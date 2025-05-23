import { NextResponse } from 'next/server'
import { getPersonalizedRecommendations } from '@/lib/ai/recommendations'
import { db } from '@/lib/db/client'
import { userRatings } from '@/lib/db/schema/user-ratings'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get user's ratings
    const ratings = await db
      .select()
      .from(userRatings)
      .where(eq(userRatings.userId, userId))

    // Convert to preferences format
    const preferences = {
      categories: [], // Would come from user profile
      readArticles: ratings.map(r => r.articleId),
      ratings: Object.fromEntries(
        ratings.map(r => [r.articleId, r.rating])
      )
    }

    const recommendations = await getPersonalizedRecommendations(
      userId,
      preferences,
      limit
    )

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
} 