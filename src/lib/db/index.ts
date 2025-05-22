'use server';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { storeEmbedding, updateEmbedding, deleteEmbedding } from '../ai/embeddings';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema: schema });

// Export async functions for server actions
export async function getDb() {
  return db;
}

export async function query() {
  return {
    db,
    schema: schema,
  };
}

export async function createArticle(data: {
  title: string;
  content: string;
  categoryIds?: string[];
}) {
  try {
    const article = await db.insert(schema.knowledgeArticles).values({
      title: data.title,
      content: data.content,
    }).returning().get();

    if (data.categoryIds?.length) {
      await db.insert(schema.articleCategories).values(
        data.categoryIds.map(categoryId => ({
          articleId: article.id,
          categoryId,
        }))
      );
    }

    // Generate and store embedding for the article
    await storeEmbedding(article.id, data.content);

    return { success: true, article };
  } catch (error) {
    console.error('Error creating article:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getArticles() {
  try {
    const articles = await db.select().from(schema.knowledgeArticles);
    return { success: true, articles };
  } catch (error) {
    console.error('Error getting articles:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getArticle(id: string) {
  try {
    const article = await db
      .select()
      .from(schema.knowledgeArticles)
      .where(eq(schema.knowledgeArticles.id, id))
      .get();

    return { success: true, article };
  } catch (error) {
    console.error('Error getting article:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateArticle(id: string, data: {
  title?: string;
  content?: string;
  categoryIds?: string[];
}) {
  try {
    const article = await db
      .update(schema.knowledgeArticles)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.knowledgeArticles.id, id))
      .returning()
      .get();

    if (data.categoryIds) {
      await db
        .delete(schema.articleCategories)
        .where(eq(schema.articleCategories.articleId, id));

      await db.insert(schema.articleCategories).values(
        data.categoryIds.map(categoryId => ({
          articleId: id,
          categoryId,
        }))
      );
    }

    // Update embedding if content has changed
    if (data.content) {
      await updateEmbedding(id, data.content);
    }

    return { success: true, article };
  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteArticle(id: string) {
  try {
    // Delete the article's embedding
    await deleteEmbedding(id);

    // Delete the article (this will cascade to articleCategories)
    await db
      .delete(schema.knowledgeArticles)
      .where(eq(schema.knowledgeArticles.id, id));

    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getCategories() {
  try {
    const categories = await db.select().from(schema.categories);
    return { success: true, categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createCategory(name: string) {
  try {
    const category = await db
      .insert(schema.categories)
      .values({ name })
      .returning()
      .get();

    return { success: true, category };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: (error as Error).message };
  }
}
