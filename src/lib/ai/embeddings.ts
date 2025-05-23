import { db } from '@/lib/db/client';
import { embeddings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TextSplitter, getOptimalChunkSize } from './text-splitter';
import { embeddingCache } from './cache';
import pLimit from 'p-limit';
import { SQL } from 'drizzle-orm';
import { HfInference } from '@huggingface/inference'
import type { FeatureExtractionOutput } from '@huggingface/inference'

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const SIMILARITY_THRESHOLD = 0.7;
const BATCH_SIZE = 10; // Number of embeddings to generate in parallel
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const hf = new HfInference(process.env.HF_ACCESS_TOKEN)

interface EmbeddingOptions {
  modelName?: string;
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface EmbeddingRecord {
  id: number;
  articleId: number;
  chunkText: string;
  chunkIndex: number;
  vector: string;
  createdAt: Date;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const cachedEmbedding = embeddingCache.getEmbedding(text);
  if (cachedEmbedding) {
    return cachedEmbedding;
  }

  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    })
    
    let embedding: number[] = []
    
    if (Array.isArray(response)) {
      embedding = response as number[]
    } else if (typeof response === 'number') {
      embedding = [response]
    } else if (Array.isArray((response as number[][])[0])) {
      embedding = (response as number[][])[0]
    }
    
    // Cache the result
    embeddingCache.setEmbedding(text, embedding);
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function generateBulkEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const limit = pLimit(BATCH_SIZE);
  
  const embeddings = await Promise.all(
    texts.map(text => 
      limit(() => generateEmbedding(text))
    )
  );

  return embeddings;
}

export function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Get chunk with overlap
    const chunk = text.slice(startIndex, startIndex + CHUNK_SIZE);
    chunks.push(chunk);
    
    // Move start index, accounting for overlap
    startIndex += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

// Utility function to calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Store embeddings for an article
export async function storeEmbedding(articleId: string, content: string) {
  try {
    // Split content into chunks
    const chunks = splitIntoChunks(content);
    console.log(`Split article into ${chunks.length} chunks`);

    // Generate and store embedding for each chunk
    for (const [index, chunk] of chunks.entries()) {
      const embedding = await generateEmbedding(chunk);
      
      await db.insert(embeddings).values({
        articleId,
        embedding: JSON.stringify(embedding),
        chunkIndex: index,
        chunkText: chunk,
        updatedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error storing embedding:", error);
    return false;
  }
}

// Find similar articles based on query embedding
export async function findSimilarArticles(queryText: string, limit: number = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(queryText);

    // Get all embeddings from database
    const storedEmbeddings = await db
      .select({
        id: embeddings.id,
        articleId: embeddings.articleId,
        embedding: embeddings.embedding,
        chunkText: embeddings.chunkText,
        chunkIndex: embeddings.chunkIndex,
      })
      .from(embeddings);

    // Calculate similarities and filter by threshold
    const similarities = storedEmbeddings
      .map((stored) => ({
        articleId: stored.articleId,
        similarity: cosineSimilarity(queryEmbedding, JSON.parse(stored.embedding)),
        chunkText: stored.chunkText,
        chunkIndex: stored.chunkIndex,
      }))
      .filter(result => result.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Group by article and take highest similarity score
    const articleSimilarities = similarities.reduce((acc, curr) => {
      if (!acc[curr.articleId] || acc[curr.articleId].similarity < curr.similarity) {
        acc[curr.articleId] = curr;
      }
      return acc;
    }, {} as Record<string, typeof similarities[0]>);

    return Object.values(articleSimilarities);
  } catch (error) {
    console.error("Error finding similar articles:", error);
    return [];
  }
}

// Update embedding for an article
export async function updateEmbedding(articleId: string, content: string) {
  try {
    // Delete existing embeddings for this article
    await deleteEmbedding(articleId);
    
    // Generate and store new embeddings
    return await storeEmbedding(articleId, content);
  } catch (error) {
    console.error("Error updating embedding:", error);
    return false;
  }
}

// Delete embedding for an article
export async function deleteEmbedding(articleId: string) {
  try {
    await db.delete(embeddings).where(eq(embeddings.articleId, articleId));
    return true;
  } catch (error) {
    console.error("Error deleting embedding:", error);
    return false;
  }
}

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start = end - CHUNK_OVERLAP;
  }
  
  return chunks;
}

export async function storeArticleEmbeddings(
  articleId: number,
  content: string
): Promise<void> {
  const textSplitter = new TextSplitter(
    getOptimalChunkSize(4096)
  );

  const chunks = textSplitter.splitText(content);
  
  const cachedChunks = embeddingCache.getChunks(content);
  if (cachedChunks) {
    chunks.push(...cachedChunks);
  }

  const vectors = await generateBulkEmbeddings(chunks);

  await Promise.all(
    chunks.map((chunk, index) =>
      db.insert(embeddings).values({
        article_id: articleId,
        chunk_text: chunk,
        chunk_index: index,
        vector: JSON.stringify(vectors[index]),
      })
    )
  );

  embeddingCache.setChunks(content, chunks);
}

export async function findSimilarChunks(
  query: string,
  limit = 5,
  options: EmbeddingOptions = {}
): Promise<Array<{ chunkText: string; similarity: number; articleId: number }>> {
  // Check cache first
  const cachedResults = embeddingCache.getSimilarityResults(query);
  if (cachedResults) {
    return cachedResults;
  }

  const queryVector = await generateEmbedding(query, options);
  const allEmbeddings = await db
    .select({
      id: embeddings.id,
      article_id: embeddings.article_id,
      chunk_text: embeddings.chunk_text,
      vector: embeddings.vector,
    })
    .from(embeddings);
  
  const results = allEmbeddings
    .map(embedding => ({
      chunkText: embedding.chunk_text,
      articleId: embedding.article_id || 0, // Fallback for type safety
      similarity: calculateCosineSimilarity(queryVector, JSON.parse(embedding.vector))
    }))
    .filter(result => result.similarity >= 0.7) // Configurable threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // Cache the results
  embeddingCache.setSimilarityResults(query, results);

  return results;
}

function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function updateArticleEmbeddings(articleId: number, newContent: string): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.articleId, articleId));
  await storeArticleEmbeddings(articleId, newContent);
}

export async function deleteArticleEmbeddings(articleId: number): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.articleId, articleId));
} 