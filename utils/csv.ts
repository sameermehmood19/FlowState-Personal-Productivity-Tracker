import type { DailyLog } from "@/types";
import { format } from "date-fns";

const CSV_HEADERS = [
  "Date",
  "Study Hours",
  "Mood Score",
  "Focus Score",
  "Sleep Hours",
  "Exercise",
  "Distraction Hours",
  "Productivity Score",
  "Notes",
];

function escapeCsvValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvContent(logs: DailyLog[]): string {
  const rows = logs.map((log) => [
    format(new Date(log.date), "yyyy-MM-dd"),
    log.studyHours,
    log.moodScore,
    log.focusScore,
    log.sleepHours,
    log.exerciseCompleted ? "Yes" : "No",
    log.distractionHours,
    log.productivityScore,
    log.notes ?? "",
  ]);

  const csvContent = [
    CSV_HEADERS.join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  return csvContent;
}
