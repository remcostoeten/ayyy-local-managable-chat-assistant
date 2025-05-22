"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Paperclip, Sparkles, SendHorizontal } from "lucide-react"

interface ChatInputProps {
  className?: string
  placeholder?: string
  onSend?: (message: string) => void
  autoFocus?: boolean
  inChat?: boolean
  disabled?: boolean
  onHeroSubmit?: (message: string) => void
}

export function ChatInput({ 
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  autoFocus = false,
  inChat = false,
  disabled = false,
  onHeroSubmit
}: ChatInputProps) {
  const [message, setMessage] = React.useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    if (inChat && onSend) {
      onSend(message)
      setMessage("")
    } else if (onHeroSubmit) {
      onHeroSubmit(message)
      setMessage("")
    } else {
      // If not in chat, redirect to chat page with the message as a query param
      router.push(`/chat?message=${encodeURIComponent(message)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className={`bg-[#1c1528] rounded-full p-3 flex items-center ${disabled ? 'opacity-70' : ''}`}>
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all"
          disabled={disabled}
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent flex-1 outline-none text-gray-300 pl-4"
          autoFocus={autoFocus}
          disabled={disabled}
        />
        <button 
          type="submit"
          className={`p-2 rounded-full transition-all ${
            message.trim() && !disabled
              ? "text-purple-400 hover:bg-[#2a1f3d]" 
              : "text-gray-600 cursor-not-allowed"
          }`}
          disabled={!message.trim() || disabled}
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
} 