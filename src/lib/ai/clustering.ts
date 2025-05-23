import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema'
import { generateEmbedding } from './optimized-embeddings'
import { sql } from 'drizzle-orm'
import { Article } from '@/lib/db/schema/articles'

type TPoint = {
  id: number
  vector: number[]
}

type TCluster = {
  centroid: number[]
  points: TPoint[]
}

export async function clusterArticles(k: number = 5) {
  // Get all articles with topic vectors
  const allArticles = await db
    .select({
      id: articles.id,
      topicVector: articles.topicVector,
    })
    .from(articles)
    .where(sql`${articles.topicVector} IS NOT NULL`)

  const points: TPoint[] = allArticles.map(article => ({
    id: article.id,
    vector: JSON.parse(article.topicVector!)
  }))

  // Run k-means clustering
  const clusters = kMeans(points, k)

  // Update cluster assignments in database
  for (const cluster of clusters) {
    await db
      .update(articles)
      .set({ clusterId: clusters.indexOf(cluster) })
      .where(sql`id IN ${cluster.points.map(p => p.id)}`)
  }

  return clusters
}

function kMeans(points: TPoint[], k: number, maxIterations: number = 100): TCluster[] {
  // Initialize k centroids randomly
  let centroids = points
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map(p => p.vector)

  let clusters: TCluster[] = []
  let iterations = 0
  let changed = true

  while (changed && iterations < maxIterations) {
    changed = false
    clusters = centroids.map(centroid => ({ centroid, points: [] }))

    // Assign points to nearest centroid
    for (const point of points) {
      let minDist = Infinity
      let nearestCluster = 0

      centroids.forEach((centroid, i) => {
        const dist = euclideanDistance(point.vector, centroid)
        if (dist < minDist) {
          minDist = dist
          nearestCluster = i
        }
      })

      clusters[nearestCluster].points.push(point)
    }

    // Update centroids
        const newCentroids = clusters.map(cluster => {
      if (cluster.points.length === 0) return cluster.centroid

      const sum = new Array(cluster.centroid.length).fill(0)
      for (const point of cluster.points) {
        for (let i = 0; i < point.vector.length; i++) {
          sum[i] += point.vector[i]
        }
      }
      return sum.map(s => s / cluster.points.length)
    })

    // Check if centroids changed
    changed = !centroids.every((centroid, i) =>
      arrayEquals(centroid, newCentroids[i])
    )
    centroids = newCentroids
    iterations++
  }

  return clusters
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  )
}

function arrayEquals(a: number[], b: number[]): boolean {
  return a.length === b.length && 
    a.every((val, i) => Math.abs(val - b[i]) < 0.0001)
}

export async function getRelatedArticles(articleId: number, limit: number = 5) {
  const article = await db
    .select({
      clusterId: articles.clusterId,
      topicVector: articles.topicVector
    })
    .from(articles)
    .where(sql`id = ${articleId}`)
    .get()

  if (!article || !article.topicVector) return []

  const vector = JSON.parse(article.topicVector)
  
  // Get articles in same cluster
  const related = await db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      topicVector: articles.topicVector
    })
    .from(articles)
    .where(sql`
      cluster_id = ${article.clusterId}
      AND id != ${articleId}
      AND topic_vector IS NOT NULL
    `)
    .limit(limit * 2) // Get extra to filter by similarity

  // Sort by similarity to original article
  return related
    .map(r => ({
      ...r,
      similarity: cosineSimilarity(vector, JSON.parse(r.topicVector!))
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (normA * normB)
} 