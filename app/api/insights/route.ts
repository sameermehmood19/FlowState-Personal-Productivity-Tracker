import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getInsights,
  markInsightRead,
  markAllInsightsRead,
  generateAIInsights,
} from "@/services/insights.service";
import type { DailyLog } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = await getInsights(session.user.id);
    return NextResponse.json({ data: insights });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      await markAllInsightsRead(session.user.id);
    } else if (id) {
      await markInsightRead(id, session.user.id);
    }

    return NextResponse.json({ message: "Updated" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/insights — triggers AI insight generation using Gemini
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user logs for AI analysis
    const rawLogs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const logs = rawLogs as unknown as DailyLog[];

    if (logs.length < 3) {
      return NextResponse.json({
        message: "Not enough data. Log at least 3 days to generate AI insights.",
        count: 0,
      });
    }

    await generateAIInsights(userId, logs);

    // Return updated insights list
    const insights = await getInsights(userId);
    const aiInsights = insights.filter((i) => i.message.startsWith("[AI]"));

    return NextResponse.json({
      message: `Generated ${aiInsights.length} AI-powered insights`,
      count: aiInsights.length,
      data: insights,
    });
  } catch (error: any) {
    console.error("[AI Insights POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}

