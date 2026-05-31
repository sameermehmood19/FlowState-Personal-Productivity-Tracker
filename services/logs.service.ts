import { prisma } from "@/lib/prisma";
import { computeProductivityScore } from "@/utils/dateUtils";
import type { DailyLog, LogsResponse } from "@/types";
import { startOfDay, parseISO } from "date-fns";

export interface GetLogsOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  minMood?: number;
  maxMood?: number;
  minFocus?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getLogs(
  userId: string,
  options: GetLogsOptions = {}
): Promise<LogsResponse> {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    minMood,
    maxMood,
    minFocus,
    search,
    sortBy = "date",
    sortOrder = "desc",
  } = options;

  const where: Record<string, unknown> = { userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: startOfDay(parseISO(startDate)) } : {}),
      ...(endDate ? { lte: new Date(endDate + "T23:59:59.999Z") } : {}),
    };
  }
  if (minMood !== undefined || maxMood !== undefined) {
    where.moodScore = {
      ...(minMood !== undefined ? { gte: minMood } : {}),
      ...(maxMood !== undefined ? { lte: maxMood } : {}),
    };
  }
  if (minFocus !== undefined) {
    where.focusScore = { gte: minFocus };
  }
  if (search) {
    where.notes = { contains: search };
  }

  const [total, logs] = await Promise.all([
    prisma.dailyLog.count({ where }),
    prisma.dailyLog.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    logs: logs as unknown as DailyLog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLogById(
  id: string,
  userId: string
): Promise<DailyLog | null> {
  const log = await prisma.dailyLog.findFirst({ where: { id, userId } });
  return log as unknown as DailyLog | null;
}

export async function getLogByDate(
  userId: string,
  date: Date
): Promise<DailyLog | null> {
  const start = startOfDay(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const log = await prisma.dailyLog.findFirst({
    where: { userId, date: { gte: start, lt: end } },
  });
  return log as unknown as DailyLog | null;
}

export async function getAllLogs(userId: string): Promise<DailyLog[]> {
  const logs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  return logs as unknown as DailyLog[];
}

export async function getRecentLogs(
  userId: string,
  count = 5
): Promise<DailyLog[]> {
  const logs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: count,
  });
  return logs as unknown as DailyLog[];
}

export async function getLogsForRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyLog[]> {
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });
  return logs as unknown as DailyLog[];
}

export async function createLog(
  userId: string,
  data: {
    date: string;
    studyHours: number;
    moodScore: number;
    focusScore: number;
    sleepHours: number;
    exerciseCompleted: boolean;
    distractionHours: number;
    notes?: string;
  },
  dailyGoal: number = 8
): Promise<DailyLog> {
  const productivityScore = computeProductivityScore(
    data.studyHours,
    data.focusScore,
    data.moodScore,
    data.sleepHours,
    data.exerciseCompleted,
    data.distractionHours,
    dailyGoal
  );

  const logDate = startOfDay(parseISO(data.date));

  const log = await prisma.dailyLog.create({
    data: {
      userId,
      date: logDate,
      studyHours: data.studyHours,
      moodScore: data.moodScore,
      focusScore: data.focusScore,
      sleepHours: data.sleepHours,
      exerciseCompleted: data.exerciseCompleted,
      distractionHours: data.distractionHours,
      notes: data.notes ?? null,
      productivityScore,
    },
  });

  return log as unknown as DailyLog;
}

export async function updateLog(
  id: string,
  userId: string,
  data: {
    studyHours?: number;
    moodScore?: number;
    focusScore?: number;
    sleepHours?: number;
    exerciseCompleted?: boolean;
    distractionHours?: number;
    notes?: string;
  },
  dailyGoal: number = 8
): Promise<DailyLog> {
  const existing = await prisma.dailyLog.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Log not found");

  const merged = {
    studyHours: data.studyHours ?? existing.studyHours,
    focusScore: data.focusScore ?? existing.focusScore,
    moodScore: data.moodScore ?? existing.moodScore,
    sleepHours: data.sleepHours ?? existing.sleepHours,
    exerciseCompleted:
      data.exerciseCompleted !== undefined
        ? data.exerciseCompleted
        : existing.exerciseCompleted,
    distractionHours: data.distractionHours ?? existing.distractionHours,
  };

  const productivityScore = computeProductivityScore(
    merged.studyHours,
    merged.focusScore,
    merged.moodScore,
    merged.sleepHours,
    merged.exerciseCompleted,
    merged.distractionHours,
    dailyGoal
  );

  const log = await prisma.dailyLog.update({
    where: { id },
    data: {
      ...data,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      productivityScore,
    },
  });

  return log as unknown as DailyLog;
}

export async function deleteLog(id: string, userId: string): Promise<void> {
  const log = await prisma.dailyLog.findFirst({ where: { id, userId } });
  if (!log) throw new Error("Log not found");
  await prisma.dailyLog.delete({ where: { id } });
}
