import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema';
import { verifyGroqApiKey } from '@/lib/ai/groq';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db.select().from(llmSettings).where(eq(llmSettings.isActive, true)).limit(1);
    return NextResponse.json({ settings: settings[0] || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch LLM settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();
    const db = await getDb();

    if (provider === 'groq' && apiKey) {
      const verification = await verifyGroqApiKey(apiKey);
      if (!verification.valid) {
        return NextResponse.json({ error: verification.error }, { status: 400 });
      }
    }

    // Deactivate all current settings
    await db
      .update(llmSettings)
      .set({ isActive: false })
      .where(eq(llmSettings.isActive, true));

    // Create new settings
    const newSettings = await db.insert(llmSettings).values({
      provider,
      apiKey: provider === 'groq' ? apiKey : null,
      isActive: true,
    }).returning();

    return NextResponse.json({ settings: newSettings[0] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update LLM settings' },
      { status: 500 }
    );
  }
} 