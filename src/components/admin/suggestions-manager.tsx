"use client"

import { useState, useEffect } from "react"
import { getSuggestions, addSuggestion, deleteSuggestion, getCategories } from "@/app/actions/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Loader2 } from "lucide-react"

interface Suggestion {
  id: string
  text: string
  categoryId: string | null
  createdAt: Date
}

interface Category {
  id: string
  name: string
}

export default function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newSuggestion, setNewSuggestion] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      const [suggestionsResult, categoriesResult] = await Promise.all([getSuggestions(), getCategories()])

      if (suggestionsResult.success) {
        setSuggestions(suggestionsResult.suggestions)
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.categories)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleAddSuggestion = async () => {
    if (!newSuggestion) return

    setIsSubmitting(true)

    const result = await addSuggestion(newSuggestion, selectedCategory || undefined)

    if (result.success) {
      // Refresh suggestions
      const suggestionsResult = await getSuggestions()
      if (suggestionsResult.success) {
        setSuggestions(suggestionsResult.suggestions)
      }

      setNewSuggestion("")
      setSelectedCategory("")
    }

    setIsSubmitting(false)
  }

  const handleDeleteSuggestion = async (id: string) => {
    const result = await deleteSuggestion(id)

    if (result.success) {
      setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id))
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Algemeen"
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "Onbekend"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggesties beheren</CardTitle>
        <CardDescription>Voeg suggesties toe die gebruikers kunnen zien in de chat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new suggestion */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Nieuwe suggestie toevoegen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="suggestion" className="sr-only">
                  Suggestie
                </Label>
                <Input
                  id="suggestion"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  placeholder="Typ een nieuwe suggestie..."
                />
              </div>
              <div>
                <Label htmlFor="category" className="sr-only">
                  Categorie
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Algemeen</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddSuggestion}
              disabled={!newSuggestion || isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Toevoegen...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Toevoegen
                </>
              )}
            </Button>
          </div>

          {/* Suggestions list */}
          <div>
            <h3 className="text-sm font-medium mb-4">Huidige suggesties</h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nog geen suggesties toegevoegd.</div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <p>{suggestion.text}</p>
                      <p className="text-xs text-gray-500 mt-1">Categorie: {getCategoryName(suggestion.categoryId)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSuggestion(suggestion.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
