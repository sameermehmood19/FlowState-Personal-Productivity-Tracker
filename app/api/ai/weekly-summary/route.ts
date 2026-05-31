import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/gemini";

interface WeeklySummary {
  headline: string; // e.g. "Strong momentum with one rough patch"
  wins: string[]; // 2-3 bullet points on what went well
  struggles: string[]; // 1-2 bullet points on what to improve
  nextWeekPlan: string; // 1-2 sentence concrete plan for next week
  weekScore: number; // 0-100 overall week rating
  weekScoreLabel: "exceptional" | "strong" | "average" | "below_average" | "poor";
}

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours (weekly summaries refresh more often)

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check cache
    const cached = await prisma.aICache.findUnique({
      where: { userId_type: { userId, type: "weekly_summary" } },
    });

    if (cached) {
      const age = Date.now() - new Date(cached.generatedAt).getTime();
      if (age < CACHE_DURATION_MS) {
        return NextResponse.json({ data: JSON.parse(cached.content), cached: true });
      }
    }

    // Fetch last 7 days of logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.dailyLog.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
    });

    if (logs.length === 0) {
      return NextResponse.json({ data: null, reason: "no_data" });
    }

    // Compute stats
    const avgStudy = (logs.reduce((s, l) => s + l.studyHours, 0) / logs.length).toFixed(1);
    const avgMood = (logs.reduce((s, l) => s + l.moodScore, 0) / logs.length).toFixed(1);
    const avgFocus = (logs.reduce((s, l) => s + l.focusScore, 0) / logs.length).toFixed(1);
    const avgSleep = (logs.reduce((s, l) => s + l.sleepHours, 0) / logs.length).toFixed(1);
    const avgDistraction = (logs.reduce((s, l) => s + l.distractionHours, 0) / logs.length).toFixed(1);
    const totalStudy = logs.reduce((s, l) => s + l.studyHours, 0).toFixed(1);
    const exerciseDays = logs.filter((l) => l.exerciseCompleted).length;
    const avgProductivity = (logs.reduce((s, l) => s + l.productivityScore, 0) / logs.length).toFixed(1);

    const logsStr = logs
      .map(
        (l, i) =>
          `Day ${i + 1}: study=${l.studyHours}h, mood=${l.moodScore}/10, focus=${l.focusScore}/10, sleep=${l.sleepHours}h, distraction=${l.distractionHours}h, exercise=${l.exerciseCompleted}, productivity=${l.productivityScore.toFixed(0)}`
      )
      .join("\n");

    const prompt = `You are an executive performance coach reviewing a developer's weekly activity log.

WEEKLY DATA (${logs.length} days logged, most recent first):
${logsStr}

WEEKLY AVERAGES:
- Study: ${avgStudy}h/day (total: ${totalStudy}h)
- Mood: ${avgMood}/10
- Focus: ${avgFocus}/10
- Sleep: ${avgSleep}h
- Distraction: ${avgDistraction}h/day
- Exercise days: ${exerciseDays}/${logs.length}
- Avg productivity score: ${avgProductivity}/100

Your job:
1. Give an honest, specific executive summary of this week
2. Celebrate 2-3 real wins with specific data references
3. Call out 1-2 genuine struggles (be direct, not harsh)
4. Give a concrete, specific plan for next week
5. Score the week objectively (not generously)

Respond ONLY with valid JSON:
{
  "headline": "string (5-8 words capturing the week's theme)",
  "wins": ["string (specific win citing data)", "string"],
  "struggles": ["string (specific struggle with data)"],
  "nextWeekPlan": "string (concrete 1-2 sentence plan for next week)",
  "weekScore": number (0-100),
  "weekScoreLabel": "exceptional" | "strong" | "average" | "below_average" | "poor"
}`;

    const summary = await generateJSON<WeeklySummary>(prompt);

    // Cache it
    await prisma.aICache.upsert({
      where: { userId_type: { userId, type: "weekly_summary" } },
      create: { userId, type: "weekly_summary", content: JSON.stringify(summary) },
      update: { content: JSON.stringify(summary), generatedAt: new Date() },
    });

    return NextResponse.json({ data: summary, cached: false });
  } catch (error: any) {
    console.error("[Weekly Summary API Error]:", error);
    
    // Handle Gemini Free Tier Quota Exhaustion Gracefully
    const isQuotaError = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    
    if (isQuotaError) {
      return NextResponse.json({
        data: {
          headline: "AI Quota Reached",
          wins: ["You've been consistently active!", "The free API tier daily limit was reached."],
          struggles: ["The AI couldn't generate a personalized summary because it's resting."],
          nextWeekPlan: "Continue logging your progress. The AI will be back tomorrow with fresh insights!",
          weekScore: 85,
          weekScoreLabel: "strong"
        },
        cached: false
      });
    }

    return NextResponse.json(
      { error: "Failed to generate weekly summary. Please try again later." },
      { status: 500 }
    );
  }
}

// Force refresh
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.aICache.deleteMany({
      where: { userId: session.user.id, type: "weekly_summary" },
    });
    return NextResponse.json({ message: "Cache cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}
