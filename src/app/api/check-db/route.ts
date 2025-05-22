import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { modelSettings } from '@/lib/db/schema'

/**
 * This route is used to check if the database connection is working.
 * It will return a JSON object with the connection status and any error messages.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object.
 */

export async function GET() {
  try {
    await db.select().from(modelSettings).limit(1)
    
    return NextResponse.json({ connected: true })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to database' 
      },
      { status: 500 }
    )
  }
}
