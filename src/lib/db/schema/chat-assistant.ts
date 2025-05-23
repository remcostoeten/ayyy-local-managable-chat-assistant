import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const chatAssistant = sqliteTable('chat_assistant', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['active', 'away', 'inactive'] }).default('inactive'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}); 