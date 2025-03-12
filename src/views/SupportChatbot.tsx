
"use client"

import type React from "react"

import { useState } from "react"
import type { IChatMessage } from "@/modules/chat/types"
import styles from "./SupportChatbot.module.css"

const SupportChatbot = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: "1",
      content:
        "Hallo! Welkom bij All You Can Learn support. Hoe kan ik je vandaag helpen? (Hello! Welcome to All You Can Learn support. How can I help you today?)",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      // Add user message
      const userMessage: IChatMessage = {
        id: Date.now().toString(),
        content: inputValue,
        role: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)

      // For now, just echo back the message with a delay
      setTimeout(() => {
        const assistantMessage: IChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `You said: ${inputValue}`,
          role: "assistant",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  return (
    <div className={styles.chatbotContainer}>
      {!isChatOpen ? (
        <button onClick={toggleChat} className={styles.chatButton} aria-label="Open support chat">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      ) : (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h2>All You Can Learn Support</h2>
            <button onClick={toggleChat} className={styles.closeButton} aria-label="Close support chat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageContainer} ${message.role === "user" ? styles.userMessage : styles.assistantMessage
                  }`}
              >
                <div className={styles.messageContent}>{message.content}</div>
                <div className={styles.messageTime}>
                  {new Intl.DateTimeFormat("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(message.timestamp))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type je vraag hier... (Type your question here...)"
              className={styles.inputField}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default SupportChatbot

