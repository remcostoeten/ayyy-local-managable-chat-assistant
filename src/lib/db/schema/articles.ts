import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  metadata: text('metadata'), // JSON string
  views: integer('views').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  // For recommendations
  averageRating: real('average_rating').default(0),
  ratingCount: integer('rating_count').default(0),
  // For clustering
  topicVector: text('topic_vector'), // JSON string of topic embedding
  clusterId: integer('cluster_id'),
})

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert 