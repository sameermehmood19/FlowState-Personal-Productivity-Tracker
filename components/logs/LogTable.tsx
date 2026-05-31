"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronUp, ChevronDown, Dumbbell, FileText } from "lucide-react";
import type { DailyLog } from "@/types";
import { cn } from "@/lib/utils";

interface LogTableProps {
  logs: DailyLog[];
  onEdit: (log: DailyLog) => void;
  onRefresh: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}

function getMoodColor(score: number): string {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-indigo-500";
  if (score >= 4) return "text-amber-500";
  return "text-red-500";
}

function getScoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
  if (score >= 40) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-red-500/10 text-red-500 dark:text-red-400";
}

function SortButton({
  field,
  label,
  currentSort,
  currentOrder,
  onSort,
}: {
  field: string;
  label: string;
  currentSort: string;
  currentOrder: string;
  onSort: (f: string) => void;
}) {
  const isActive = currentSort === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-indigo-500 transition-colors text-xs font-semibold uppercase tracking-wider"
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp
          className={cn(
            "w-3 h-3 -mb-1",
            isActive && currentOrder === "asc" ? "text-indigo-500" : "text-slate-400"
          )}
        />
        <ChevronDown
          className={cn(
            "w-3 h-3",
            isActive && currentOrder === "desc" ? "text-indigo-500" : "text-slate-400"
          )}
        />
      </span>
    </button>
  );
}

export function LogTable({
  logs,
  onEdit,
  onRefresh,
  sortBy,
  sortOrder,
  onSort,
}: LogTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Log deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete log");
    } finally {
      setDeletingId(null);
    }
  };

  if (!logs.length) {
    return (
      <div className="text-center py-16">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No logs found</p>
        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new log</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400">
              <SortButton field="date" label="Date" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
              <SortButton field="studyHours" label="Study" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
              <SortButton field="moodScore" label="Mood" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
              <SortButton field="focusScore" label="Focus" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
              <SortButton field="sleepHours" label="Sleep" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">Ex.</th>
            <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400">
              <SortButton field="productivityScore" label="Score" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatDate(log.date)}
                </span>
                {log.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">
                    {log.notes}
                  </p>
                )}
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {log.studyHours}h
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  -{log.distractionHours}h
                </span>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className={cn("font-bold", getMoodColor(log.moodScore))}>
                  {log.moodScore}
                </span>
                <span className="text-slate-400">/10</span>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className={cn("font-bold", getMoodColor(log.focusScore))}>
                  {log.focusScore}
                </span>
                <span className="text-slate-400">/10</span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell text-slate-600 dark:text-slate-300">
                {log.sleepHours}h
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <Dumbbell
                  className={cn(
                    "w-4 h-4",
                    log.exerciseCompleted
                      ? "text-emerald-500"
                      : "text-slate-300 dark:text-slate-600"
                  )}
                />
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    getScoreBadgeClass(log.productivityScore)
                  )}
                >
                  {log.productivityScore}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(log)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                    title="Edit log"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Delete log"
                  >
                    {deletingId === log.id ? (
                      <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
