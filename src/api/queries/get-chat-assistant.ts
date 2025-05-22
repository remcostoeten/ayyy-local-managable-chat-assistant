'use server'

/* 
    This file contains the queries for the chat assistant.
    It allows to get the chat assistant's name, description, avatar and status.
*/

import { db } from "@/lib/db/client";
import { chatAssistant } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ChatAssistant } from "@/core/types/chat";

interface GetChatAssistantResponse {
  success: boolean;
  chatAssistant?: ChatAssistant;
  error?: string;
}

export async function getChatAssistant(id: string = "default"): Promise<GetChatAssistantResponse> {
  try {
    const assistant = await db
      .select()
      .from(chatAssistant)
      .where(eq(chatAssistant.id, id))
      .get();

    if (!assistant) {
      return {
        success: false,
        error: "Chat assistant not found"
      };
    }

    return {
      success: true,
      chatAssistant: {
        id: assistant.id,
        name: assistant.name,
        description: assistant.description,
        status: assistant.status,
        avatar: assistant.avatar,
        createdAt: assistant.createdAt,
        updatedAt: assistant.updatedAt
      }
    };
  } catch (error) {
    console.error("Error getting chat assistant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error getting chat assistant"
    };
  }
}
