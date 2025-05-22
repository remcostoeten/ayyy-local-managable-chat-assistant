"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Copy, Code, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"

interface ChatMessageProps {
  content: string
  role: "user" | "assistant"
  timestamp?: Date
  isLoading?: boolean
}

export function ChatMessage({ content, role, timestamp, isLoading }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const components: Components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      return !inline && match ? (
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <SyntaxHighlighter
            language={match[1]}
            style={vscDarkPlus}
            customStyle={{ margin: 0 }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={cn("bg-muted px-1.5 py-0.5 rounded-md", className)} {...props}>
          {children}
        </code>
      )
    },
    img({ src, alt, ...props }) {
      if (!src) return null
      return (
        <div className="relative rounded-lg overflow-hidden">
          <img src={src} alt={alt || ""} className="max-w-full h-auto" {...props} />
          <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => window.open(src, "_blank")}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg",
        role === "assistant" ? "bg-secondary" : "bg-primary/5"
      )}
    >
      <div className="flex-1 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        ) : (
          <>
            <ReactMarkdown components={components} className="prose prose-sm dark:prose-invert max-w-none">
              {content}
            </ReactMarkdown>
            {timestamp && (
              <time className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                }).format(timestamp)}
              </time>
            )}
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </motion.div>
  )
} 