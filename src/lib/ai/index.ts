import { db } from "../db/client"
import { knowledgeArticles, articleCategories, suggestions, modelSettings } from "../db/schema"
import { eq } from "drizzle-orm"
import { MODEL_DEFAULTS } from "../config/model-defaults"
import { findSimilarArticles } from "./embeddings"

interface SimilarArticle {
  articleId: string;
  similarity: number;
  chunkText: string;
}

interface ArticleWithContext {
  id: string;
  title: string;
  content: string;
  similarity: number;
  relevantChunk: string;
}

export async function getRelevantKnowledge(query: string) {
  try {
    console.log('Finding relevant articles for query:', query);
    
    // Find similar articles using vector similarity - reduced to 3 for faster processing
    const similarArticles = await findSimilarArticles(query, 3) as SimilarArticle[];
    
    if (!similarArticles.length) {
      console.log('No similar articles found');
      return {
        combinedContent: "",
        sources: []
      };
    }

    // Get the full article content for similar articles
    const articles = await Promise.all(
      similarArticles.map(async ({ articleId, similarity, chunkText }) => {
        const article = await db
          .select({
            id: knowledgeArticles.id,
            title: knowledgeArticles.title,
            content: knowledgeArticles.content,
            categoryId: articleCategories.categoryId
          })
          .from(knowledgeArticles)
          .leftJoin(articleCategories, eq(knowledgeArticles.id, articleCategories.articleId))
          .where(eq(knowledgeArticles.id, articleId))
          .get();

        if (!article) return null;

        // Get category name if categoryId exists
        let categoryName = '';
        if (article.categoryId) {
          const category = await db
            .select({ name: articleCategories.categoryId })
            .from(articleCategories)
            .where(eq(articleCategories.categoryId, article.categoryId))
            .get();
          if (category) {
            categoryName = category.name;
          }
        }

        // Find the most relevant section using the chunk
        const chunkIndex = article.content.indexOf(chunkText);
        
        // Expand context window based on similarity score
        // Higher similarity = smaller window, lower similarity = larger window
        const baseWindow = 500;
        const contextWindow = Math.round(baseWindow / similarity);
        
        // Get context around the chunk
        const start = Math.max(0, chunkIndex - contextWindow);
        const end = Math.min(article.content.length, chunkIndex + chunkText.length + contextWindow);
        const contextContent = article.content.slice(start, end);

        // Add category context if available
        const categoryContext = categoryName ? `[Category: ${categoryName}] ` : '';

        return {
          id: article.id,
          title: article.title,
          content: `${categoryContext}${contextContent}`,
          similarity,
          relevantChunk: chunkText
        } as ArticleWithContext;
      })
    );

    // Filter out any null results and sort by similarity
    const validArticles = articles
      .filter((article): article is ArticleWithContext => article !== null)
      .sort((a, b) => b.similarity - a.similarity);
    
    console.log(`Found ${validArticles.length} relevant articles`);
    
    // Format the content to highlight relevance and context
    const combinedContent = validArticles
      .map(article => {
        const relevancePercent = (article.similarity * 100).toFixed(1);
        return `[Relevance: ${relevancePercent}%]
Title: ${article.title}
Content: ${article.content}
---`
      })
      .join("\n\n");
    
    return {
      combinedContent,
      sources: validArticles.map(article => ({
        id: article.id,
        title: article.title,
        preview: article.relevantChunk,
        similarity: article.similarity
      }))
    };
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return {
      combinedContent: "",
      sources: []
    };
  }
}

async function getAISettings() {
  try {
    console.log('Fetching AI settings...');
    const settings = await db.select().from(modelSettings).where(eq(modelSettings.id, "default")).get()
    console.log('AI settings from database:', settings);

    // If we have settings in the database, use those
    if (settings) {
      console.log('Using existing settings with model:', settings.model);
      return settings;
    }

    // If no settings exist, create default settings in database
    console.log('No settings found, creating defaults...');
    const defaultSettings = MODEL_DEFAULTS;
    await db.insert(modelSettings).values(defaultSettings);
    console.log('Created default settings with model:', defaultSettings.model);
    return defaultSettings;
  } catch (error) {
    console.error('Error in getAISettings:', error);
    throw error;
  }
}

