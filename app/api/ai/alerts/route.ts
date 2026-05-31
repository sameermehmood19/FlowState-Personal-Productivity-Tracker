import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export interface SmartAlert {
  id: string;
  type: "error" | "warning" | "info" | "success";
  category: "Burnout" | "Consistency" | "Progress" | "Streak" | "Blueprint" | "Rest";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const alerts: SmartAlert[] = [];

    // Fetch all needed data in parallel
    const [recentLogs, coachProfile, architectProjects] = await Promise.all([
      prisma.dailyLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 14,
      }),
      prisma.learningProfile.findUnique({
        where: { userId },
        include: {
          topics: {
            where: { status: "in_progress" },
            orderBy: { updatedAt: "asc" },
          },
        },
      }),
      prisma.projectValidation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ─── Check 1: No log today (streak break warning) ─────────────────────────
    const hasLogToday = recentLogs.some((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (!hasLogToday && recentLogs.length > 0) {
      alerts.push({
        id: "no-log-today",
        type: "warning",
        category: "Streak",
        title: "Don't break the chain!",
        message: "You haven't logged today yet. Log your session to maintain your streak and keep your productivity score accurate.",
        actionLabel: "Log Now",
        actionHref: "/logs",
      });
    }

    // ─── Check 2: Consistency break (3+ days without logging) ─────────────────
    if (recentLogs.length > 0) {
      const lastLogDate = new Date(recentLogs[0].date);
      const daysSinceLastLog = differenceInDays(today, lastLogDate);
      if (daysSinceLastLog >= 3) {
        alerts.push({
          id: "consistency-break",
          type: "error",
          category: "Consistency",
          title: `${daysSinceLastLog}-day consistency gap detected`,
          message: `Your last log was ${daysSinceLastLog} days ago. Consistency is the biggest factor in long-term skill growth. Short gaps quickly become long breaks.`,
          actionLabel: "Get Back on Track",
          actionHref: "/logs",
        });
      }
    }

    // ─── Check 3: Burnout risk — mood dropping 3+ consecutive days ────────────
    if (recentLogs.length >= 3) {
      const last3Moods = recentLogs.slice(0, 3).map((l) => l.moodScore);
      const isMoodDeclining =
        last3Moods[0] < last3Moods[1] && last3Moods[1] < last3Moods[2];
      const avgRecentMood =
        last3Moods.reduce((s, m) => s + m, 0) / last3Moods.length;

      if (isMoodDeclining && avgRecentMood < 6) {
        alerts.push({
          id: "burnout-risk",
          type: "error",
          category: "Burnout",
          title: "Burnout risk detected",
          message: `Your mood has dropped 3 days in a row (${last3Moods[2]} → ${last3Moods[1]} → ${last3Moods[0]}). Your average mood this week is ${avgRecentMood.toFixed(1)}/10. Consider taking a deliberate rest day — rest is productive.`,
          actionLabel: "View Insights",
          actionHref: "/insights",
        });
      }
    }

    // ─── Check 4: Overwork alert — 8+ hrs/day for 5+ consecutive days ─────────
    if (recentLogs.length >= 5) {
      const last5 = recentLogs.slice(0, 5);
      const allOverworking = last5.every((l) => l.studyHours >= 8);
      if (allOverworking) {
        const avgHours = (last5.reduce((s, l) => s + l.studyHours, 0) / 5).toFixed(1);
        alerts.push({
          id: "overwork-alert",
          type: "warning",
          category: "Rest",
          title: "Rest day recommended",
          message: `You've averaged ${avgHours}h/day for 5+ consecutive days. Sustained high-intensity work without recovery reduces long-term learning retention by up to 40%.`,
          actionLabel: "View Analytics",
          actionHref: "/analytics",
        });
      }
    }

    // ─── Check 5: Stuck coach topic (in_progress > 7 days) ────────────────────
    if (coachProfile?.topics && coachProfile.topics.length > 0) {
      const stuckTopic = coachProfile.topics.find((t) => {
        const daysSinceUpdate = differenceInDays(today, new Date(t.updatedAt));
        return daysSinceUpdate >= 7;
      });

      if (stuckTopic) {
        const daysStuck = differenceInDays(today, new Date(stuckTopic.updatedAt));
        alerts.push({
          id: "stuck-topic",
          type: "info",
          category: "Progress",
          title: "Learning topic needs attention",
          message: `"${stuckTopic.title}" has been In Progress for ${daysStuck} days. Either dedicate focused time to complete it this week or break it into smaller daily chunks.`,
          actionLabel: "Open Coach",
          actionHref: "/coach",
        });
      }
    }

    // ─── Check 6: No architect validation in 2+ weeks ─────────────────────────
    if (architectProjects.length > 0) {
      const lastValidation = new Date(architectProjects[0].createdAt);
      const daysSince = differenceInDays(today, lastValidation);
      if (daysSince >= 14) {
        alerts.push({
          id: "blueprint-stale",
          type: "info",
          category: "Blueprint",
          title: "Time to review your architecture",
          message: `Your last project blueprint review was ${daysSince} days ago. Engineers who regularly validate their architectural decisions ship better products. Have a new idea? Submit it!`,
          actionLabel: "Open Architect",
          actionHref: "/architect",
        });
      }
    }

    // ─── Check 7: Great week — positive reinforcement ─────────────────────────
    if (recentLogs.length >= 5 && alerts.length === 0) {
      const last5 = recentLogs.slice(0, 5);
      const avgMood = last5.reduce((s, l) => s + l.moodScore, 0) / last5.length;
      const avgStudy = last5.reduce((s, l) => s + l.studyHours, 0) / last5.length;
      if (avgMood >= 7 && avgStudy >= 3) {
        alerts.push({
          id: "great-week",
          type: "success",
          category: "Streak",
          title: "Outstanding consistency this week! 🔥",
          message: `${avgStudy.toFixed(1)}h avg daily study and ${avgMood.toFixed(1)}/10 avg mood across 5 days. You're in the top tier of productive developers. Keep building this momentum!`,
        });
      }
    }

    return NextResponse.json({ data: alerts });
  } catch (error: any) {
    console.error("[Smart Alerts API Error]:", error);
    return NextResponse.json({ error: "Failed to generate alerts" }, { status: 500 });
  }
}
