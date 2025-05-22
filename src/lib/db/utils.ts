import { db } from './client'
import { modelSettings } from './schema'

export async function checkDatabaseConnection() {
  try {
    await db.select().from(modelSettings).limit(1)
    return { connected: true }
  } catch (error) {
    console.error('Database connection error:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Failed to connect to database'
    }
  }
} 