// Function to generate a response using Ollama
export async function generateAIResponse(
  query: string,
  chatHistory: { role: "user" | "assistant"; content: string }[],
) {
  try {
    console.log('Generating AI response for query:', query);
    console.log('Chat history:', chatHistory);

    // Get relevant knowledge
    const { combinedContent: knowledgeBase, sources } = await getRelevantKnowledge(query)
    console.log('Knowledge base length:', knowledgeBase.length);

    // Get model settings
    const settings = await getAISettings()

    // If no system prompt is configured, return an error message
    if (!settings.systemPrompt || settings.systemPrompt === "Waiting for system prompt to be configured in admin settings...") {
      console.error('No system prompt configured in admin settings');
      return "De chatbot is nog niet geconfigureerd. Configureer eerst de instellingen in het admin paneel.";
    }

    // Create system prompt
    const systemPrompt = `${settings.systemPrompt}

KENNISBANK START
----------------
${knowledgeBase}
----------------
KENNISBANK EIND

${knowledgeBase.length === 0 ? `
Opmerking: Er is geen relevante informatie gevonden in de kennisbank voor deze vraag.
Informeer de gebruiker hierover en vraag om een andere vraag.
` : `
Opmerking: Gebruik bovenstaande kennisbank informatie voor je antwoord.
Voeg aan het einde van je antwoord de gebruikte bronnen toe in dit formaat:

Bronnen:
[ID] Titel - Preview
`}`;

    console.log('System prompt:', systemPrompt);
    console.log('Using model:', settings.model);

    // Format chat history for Ollama
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: query }
    ];

    // Call Ollama API
    console.log('Calling Ollama API...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model,
        prompt: messages.map(m => `${m.role === 'system' ? '<<SYS>>\n' : ''}${m.content}${m.role === 'system' ? '\n<</SYS>>\n\n' : '\n'}`).join(''),
        options: {
          temperature: settings.temperature,
          top_p: settings.topP,
          num_predict: settings.maxTokens,
          frequency_penalty: settings.frequencyPenalty,
          presence_penalty: settings.presencePenalty,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      if (response.status === 404) {
        return "Het gekozen AI model is niet beschikbaar. Controleer of het model correct is geïnstalleerd met 'pnpm check-ollama'.";
      }
      
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('Generated response:', data);
    
    // Add sources to the response
    const aiResponse = data.response;
    const sourcesSection = sources.length > 0 ? "\n\nBronnen:\n" + sources.map(s => 
      `[${s.id}] ${s.title} - ${s.preview}`
    ).join("\n") : "";
    
    return aiResponse + sourcesSection;
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return "Kan geen verbinding maken met Ollama. Zorg ervoor dat Ollama draait met 'pnpm check-ollama'.";
      }
      
      if (error.message.includes('not loaded')) {
        return "Het AI model is niet geladen. Start Ollama opnieuw met 'pnpm check-ollama'.";
      }
    }
    
    return "Er is een fout opgetreden bij het genereren van een antwoord. Controleer de server logs voor meer details.";
  }
}

// Function to generate suggestions based on categories
export async function generateSuggestions(categoryId?: string) {
  try {
    // Get suggestions from the database
    const baseQuery = db.select().from(suggestions);
    
    // If category is specified, filter by it
    const query = categoryId 
      ? baseQuery.where(eq(suggestions.categoryId, categoryId))
      : baseQuery;
    
    // Limit to 5 suggestions and get them
    const dbSuggestions = await query.limit(5);
    
    // Return the suggestions, or empty array if none found
    return dbSuggestions.map(suggestion => suggestion.text);
    
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}
