import { Groq } from 'groq-sdk';

export async function verifyGroqApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const groq = new Groq({
      apiKey: apiKey,
    });

    // Try to list models as a simple API test
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'mixtral-8x7b-32768',
      max_tokens: 1,
    });

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify Groq API key',
    };
  }
}

export function createGroqClient(apiKey: string) {
  return new Groq({
    apiKey: apiKey,
  });
} 