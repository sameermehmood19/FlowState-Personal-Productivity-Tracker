import { prisma } from "@/lib/prisma";
import type { DailyLog, WeeklyStats, MonthlyStats, ChartDataPoint, AnalyticsData } from "@/types";
import {
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import {
  computeCurrentStreak,
  computeLongestStreak,
  getStartOfWeek,
} from "@/utils/dateUtils";

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
}

export async function getChartData(
  userId: string,
  days = 30
): Promise<ChartDataPoint[]> {
  const since = subDays(startOfDay(new Date()), days - 1);
  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  return logs.map((log) => ({
    date: format(new Date(log.date), "MMM dd"),
    studyHours: log.studyHours,
    moodScore: log.moodScore,
    focusScore: log.focusScore,
    distractionHours: log.distractionHours,
    productivityScore: log.productivityScore,
  }));
}

export async function getWeeklyStats(
  userId: string,
  weekStartDate?: Date
): Promise<WeeklyStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const weekStart = weekStartDate ?? getStartOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
  });

  const daysLogged = logs.length;
  const totalStudyHours = parseFloat(
    logs.reduce((a, l) => a + l.studyHours, 0).toFixed(1)
  );

  return {
    totalStudyHours,
    avgMoodScore: avg(logs.map((l) => l.moodScore)),
    avgFocusScore: avg(logs.map((l) => l.focusScore)),
    avgSleepHours: avg(logs.map((l) => l.sleepHours)),
    daysLogged,
    consistencyScore: parseFloat(((daysLogged / 7) * 100).toFixed(1)),
    weeklyGoal: user?.weeklyGoal ?? 40,
  };
}

export async function getMonthlyStats(
  userId: string,
  monthDate?: Date
): Promise<MonthlyStats> {
  const ref = monthDate ?? new Date();
  const monthStart = startOfMonth(ref);
  const monthEnd = endOfMonth(ref);
  const daysInMonth = monthEnd.getDate();

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: monthStart, lte: monthEnd } },
  });

  const daysLogged = logs.length;
  const totalStudyHours = parseFloat(
    logs.reduce((a, l) => a + l.studyHours, 0).toFixed(1)
  );

  return {
    month: format(ref, "MMMM yyyy"),
    totalStudyHours,
    avgMoodScore: avg(logs.map((l) => l.moodScore)),
    avgFocusScore: avg(logs.map((l) => l.focusScore)),
    avgSleepHours: avg(logs.map((l) => l.sleepHours)),
    daysLogged,
    consistencyScore: parseFloat(((daysLogged / daysInMonth) * 100).toFixed(1)),
  };
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  const allLogs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  }) as unknown as DailyLog[];

  const currentStreak = computeCurrentStreak(allLogs);
  const longestStreak = computeLongestStreak(allLogs);
  const totalDays = allLogs.length;

  // Best and worst days
  const bestDay = allLogs.reduce(
    (best, log) =>
      log.productivityScore > (best?.productivityScore ?? 0) ? log : best,
    null as DailyLog | null
  );
  const worstDay = allLogs
    .filter((l) => l.distractionHours > 0)
    .reduce(
      (worst, log) =>
        log.distractionHours > (worst?.distractionHours ?? 0) ? log : worst,
      null as DailyLog | null
    );

  const avgMoodScore = avg(allLogs.map((l) => l.moodScore));
  const allTimeTotalHours = parseFloat(
    allLogs.reduce((a, l) => a + l.studyHours, 0).toFixed(1)
  );

  // Days since first log
  const firstLog = allLogs[allLogs.length - 1];
  const totalPossibleDays = firstLog
    ? Math.ceil(
        (Date.now() - new Date(firstLog.date).getTime()) / 86400000
      ) + 1
    : 1;
  const consistencyScore = parseFloat(
    ((totalDays / totalPossibleDays) * 100).toFixed(1)
  );

  // Get last 8 weeks
  const weekly: WeeklyStats[] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = getStartOfWeek(subDays(new Date(), w * 7));
    weekly.push(await getWeeklyStats(userId, weekStart));
  }

  const monthly = await getMonthlyStats(userId);

  return {
    weekly,
    monthly,
    bestDay,
    worstDay,
    longestStreak,
    currentStreak,
    consistencyScore,
    avgMoodScore,
    allTimeTotalHours,
  };
}

export async function getHeatmapData(
  userId: string
): Promise<Array<{ date: string; count: number; value: number }>> {
  const since = subDays(startOfDay(new Date()), 364);
  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: since } },
    select: { date: true, productivityScore: true },
    orderBy: { date: "asc" },
  });

  return logs.map((log) => ({
    date: format(new Date(log.date), "yyyy-MM-dd"),
    count: Math.floor(log.productivityScore / 25), // 0–4 bucket
    value: log.productivityScore,
  }));
}
