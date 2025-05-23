"use client"

import { Button } from "@/components/ui/button"

const SUGGESTIONS = [
  {
    text: "Explain a complex topic",
    examples: [
      "Explain quantum computing in simple terms",
      "How does blockchain work?",
      "What is machine learning?"
    ]
  },
  {
    text: "Write & analyze code",
    examples: [
      "Write a React component for a todo list",
      "Debug this JavaScript function",
      "Optimize this SQL query"
    ]
  },
  {
    text: "Creative writing",
    examples: [
      "Write a short story about time travel",
      "Create a product description",
      "Draft a professional email"
    ]
  }
]

interface ChatSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void
}

export default function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Suggested prompts</h3>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((category) => (
          category.examples.map((example, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onSuggestionClick?.(example)}
            >
              {example}
            </Button>
          ))
        ))}
      </div>
    </div>
  )
} 