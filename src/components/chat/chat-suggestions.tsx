"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getSuggestionsForChat } from "@/app/actions/chat"
import { MessageSquarePlus } from "lucide-react"

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

export default function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const result = await getSuggestionsForChat()
        if (result.success && result.suggestions) {
          setSuggestions(result.suggestions)
        }
      } catch (error) {
        console.error("Error loading suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (!suggestions.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow transition-all duration-200 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 max-w-full"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <MessageSquarePlus className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{suggestion}</span>
        </Button>
      ))}
    </div>
  )
} 