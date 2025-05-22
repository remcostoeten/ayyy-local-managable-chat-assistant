import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema/llm-settings';
import { verifyGroqApiKey } from '@/lib/ai/groq';
import { eq } from 'drizzle-orm';
import { encryptText, decryptText } from '@/lib/utils/encryption';

// Helper function to verify OpenAI API key
async function verifyOpenAIApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return { valid: false, error: 'Invalid OpenAI API key' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Failed to verify OpenAI API key' };
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db
      .select()
      .from(llmSettings)
      .where(eq(llmSettings.isActive, true))
      .limit(1);

    const currentSettings = settings[0];
    
    // Decrypt API key if exists
    if (currentSettings && 
        currentSettings.apiKey && 
        currentSettings.apiKeyIv && 
        currentSettings.apiKeyTag) {
      return NextResponse.json({
        settings: {
          ...currentSettings,
          apiKey: decryptText(
            currentSettings.apiKey,
            currentSettings.apiKeyIv,
            currentSettings.apiKeyTag
          ),
          // Don't expose encryption details to client
          apiKeyIv: undefined,
          apiKeyTag: undefined
        }
      });
    }

    return NextResponse.json({ settings: currentSettings || null });
  } catch (error) {
    console.error('Error fetching LLM settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LLM settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { provider, apiKey, openaiModel } = await req.json();
    const db = await getDb();

    // Verify API key for cloud providers
    if (apiKey) {
      let verification;
      
      if (provider === 'groq') {
        verification = await verifyGroqApiKey(apiKey);
      } else if (provider === 'openai') {
        verification = await verifyOpenAIApiKey(apiKey);
      }

      if (verification && !verification.valid) {
        return NextResponse.json({ error: verification.error }, { status: 400 });
      }
    }

    // Deactivate all current settings
    await db
      .update(llmSettings)
      .set({ isActive: false })
      .where(eq(llmSettings.isActive, true));

    if (['groq', 'openai'].includes(provider) && apiKey) {
      // Encrypt API key
      const { encryptedData, iv, tag } = encryptText(apiKey);

      // Create new settings with encrypted API key
      const newSettings = await db
        .insert(llmSettings)
        .values({
          provider,
          apiKey: encryptedData,
          apiKeyIv: iv,
          apiKeyTag: tag,
          openaiModel: provider === 'openai' ? openaiModel : null,
          isActive: true,
        })
        .returning();

      // Return settings without encryption details
      return NextResponse.json({
        settings: {
          ...newSettings[0],
          apiKeyIv: undefined,
          apiKeyTag: undefined
        }
      });
    } else {
      // Handle local provider
      const newSettings = await db
        .insert(llmSettings)
        .values({
          provider,
          apiKey: null,
          apiKeyIv: null,
          apiKeyTag: null,
          openaiModel: null,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ settings: newSettings[0] });
    }
  } catch (error) {
    console.error('Error updating LLM settings:', error);
    return NextResponse.json(
      { error: 'Failed to update LLM settings' },
      { status: 500 }
    );
  }
} 