"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { searchKnowledge } from "@/app/actions/knowledge"
import { useDebounce } from "@/hooks/use-debounce"

type TSearchResult =  {
  id: string
  title: string
  content: string
  categories: string[]
  createdAt: Date
  updatedAt: Date
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      try {
        setIsLoading(true)
        const result = await searchKnowledge(debouncedQuery)
        if (result.success && result.articles) {
          setResults(result.articles as TSearchResult[])
        }
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search knowledge base..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        <div className="absolute right-3 top-2.5">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((article) => (
            <div key={article.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{article.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {article.content}
              </p>
              {article.categories.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {article.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                Last updated: {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {query && !isLoading && results.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
} 