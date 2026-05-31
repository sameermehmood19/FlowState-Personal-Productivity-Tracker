"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvisorBriefing {
  todayFocus: string;
  patternObserved: string;
  actionItem: string;
  motivationalScore: number;
  mood: "excellent" | "good" | "neutral" | "concerning" | "critical";
}

const MOOD_CONFIG = {
  excellent: {
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/10",
    label: "Excellent momentum",
    dot: "bg-emerald-500",
  },
  good: {
    gradient: "from-indigo-500/10 via-violet-500/5 to-transparent",
    border: "border-indigo-500/20",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    glow: "shadow-indigo-500/10",
    label: "Good progress",
    dot: "bg-indigo-500",
  },
  neutral: {
    gradient: "from-slate-500/8 via-slate-400/5 to-transparent",
    border: "border-slate-300 dark:border-slate-700",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    glow: "shadow-slate-500/5",
    label: "Steady pace",
    dot: "bg-slate-400",
  },
  concerning: {
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/10",
    label: "Needs attention",
    dot: "bg-amber-500",
  },
  critical: {
    gradient: "from-rose-500/10 via-red-500/5 to-transparent",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    glow: "shadow-rose-500/10",
    label: "Act now",
    dot: "bg-rose-500",
  },
};

export function DailyAdvisorCard() {
  const [briefing, setBriefing] = useState<AdvisorBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchBriefing = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        // Clear cache first
        await fetch("/api/ai/advisor", { method: "DELETE" });
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await fetch("/api/ai/advisor");
      const json = await res.json();

      if (res.ok && json.data) {
        setBriefing(json.data);
        setCached(json.cached ?? false);
      } else {
        setError(json.error || "Failed to load daily briefing");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  if (loading) {
    return (
      <div className="card p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 skeleton rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-3.5 skeleton w-32" />
            <div className="h-2.5 skeleton w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 skeleton w-full" />
          <div className="h-3 skeleton w-5/6" />
          <div className="h-3 skeleton w-4/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4 border border-rose-500/20 bg-rose-500/5 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{error}</p>
        <button
          onClick={() => fetchBriefing(true)}
          className="btn btn-secondary btn-sm font-bold text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!briefing) return null;

  const config = MOOD_CONFIG[briefing.mood] ?? MOOD_CONFIG.neutral;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300",
        `bg-gradient-to-br ${config.gradient}`,
        config.border,
        config.glow,
        "animate-slide-up"
      )}
    >
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-40 h-40 opacity-[0.04] pointer-events-none">
        <Sparkles className="w-full h-full" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              AI Daily Advisor
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", config.badge)}>
                {config.label}
              </span>
              {cached && (
                <span className="text-[10px] text-slate-400">· cached</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchBriefing(true)}
          disabled={refreshing}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          title="Refresh AI advice (uses Gemini)"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Three-part briefing */}
      <div className="space-y-3">
        {/* Today's Focus */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-0.5">
              Today's Focus
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              {briefing.todayFocus}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800/60 mx-9" />

        {/* Pattern Observed */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-500 mb-0.5">
              Pattern Observed
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {briefing.patternObserved}
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800/60 mx-9" />

        {/* Action Item */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
              Action Item
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {briefing.actionItem}
            </p>
          </div>
        </div>
      </div>

      {/* Motivational score bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Motivation Level
          </span>
          <span className="text-xs font-black text-slate-600 dark:text-slate-400">
            {briefing.motivationalScore}/10
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${briefing.motivationalScore * 10}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-right">
          Powered by Google Gemini · Updates daily
        </p>
      </div>
    </div>
  );
}
