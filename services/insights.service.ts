import { prisma } from "@/lib/prisma";
import type { DailyLog, Insight } from "@/types";
import { startOfDay, subDays, parseISO } from "date-fns";
import { computeCurrentStreak } from "@/utils/dateUtils";
import { generateJSON } from "@/lib/gemini";

interface InsightRule {
  id: string;
  check: (logs: DailyLog[], allLogs: DailyLog[]) => InsightResult | null;
}

interface InsightResult {
  type: "warning" | "positive" | "neutral" | "motivation";
  category: "sleep" | "focus" | "distraction" | "streak" | "study" | "general";
  message: string;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const INSIGHT_RULES: InsightRule[] = [
  {
    id: "study_drop_3_days",
    check(recent, all) {
      const last3 = recent.slice(0, 3);
      const prev7 = all.slice(3, 10);
      if (last3.length < 3 || prev7.length < 3) return null;
      const recentAvg = avg(last3.map((l) => l.studyHours));
      const prevAvg = avg(prev7.map((l) => l.studyHours));
      if (prevAvg > 0 && recentAvg < prevAvg * 0.8) {
        return {
          type: "warning",
          category: "study",
          message: `Your study hours have dropped by ${Math.round((1 - recentAvg / prevAvg) * 100)}% over the last 3 days (avg ${recentAvg.toFixed(1)}h vs previous ${prevAvg.toFixed(1)}h). Try to get back on track!`,
        };
      }
      return null;
    },
  },
  {
    id: "distraction_spike",
    check(recent) {
      const last3 = recent.slice(0, 3);
      if (!last3.length) return null;
      const avgDistraction = avg(last3.map((l) => l.distractionHours));
      if (avgDistraction > 3) {
        return {
          type: "warning",
          category: "distraction",
          message: `Your average distraction time is ${avgDistraction.toFixed(1)} hours over the last 3 days. Consider using focus techniques like Pomodoro to reduce distractions.`,
        };
      }
      return null;
    },
  },
  {
    id: "low_sleep",
    check(recent) {
      const last3 = recent.slice(0, 3);
      if (!last3.length) return null;
      const avgSleep = avg(last3.map((l) => l.sleepHours));
      if (avgSleep < 6) {
        return {
          type: "warning",
          category: "sleep",
          message: `You've averaged only ${avgSleep.toFixed(1)} hours of sleep over the last 3 days. Poor sleep significantly reduces cognitive performance. Aim for 7–8 hours.`,
        };
      }
      return null;
    },
  },
  {
    id: "focus_improvement",
    check(recent, all) {
      const last3 = recent.slice(0, 3);
      const prev7 = all.slice(3, 10);
      if (last3.length < 2 || prev7.length < 2) return null;
      const recentAvg = avg(last3.map((l) => l.focusScore));
      const prevAvg = avg(prev7.map((l) => l.focusScore));
      if (recentAvg >= prevAvg + 1.5) {
        return {
          type: "positive",
          category: "focus",
          message: `Your focus score has improved by ${(recentAvg - prevAvg).toFixed(1)} points compared to the previous week (${recentAvg.toFixed(1)} vs ${prevAvg.toFixed(1)}). Excellent work!`,
        };
      }
      return null;
    },
  },
  {
    id: "streak_broken",
    check(recent, all) {
      if (all.length < 2) return null;
      const streak = computeCurrentStreak(all);
      if (streak === 0) {
        const lastLog = all[0];
        if (!lastLog) return null;
        const daysSince = Math.floor(
          (Date.now() - new Date(lastLog.date).getTime()) / 86400000
        );
        if (daysSince >= 2) {
          return {
            type: "motivation",
            category: "streak",
            message: `It's been ${daysSince} days since your last log. Every day is a fresh start — log today and rebuild your streak!`,
          };
        }
      }
      return null;
    },
  },
  {
    id: "perfect_day",
    check(recent) {
      const last = recent[0];
      if (!last) return null;
      const today = startOfDay(new Date());
      const logDate = startOfDay(parseISO(last.date as string));
      if (
        logDate.getTime() === today.getTime() &&
        last.studyHours >= 7 &&
        last.moodScore >= 8 &&
        last.focusScore >= 8 &&
        last.sleepHours >= 7 &&
        last.exerciseCompleted
      ) {
        return {
          type: "positive",
          category: "general",
          message: `You had a perfect day today! High study hours, excellent mood, focus, sleep, and exercise. Keep this momentum going!`,
        };
      }
      return null;
    },
  },
  {
    id: "consistent_week",
    check(recent, all) {
      if (all.length < 7) return null;
      const last7Days = 7;
      const logsInLast7 = all.filter((l) => {
        const daysDiff = Math.floor(
          (Date.now() - new Date(l.date).getTime()) / 86400000
        );
        return daysDiff <= 7;
      });
      const consistencyScore = (logsInLast7.length / last7Days) * 100;
      if (consistencyScore >= 85) {
        return {
          type: "positive",
          category: "general",
          message: `You've logged ${logsInLast7.length} out of the last 7 days — a ${Math.round(consistencyScore)}% consistency rate this week. Outstanding discipline!`,
        };
      }
      return null;
    },
  },
  {
    id: "mood_improvement",
    check(recent, all) {
      const last3 = recent.slice(0, 3);
      const prev7 = all.slice(3, 10);
      if (last3.length < 2 || prev7.length < 2) return null;
      const recentAvg = avg(last3.map((l) => l.moodScore));
      const prevAvg = avg(prev7.map((l) => l.moodScore));
      if (recentAvg >= prevAvg + 2) {
        return {
          type: "positive",
          category: "general",
          message: `Your mood has significantly improved! Average mood: ${recentAvg.toFixed(1)}/10 vs ${prevAvg.toFixed(1)}/10 previously. Keep up whatever you're doing!`,
        };
      }
      return null;
    },
  },
];

export async function generateInsights(
  userId: string,
  logs: DailyLog[]
): Promise<void> {
  if (!logs.length) return;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Only generate insights based on recent data (last 14 days)
  const cutoff = subDays(new Date(), 14);
  const recentLogs = sortedLogs.filter(
    (l) => new Date(l.date) >= cutoff
  );

  const newInsights: Array<{
    userId: string;
    type: string;
    category: string;
    message: string;
  }> = [];

  for (const rule of INSIGHT_RULES) {
    const result = rule.check(recentLogs, sortedLogs);
    if (result) {
      newInsights.push({ userId, ...result });
    }
  }

  if (newInsights.length > 0) {
    // Delete old unread insights of same categories to avoid duplicates
    const categories = [...new Set(newInsights.map((i) => i.category))];
    await prisma.insight.deleteMany({
      where: {
        userId,
        category: { in: categories },
        read: false,
        date: { gte: subDays(new Date(), 3) },
      },
    });

    await prisma.insight.createMany({ data: newInsights });
  }
}

export async function getInsights(userId: string): Promise<Insight[]> {
  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: [{ read: "asc" }, { date: "desc" }],
    take: 50,
  });
  return insights as unknown as Insight[];
}

