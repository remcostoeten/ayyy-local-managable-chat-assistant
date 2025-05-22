import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { recommendationQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const questions = await db
      .select()
      .from(recommendationQuestions)
      .where(eq(recommendationQuestions.isActive, true));
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendation questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { question, category } = await req.json();
    const db = await getDb();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const newQuestion = await db
      .insert(recommendationQuestions)
      .values({
        question,
        category,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ question: newQuestion[0] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create recommendation question' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const db = await getDb();

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    await db
      .update(recommendationQuestions)
      .set({ isActive: false })
      .where(eq(recommendationQuestions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete recommendation question' },
      { status: 500 }
    );
  }
} 