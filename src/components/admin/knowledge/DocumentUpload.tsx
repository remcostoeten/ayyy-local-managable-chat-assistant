import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ingestDocument } from '@/lib/ai/knowledge-base'
import { analyzeContent } from '@/lib/ai/content-analyzer'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Upload, FileUp, Tag } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UploadStatus {
  state: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'success' | 'error'
  progress: number
  message?: string
}

interface ContentMetadata {
  categories: string[]
  summary: string
  mainTopic: string
  suggestedTags: string[]
}

export function DocumentUpload() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metadata, setMetadata] = useState<ContentMetadata>({
    categories: [],
    summary: '',
    mainTopic: '',
    suggestedTags: []
  })
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: 'idle',
    progress: 0
  })
  const [isDragging, setIsDragging] = useState(false)

  const analyzeAndSetContent = async (text: string, documentTitle: string) => {
    try {
      setUploadStatus({
        state: 'analyzing',
        progress: 60,
        message: 'Analyzing content and extracting categories...'
      })

      const analysis = await analyzeContent(text)
      setMetadata(analysis)
      setTitle(documentTitle)
      setContent(text)

      setUploadStatus({
        state: 'processing',
        progress: 80,
        message: 'Preparing to save...'
      })

      // Add metadata to the document before ingesting
      await ingestDocument(documentTitle, text, {
        categories: analysis.categories,
        summary: analysis.summary,
        mainTopic: analysis.mainTopic,
        tags: analysis.suggestedTags
      })

      setUploadStatus({
        state: 'success',
        progress: 100,
        message: 'Document successfully processed and categorized'
      })

      toast.success('Document successfully added with categories')

      setTimeout(() => {
        setTitle('')
        setContent('')
        setMetadata({
          categories: [],
          summary: '',
          mainTopic: '',
          suggestedTags: []
        })
        setUploadStatus({
          state: 'idle',
          progress: 0
        })
      }, 2000)
    } catch (error) {
      console.error('Error processing content:', error)
      setUploadStatus({
        state: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to process content'
      })
      toast.error('Failed to process content')
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.html')) {
      setUploadStatus({
        state: 'error',
        progress: 0,
        message: 'Only HTML files are supported'
      })
      return
    }

    try {
      setUploadStatus({
        state: 'uploading',
        progress: 20,
        message: 'Reading file...'
      })

      const text = await file.text()
      
      // Extract title from HTML if not provided
      let documentTitle = title
      if (!documentTitle) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/)
        documentTitle = titleMatch ? titleMatch[1] : file.name.replace('.html', '')
      }

      await analyzeAndSetContent(text, documentTitle)
    } catch (error) {
      console.error('Error processing HTML file:', error)
      setUploadStatus({
        state: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to process HTML file'
      })
      toast.error('Failed to process HTML file')
    }
  }, [title])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setUploadStatus({
        state: 'error',
        progress: 0,
        message: 'Please fill in both title and content fields'
      })
      return
    }

    await analyzeAndSetContent(content, title)
  }

  return (
    <div className="space-y-6">
      {uploadStatus.state !== 'idle' && (
        <Alert variant={uploadStatus.state === 'error' ? 'destructive' : 'default'}>
          <div className="flex items-center gap-2">
            {uploadStatus.state === 'error' && <AlertCircle className="h-4 w-4" />}
            {uploadStatus.state === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {uploadStatus.state === 'analyzing' && <Tag className="h-4 w-4 animate-pulse" />}
            {(uploadStatus.state === 'uploading' || uploadStatus.state === 'processing') && (
              <Upload className="h-4 w-4 animate-bounce" />
            )}
            <AlertTitle>
              {uploadStatus.state === 'error' && 'Error'}
              {uploadStatus.state === 'success' && 'Success'}
              {uploadStatus.state === 'uploading' && 'Uploading'}
              {uploadStatus.state === 'analyzing' && 'Analyzing'}
              {uploadStatus.state === 'processing' && 'Processing'}
            </AlertTitle>
          </div>
          <AlertDescription>{uploadStatus.message}</AlertDescription>
          {(uploadStatus.state === 'uploading' || uploadStatus.state === 'processing' || uploadStatus.state === 'analyzing') && (
            <Progress value={uploadStatus.progress} className="mt-2" />
          )}
        </Alert>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          {
            "border-primary bg-primary/5": isDragging,
            "border-border": !isDragging
          }
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileUp className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <div className="text-sm text-muted-foreground mb-4">
          Drag and drop your HTML file here, or
          <label className="mx-1 text-primary hover:underline cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              accept=".html"
              onChange={handleFileInput}
              disabled={uploadStatus.state === 'uploading' || uploadStatus.state === 'processing'}
            />
          </label>
        </div>
        <div className="text-xs text-muted-foreground">
          Supported file type: .html
        </div>
      </div>

      {(metadata.categories.length > 0 || metadata.suggestedTags.length > 0) && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          {metadata.mainTopic && (
            <div>
              <h3 className="text-sm font-medium mb-2">Main Topic</h3>
              <Badge variant="secondary" className="text-sm">{metadata.mainTopic}</Badge>
            </div>
          )}
          
          {metadata.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Detected Categories</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.categories.map((category, i) => (
                  <Badge key={i} variant="outline" className="text-sm">{category}</Badge>
                ))}
              </div>
            </div>
          )}

          {metadata.suggestedTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Suggested Tags</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.suggestedTags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {metadata.summary && (
            <div>
              <h3 className="text-sm font-medium mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground">{metadata.summary}</p>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or enter content manually</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Document Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            required
            className={cn({
              'border-red-500 focus:ring-red-500': uploadStatus.state === 'error' && !title.trim()
            })}
            disabled={uploadStatus.state === 'uploading' || uploadStatus.state === 'processing'}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Document Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content or drop an HTML file"
            className={cn("min-h-[200px]", {
              'border-red-500 focus:ring-red-500': uploadStatus.state === 'error' && !content.trim()
            })}
            required
            disabled={uploadStatus.state === 'uploading' || uploadStatus.state === 'processing'}
          />
        </div>

        <Button 
          type="submit" 
          disabled={uploadStatus.state === 'uploading' || uploadStatus.state === 'processing'}
          className={cn({
            'bg-green-500 hover:bg-green-600': uploadStatus.state === 'success'
          })}
        >
          {uploadStatus.state === 'uploading' && 'Uploading...'}
          {uploadStatus.state === 'analyzing' && 'Analyzing...'}
          {uploadStatus.state === 'processing' && 'Processing...'}
          {uploadStatus.state === 'success' && 'Added Successfully'}
          {(uploadStatus.state === 'idle' || uploadStatus.state === 'error') && 'Add to Knowledge Base'}
        </Button>
      </form>
    </div>
  )
} 