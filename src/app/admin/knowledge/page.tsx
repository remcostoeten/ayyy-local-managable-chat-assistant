"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreVertical, Pencil, Trash, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ArticleDialog } from "@/components/admin/knowledge/article-dialog"
import { useToast } from "@/components/ui/use-toast"
import { createArticle, getArticles, updateArticle, deleteArticle } from "@/lib/db"
import KnowledgeForm from "@/components/admin/knowledge-form"

interface Article {
  id: string
  title: string
  content: string
  updatedAt: Date
  sourceUrl?: string
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const result = await getArticles()
      if (!result.success) throw new Error(result.error)
      setArticles(result.articles)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedArticle(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async (articleId: string) => {
    try {
      const result = await deleteArticle(articleId)
      if (!result.success) throw new Error(result.error)
      
      setArticles(prev => prev.filter(a => a.id !== articleId))
      toast({
        title: "Success",
        description: "Article deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      })
    }
  }

  const handleSave = async (articleData: { title: string; content: string }) => {
    try {
      if (selectedArticle) {
        // Update existing article
        const result = await updateArticle(selectedArticle.id, articleData)
        if (!result.success) throw new Error(result.error)
        
        setArticles(prev => prev.map(a => 
          a.id === selectedArticle.id ? result.article : a
        ))
        toast({
          title: "Success",
          description: "Article updated successfully"
        })
      } else {
        // Create new article
        const result = await createArticle(articleData)
        if (!result.success) throw new Error(result.error)
        
        setArticles(prev => [...prev, result.article])
        toast({
          title: "Success",
          description: "Article created successfully"
        })
      }
      setDialogOpen(false)
      setSelectedArticle(undefined)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive"
      })
    }
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kennisartikelen</h1>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuw artikel
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Beheer de artikelen in je kennisbank
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoeken in artikelen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group relative flex flex-col space-y-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{article.title}</h3>
                    <div className="text-sm text-muted-foreground line-clamp-2 prose prose-sm dark:prose-invert">
                      {article.content}
                    </div>
                    {article.sourceUrl && (
                      <a 
                        href={article.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Source
                      </a>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => handleEdit(article)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bewerken
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-xs text-muted-foreground">
                  Bijgewerkt {formatDistanceToNow(article.updatedAt, { locale: nl, addSuffix: true })}
                </div>
              </div>
            ))}
            <KnowledgeForm/>  
            {filteredArticles.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Geen artikelen gevonden
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      <ArticleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        article={selectedArticle}
        onSave={handleSave}
      />
    </div>
  )
}
