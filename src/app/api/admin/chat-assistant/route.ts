import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { chatAssistant } from '@/lib/db/schema/chat-assistant';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET - Fetch chat assistant
export async function GET() {
  try {
    const assistant = await db
      .select()
      .from(chatAssistant)
      .limit(1)
      .get();

    return NextResponse.json({ success: true, chatAssistant: assistant });
  } catch (error) {
    console.error('Error fetching chat assistant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat assistant' },
      { status: 500 }
    );
  }
}

// POST - Create new chat assistant
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, status, avatar } = body;

    const newAssistant = await db
      .insert(chatAssistant)
      .values({
        id: nanoid(),
        name,
        description,
        status: status || 'inactive',
        avatar,
      })
      .returning()
      .get();

    return NextResponse.json({ success: true, chatAssistant: newAssistant });
  } catch (error) {
    console.error('Error creating chat assistant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chat assistant' },
      { status: 500 }
    );
  }
}

// PUT - Update chat assistant
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, status, avatar } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    const updatedAssistant = await db
      .update(chatAssistant)
      .set({
        name,
        description,
        status,
        avatar,
        updatedAt: new Date(),
      })
      .where(eq(chatAssistant.id, id))
      .returning()
      .get();

    return NextResponse.json({ success: true, chatAssistant: updatedAssistant });
  } catch (error) {
    console.error('Error updating chat assistant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update chat assistant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete chat assistant
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(chatAssistant)
      .where(eq(chatAssistant.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat assistant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat assistant' },
      { status: 500 }
    );
  }
} 