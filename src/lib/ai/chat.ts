"use client";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

import { MODEL_DEFAULTS } from "@/lib/config/model-defaults";

export async function handleChatWithRAG(
  messages: Message[],
  query: string
): Promise<string> {
  // Knowledge base context removed - using basic chat without RAG for now
  const systemMessage = {
    role: 'system' as const,
    content: `You are a helpful AI assistant. Please provide accurate and helpful responses to user questions.`
  }

  const augmentedMessages = [
    systemMessage,
    ...messages,
    { role: 'user' as const, content: query }
  ]

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL_DEFAULTS.model,
      prompt: augmentedMessages.map(m => `${m.role}: ${m.content}`).join('\n'),
      options: {
        temperature: MODEL_DEFAULTS.temperature,
        top_p: MODEL_DEFAULTS.topP,
        num_predict: MODEL_DEFAULTS.maxTokens,
        frequency_penalty: MODEL_DEFAULTS.frequencyPenalty,
        presence_penalty: MODEL_DEFAULTS.presencePenalty,
      },
      stream: false
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get response from LLM')
  }

  const data = await response.json()
  return data.response
}

export async function createChatCompletion(messages: Message[]): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL_DEFAULTS.model,
      prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
      options: {
        temperature: MODEL_DEFAULTS.temperature,
        top_p: MODEL_DEFAULTS.topP,
        num_predict: MODEL_DEFAULTS.maxTokens,
        frequency_penalty: MODEL_DEFAULTS.frequencyPenalty,
        presence_penalty: MODEL_DEFAULTS.presencePenalty,
      },
      stream: false
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get response from LLM')
  }

  const data = await response.json()
  return data.response
} 