import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const llmSettings = sqliteTable('llm_settings', {
  id: text('id').primaryKey().default(sql`(uuid())`),
  provider: text('provider').notNull(),
  
  // Encrypted API key data
  apiKey: text('api_key'),
  apiKeyIv: text('api_key_iv'),
  apiKeyTag: text('api_key_tag'),
  
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
}); 