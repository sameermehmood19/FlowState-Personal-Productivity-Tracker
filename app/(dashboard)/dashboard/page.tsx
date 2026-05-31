"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudyHoursChart } from "@/components/dashboard/StudyHoursChart";
import { MoodFocusChart } from "@/components/dashboard/MoodFocusChart";
import { ProductivityHeatmap } from "@/components/dashboard/ProductivityHeatmap";
import { ProductivityGauge } from "@/components/dashboard/ProductivityGauge";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { InsightCard } from "@/components/insights/InsightCard";
import { LogForm } from "@/components/logs/LogForm";
import { DailyAdvisorCard } from "@/components/ai/DailyAdvisorCard";
import { SmartAlertBanner } from "@/components/ai/SmartAlertBanner";
import { toast } from "sonner";
import {
  BookOpen,
  Flame,
  Heart,
  BarChart2,
  Plus,
  X,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import type { DashboardData } from "@/types";
import { format } from "date-fns";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkInsightRead = async (id: string) => {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchDashboard();
  };

  const goalProgress = data
    ? Math.min(
        (data.weeklyStats.totalStudyHours / data.weeklyStats.weeklyGoal) * 100,
        100
      )
    : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle={`${format(new Date(), "EEEE, MMMM d, yyyy")}`}
      >
        <button
          id="add-log-btn"
          onClick={() => setShowLogForm(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Log Today</span>
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* AI Smart Alerts — auto-detected from your data */}
        <SmartAlertBanner />

        {/* AI Daily Advisor Card */}
        <DailyAdvisorCard />

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatsCard
                title="Today's Study"
                value={data?.todayLog?.studyHours ?? 0}
                unit="hrs"
                icon={BookOpen}
                gradient="brand"
              />
              <StatsCard
                title="Weekly Total"
                value={data?.weeklyStats.totalStudyHours ?? 0}
                unit={`/ ${data?.weeklyStats.weeklyGoal ?? 40}h`}
                icon={BarChart2}
                gradient="success"
              />
              <StatsCard
                title="Current Streak"
                value={data?.currentStreak ?? 0}
                unit="days"
                icon={Flame}
                gradient="warning"
              />
              <StatsCard
                title="Avg Mood"
                value={data?.weeklyStats.avgMoodScore.toFixed(1) ?? "–"}
                unit="/ 10"
                icon={Heart}
                gradient="danger"
              />
            </>
          )}
        </div>

        {/* Weekly goal progress bar */}
        {!loading && data && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Weekly Goal Progress
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {data.weeklyStats.totalStudyHours}h /{" "}
                  {data.weeklyStats.weeklyGoal}h
                </p>
              </div>
              <span
                className="text-2xl font-bold"
                style={{
                  color: goalProgress >= 80 ? "#10b981" : goalProgress >= 50 ? "#6366f1" : "#f59e0b",
                }}
              >
                {goalProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${goalProgress}%`,
                  background:
                    goalProgress >= 80
                      ? "linear-gradient(90deg,#10b981,#059669)"
                      : goalProgress >= 50
                      ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                      : "linear-gradient(90deg,#f59e0b,#d97706)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>{data.weeklyStats.daysLogged} days logged this week</span>
              <span>Consistency: {data.weeklyStats.consistencyScore}%</span>
            </div>
          </div>
        )}

        {/* Charts + Gauge row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Hours Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Study vs Distraction</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            {loading ? (
              <div className="skeleton h-52 rounded-xl" />
            ) : (
              <StudyHoursChart data={data?.chartData ?? []} />
            )}
          </div>

          {/* Productivity Gauge */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4 self-start">
              Productivity Score
            </h2>
            {loading ? (
              <div className="skeleton w-40 h-40 rounded-full" />
            ) : (
              <ProductivityGauge score={data?.productivityScore ?? 0} />
            )}
            {!loading && data && (
              <div className="grid grid-cols-2 gap-3 w-full mt-4 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Longest Streak</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {data.longestStreak}d
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Avg Focus</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {data.weeklyStats.avgFocusScore.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mood/Focus Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Mood & Focus Trends</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 30 days · Scale 1–10</p>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <MoodFocusChart data={data?.chartData ?? []} />
          )}
        </div>

        {/* Recent Logs + Insights row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Recent Logs
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <RecentLogs logs={data?.recentLogs ?? []} />
            )}
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Insights
                {(data?.insights.length ?? 0) > 0 && (
                  <span className="text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    {data!.insights.length}
                  </span>
                )}
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : (data?.insights.length ?? 0) === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No new insights yet</p>
                <p className="text-slate-400 text-xs mt-1">
                  Keep logging to get personalized insights
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data!.insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onMarkRead={handleMarkInsightRead}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Productivity Heatmap */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Productivity Heatmap</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 365 days of activity</p>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-24 rounded-xl" />
          ) : (
            <ProductivityHeatmap data={data?.heatmapData ?? []} />
          )}
        </div>
      </div>

      {/* Log Form Modal */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {data?.todayLog ? "Update Today&apos;s Log" : "Add Daily Log"}
              </h2>
              <button
                onClick={() => setShowLogForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <LogForm
                log={data?.todayLog ?? undefined}
                onSuccess={() => {
                  setShowLogForm(false);
                  fetchDashboard();
                }}
                onCancel={() => setShowLogForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
