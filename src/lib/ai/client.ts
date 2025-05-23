import { db } from '@/lib/db/client';
import { llmSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createGroqClient } from './groq';
import { MODEL_DEFAULTS } from '@/lib/config/model-defaults';

interface OllamaClient {
  chat: {
    completions: {
      create: (params: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<any>;
    };
  };
}

export async function getAIClient() {
  // Get current active settings
  const settings = await db.select().from(llmSettings).where(eq(llmSettings.isActive, true)).limit(1);
  const currentSettings = settings[0];

  if (!currentSettings) {
    // Default to local if no settings found
    return getLocalClient();
  }

  if (currentSettings.provider === 'groq') {
    if (!currentSettings.apiKey) {
      throw new Error('Groq API key not configured');
    }
    return createGroqClient(currentSettings.apiKey);
  }

  // Default to local client
  return getLocalClient();
}

function getLocalClient(): OllamaClient {
  return {
    chat: {
      completions: {
        create: async ({ messages, model = MODEL_DEFAULTS.model, temperature = 0.7, max_tokens = 2048 }) => {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
              options: {
                temperature,
                num_predict: max_tokens,
              },
              stream: false,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get response from local LLM');
          }

          const data = await response.json();
          return {
            choices: [{
              message: {
                content: data.response,
              },
            }],
          };
        },
      },
    },
  };
} 