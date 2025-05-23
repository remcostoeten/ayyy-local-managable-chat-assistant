'use server';

import { db } from './client'
import { eq } from 'drizzle-orm'
import { storeEmbedding, updateEmbedding, deleteEmbedding } from '../ai/embeddings'
import { knowledgeArticles, articleCategories, categories } from './schema'
import type { KnowledgeArticle, Category } from './schema'

export async function getDb() {
  return db
}

export async function query() {
  return {
    db,
    schema: { knowledgeArticles, articleCategories, categories },
  }
}

export async function createArticle(data: {
  title: string;
  content: string;
  categoryIds?: string[];
}) {
  try {
    const article = await db
      .insert(knowledgeArticles)
      .values({
        title: data.title,
        content: data.content,
      })
      .returning()
      .get()

    if (data.categoryIds?.length) {
      await db.insert(articleCategories).values(
        data.categoryIds.map(categoryId => ({
          articleId: article.id,
          categoryId,
        }))
      )
    }

    await storeEmbedding(article.id, data.content)

    return { success: true, article }
  } catch (error) {
    console.error('Error creating article:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getArticles() {
  try {
    const articles = await db.select().from(knowledgeArticles)
    return { success: true, articles }
  } catch (error) {
    console.error('Error getting articles:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getArticle(id: string) {
  try {
    const article = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .get()

    return { success: true, article }
  } catch (error) {
    console.error('Error getting article:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateArticle(id: string, data: {
  title?: string;
  content?: string;
  categoryIds?: string[];
}) {
  try {
    const article = await db
      .update(knowledgeArticles)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeArticles.id, id))
      .returning()
      .get()

    if (data.categoryIds) {
      await db
        .delete(articleCategories)
        .where(eq(articleCategories.articleId, id))

      await db.insert(articleCategories).values(
        data.categoryIds.map(categoryId => ({
          articleId: id,
          categoryId,
        }))
      )
    }

    if (data.content) {
      await updateEmbedding(id, data.content)
    }

    return { success: true, article }
  } catch (error) {
    console.error('Error updating article:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteArticle(id: string) {
  try {
    await deleteEmbedding(id)

    await db
      .delete(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))

    return { success: true }
  } catch (error) {
    console.error('Error deleting article:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getCategories() {
  try {
    const allCategories = await db.select().from(categories)
    return { success: true, categories: allCategories }
  } catch (error) {
    console.error('Error getting categories:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createCategory(name: string) {
  try {
    const category = await db
      .insert(categories)
      .values({ name })
      .returning()
      .get()

    return { success: true, category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: (error as Error).message }
  }
}
