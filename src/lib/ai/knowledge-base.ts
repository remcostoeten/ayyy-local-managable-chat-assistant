import { db } from '@/lib/db/client'
import { articles, embeddings } from '@/lib/db/schema'
import { generateEmbedding, splitIntoChunks } from './embeddings'
import { eq } from 'drizzle-orm'

export type TArticle = {
  id: number
  title: string
  content: string
  metadata?: ArticleMetadata
}

export interface ArticleMetadata {
  categories?: string[]
  summary?: string
  mainTopic?: string
  tags?: string[]
}

export async function ingestDocument(
  title: string, 
  content: string, 
  metadata?: ArticleMetadata
): Promise<number> {
  const [article] = await db.insert(articles).values({
    title,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
  }).returning({ id: articles.id })

  const chunks = splitIntoChunks(content)
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const vector = await generateEmbedding(chunk)
    
    await db.insert(embeddings).values({
      articleId: article.id,
      chunkText: chunk,
      chunkIndex: i,
      vector: JSON.stringify(vector)
    })
  }

  return article.id
}

export async function searchKnowledgeBase(query: string, limit: number = 3): Promise<Array<{
  articleId: number
  chunkText: string
  similarity: number
}>> {
  const queryVector = await generateEmbedding(query)

  // Get all embeddings
  const storedEmbeddings = await db
    .select({
      id: embeddings.id,
      articleId: embeddings.articleId,
      chunkText: embeddings.chunkText,
      vector: embeddings.vector,
    })
    .from(embeddings)

  // Calculate similarities and sort
  const results = storedEmbeddings
    .map(record => ({
      articleId: record.articleId,
      chunkText: record.chunkText,
      similarity: calculateCosineSimilarity(
        queryVector,
        JSON.parse(record.vector)
      )
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return results
}

function calculateCosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (normA * normB)
}

export async function getRelevantContext(query: string, maxChunks: number = 3): Promise<string> {
  const relevantChunks = await searchKnowledgeBase(query, maxChunks)
  return relevantChunks.map(chunk => chunk.chunkText).join('\n\n') 
}