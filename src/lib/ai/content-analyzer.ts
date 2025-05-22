import { OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { parse } from 'node-html-parser'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

interface ContentAnalysis {
  categories: string[]
  summary: string
  mainTopic: string
  suggestedTags: string[]
}

export async function analyzeContent(htmlContent: string): Promise<ContentAnalysis> {
  // Parse HTML to extract meaningful text
  const root = parse(htmlContent)
  
  // Remove script and style tags
  root.querySelectorAll('script, style').forEach(el => el.remove())
  
  // Extract text from article tag if it exists, otherwise use body
  const articleContent = root.querySelector('article')?.textContent || root.querySelector('body')?.textContent || ''
  
  // Clean up the text
  const cleanText = articleContent
    .replace(/\\s+/g, ' ')
    .trim()
    .slice(0, 1500) // Limit text length for API

  const prompt = `Analyze the following content and provide:
1. 3-5 relevant categories
2. A brief summary (max 100 words)
3. The main topic
4. 5-8 relevant tags

The categories should be specific and meaningful, not just technical terms like "html" or "css".
Focus on the subject matter and content type.

Content:
${cleanText}

Respond in JSON format:
{
  "categories": ["category1", "category2", ...],
  "summary": "brief summary",
  "mainTopic": "main topic",
  "suggestedTags": ["tag1", "tag2", ...]
}`

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a content analyzer that extracts meaningful categories and insights from text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const result = await response.json()
    const analysis = JSON.parse(result.choices[0].message.content)

    return {
      categories: analysis.categories || [],
      summary: analysis.summary || '',
      mainTopic: analysis.mainTopic || '',
      suggestedTags: analysis.suggestedTags || []
    }
  } catch (error) {
    console.error('Error analyzing content:', error)
    return {
      categories: [],
      summary: '',
      mainTopic: '',
      suggestedTags: []
    }
  }
} 