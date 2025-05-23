import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getChatAssistantSettings() {
  try {
    const response = await fetch('/api/admin/chat-assistant')
    const data = await response.json()
    
    if (data.success && data.chatAssistant) {
      return {
        success: true,
        settings: {
          id: data.chatAssistant.id,
          name: data.chatAssistant.name || "Henk",
          description: data.chatAssistant.description || "",
          status: data.chatAssistant.status || "inactive",
          avatar: data.chatAssistant.avatar || ""
        }
      }
    }
    return { success: false, error: "No chat assistant found" }
  } catch (error) {
    console.error("Error loading chat assistant settings:", error)
    return { success: false, error: "Failed to load chat assistant settings" }
  }
}
