import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";
import type { DailyLog } from "@/types";

interface RecentLogsProps {
  logs: DailyLog[];
}

function getMoodEmoji(score: number): string {
  if (score >= 9) return "🤩";
  if (score >= 7) return "😊";
  if (score >= 5) return "😐";
  if (score >= 3) return "😔";
  return "😢";
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400";
  if (score >= 60) return "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400";
  if (score >= 40) return "text-amber-600 bg-amber-500/10 dark:text-amber-400";
  return "text-red-500 bg-red-500/10";
}

export function RecentLogs({ logs }: RecentLogsProps) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BookOpen className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">No logs yet</p>
        <Link
          href="/logs"
          className="text-indigo-500 hover:text-indigo-400 text-sm font-medium mt-1"
        >
          Add your first log
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="text-xl flex-shrink-0">{getMoodEmoji(log.moodScore)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatDate(log.date)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreBadgeColor(
                  log.productivityScore
                )}`}
              >
                {log.productivityScore}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {log.studyHours}h study · Mood {log.moodScore}/10 · Focus{" "}
              {log.focusScore}/10
            </p>
          </div>
          <Link
            href={`/logs?edit=${log.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-400"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ))}

      <Link
        href="/logs"
        className="flex items-center justify-center gap-1 text-sm text-indigo-500 hover:text-indigo-400 font-medium mt-2 py-2 rounded-xl hover:bg-indigo-500/5 transition-colors"
      >
        View all logs
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
