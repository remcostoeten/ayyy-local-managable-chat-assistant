"use server"

import { db } from "@/lib/db/client"
import { chatSessions, chatMessages, suggestions, chatSessionMetadata } from "@/lib/db/schema"
import { generateAIResponse, generateSuggestions } from "@/lib/ai"
import { eq, desc, and } from "drizzle-orm"

export type ChatSessionResponse = {
  success: boolean
  sessionId?: string
  error?: string
}

export type ChatMessageResponse = {
  success: boolean
  message?: {
    id: string
    content: string
  }
  error?: string
}

export type ChatSuggestionsResponse = {
  success: boolean
  suggestions?: string[]
  error?: string
}

export async function createChatSession(userId: string): Promise<ChatSessionResponse> {
  try {
    const sessionId = `session-${Math.random().toString(36).substring(2, 9)}`
    return { success: true, sessionId }
  } catch (error) {
    console.error("Error creating chat session:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getChatHistory(sessionId: string) {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)

    return {
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    }
  } catch (error) {
    console.error("Error getting chat history:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      messages: [],
    }
  }
}

export async function sendMessage(sessionId: string, message: string, userId: string): Promise<ChatMessageResponse> {
  try {
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (!session.length) {
      await db.insert(chatSessions).values({
        id: sessionId,
        userId,
        createdAt: new Date(),
      });
    }

    const history = await getChatHistory(sessionId);
    const messages = history.success ? history.messages : [];

    const response = await generateAIResponse(message, messages);

    if (db) {
      await db.insert(chatMessages).values([
        {
          sessionId,
          content: message,
          role: "user",
        },
        {
          sessionId,
          content: response,
          role: "assistant",
        },
      ]);
    }

    return {
      success: true,
      message: {
        id: `msg-${Math.random().toString(36).substring(2, 9)}`,
        content: response,
      },
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getSuggestionsForChat(): Promise<ChatSuggestionsResponse> {
  try {
    // Fetch suggestions from the database
    const dbSuggestions = await db
      .select({
        text: suggestions.text
      })
      .from(suggestions)
      .limit(5);

    return {
      success: true,
      suggestions: dbSuggestions.map(s => s.text)
    }
  } catch (error) {
    console.error("Error getting suggestions:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getChatSessions(userId: string) {
  try {
    const sessions = await db
      .select({
        id: chatSessions.id,
        createdAt: chatSessions.createdAt,
        title: chatSessionMetadata.title,
        summary: chatSessionMetadata.summary,
        lastAccessedAt: chatSessionMetadata.lastAccessedAt,
        status: chatSessionMetadata.status,
      })
      .from(chatSessions)
      .leftJoin(chatSessionMetadata, eq(chatSessions.id, chatSessionMetadata.sessionId))
      .where(and(
        eq(chatSessions.userId, userId),
        eq(chatSessionMetadata.status, "active")
      ))
      .orderBy(desc(chatSessionMetadata.lastAccessedAt))

    return { success: true, sessions }
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateSessionMetadata(
  sessionId: string,
  metadata: {
    title?: string
    summary?: string
    status?: "active" | "archived" | "deleted"
  }
) {
  try {
    await db
      .update(chatSessionMetadata)
      .set({
        ...metadata,
        lastAccessedAt: new Date(),
      })
      .where(eq(chatSessionMetadata.sessionId, sessionId))

    return { success: true }
  } catch (error) {
    console.error("Error updating session metadata:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createNewSession(userId: string, initialTitle?: string) {
  try {
    const session = await db.transaction(async (tx) => {
      const [newSession] = await tx
        .insert(chatSessions)
        .values({ userId })
        .returning()

      await tx
        .insert(chatSessionMetadata)
        .values({
          sessionId: newSession.id,
          title: initialTitle || "New Chat",
          status: "active",
        })

      return newSession
    })

    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error("Error creating new session:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
