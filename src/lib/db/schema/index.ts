import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const knowledgeArticles = sqliteTable('knowledge_articles', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const articleCategories = sqliteTable('article_categories', {
  articleId: text('article_id')
    .notNull()
    .references(() => knowledgeArticles.id),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect
export type NewKnowledgeArticle = typeof knowledgeArticles.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type ArticleCategory = typeof articleCategories.$inferSelect
export type NewArticleCategory = typeof articleCategories.$inferInsert 