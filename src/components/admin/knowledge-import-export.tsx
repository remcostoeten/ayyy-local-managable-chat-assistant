"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Download, Loader2 } from "lucide-react"
import { importKnowledgeArticles, exportKnowledgeArticles } from "@/app/actions/knowledge"
import { useToast } from "@/components/ui/use-toast"

type TImportResult = {
  success: boolean
  articles?: Array<{ id: string; title: string; content: string }>
  error?: string
}

type TExportResult = {
  success: boolean
  articles?: Array<{
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    categories: string[]
  }>
  error?: string
}

export default function KnowledgeImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()


async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
  try {
      setIsImporting(true)
      const file = e.target.files?.[0]
      if (!file) return

      const content = await file.text()
      let articles

      const isHtml = file.type === 'text/html' || file.name.endsWith('.html')
      
      if (isHtml) {
        articles = [{
          content,
          isHtml: true
        }]
      } else {
        articles = JSON.parse(content)
        if (!Array.isArray(articles)) {
          throw new Error("Invalid JSON format. Expected an array of articles.")
        }
      }

      const result = await importKnowledgeArticles(articles) as TImportResult
      Import/E
      if (result.success && result.articles) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.articles.length} articles.`,
        })
      } else {
        throw new Error(result.error || "Import failed")
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      e.target.value = ""
    }
  }

  async function handleExport() {
    try {
      setIsExporting(true)
      const result = await exportKnowledgeArticles() as TExportResult

      if (result.success && result.articles) {
        const blob = new Blob([JSON.stringify(result.articles, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `knowledge-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: `Exported ${result.articles.length} articles.`,
        })
      } else {
        throw new Error(result.error || "Export failed")
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Import/Export Knowledge Base</h2>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept=".json,.html"
            onChange={handleImport}
            disabled={isImporting}
            className="hidden"
            id="import-file"
          />
          <Button
            asChild
            variant="outline"
            className="w-full"
            disabled={isImporting}
          >
            <label htmlFor="import-file" className="cursor-pointer">
              {isImporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Import Articles
            </label>
          </Button>
        </div>

        <Button
          variant="outline"
          className="flex-1"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Articles
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Supported formats:</p>
        <ul className="mt-2 space-y-2">
          <li>
            <strong>JSON</strong> - Array of articles:
            <pre className="mt-1 p-2 bg-muted rounded-md">
{JSON.stringify([{
  "title": "Article Title",
  "content": "Article content...",
  "categories": ["Category 1", "Category 2"]
}], null, 2)}
            </pre>
          </li>
          <li>
            <strong>HTML</strong> - Full HTML page with <code>&lt;article&gt;</code> tag:
            <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
{`<html>
  <body>
    <article>
      Article content goes here...
    </article>
  </body>
</html>`}
            </pre>
          </li>
        </ul>
      </div>
    </div>
  )
} 