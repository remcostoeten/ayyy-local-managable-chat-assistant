import { HfInference } from '@huggingface/inference'
import type { FeatureExtractionOutput } from '@huggingface/inference'
import pLimit from 'p-limit'
import { LRUCache } from 'lru-cache'

// Configuration
const BATCH_SIZE = 10
const CACHE_MAX_SIZE = 1000
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second
const RATE_LIMIT = 50 // requests per minute

// Initialize Hugging Face client
const hf = new HfInference('REMOVED_TOKEN')

// Initialize rate limiter
const limiter = pLimit(RATE_LIMIT)

// Initialize cache
const cache = new LRUCache<string, number[]>({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = `embedding:${text}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Use rate limiter for API calls
  return limiter(async () => {
    let lastError: Error | null = null

    // Retry logic
    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })

        if (!response.ok) {
          throw new Error(`Failed to generate embedding: ${response.statusText}`)
        }

        const data = await response.json()
        const embedding = data.embedding

        // Cache the result
        if (embedding && embedding.length > 0) {
          cache.set(cacheKey, embedding)
        }

        return embedding
      } catch (error) {
        lastError = error as Error
        if (attempt < RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        }
      }
    }

    throw lastError || new Error('Failed to generate embedding after retries')
  })
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  // Split into batches
  const batches: string[][] = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    batches.push(texts.slice(i, i + BATCH_SIZE))
  }

  // Process batches
  const results: number[][] = []
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text))
    )
    results.push(...batchResults)
  }

  return results
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  
  return dotProduct / (normA * normB)
}

export async function findSimilarTexts(
  query: string,
  candidates: string[],
  threshold = 0.7
): Promise<Array<{ text: string; similarity: number }>> {
  const queryEmbedding = await generateEmbedding(query)
  const candidateEmbeddings = await generateBatchEmbeddings(candidates)

  return candidates
    .map((text, i) => ({
      text,
      similarity: cosineSimilarity(queryEmbedding, candidateEmbeddings[i])
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
} 