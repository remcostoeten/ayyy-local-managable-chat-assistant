"use client"

import { useState, useEffect, useRef } from "react"
import type { IChatMessage } from "@/modules/chat/types"
import ChatInterface from "@/modules/chat/components/ChatInterface"
import styles from "./SupportChatbot.module.css"

const SupportChatbot = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: "1",
        content:
          "Hallo! Welkom bij All You Can Learn support. Hoe kan ik je vandaag helpen? (Hello! Welcome to All You Can Learn support. How can I help you today?)",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: IChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate a response
    setTimeout(() => {
      const assistantMessage: IChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `You asked: "${message}". This is a placeholder response. In the next step, we'll integrate a real LLM.`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
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
        <div className={styles.chatWindow} ref={chatContainerRef}>
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
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}

export default SupportChatbot

