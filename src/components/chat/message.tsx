import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Markdown } from "@/components/ui/markdown"

interface ChatMessageProps {
  content: string
  role: "assistant" | "user"
  avatar?: string
  name?: string
  timestamp?: string
  isLoading?: boolean
  isError?: boolean
}

export function ChatMessage({
  content,
  role,
  avatar,
  name = role === "assistant" ? "AI" : "You",
  timestamp,
  isLoading,
  isError
}: ChatMessageProps) {
  const isAssistant = role === "assistant"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative flex gap-3 px-4 py-3",
        isAssistant ? "bg-muted/50" : "bg-background"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 select-none">
        <AvatarImage src={avatar} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isAssistant ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {name}
          </span>
          {timestamp && (
            <span className="text-[10px] text-muted-foreground">
              {timestamp}
            </span>
          )}
        </div>

        <Card className={cn(
          "prose prose-sm dark:prose-invert max-w-none p-3 text-sm shadow-sm break-words",
          isAssistant 
            ? "bg-background rounded-tl-none prose-pre:bg-muted" 
            : "bg-primary text-primary-foreground rounded-tr-none",
          isError && "border-red-500 bg-red-500/10 text-red-500"
        )}>
          {isLoading ? (
            <div className="flex gap-1 py-2">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <Markdown>{content}</Markdown>
          )}
        </Card>
      </div>
    </motion.div>
  )
} 