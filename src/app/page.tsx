'use client'
import {Hero} from "@/components/landing/hero";
import ChatBubble from "@/components/chat/chat-bubble";
import { Metadata } from "next";
import { useRef, RefObject } from "react";
import type { ChatBubbleHandle } from "@/components/chat/chat-bubble";

// export const metadata: Metadata = {
//     title: "Local AI sandbox",
//     description: "A sandbox turned feature-rich RAG embedded knowledge base with local LLM, admin dashboard for knowledge managment, chat history, ai-managemet and more. Built with Next.jS, Drizle-ORM, Groq/Ollama, SQLite (turso.tech).",
//   }
  
export default function Home() {
  const chatBubbleRef = useRef<ChatBubbleHandle>(null) as RefObject<ChatBubbleHandle>;

  return (
    <>
      <Hero chatBubbleRef={chatBubbleRef} />
      <ChatBubble ref={chatBubbleRef} isWidget={true} />
    </>
  );
}