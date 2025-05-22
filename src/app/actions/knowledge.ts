"use server"

import { db } from "@/lib/db/client"
import { knowledgeArticles, categories, articleCategories } from "@/lib/db/schema"
import { eq, like, or } from "drizzle-orm"
import { extractArticleContent, generateTitleFromContent, extractPossibleCategories } from "@/lib/utils/html-stripper"

type TKnowledgeArticleImport = {
  title?: string
  content: string
  categories?: string[]
  isHtml?: boolean
}

export async function importKnowledgeArticles(articles: TKnowledgeArticleImport[]) {
  try {
    const results = []
    
    for (const article of articles) {
      let processedContent = article.content
      let processedTitle = article.title
      let processedCategories = article.categories || []

      // If content is HTML and isHtml flag is true, extract article content
      if (article.isHtml) {
        const extractedContent = extractArticleContent(article.content)
        if (extractedContent) {
          processedContent = extractedContent
          
          // Generate title if not provided
          if (!processedTitle) {
            processedTitle = generateTitleFromContent(processedContent)
          }
          
          // Generate categories if not provided
          if (!processedCategories.length) {
            processedCategories = extractPossibleCategories(processedContent)
          }
        }
      }

      // Create article
      const newArticle = await db.insert(knowledgeArticles).values({
        title: processedTitle || 'Untitled Article',
        content: processedContent,
      }).returning().get()

      // Handle categories
      if (processedCategories.length) {
        // Create categories that don't exist
        const existingCategories = await db
          .select()
          .from(categories)
          .where(or(...processedCategories.map(c => eq(categories.name, c))))
          .all()

        const existingCategoryNames = new Set(existingCategories.map(c => c.name))
        const newCategories = processedCategories.filter(c => !existingCategoryNames.has(c))

        if (newCategories.length) {
          await db.insert(categories).values(
            newCategories.map(name => ({ name }))
          )
        }

        // Get all category IDs
        const categoryRecords = await db
          .select()
          .from(categories)
          .where(or(...processedCategories.map(c => eq(categories.name, c))))
          .all()

        // Link article to categories
        await db.insert(articleCategories).values(
          categoryRecords.map(category => ({
            articleId: newArticle.id,
            categoryId: category.id,
          }))
        )
      }

      results.push(newArticle)
    }

    return { success: true, articles: results }
  } catch (error) {
    console.error("Error importing articles:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function exportKnowledgeArticles() {
  try {
    const articles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        content: knowledgeArticles.content,
        createdAt: knowledgeArticles.createdAt,
        updatedAt: knowledgeArticles.updatedAt,
        categories: categories.name,
      })
      .from(knowledgeArticles)
      .leftJoin(articleCategories, eq(articleCategories.articleId, knowledgeArticles.id))
      .leftJoin(categories, eq(categories.id, articleCategories.categoryId))
      .all()

    // Group by article and collect categories
    const groupedArticles = articles.reduce((acc, curr) => {
      if (!acc[curr.id]) {
        acc[curr.id] = {
          title: curr.title,
          content: curr.content,
          createdAt: curr.createdAt,
          updatedAt: curr.updatedAt,
          categories: [],
        }
      }
      if (curr.categories) {
        acc[curr.id].categories.push(curr.categories)
      }
      return acc
    }, {} as Record<string, any>)

    return { 
      success: true, 
      articles: Object.values(groupedArticles)
    }
  } catch (error) {
    console.error("Error exporting articles:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function searchKnowledge(query: string) {
  try {
    const searchTerm = `%${query}%`
    
    const articles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        content: knowledgeArticles.content,
        createdAt: knowledgeArticles.createdAt,
        updatedAt: knowledgeArticles.updatedAt,
        categories: categories.name,
      })
      .from(knowledgeArticles)
      .leftJoin(articleCategories, eq(articleCategories.articleId, knowledgeArticles.id))
      .leftJoin(categories, eq(categories.id, articleCategories.categoryId))
      .where(
        or(
          like(knowledgeArticles.title, searchTerm),
          like(knowledgeArticles.content, searchTerm),
          like(categories.name, searchTerm)
        )
      )
      .all()

    // Group by article and collect categories
    const groupedArticles = articles.reduce((acc, curr) => {
      if (!acc[curr.id]) {
        acc[curr.id] = {
          id: curr.id,
          title: curr.title,
          content: curr.content,
          createdAt: curr.createdAt,
          updatedAt: curr.updatedAt,
          categories: [],
        }
      }
      if (curr.categories) {
        acc[curr.id].categories.push(curr.categories)
      }
      return acc
    }, {} as Record<string, any>)

    return { 
      success: true, 
      articles: Object.values(groupedArticles)
    }
  } catch (error) {
    console.error("Error searching articles:", error)
    return { success: false, error: (error as Error).message }
  }
} 