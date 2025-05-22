"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Search } from "lucide-react"
import { db } from "@/lib/db/client"
import { knowledgeArticles, embeddings } from "@/lib/db/schema"
import { findSimilarArticles } from "@/lib/ai/embeddings"
import { eq } from "drizzle-orm"

export default function EmbeddingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerateProgress, setRegenerateProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{
    articleId: string
    title: string
    similarity: number
    chunkText: string
  }>>([])
  const [stats, setStats] = useState<{
    totalArticles: number
    totalEmbeddings: number
    averageChunksPerArticle: number
  } | null>(null)

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const articles = await db.select().from(knowledgeArticles)
      const allEmbeddings = await db.select().from(embeddings)
      
      setStats({
        totalArticles: articles.length,
        totalEmbeddings: allEmbeddings.length,
        averageChunksPerArticle: allEmbeddings.length / articles.length || 0
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const results = await findSimilarArticles(searchQuery)
      
      // Get article titles
      const articlesWithTitles = await Promise.all(
        results.map(async (result) => {
          const article = await db
            .select({ title: knowledgeArticles.title })
            .from(knowledgeArticles)
            .where(eq(knowledgeArticles.id, result.articleId))
            .get()

          return {
            ...result,
            title: article?.title || "Unknown Article"
          }
        })
      )

      setSearchResults(articlesWithTitles)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegenerateEmbeddings() {
    if (!confirm("Are you sure you want to regenerate all embeddings? This may take a while.")) {
      return
    }

    setIsRegenerating(true)
    try {
      // Get all articles
      const articles = await db.select().from(knowledgeArticles)
      setRegenerateProgress({ current: 0, total: articles.length })

      // Process each article
      for (const [index, article] of articles.entries()) {
        try {
          // Delete existing embeddings
          await db.delete(embeddings).where(eq(embeddings.articleId, article.id))
          
          // Generate new embeddings
          await storeEmbedding(article.id, article.content)
          
          setRegenerateProgress({ current: index + 1, total: articles.length })
        } catch (error) {
          console.error(`Error regenerating embeddings for article ${article.title}:`, error)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Refresh stats
      await loadStats()
    } catch (error) {
      console.error("Error regenerating embeddings:", error)
    } finally {
      setIsRegenerating(false)
      setRegenerateProgress(null)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Embeddings Management</CardTitle>
            <CardDescription>
              Manage and test vector embeddings for your knowledge base
            </CardDescription>
          </div>
          <Button 
            onClick={handleRegenerateEmbeddings} 
            disabled={isRegenerating}
            variant="outline"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {regenerateProgress 
                  ? `${regenerateProgress.current}/${regenerateProgress.total}`
                  : "Regenerating..."}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats?.totalArticles || "-"}</div>
                <p className="text-sm text-gray-500">Total Articles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats?.totalEmbeddings || "-"}</div>
                <p className="text-sm text-gray-500">Total Embeddings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {stats?.averageChunksPerArticle.toFixed(1) || "-"}
                </div>
                <p className="text-sm text-gray-500">Avg. Chunks per Article</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Test */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Vector Search</Label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a search query..."
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Search Results</h3>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{result.title}</h4>
                          <div className="text-sm text-gray-500">
                            {(result.similarity * 100).toFixed(1)}% match
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {result.chunkText}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 