export async function markInsightRead(
  id: string,
  userId: string
): Promise<void> {
  await prisma.insight.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllInsightsRead(userId: string): Promise<void> {
  await prisma.insight.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadInsightCount(userId: string): Promise<number> {
  return prisma.insight.count({ where: { userId, read: false } });
}

interface AIInsightItem {
  type: "warning" | "positive" | "neutral" | "motivation";
  category: "sleep" | "focus" | "distraction" | "streak" | "study" | "general";
  message: string;
}

/**
 * Generates AI-powered insights using Gemini.
 * Produces richer, narrative insights that catch nuanced patterns
 * the static rule engine misses.
 */
export async function generateAIInsights(
  userId: string,
  logs: DailyLog[]
): Promise<void> {
  if (logs.length < 3) return; // Need at least 3 logs for meaningful analysis

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recent = sortedLogs.slice(0, 14);

  // Build a data summary for the prompt
  const logsStr = recent
    .slice(0, 10)
    .map(
      (l, i) =>
        `Day ${i + 1}: study=${l.studyHours}h, mood=${l.moodScore}/10, focus=${l.focusScore}/10, sleep=${l.sleepHours}h, distraction=${l.distractionHours}h, exercise=${l.exerciseCompleted}`
    )
    .join("\n");

  const avgStudy = avg(recent.map((l) => l.studyHours));
  const avgMood = avg(recent.map((l) => l.moodScore));
  const avgFocus = avg(recent.map((l) => l.focusScore));
  const avgSleep = avg(recent.map((l) => l.sleepHours));
  const avgDistraction = avg(recent.map((l) => l.distractionHours));
  const currentStreak = computeCurrentStreak(sortedLogs);

  const prompt = `You are a personal productivity analyst. Analyze a developer's recent activity data and generate 3-5 specific, personalized, actionable insights.

RECENT ACTIVITY (most recent first):
${logsStr}

SUMMARY STATS (last ${recent.length} days):
- Avg study: ${avgStudy.toFixed(1)}h/day
- Avg mood: ${avgMood.toFixed(1)}/10
- Avg focus: ${avgFocus.toFixed(1)}/10
- Avg sleep: ${avgSleep.toFixed(1)}h
- Avg distraction: ${avgDistraction.toFixed(1)}h
- Current streak: ${currentStreak} days

RULES:
- Reference actual numbers from the data
- Identify non-obvious correlations (e.g. "your focus drops on days with <6h sleep")
- Be direct, specific, actionable — not generic
- Mix insight types: warnings for problems, positives for wins, motivation for encouragement
- Each message should be 1-2 sentences max

Respond ONLY with valid JSON:
[
  {
    "type": "warning" | "positive" | "neutral" | "motivation",
    "category": "sleep" | "focus" | "distraction" | "streak" | "study" | "general",
    "message": "string (specific, data-driven insight)"
  }
]`;

  let aiInsights: AIInsightItem[];
  try {
    aiInsights = await generateJSON<AIInsightItem[]>(prompt);
    if (!Array.isArray(aiInsights)) return;
  } catch (err) {
    console.error("[AI Insights] Failed to generate:", err);
    return;
  }

  // Filter to valid insight types/categories
  const validTypes = ["warning", "positive", "neutral", "motivation"];
  const validCategories = ["sleep", "focus", "distraction", "streak", "study", "general"];
  const filtered = aiInsights.filter(
    (i) =>
      validTypes.includes(i.type) &&
      validCategories.includes(i.category) &&
      typeof i.message === "string" &&
      i.message.length > 10
  );

  if (filtered.length === 0) return;

  // Delete old AI-generated insights (> 1 day old) before inserting new ones
  await prisma.insight.deleteMany({
    where: {
      userId,
      message: { startsWith: "[AI]" },
      date: { lt: subDays(new Date(), 1) },
    },
  });

  // Prefix AI insights to distinguish from rule-based ones
  const insightData = filtered.map((i) => ({
    userId,
    type: i.type,
    category: i.category,
    message: `[AI] ${i.message}`,
  }));

  await prisma.insight.createMany({ data: insightData });
}
