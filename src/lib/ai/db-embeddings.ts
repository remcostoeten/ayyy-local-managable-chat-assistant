import { db } from '@/lib/db/client'
import { embeddings } from '@/lib/db/schema/embeddings'
import { eq, and, sql } from 'drizzle-orm'
import { generateEmbedding, generateBatchEmbeddings, cosineSimilarity } from './optimized-embeddings'

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 100
const SIMILARITY_THRESHOLD = 0.7

export async function storeArticleEmbeddings(articleId: number, content: string): Promise<void> {
  try {
    // Split content into chunks
    const chunks = splitIntoChunks(content)
    console.log(`Split article into ${chunks.length} chunks`)

    // Generate embeddings for all chunks in batches
    const vectors = await generateBatchEmbeddings(chunks)

    // Store all embeddings
    await Promise.all(
      chunks.map((chunk, index) =>
        db.insert(embeddings).values({
          articleId,
          chunkText: chunk,
          chunkIndex: index,
          vector: JSON.stringify(vectors[index]),
          createdAt: new Date()
        })
      )
    )

    console.log(`Successfully stored ${chunks.length} embeddings`)
  } catch (error) {
    console.error('Error storing article embeddings:', error)
    throw error
  }
}

export async function findSimilarArticles(
  query: string,
  limit = 5,
  threshold = SIMILARITY_THRESHOLD
): Promise<Array<{
  articleId: number
  chunkText: string
  similarity: number
}>> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Get all embeddings from database
    const storedEmbeddings = await db
      .select({
        id: embeddings.id,
        articleId: embeddings.articleId,
        chunkText: embeddings.chunkText,
        vector: embeddings.vector
      })
      .from(embeddings)

    // Calculate similarities and filter out null articleIds
    const results = storedEmbeddings
      .filter(record => record.articleId !== null)
      .map(record => ({
        articleId: record.articleId as number,
        chunkText: record.chunkText,
        similarity: cosineSimilarity(
          queryEmbedding,
          JSON.parse(record.vector)
        )
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return results
  } catch (error) {
    console.error('Error finding similar articles:', error)
    throw error
  }
}

export async function updateArticleEmbeddings(
  articleId: number,
  newContent: string
): Promise<void> {
  try {
    // Delete existing embeddings
    await db.delete(embeddings)
      .where(eq(embeddings.articleId, articleId))

    // Store new embeddings
    await storeArticleEmbeddings(articleId, newContent)
  } catch (error) {
    console.error('Error updating article embeddings:', error)
    throw error
  }
}

export async function deleteArticleEmbeddings(articleId: number): Promise<void> {
  try {
    await db.delete(embeddings)
      .where(eq(embeddings.articleId, articleId))
  } catch (error) {
    console.error('Error deleting article embeddings:', error)
    throw error
  }
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < text.length) {
    const chunk = text.slice(
      startIndex,
      Math.min(startIndex + CHUNK_SIZE, text.length)
    )
    chunks.push(chunk)
    startIndex += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

// Utility function to get embedding stats
export async function getEmbeddingStats(): Promise<{
  totalEmbeddings: number
  totalArticles: number
  averageChunksPerArticle: number
}> {
  const result = await db
    .select({
      totalEmbeddings: sql<number>`count(*)`,
      totalArticles: sql<number>`count(distinct ${embeddings.articleId})`,
      averageChunks: sql<number>`cast(count(*) as float) / count(distinct ${embeddings.articleId})`
    })
    .from(embeddings)

  return {
    totalEmbeddings: result[0].totalEmbeddings,
    totalArticles: result[0].totalArticles,
    averageChunksPerArticle: result[0].averageChunks
  }
} 