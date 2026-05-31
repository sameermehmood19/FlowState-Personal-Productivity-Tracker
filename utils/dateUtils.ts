import { startOfDay, differenceInCalendarDays, parseISO } from "date-fns";

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDateRangeArray(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return Math.abs(differenceInCalendarDays(d1, d2));
}

export function toLocalDateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return startOfDay(d).toISOString().split("T")[0];
}

export function computeCurrentStreak(
  logs: Array<{ date: Date | string }>
): number {
  if (!logs.length) return 0;

  const sorted = [...logs]
    .map((l) => ({
      date: typeof l.date === "string" ? parseISO(l.date) : l.date,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const today = startOfDay(new Date());
  let streak = 0;
  let expectedDate = today;

  for (const log of sorted) {
    const logDate = startOfDay(log.date);
    const diff = differenceInCalendarDays(expectedDate, logDate);

    if (diff === 0 || (streak === 0 && diff === 1)) {
      streak++;
      expectedDate = new Date(logDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}

export function computeLongestStreak(
  logs: Array<{ date: Date | string }>
): number {
  if (!logs.length) return 0;

  const sorted = [...logs]
    .map((l) => startOfDay(typeof l.date === "string" ? parseISO(l.date) : l.date))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(sorted[i], sorted[i - 1]);
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export function computeProductivityScore(
  studyHours: number,
  focusScore: number,
  moodScore: number,
  sleepHours: number,
  exerciseCompleted: boolean,
  distractionHours: number,
  dailyGoal: number = 8
): number {
  const studyWeight = Math.min((studyHours / dailyGoal) * 30, 30);
  const focusWeight = (focusScore / 10) * 25;
  const moodWeight = (moodScore / 10) * 15;
  const sleepWeight = Math.min((sleepHours / 8) * 15, 15);
  const exerciseWeight = exerciseCompleted ? 10 : 0;
  const distractionPenalty =
    studyHours > 0 ? Math.min((distractionHours / studyHours) * 5, 5) : 5;
  const score =
    studyWeight +
    focusWeight +
    moodWeight +
    sleepWeight +
    exerciseWeight +
    (5 - distractionPenalty);
  return parseFloat(Math.min(score, 100).toFixed(1));
}
