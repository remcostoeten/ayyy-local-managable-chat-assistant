import { MODEL_DEFAULTS } from '@/lib/config/model-defaults'

export async function checkLLMStatus() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Failed to connect to Ollama')
    }

    const data = await response.json()
    const models = data.models || []
    
    // Check if our default model is available
    const defaultModel = models.find((m: any) => m.name === MODEL_DEFAULTS.model)
    
    return {
      connected: true,
      model: defaultModel ? MODEL_DEFAULTS.model : 'Not found',
      availableModels: models.map((m: any) => m.name)
    }
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message,
      model: null,
      availableModels: []
    }
  }
} 