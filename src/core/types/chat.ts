export type TChatAssistant = {
  id: string
  name: string
  description: string
  status: "away" | "active" | "inactive"
  avatar: string
  createdAt: Date
  updatedAt: Date
}

export type TChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  createdAt: Date
}

export type TChatSession = {
  id: string
  userId: string
  createdAt: Date
  messages?: TChatMessage[]
} 