import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema/llm-settings';
import { verifyGroqApiKey } from '@/lib/ai/groq';
import { eq } from 'drizzle-orm';
import { encryptText, decryptText } from '@/lib/utils/encryption';

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
    const { provider, apiKey } = await req.json();
    const db = await getDb();

    if (provider === 'groq' && apiKey) {
      // Verify API key before storing
      const verification = await verifyGroqApiKey(apiKey);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error }, { status: 400 });
      }

      // Encrypt API key
      const { encryptedData, iv, tag } = encryptText(apiKey);

      // Deactivate all current settings
      await db
        .update(llmSettings)
        .set({ isActive: false })
        .where(eq(llmSettings.isActive, true));

      // Create new settings with encrypted API key
      const newSettings = await db
        .insert(llmSettings)
        .values({
          provider,
          apiKey: encryptedData,
          apiKeyIv: iv,
          apiKeyTag: tag,
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
      await db
        .update(llmSettings)
        .set({ isActive: false })
        .where(eq(llmSettings.isActive, true));

      const newSettings = await db
        .insert(llmSettings)
        .values({
          provider,
          apiKey: null,
          apiKeyIv: null,
          apiKeyTag: null,
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