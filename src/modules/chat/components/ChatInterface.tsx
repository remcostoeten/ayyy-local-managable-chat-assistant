"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { IChatMessage } from "@/modules/chat/types"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import SuggestedQuestions from "./suggested-questions/SuggestedQuestions"
import styles from "./ChatInterface.module.css"

interface IChatInterfaceProps {
  messages: IChatMessage[]
  onSendMessage: (message: string) => void
  isLoading: boolean
}

const ChatInterface = ({ messages, onSendMessage, isLoading }: IChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  const handleSuggestedQuestionClick = (question: string) => {
    onSendMessage(question)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const suggestedQuestions = [
    "How do I start a course?",
    "How do I unenroll from a course?",
    "What is the structure of a course?",
    "How do I choose a mentor?",
    "Can I get an invoice for my purchase?",
  ]

  return (
    <div className={styles.chatInterface}>
      <div className={styles.messagesContainer}>
        <MessageList messages={messages} />
        {isLoading && (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <SuggestedQuestions questions={suggestedQuestions} onQuestionClick={handleSuggestedQuestionClick} />
      )}

      <MessageInput value={inputValue} onChange={handleInputChange} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}

export default ChatInterface

