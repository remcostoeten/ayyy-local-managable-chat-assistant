import { db } from '@/lib/db/client'
import { embeddings, articles } from '@/lib/db/schema'
import { and, eq, gt, lt, sql, desc, asc } from 'drizzle-orm'
import { generateEmbedding } from './optimized-embeddings'

export type SearchFilters = {
  dateFrom?: Date
  dateTo?: Date
  categories?: string[]
  minSimilarity?: number
  sortBy?: 'relevance' | 'date' | 'popularity'
  limit?: number
}

export type SearchResult = {
  articleId: number
  title: string
  chunkText: string
  similarity: number
  category?: string
  createdAt: Date
  metadata?: Record<string, any>
}

export async function semanticSearch(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  try {
    const {
      dateFrom,
      dateTo,
      categories,
      minSimilarity = 0.7,
      sortBy = 'relevance',
      limit = 10
    } = filters

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query)

    // Build base query
    let baseQuery = db
      .select({
        id: embeddings.id,
        articleId: embeddings.articleId,
        chunkText: embeddings.chunkText,
        vector: embeddings.vector,
        title: articles.title,
        category: articles.category,
        createdAt: articles.createdAt,
        metadata: articles.metadata
      })
      .from(embeddings)
      .leftJoin(articles, eq(embeddings.articleId, articles.id))

    // Apply filters
    const conditions = []

    if (dateFrom) {
      conditions.push(gt(articles.createdAt, dateFrom))
    }
    if (dateTo) {
      conditions.push(lt(articles.createdAt, dateTo))
    }
    if (categories?.length) {
      conditions.push(sql`${articles.category} IN ${categories}`)
    }

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions))
    }

    // Get filtered results
    const results = await baseQuery

    // Calculate similarities and apply threshold
    const scoredResults = results
      .map(record => ({
        articleId: record.articleId as number,
        title: record.title || 'Untitled',
        chunkText: record.chunkText,
        similarity: calculateCosineSimilarity(
          queryEmbedding,
          JSON.parse(record.vector)
        ),
        category: record.category,
        createdAt: record.createdAt,
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined
      }))
      .filter(result => result.similarity >= minSimilarity)

    // Sort results
    const sortedResults = sortResults(scoredResults, sortBy)

    return sortedResults.slice(0, limit)
  } catch (error) {
    console.error('Error in semantic search:', error)
    throw error
  }
}

function calculateCosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (normA * normB)
}

function sortResults(
  results: SearchResult[],
  sortBy: SearchFilters['sortBy']
): SearchResult[] {
  switch (sortBy) {
    case 'date':
      return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    case 'popularity':
      return results.sort((a, b) => {
        const aPopularity = a.metadata?.views || 0
        const bPopularity = b.metadata?.views || 0
        return bPopularity - aPopularity
      })
    case 'relevance':
    default:
      return results.sort((a, b) => b.similarity - a.similarity)
  }
} 