import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { Article } from '@/lib/db/schema/articles'
import { getRelatedArticles } from './clustering'

interface UserPreferences {
  categories: string[]
  readArticles: number[]
  ratings: Record<number, number>
}

export async function getPersonalizedRecommendations(
  userId: string,
  preferences: UserPreferences,
  limit: number = 5
) {
  // Get content-based recommendations
  const contentBased = await getContentBasedRecommendations(preferences, limit * 2)
  
  // Get collaborative recommendations
  const collaborative = await getCollaborativeRecommendations(userId, limit * 2)
  
  // Merge and rank recommendations
  const recommendations = rankRecommendations(
    contentBased,
    collaborative,
    preferences
  )

  return recommendations.slice(0, limit)
}

async function getContentBasedRecommendations(
  preferences: UserPreferences,
  limit: number
) {
  // Get articles in user's preferred categories
  const categoryArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      averageRating: articles.averageRating,
      createdAt: articles.createdAt
    })
    .from(articles)
    .where(sql`
      category IN ${preferences.categories}
      AND id NOT IN ${preferences.readArticles}
    `)
    .orderBy(articles.averageRating, 'desc')
    .limit(limit)

  // For each recently rated article, get related articles
  const relatedArticles = await Promise.all(
    Object.entries(preferences.ratings)
      .sort(([, a], [, b]) => b - a) // Sort by rating
      .slice(0, 3) // Take top 3 rated articles
      .map(async ([articleId]) => {
        return getRelatedArticles(parseInt(articleId), Math.floor(limit / 3))
      })
  )

  return [...categoryArticles, ...relatedArticles.flat()]
}

async function getCollaborativeRecommendations(userId: string, limit: number) {
  // Find similar users based on rating patterns
  const similarUsers = await findSimilarUsers(userId)
  
  // Get highly rated articles from similar users
  const recommendations = await db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      averageRating: articles.averageRating
    })
    .from(articles)
    .where(sql`
      id IN (
        SELECT article_id 
        FROM user_ratings
        WHERE user_id IN ${similarUsers}
        AND rating >= 4
      )
    `)
    .orderBy(articles.averageRating, 'desc')
    .limit(limit)

  return recommendations
}

async function findSimilarUsers(userId: string): Promise<string[]> {
  // This would typically use a more sophisticated similarity calculation
  // For now, we'll just find users who rated similar articles
  const similarUsers = await db.execute(sql`
    SELECT DISTINCT ur2.user_id
    FROM user_ratings ur1
    JOIN user_ratings ur2 ON ur1.article_id = ur2.article_id
    WHERE ur1.user_id = ${userId}
    AND ur2.user_id != ${userId}
    AND ABS(ur1.rating - ur2.rating) <= 1
    GROUP BY ur2.user_id
    HAVING COUNT(*) >= 3
    LIMIT 10
  `)

  return similarUsers.map(u => u.user_id)
}

function rankRecommendations(
  contentBased: Article[],
  collaborative: Article[],
  preferences: UserPreferences
): Article[] {
  const scored = [...contentBased, ...collaborative].map(article => {
    let score = article.averageRating || 0

    // Boost score for preferred categories
    if (preferences.categories.includes(article.category)) {
      score += 0.5
    }

    // Boost score for recent articles
    const age = Date.now() - new Date(article.createdAt).getTime()
    const daysSinceCreation = age / (1000 * 60 * 60 * 24)
    if (daysSinceCreation < 7) {
      score += 0.3
    }

    return { ...article, score }
  })

  // Remove duplicates and sort by score
  const seen = new Set<number>()
  return scored
    .filter(article => {
      if (seen.has(article.id)) return false
      seen.add(article.id)
      return true
    })
    .sort((a, b) => b.score - a.score)
} 