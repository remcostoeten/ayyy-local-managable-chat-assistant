"use client"

import type React from "react"

import { useState } from "react"
import { addKnowledgeFromHtml, bulkImportKnowledgeArticles } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { stripHtmlTags, generateTitleFromContent, extractPossibleCategories } from "@/lib/utils/html-stripper"
import { Loader2, Plus, X, Link as LinkIcon, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function KnowledgeForm() {
  const [htmlContent, setHtmlContent] = useState("")
  const [title, setTitle] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState("")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const { toast } = useToast()

  const handlePreview = () => {
    if (!htmlContent) return

    const stripped = stripHtmlTags(htmlContent)
    setPreview(stripped)

    if (!title) {
      setTitle(generateTitleFromContent(stripped))
    }

    const possibleCategories = extractPossibleCategories(stripped)
    setCategories((prev) => Array.from(new Set([...prev, ...possibleCategories])))
  }

  const handleAddCategory = () => {
    if (!newCategory) return
    setCategories((prev) => Array.from(new Set([...prev, newCategory])))
    setNewCategory("")
  }

  const handleRemoveCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("htmlContent", htmlContent)
      formData.append("title", title)
      formData.append("sourceUrl", sourceUrl)
      categories.forEach((category) => {
        formData.append("categories", category)
      })

      const result = await addKnowledgeFromHtml(formData)

      if (result.success) {
        setMessage({
          type: "success",
          text: "Kennisartikel succesvol toegevoegd!",
        })
        setHtmlContent("")
        setTitle("")
        setSourceUrl("")
        setCategories([])
        setPreview("")
      } else {
        setMessage({
          type: "error",
          text: result.error || "Er is een fout opgetreden.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Er is een fout opgetreden bij het toevoegen van het artikel.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsSubmitting(true);
      const file = e.target.files?.[0];
      if (!file) return;

      let articles;
      const content = await file.text();

      try {
        // Try to parse as JSON
        articles = JSON.parse(content);
        if (!Array.isArray(articles)) {
          throw new Error("File content must be an array of articles");
        }
      } catch (error) {
        // If JSON parsing fails, treat as single HTML article
        if (file.type === "text/html" || file.name.endsWith(".html")) {
          setHtmlContent(content);
          setTitle(file.name.replace(/\.html$/, ""));
          handlePreview();
          setIsSubmitting(false);
          e.target.value = "";
          return;
        } else {
          throw new Error("Invalid file format. Must be JSON array or HTML file.");
        }
      }

      const result = await bulkImportKnowledgeArticles(articles);

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported} articles${result.failed && result.failed > 0 ? `, ${result.failed} failed` : ""}`,
        });
        setHtmlContent("");
        setTitle("");
        setSourceUrl("");
        setCategories([]);
        setPreview("");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import articles",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      e.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>   
          Knowledge Base  
        </CardTitle>
        <CardDescription>
        Add articles to the knowledge base by writing, pasting HTML, or uploading files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="write" className="space-y-6">
          <TabsList>
            <TabsTrigger value="write">Schrijven/Plakken</TabsTrigger>
            <TabsTrigger value="upload">Bestand Uploaden</TabsTrigger>
          </TabsList>

          <TabsContent value="write">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Inhoud</Label>
                <Textarea
                  id="htmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Plak hier de HTML-inhoud of schrijf direct een artikel met HTML-opmaak..."
                  className="min-h-32 font-mono text-sm"
                  required
                />
                <div className="text-sm text-muted-foreground">
                  Tip: Je kunt hier direct HTML plakken van een webpagina of zelf HTML schrijven met tags zoals &lt;p&gt;, &lt;h1&gt;, &lt;ul&gt;, etc.
                </div>
                <Button type="button" variant="outline" onClick={handlePreview} disabled={!htmlContent || isSubmitting}>
                  Voorbeeld bekijken
                </Button>
              </div>

              {preview && (
                <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label>Voorbeeld (HTML-tags verwijderd)</Label>
                    <span className="text-xs text-muted-foreground">Dit is hoe het artikel er uit zal zien in de kennisbank</span>
                  </div>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">{preview}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel van het kennisartikel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Bron URL
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Categorieën</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nieuwe categorie"
                  />
                  <Button type="button" variant="outline" onClick={handleAddCategory} disabled={!newCategory}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Toevoegen...
                  </>
                ) : (
                  "Artikel Toevoegen"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <label
                  htmlFor="file-upload"
                  className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-5 py-4 text-center transition-colors hover:bg-gray-50 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {isSubmitting ? "Importeren..." : "Klik om te uploaden of sleep een bestand"}
                  </p>
                  <p className="text-xs text-gray-400">JSON of HTML bestanden</p>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,.html"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </div>

         
            </div>
          </TabsContent>
        </Tabs>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
