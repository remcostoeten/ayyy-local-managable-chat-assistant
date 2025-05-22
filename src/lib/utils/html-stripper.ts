export function stripHtmlTags(html: string): string {
  // Temporarily replace anchor tags with a special marker
  const preserveAnchors = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g, '###ANCHOR_START###$1###CONTENT###$2###ANCHOR_END###')

  // Remove all other HTML tags
  const withoutTags = preserveAnchors.replace(/<[^>]*>/g, " ")

  // Replace multiple spaces with a single space
  const withoutExtraSpaces = withoutTags.replace(/\s+/g, " ")

  // Decode HTML entities
  const decoded = withoutExtraSpaces
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Restore anchor tags
  const restoredAnchors = decoded
    .replace(/###ANCHOR_START###(.*?)###CONTENT###(.*?)###ANCHOR_END###/g, '<a href="$1">$2</a>')
    .trim()

  return restoredAnchors
}

export function extractArticleContent(html: string): string | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Find the article element
  const articleElement = doc.querySelector('article')
  
  if (!articleElement) {
    return null
  }
  
  // Get the HTML content of the article
  return stripHtmlTags(articleElement.innerHTML)
}

export function generateTitleFromContent(content: string, maxLength = 60): string {
  // Get the first sentence or first few words
  const firstSentence = content.split(/[.!?]/, 1)[0].trim()

  if (firstSentence.length <= maxLength) {
    return firstSentence
  }

  // If the first sentence is too long, truncate it
  return firstSentence.substring(0, maxLength).trim() + "..."
}

export function extractPossibleCategories(content: string): string[] {
  // Split content into words and normalize
  const words = content.toLowerCase()
    .split(/[\s,.-]+/) // Split on spaces, commas, periods, and hyphens
    .filter(word => word.length > 3) // Filter out short words
  
  // Common words to exclude
  const commonWords = new Set([
    "the", "and", "for", "that", "this", "with", "from", "your", "have", "are", "not",
    "was", "were", "they", "will", "what", "when", "where", "which", "would", "could",
    "should", "their", "there", "about", "been", "more", "these", "those", "other",
    // Add Dutch common words
    "het", "een", "van", "met", "door", "zijn", "haar", "naar", "voor", "maar",
    "ook", "bij", "uit", "nog", "dit", "dat", "die", "wel", "kan", "dan"
  ])

  // Count word frequencies
  const wordFrequency = new Map<string, number>()
  words.forEach(word => {
    if (!commonWords.has(word)) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1)
    }
  })

  // Sort by frequency and get top words as categories
  const sortedWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  return sortedWords
}
