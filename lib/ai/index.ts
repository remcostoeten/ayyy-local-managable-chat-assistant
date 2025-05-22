import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { eq } from "drizzle-orm"
import { knowledgeArticles, articleCategories } from "@/lib/db/schema"
import { db } from "@/lib/db/client"

// Function to get relevant knowledge base articles for a query
export async function getRelevantKnowledge(query: string) {
  // In a real implementation, you might use embeddings and vector search
  // For simplicity, we'll just get all articles
  const articles = await db.select().from(knowledgeArticles)
  return articles.map((article: { content: any }) => article.content).join("\n\n")
}

// Function to generate a response using Groq
export async function generateAIResponse(
  query: string,
  chatHistory: { role: "user" | "assistant"; content: string }[],
) {
  try {
    // Get relevant knowledge
    const knowledgeBase = await getRelevantKnowledge(query)

    // Create system prompt
    const systemPrompt = `
      Je bent een behulpzame assistent voor een e-learning platform. 
      Beantwoord vragen alleen op basis van de gegeven kennisbank.
      Als je het antwoord niet weet, zeg dan eerlijk dat je het niet weet.
      Varieer je antwoordstijl en lengte om natuurlijk over te komen.
      Antwoord altijd in het Nederlands.
      
      Kennisbank:
      ${knowledgeBase}
    `

    // Format chat history for the AI
    const formattedHistory = chatHistory.map((msg) => {
      return {
        role: msg.role,
        content: msg.content,
      }
    })

    // Generate response
    const { text } = await generateText({
      model: groq("llama3-8b-8192"),
      messages: [{ role: "system", content: systemPrompt }, ...formattedHistory, { role: "user", content: query }],
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "Er is een fout opgetreden bij het genereren van een antwoord. Probeer het later opnieuw."
  }
}

// Function to generate suggestions based on categories
export async function generateSuggestions(categoryId?: string) {
  try {
    let relevantArticles

    if (categoryId) {
      // Get articles in the specific category
      const articleIds = await db
        .select({ articleId: articleCategories.articleId })
        .from(articleCategories)
        .where(eq(articleCategories.categoryId, categoryId))

      if (articleIds.length > 0) {
        const ids = articleIds.map((row: { articleId: any }) => row.articleId)
        relevantArticles = await db
          .select({ title: knowledgeArticles.title })
          .from(knowledgeArticles)
          .where(eq(knowledgeArticles.id, ids[0])) // Using first one for simplicity
      }
    } else {
      // Get random articles
      relevantArticles = await db.select({ title: knowledgeArticles.title }).from(knowledgeArticles).limit(5)
    }

    // Generate questions from titles
    return (relevantArticles || []).map((article: { title: string }) => {
      return `Wat is ${article.title.toLowerCase()}?`
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return ["Hoe kan ik beginnen?", "Wat zijn de populaire cursussen?", "Hoe reset ik mijn wachtwoord?"]
  }
}
