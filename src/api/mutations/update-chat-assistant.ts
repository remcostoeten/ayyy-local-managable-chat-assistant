'use server';   

/*
    This file contains the mutations for the chat assistant.
    It allows to update the chat assistant's name, description, avatar and status.
*/  


import { db } from "@/lib/db/client";
import { chatAssistant } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ChatAssistant } from "@/core/types/chat";

export interface UpdateChatAssistantInput {
  name?: string;
  description?: string;
  status?: "away" | "active" | "inactive";
  avatar?: string;
}

interface UpdateChatAssistantResponse {
  success: boolean;
  chatAssistant?: ChatAssistant;
  error?: string;
}

export async function updateChatAssistant(
  id: string,
  input: UpdateChatAssistantInput
): Promise<UpdateChatAssistantResponse> {
  try {
    // Verify assistant exists
    const existingAssistant = await db
      .select()
      .from(chatAssistant)
      .where(eq(chatAssistant.id, id))
      .get();

    if (!existingAssistant) {
      return {
        success: false,
        error: "Chat assistant not found"
      };
    }

    // Prepare update data
    const updateData = {
      ...input,
      updatedAt: new Date()
    };

    // Update assistant
    const updatedAssistant = await db
      .update(chatAssistant)
      .set(updateData)
      .where(eq(chatAssistant.id, id))
      .returning()
      .get();

    if (!updatedAssistant) {
      return {
        success: false,
        error: "Failed to update chat assistant"
      };
    }

    // Ensure status is defined in the returned object
    const status = updatedAssistant.status || "inactive";

    return {
      success: true,
      chatAssistant: {
        id: updatedAssistant.id,
        name: updatedAssistant.name,
        description: updatedAssistant.description,
        status: status as "away" | "active" | "inactive",
        avatar: updatedAssistant.avatar,
        createdAt: updatedAssistant.createdAt,
        updatedAt: updatedAssistant.updatedAt
      }
    };
  } catch (error) {
    console.error("Error updating chat assistant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error updating chat assistant"
    };
  }
}

export async function updateStatus(data: {
    id: string;
    status: "away" | "active" | "inactive";
}) {
    try {
        const { id, status } = data;

        await db.update(chatAssistant).set({ status }).where(eq(chatAssistant.id, id));

        return { success: true, message: "Status updated successfully" };
    } catch (error) {   
        console.error("Error updating status", error);
        return { success: false, error: "Error updating status" };
    }   
}