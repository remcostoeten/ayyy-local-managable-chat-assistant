import { db } from '@/lib/db/client';
import { embeddings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const SIMILARITY_THRESHOLD = 0.7;

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Split text into overlapping chunks
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

interface EmbeddingRecord {
  id: number;
  articleId: number;
  chunkText: string;
  chunkIndex: number;
  vector: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function storeArticleEmbeddings(articleId: number, content: string): Promise<void> {
  const chunks = splitIntoChunks(content);
  
  for (let i = 0; i < chunks.length; i++) {
    const vector = await generateEmbedding(chunks[i]);
    await db.insert(embeddings).values({
      articleId,
      chunkText: chunks[i],
      chunkIndex: i,
      vector: JSON.stringify(vector),
    });
  }
}

export async function findSimilarChunks(query: string, limit = 5): Promise<Array<{ chunkText: string; similarity: number; articleId: number }>> {
  const queryVector = await generateEmbedding(query);
  const allEmbeddings = await db.select().from(embeddings);
  
  const results = allEmbeddings
    .map((embedding: EmbeddingRecord) => ({
      ...embedding,
      similarity: cosineSimilarity(queryVector, JSON.parse(embedding.vector))
    }))
    .filter(result => result.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
    
  return results.map(({ chunkText, similarity, articleId }) => ({
    chunkText,
    similarity,
    articleId,
  }));
}

export async function updateArticleEmbeddings(articleId: number, newContent: string): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.articleId, articleId));
  await storeArticleEmbeddings(articleId, newContent);
}

export async function deleteArticleEmbeddings(articleId: number): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.articleId, articleId));
} 