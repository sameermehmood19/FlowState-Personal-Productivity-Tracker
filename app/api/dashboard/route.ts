import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecentLogs, getLogByDate, getAllLogs } from "@/services/logs.service";
import { getInsights } from "@/services/insights.service";
import { getChartData, getWeeklyStats, getHeatmapData } from "@/services/analytics.service";
import { computeCurrentStreak, computeLongestStreak } from "@/utils/dateUtils";
import type { DashboardData } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [todayLog, weeklyStats, allLogs, recentLogs, insights, chartData, heatmapData] =
      await Promise.all([
        getLogByDate(userId, new Date()),
        getWeeklyStats(userId),
        getAllLogs(userId),
        getRecentLogs(userId, 5),
        getInsights(userId),
        getChartData(userId, 30),
        getHeatmapData(userId),
      ]);

    const currentStreak = computeCurrentStreak(allLogs);
    const longestStreak = computeLongestStreak(allLogs);

    const dashboardData: DashboardData = {
      todayLog,
      weeklyStats,
      currentStreak,
      longestStreak,
      recentLogs,
      insights: insights.filter((i) => !i.read).slice(0, 5),
      chartData,
      heatmapData,
      productivityScore: todayLog?.productivityScore ?? 0,
    };

    return NextResponse.json({ data: dashboardData });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
