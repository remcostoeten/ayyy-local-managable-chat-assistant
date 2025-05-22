import { env } from "@/lib/env"
import { neon } from "@neondatabase/serverless"

// This script pushes the schema to the database
async function main() {
  console.log("Connecting to database...")

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not defined")
  }

  const sql = neon(env.DATABASE_URL)

  console.log("Pushing schema to database...")

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_articles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS article_categories (
        article_id TEXT NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, category_id)
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS suggestions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        text TEXT NOT NULL,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `

    console.log("Schema pushed successfully!")
  } catch (error) {
    console.error("Error pushing schema:", error)
    process.exit(1)
  }
}

main()

