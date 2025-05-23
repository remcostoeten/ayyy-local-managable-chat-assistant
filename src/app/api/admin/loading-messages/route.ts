import { NextResponse } from "next/server";
import { LoadingMessageType } from "@/lib/config/environment";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { messages, percentage } = await req.json();

    // Validate input
    if (!Array.isArray(messages) || typeof percentage !== 'number') {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.text || !msg.lang || !['en', 'nl'].includes(msg.lang)) {
        return NextResponse.json(
          { error: "Invalid message format" },
          { status: 400 }
        );
      }
    }

    // Save to database
    await db.transaction().execute(async (trx) => {
      // Clear existing settings
      await trx.delete("assistant_settings").where("key", "in", ["loading_messages", "easter_egg_percentage"]);

      // Insert new settings
      await trx.insert("assistant_settings").values([
        {
          key: "loading_messages",
          value: JSON.stringify(messages),
        },
        {
          key: "easter_egg_percentage",
          value: JSON.stringify(percentage),
        },
      ]);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving loading message settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const settings = await db.select().from("assistant_settings")
      .where("key", "in", ["loading_messages", "easter_egg_percentage"]);

    const messages = settings.find(s => s.key === "loading_messages")?.value;
    const percentage = settings.find(s => s.key === "easter_egg_percentage")?.value;

    return NextResponse.json({
      success: true,
      messages: messages ? JSON.parse(messages) : [],
      percentage: percentage ? JSON.parse(percentage) : 15,
    });
  } catch (error) {
    console.error("Error fetching loading message settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
} 