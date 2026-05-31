"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklySummary {
  headline: string;
  wins: string[];
  struggles: string[];
  nextWeekPlan: string;
  weekScore: number;
  weekScoreLabel: "exceptional" | "strong" | "average" | "below_average" | "poor";
}

const SCORE_CONFIG = {
  exceptional: {
    gradient: "from-emerald-500/15 via-teal-500/8 to-transparent",
    border: "border-emerald-500/25",
    ring: "text-emerald-500",
    label: "Exceptional week",
    icon: TrendingUp,
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bar: "from-emerald-400 to-teal-500",
  },
  strong: {
    gradient: "from-indigo-500/15 via-violet-500/8 to-transparent",
    border: "border-indigo-500/25",
    ring: "text-indigo-500",
    label: "Strong week",
    icon: TrendingUp,
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    bar: "from-indigo-400 to-violet-500",
  },
  average: {
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
    border: "border-sky-500/20",
    ring: "text-sky-500",
    label: "Average week",
    icon: Minus,
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    bar: "from-sky-400 to-blue-500",
  },
  below_average: {
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    border: "border-amber-500/20",
    ring: "text-amber-500",
    label: "Below average",
    icon: TrendingDown,
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bar: "from-amber-400 to-orange-500",
  },
  poor: {
    gradient: "from-rose-500/10 via-red-500/5 to-transparent",
    border: "border-rose-500/20",
    ring: "text-rose-500",
    label: "Tough week",
    icon: TrendingDown,
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    bar: "from-rose-400 to-red-500",
  },
};

export function WeeklyAISummaryCard() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [noData, setNoData] = useState(false);

  const fetchSummary = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        await fetch("/api/ai/weekly-summary", { method: "DELETE" });
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await fetch("/api/ai/weekly-summary");
      const json = await res.json();

      if (res.ok) {
        if (json.reason === "no_data") {
          setNoData(true);
        } else if (json.data) {
          setSummary(json.data);
          setCached(json.cached ?? false);
          setNoData(false);
        } else {
          setError(json.error || "Failed to load weekly summary");
        }
      } else {
        setError(json.error || "Failed to load weekly summary");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="card p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 skeleton rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-3.5 skeleton w-40" />
            <div className="h-2.5 skeleton w-24" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 skeleton w-full" />
          <div className="h-3 skeleton w-5/6" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 skeleton rounded-xl" />
          <div className="h-20 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (noData) return null;

  if (error) {
    return (
      <div className="card p-4 border border-rose-500/20 bg-rose-500/5 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{error}</p>
        <button onClick={() => fetchSummary(true)} className="btn btn-secondary btn-sm text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const config = SCORE_CONFIG[summary.weekScoreLabel] ?? SCORE_CONFIG.average;
  const ScoreIcon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 animate-slide-up",
        `bg-gradient-to-br ${config.gradient}`,
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Weekly AI Review
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ScoreIcon className={cn("w-3 h-3", config.ring)} />
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", config.badge)}>
                {config.label}
              </span>
              {cached && <span className="text-[10px] text-slate-400">· cached</span>}
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchSummary(true)}
          disabled={refreshing}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          title="Refresh weekly AI summary"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Headline */}
      <p className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-snug">
        "{summary.headline}"
      </p>

      {/* Week score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Week Score</span>
          <span className="text-sm font-black text-slate-700 dark:text-slate-300">{summary.weekScore}/100</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 bg-gradient-to-r", config.bar)}
            style={{ width: `${summary.weekScore}%` }}
          />
        </div>
      </div>

      {/* Wins + Struggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Wins */}
        <div className="bg-emerald-500/8 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/15">
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Wins
            </span>
          </div>
          <ul className="space-y-1.5">
            {summary.wins.map((win, i) => (
              <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex gap-1.5">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Struggles */}
        <div className="bg-amber-500/8 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-500/15">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              To Improve
            </span>
          </div>
          <ul className="space-y-1.5">
            {summary.struggles.map((s, i) => (
              <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex gap-1.5">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next week plan */}
      <div className="flex gap-2.5 bg-indigo-500/8 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/15">
        <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-0.5">
            Next Week Plan
          </p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {summary.nextWeekPlan}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-right mt-3">
        Powered by Google Gemini · Refreshes every 6h
      </p>
    </div>
  );
}
