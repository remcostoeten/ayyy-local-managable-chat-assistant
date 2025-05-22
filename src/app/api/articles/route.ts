import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.updatedAt)
    return NextResponse.json(allArticles)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const newArticle = await db.insert(articles).values({
      title,
      content,
      updatedAt: new Date(),
    }).returning()

    return NextResponse.json(newArticle[0])
  } catch (error) {
    console.error('Failed to create article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
} 