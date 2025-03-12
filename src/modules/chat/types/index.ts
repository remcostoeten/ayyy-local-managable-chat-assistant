export interface IChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

