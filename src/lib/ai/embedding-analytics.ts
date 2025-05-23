import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { embeddings, articles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type EmbeddingMetrics = {
  totalQueries: number
  averageSimilarity: number
  topCategories: Array<{ category: string; count: number }>
  queryDistribution: Array<{ hour: number; count: number }>
  averageResponseTime: number
}

export type QueryLog = {
  query: string
  timestamp: Date
  responseTime: number
  numResults: number
  averageSimilarity: number
}

// Track query metrics
const queryMetrics = new Map<string, QueryLog[]>()

export function logQuery(
  query: string,
  startTime: number,
  results: Array<{ similarity: number }>
): void {
  const endTime = Date.now()
  const responseTime = endTime - startTime
  const numResults = results.length
  const averageSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / numResults

  const log: QueryLog = {
    query,
    timestamp: new Date(),
    responseTime,
    numResults,
    averageSimilarity
  }

  const existing = queryMetrics.get(query) || []
  queryMetrics.set(query, [...existing, log])
}

export async function getEmbeddingMetrics(
  timeframe: 'day' | 'week' | 'month' = 'day'
): Promise<EmbeddingMetrics> {
  // Get timeframe in hours
  const hours = timeframe === 'day' ? 24 : timeframe === 'week' ? 168 : 720
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

  // Get all queries in timeframe
  const queries = Array.from(queryMetrics.values())
    .flat()
    .filter(log => log.timestamp >= startTime)

  // Calculate metrics
  const totalQueries = queries.length
  const averageSimilarity = queries.reduce((sum, q) => sum + q.averageSimilarity, 0) / totalQueries
  const averageResponseTime = queries.reduce((sum, q) => sum + q.responseTime, 0) / totalQueries

  // Get query distribution by hour
  const distribution = new Array(24).fill(0)
  queries.forEach(q => {
    const hour = q.timestamp.getHours()
    distribution[hour]++
  })

  // Get top categories from database
  const categoryResults = await db
    .select({
      category: articles.category,
      count: sql<number>`count(*)`
    })
    .from(embeddings)
    .leftJoin(articles, eq(embeddings.articleId, articles.id))
    .groupBy(articles.category)
    .orderBy(sql`count(*) desc`)
    .limit(5)

  return {
    totalQueries,
    averageSimilarity,
    averageResponseTime,
    queryDistribution: distribution.map((count, hour) => ({ hour, count })),
    topCategories: categoryResults.map(r => ({
      category: r.category || 'uncategorized',
      count: r.count
    }))
  }
}

export function getPopularQueries(limit = 10): Array<{
  query: string
  count: number
  avgSimilarity: number
}> {
  return Array.from(queryMetrics.entries())
    .map(([query, logs]) => ({
      query,
      count: logs.length,
      avgSimilarity: logs.reduce((sum, log) => sum + log.averageSimilarity, 0) / logs.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function clearOldMetrics(maxAge = 30 * 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAge
  for (const [query, logs] of queryMetrics.entries()) {
    const filtered = logs.filter(log => log.timestamp.getTime() > cutoff)
    if (filtered.length === 0) {
      queryMetrics.delete(query)
    } else {
      queryMetrics.set(query, filtered)
    }
  }
} 