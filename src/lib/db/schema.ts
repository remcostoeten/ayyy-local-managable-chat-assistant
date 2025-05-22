import { sqliteTable, text, integer, primaryKey, real } from "drizzle-orm/sqlite-core"
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const knowledgeArticles = sqliteTable("knowledge_articles", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
})

export const articleCategories = sqliteTable("article_categories", {
  articleId: text("article_id")
    .notNull()
    .references(() => knowledgeArticles.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.articleId, table.categoryId] }),
}))

export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
})

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: text("role").notNull().$type<"user" | "assistant">(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
})

export const chatSessionMetadata = sqliteTable("chat_session_metadata", {
  sessionId: text("session_id")
    .primaryKey()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  title: text("title"),
  summary: text("summary"),
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }).notNull().defaultNow(),
  status: text("status").$type<"active" | "archived" | "deleted">().default("active"),
})

export const suggestions = sqliteTable("suggestions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  text: text("text").notNull(),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
})

export const modelSettings = sqliteTable("model_settings", {
  id: text("id").primaryKey(),
  model: text("model").notNull(),
  temperature: real("temperature").notNull().default(0.7),
  systemPrompt: text("system_prompt").notNull(),
  maxTokens: integer("max_tokens").default(2048),
  topP: real("top_p").notNull().default(1),
  frequencyPenalty: real("frequency_penalty").notNull().default(0),
  presencePenalty: real("presence_penalty").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const embeddings = sqliteTable('embeddings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').references(() => articles.id),
  chunkText: text('chunk_text').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  vector: text('vector').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const chatAssistant = sqliteTable("chat_assistant", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
  status: text("status").$type<"away" | "active" | "inactive">().default("active"),
  avatar: text("avatar").notNull(),
})

export const llmSettings = sqliteTable('llm_settings', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  provider: text('provider').notNull().default('local'), // 'local' or 'groq'
  apiKey: text('api_key'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const recommendationQuestions = sqliteTable('recommendation_questions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  question: text('question').notNull(),
  category: text('category'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
