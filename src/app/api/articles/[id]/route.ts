import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content } = await request.json()
    const articleId = parseInt(params.id)
    
    if (!title || !content || isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const updatedArticle = await db
      .update(articles)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId))
      .returning()

    if (!updatedArticle.length) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedArticle[0])
  } catch (error) {
    console.error('Failed to update article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id)
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    const deletedArticle = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning()

    if (!deletedArticle.length) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedArticle[0])
  } catch (error) {
    console.error('Failed to delete article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
} 