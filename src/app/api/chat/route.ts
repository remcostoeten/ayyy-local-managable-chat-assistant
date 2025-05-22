import { NextResponse } from 'next/server'
import { MODEL_DEFAULTS } from '@/lib/config/model-defaults'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // Here you would typically:
    // 1. Validate the message
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Call Ollama API
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_DEFAULTS.model,
        messages: [
          {
            role: 'system',
            content: MODEL_DEFAULTS.systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
        options: {
          temperature: MODEL_DEFAULTS.temperature,
          top_p: MODEL_DEFAULTS.topP,
          num_predict: MODEL_DEFAULTS.maxTokens,
          frequency_penalty: MODEL_DEFAULTS.frequencyPenalty,
          presence_penalty: MODEL_DEFAULTS.presencePenalty,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    return NextResponse.json({
      message: data.message,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 