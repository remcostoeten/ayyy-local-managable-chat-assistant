'use server'

import { db } from '@/lib/db/client'
import { embeddings } from '@/lib/db/schema'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { eq } from 'drizzle-orm'

const SIMILARITY_THRESHOLD = 0.7

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function searchEmbeddings(searchQuery: string) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(searchQuery)

    // Get all embeddings from database
    const storedEmbeddings = await db
      .select({
        id: embeddings.id,
        articleId: embeddings.articleId,
        vector: embeddings.vector,
        chunkText: embeddings.chunkText,
      })
      .from(embeddings)

    // Calculate similarities
    const results = storedEmbeddings
      .map((stored) => ({
        articleId: stored.articleId,
        similarity: cosineSimilarity(queryEmbedding, JSON.parse(stored.vector)),
        chunkText: stored.chunkText,
      }))
      .filter(result => result.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    return { success: true, results }
  } catch (error) {
    console.error('Error searching embeddings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search embeddings'
    }
  }
} 