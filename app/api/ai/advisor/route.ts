import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/gemini";

interface AdvisorBriefing {
  todayFocus: string;
  patternObserved: string;
  actionItem: string;
  motivationalScore: number; // 0-10
  mood: "excellent" | "good" | "neutral" | "concerning" | "critical";
}

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check cache first (24hr cache)
    const cached = await prisma.aICache.findUnique({
      where: { userId_type: { userId, type: "advisor" } },
    });

    if (cached) {
      const age = Date.now() - new Date(cached.generatedAt).getTime();
      if (age < CACHE_DURATION_MS) {
        return NextResponse.json({
          data: JSON.parse(cached.content),
          cached: true,
        });
      }
    }

    // Fetch last 14 days of logs for analysis
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const logs = await prisma.dailyLog.findMany({
      where: { userId, date: { gte: twoWeeksAgo } },
      orderBy: { date: "desc" },
    });

    if (logs.length < 2) {
      // Not enough data for meaningful advice
      const defaultBriefing: AdvisorBriefing = {
        todayFocus: "Start building your daily logging habit — consistency is the foundation of all growth.",
        patternObserved: "You're just getting started. Every expert was once a beginner. Log your first few days to unlock personalized insights.",
        actionItem: "Log today's study session before you close the app. Even a 30-minute session counts!",
        motivationalScore: 7,
        mood: "neutral",
      };

      await upsertCache(userId, defaultBriefing);
      return NextResponse.json({ data: defaultBriefing, cached: false });
    }

    // Compute stats
    const last7 = logs.slice(0, 7);
    const avgMood = (last7.reduce((s, l) => s + l.moodScore, 0) / last7.length).toFixed(1);
    const avgFocus = (last7.reduce((s, l) => s + l.focusScore, 0) / last7.length).toFixed(1);
    const avgSleep = (last7.reduce((s, l) => s + l.sleepHours, 0) / last7.length).toFixed(1);
    const avgStudy = (last7.reduce((s, l) => s + l.studyHours, 0) / last7.length).toFixed(1);
    const totalStudy = last7.reduce((s, l) => s + l.studyHours, 0).toFixed(1);

    const moodTrend =
      last7.length >= 3
        ? last7[0].moodScore - last7[Math.min(last7.length - 1, 2)].moodScore
        : 0;

    const logsStr = last7
      .map(
        (l, i) =>
          `Day ${i + 1}: study=${l.studyHours}h, mood=${l.moodScore}/10, focus=${l.focusScore}/10, sleep=${l.sleepHours}h, distraction=${l.distractionHours}h`
      )
      .join("\n");

    const prompt = `You are a personal productivity analyst and life coach analyzing a developer's recent performance data.

LAST 7 DAYS OF DATA (most recent first):
${logsStr}

SUMMARY:
- Average mood: ${avgMood}/10 (trend: ${moodTrend > 0 ? "improving" : moodTrend < 0 ? "declining" : "stable"})
- Average focus: ${avgFocus}/10
- Average sleep: ${avgSleep}h
- Average daily study: ${avgStudy}h (total: ${totalStudy}h)

Generate a personalized daily briefing. Be specific, reference the actual numbers, be encouraging but honest.

Respond ONLY with this exact JSON (no markdown, no extra text):
{
  "todayFocus": "string — what should they prioritize today based on patterns (1-2 sentences)",
  "patternObserved": "string — a specific pattern you noticed in the data, cite actual numbers (1-2 sentences)",
  "actionItem": "string — one concrete, specific action they should take TODAY (1 sentence, starts with an action verb)",
  "motivationalScore": number between 0-10 (how positively motivated they should feel based on their data),
  "mood": "excellent" | "good" | "neutral" | "concerning" | "critical"
}`;

    const briefing = await generateJSON<AdvisorBriefing>(prompt);

    // Save to cache
    await upsertCache(userId, briefing);

    return NextResponse.json({ data: briefing, cached: false });
  } catch (error: any) {
    console.error("[Daily Advisor API Error]:", error);
    
    // Handle Gemini Free Tier Quota Exhaustion Gracefully
    const isQuotaError = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    
    if (isQuotaError) {
      return NextResponse.json({
        data: {
          todayFocus: "AI Quota Reached",
          patternObserved: "You've been highly active! The free Gemini API tier daily limit has been reached, so the AI is taking a quick nap.",
          actionItem: "Continue logging your sessions manually. AI insights will return when the quota resets!",
          motivationalScore: 8,
          mood: "neutral"
        },
        cached: false
      });
    }

    return NextResponse.json(
      { error: "Failed to generate daily briefing. Please try again later." },
      { status: 500 }
    );
  }
}

// Force-refresh the cache
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.aICache.deleteMany({
      where: { userId: session.user.id, type: "advisor" },
    });

    return NextResponse.json({ message: "Cache cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}

async function upsertCache(userId: string, data: AdvisorBriefing) {
  await prisma.aICache.upsert({
    where: { userId_type: { userId, type: "advisor" } },
    create: { userId, type: "advisor", content: JSON.stringify(data) },
    update: { content: JSON.stringify(data), generatedAt: new Date() },
  });
}
