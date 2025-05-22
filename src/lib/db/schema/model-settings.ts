import { sql } from 'drizzle-orm';
import { 
  sqliteTable, 
  text, 
  integer, 
  real
} from 'drizzle-orm/sqlite-core';

export const modelSettings = sqliteTable('model_settings', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  modelTag: text('model_tag').notNull(),
  tooltip: text('tooltip').notNull(),
  badgeColor: text('badge_color').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  
  // Features (1-5 scale)
  snelheid: integer('snelheid').notNull().default(3),
  nederlands: integer('nederlands').notNull().default(3),
  contextGebruik: integer('context_gebruik').notNull().default(3),
  
  // Model parameters
  systemPrompt: text('system_prompt').notNull().default(
    `Je bent een AI assistent voor een e-learning platform. Je taak is om vragen te beantwoorden op basis van de beschikbare kennisbank.

BASISREGELS:
1. Antwoord ALTIJD in het Nederlands
2. Gebruik ALLEEN informatie uit de kennisbank
3. Als je iets niet weet, zeg dat eerlijk
4. Wees kort en bondig
5. Als een vraag onduidelijk is, vraag om verduidelijking
6. Gebruik een professionele en behulpzame toon

De kennisbank informatie wordt bij elke vraag apart toegevoegd. Gebruik ALLEEN deze informatie voor je antwoorden.`
  ),
  maxTokens: integer('max_tokens').notNull().default(512),
  temperature: real('temperature').notNull().default(0.3),
  topP: real('top_p').notNull().default(0.3),
  frequencyPenalty: real('frequency_penalty').notNull().default(0),
  presencePenalty: real('presence_penalty').notNull().default(0),
  
  // Additional info
  adminNotes: text('admin_notes'),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Types
export type ModelSettings = typeof modelSettings.$inferSelect;
export type NewModelSettings = typeof modelSettings.$inferInsert; 