import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { articles } from './articles'

export const userRatings = sqliteTable('user_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id),
  rating: real('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export type UserRating = typeof userRatings.$inferSelect
export type NewUserRating = typeof userRatings.$inferInsert 