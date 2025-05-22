"use server"

import { db } from "@/lib/db/client"
import { knowledgeArticles, categories, articleCategories, suggestions, modelSettings } from "@/lib/db/schema"
import { stripHtmlTags, generateTitleFromContent, extractPossibleCategories } from "@/lib/utils/html-stripper"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { updateEmbedding, storeEmbedding } from "@/lib/ai/embeddings"

// Add a knowledge article from HTML
export async function addKnowledgeFromHtml(formData: FormData) {
  try {
    const htmlContent = formData.get("htmlContent")
    const title = formData.get("title")
    const categoryValues = formData.getAll("categories")

    if (!htmlContent || typeof htmlContent !== "string") {
      return { success: false, error: "HTML content is required and must be a string" }
    }

    if (!title || typeof title !== "string") {
      return { success: false, error: "Title is required and must be a string" }
    }

    // Strip HTML tags
    const strippedContent = stripHtmlTags(htmlContent)

    // Extract possible categories
    const possibleCategories = extractPossibleCategories(strippedContent)

    // Insert article
    const article = await db
      .insert(knowledgeArticles)
      .values({
        title,
        content: strippedContent,
      })
      .returning()
      .get()

    if (!article) {
      throw new Error("Failed to create article")
    }

    // Process categories
    const selectedCategories = categoryValues.map(cat => String(cat))
    const categoriesToAdd = Array.from(new Set([...selectedCategories, ...possibleCategories]))

    for (const categoryName of categoriesToAdd) {
      if (!categoryName) continue;
      
      // Check if category exists
      let category = await db.select().from(categories).where(eq(categories.name, categoryName)).get()

      // If not, create it
      if (!category) {
        category = await db.insert(categories).values({ name: categoryName }).returning().get()
        if (!category) {
          console.error(`Failed to create category: ${categoryName}`)
          continue
        }
      }

      // Link article to category
      await db.insert(articleCategories).values({
        articleId: article.id,
        categoryId: category.id,
      })
    }

    revalidatePath("/admin/knowledge")
    return { success: true, articleId: article.id }
  } catch (error) {
    console.error("Error adding knowledge:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Get all knowledge articles
export async function getKnowledgeArticles() {
  try {
    const articles = await db.select().from(knowledgeArticles)
    return { success: true, articles }
  } catch (error) {
    console.error("Error getting knowledge articles:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      articles: [],
    }
  }
}

// Get all categories
export async function getCategories() {
  try {
    const allCategories = await db.select().from(categories)
    return { success: true, categories: allCategories }
  } catch (error) {
    console.error("Error getting categories:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      categories: [],
    }
  }
}

// Delete a knowledge article
export async function deleteKnowledgeArticle(id: string) {
  try {
    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id))
    revalidatePath("/admin/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Error deleting knowledge article:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Add a suggestion
export async function addSuggestion(text: string, categoryId?: string) {
  try {
    await db.insert(suggestions).values({
      text,
      categoryId,
    })
    revalidatePath("/admin/suggestions")
    return { success: true }
  } catch (error) {
    console.error("Error adding suggestion:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get all suggestions
export async function getSuggestions() {
  try {
    const allSuggestions = await db.select().from(suggestions)
    return { success: true, suggestions: allSuggestions }
  } catch (error) {
    console.error("Error getting suggestions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      suggestions: [],
    }
  }
}

// Delete a suggestion
export async function deleteSuggestion(id: string) {
  try {
    await db.delete(suggestions).where(eq(suggestions.id, id))
    revalidatePath("/admin/suggestions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting suggestion:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get model settings
export async function getModelSettings() {
  try {
    const settings = await db.select().from(modelSettings).where(eq(modelSettings.id, "default")).get()
    return { success: true, settings }
  } catch (error) {
    console.error("Error getting model settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update model settings
export async function updateModelSettings(settings: {
  id: string
  model: string
  temperature: number
  systemPrompt: string
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  updatedAt?: Date
}) {
  try {
    // Check if settings exist
    const existing = await db.select().from(modelSettings).where(eq(modelSettings.id, settings.id)).get()

    if (existing) {
      // Update existing settings
      await db
        .update(modelSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(modelSettings.id, settings.id))
    } else {
      // Create new settings
      await db.insert(modelSettings).values({
        ...settings,
        updatedAt: new Date(),
      })
    }

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating model settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Edit a knowledge article
export async function editKnowledgeArticle(articleId: string, data: {
  title?: string;
  content?: string;
  sourceUrl?: string;
  categories?: string[];
}) {
  try {
    // Update the article
    const article = await db
      .update(knowledgeArticles)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        updatedAt: new Date(),
      })
      .where(eq(knowledgeArticles.id, articleId))
      .returning()
      .get();

    if (!article) {
      throw new Error("Article not found");
    }

    // Update categories if provided
    if (data.categories) {
      // Delete existing categories
      await db
        .delete(articleCategories)
        .where(eq(articleCategories.articleId, articleId));

      // Add new categories
      for (const categoryName of data.categories) {
        // Check if category exists
        let category = await db
          .select()
          .from(categories)
          .where(eq(categories.name, categoryName))
          .get();

        // If not, create it
        if (!category) {
          category = await db
            .insert(categories)
            .values({ name: categoryName })
            .returning()
            .get();
        }

        // Link article to category
        await db.insert(articleCategories).values({
          articleId: article.id,
          categoryId: category.id,
        });
      }
    }

    // Update embeddings if content changed
    if (data.content) {
      await updateEmbedding(articleId, data.content);
    }

    revalidatePath("/admin/knowledge");
    return { success: true, article };
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkImportKnowledgeArticles(articles: Array<{
  title: string;
  content: string;
  sourceUrl?: string;
  categories?: string[];
  isHtml?: boolean;
}>) {
  try {
    const results = [];
    const errors = [];

    for (const article of articles) {
      try {
        let processedContent = article.content;
        
        // If content is HTML and isHtml flag is true, strip HTML
        if (article.isHtml) {
          processedContent = stripHtmlTags(article.content);
        }

        // Create article
        const newArticle = await db
          .insert(knowledgeArticles)
          .values({
            title: article.title,
            content: processedContent,
            sourceUrl: article.sourceUrl,
          })
          .returning()
          .get();

        // Process categories
        if (article.categories?.length) {
          for (const categoryName of article.categories) {
            // Check if category exists
            let category = await db
              .select()
              .from(categories)
              .where(eq(categories.name, categoryName))
              .get();

            // If not, create it
            if (!category) {
              category = await db
                .insert(categories)
                .values({ name: categoryName })
                .returning()
                .get();
            }

            // Link article to category
            await db.insert(articleCategories).values({
              articleId: newArticle.id,
              categoryId: category.id,
            });
          }
        }

        // Generate embeddings
        await storeEmbedding(newArticle.id, processedContent);

        results.push(newArticle);
      } catch (error) {
        console.error("Error importing article:", error);
        errors.push({
          title: article.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    revalidatePath("/admin/knowledge");
    return {
      success: true,
      imported: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error in bulk import:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
