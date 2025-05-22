import { NextResponse } from 'next/server'
import { MODEL_DEFAULTS } from '@/lib/config/model-defaults'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

export async function GET() {
  try {
    // Check if Ollama service is running and get available models
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        error: 'Ollama service not running',
        details: `Failed to get models list: ${response.status}`,
      }, { status: 503 })
    }

    const data = await response.json()
    const models = data.models || []
    const defaultModel = models.find((m: any) => m.name === MODEL_DEFAULTS.model)

    if (!defaultModel) {
      return NextResponse.json({
        connected: true,
        error: `Model ${MODEL_DEFAULTS.model} not found`,
        availableModels: models.map((m: any) => m.name),
      })
    }
    
    return NextResponse.json({
      connected: true,
      model: MODEL_DEFAULTS.model,
      status: "active",
      availableModels: models.map((m: any) => m.name)
    })
  } catch (error) {
    console.error('LLM status check error:', error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to LLM service',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
} 