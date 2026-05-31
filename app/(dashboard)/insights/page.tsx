"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InsightCard } from "@/components/insights/InsightCard";
import { toast } from "sonner";
import { Lightbulb, CheckCheck, AlertTriangle, CheckCircle, Info, Zap, Sparkles, Loader2, Bot } from "lucide-react";
import type { Insight } from "@/types";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "study", label: "Study" },
  { key: "focus", label: "Focus" },
  { key: "sleep", label: "Sleep" },
  { key: "distraction", label: "Distraction" },
  { key: "streak", label: "Streak" },
  { key: "general", label: "General" },
];

const TYPE_TABS = [
  { key: "all", label: "All", icon: Lightbulb },
  { key: "warning", label: "Warnings", icon: AlertTriangle },
  { key: "positive", label: "Positive", icon: CheckCircle },
  { key: "motivation", label: "Motivation", icon: Zap },
];

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      if (json.data) setInsights(json.data);
    } catch {
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "AI insights generated!");
        if (json.data) setInsights(json.data);
      } else {
        toast.error(json.error || "Failed to generate AI insights");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setInsights((prev) => prev.map((i) => ({ ...i, read: true })));
    toast.success("All insights marked as read");
  };

  const filtered = insights.filter((i) => {
    if (activeType !== "all" && i.type !== activeType) return false;
    if (activeCategory !== "all" && i.category !== activeCategory) return false;
    return true;
  });

  const unreadCount = insights.filter((i) => !i.read).length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Insights"
        subtitle="Rule-based & AI-powered analysis of your productivity patterns"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAI}
            disabled={generatingAI}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white gradient-brand rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {generatingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {generatingAI ? "Generating..." : "Generate AI Insights"}
            </span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", count: insights.length, color: "text-slate-900 dark:text-white" },
            { label: "Unread", count: unreadCount, color: "text-amber-600 dark:text-amber-400" },
            { label: "Warnings", count: insights.filter(i => i.type === "warning").length, color: "text-red-500" },
            { label: "AI-Generated", count: insights.filter(i => i.message.startsWith("[AI]")).length, color: "text-indigo-500" },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPE_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeType === key
                  ? "gradient-brand text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                activeCategory === key
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Insights list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No insights found</p>
            <p className="text-slate-400 text-sm mt-1">
              {insights.length === 0
                ? "Keep logging daily to generate insights"
                : "Try changing the filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-medium">
              Showing {filtered.length} insight{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
