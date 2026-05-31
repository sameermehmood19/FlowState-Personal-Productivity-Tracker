"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StudyHoursChart } from "@/components/dashboard/StudyHoursChart";
import { MoodFocusChart } from "@/components/dashboard/MoodFocusChart";
import { WeeklyAISummaryCard } from "@/components/ai/WeeklyAISummaryCard";
import { toast } from "sonner";
import {
  TrendingUp,
  Flame,
  Award,
  Activity,
  Calendar,
  Target,
  BookOpen,
  Heart,
} from "lucide-react";
import type { AnalyticsData } from "@/types";
import { formatDate } from "@/lib/utils";

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-indigo-500",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className={`${color} mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, chartRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch(`/api/analytics?type=chart&days=${chartDays}`),
        ]);
        const [analyticsJson, chartJson] = await Promise.all([
          analyticsRes.json(),
          chartRes.json(),
        ]);
        if (analyticsJson.data) setAnalytics(analyticsJson.data);
        if (chartJson.data) setChartData(chartJson.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [chartDays]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Analytics"
        subtitle="Comprehensive productivity analysis"
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* AI Weekly Summary */}
        <WeeklyAISummaryCard />

        {/* All-time stats */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            All-Time Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))
            ) : (
              <>
                <MetricCard
                  label="Total Study Hours"
                  value={`${analytics?.allTimeTotalHours ?? 0}h`}
                  icon={BookOpen}
                  color="text-indigo-500"
                />
                <MetricCard
                  label="Longest Streak"
                  value={`${analytics?.longestStreak ?? 0} days`}
                  icon={Flame}
                  color="text-amber-500"
                />
                <MetricCard
                  label="Current Streak"
                  value={`${analytics?.currentStreak ?? 0} days`}
                  icon={Activity}
                  color="text-emerald-500"
                />
                <MetricCard
                  label="Avg Mood Score"
                  value={`${analytics?.avgMoodScore.toFixed(1) ?? "–"}/10`}
                  icon={Heart}
                  color="text-pink-500"
                />
                <MetricCard
                  label="Consistency Rate"
                  value={`${analytics?.consistencyScore ?? 0}%`}
                  sub="Days logged vs total days"
                  icon={Target}
                  color="text-violet-500"
                />
                <MetricCard
                  label="Best Day Score"
                  value={analytics?.bestDay ? `${analytics.bestDay.productivityScore}` : "–"}
                  sub={analytics?.bestDay ? formatDate(analytics.bestDay.date) : undefined}
                  icon={Award}
                  color="text-yellow-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Best/Worst day highlights */}
        {!loading && analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analytics.bestDay && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 dark:bg-emerald-500/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Best Productivity Day</h3>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {formatDate(analytics.bestDay.date)}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Study</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{analytics.bestDay.studyHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Mood</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{analytics.bestDay.moodScore}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Score</p>
                    <p className="font-bold text-emerald-500">{analytics.bestDay.productivityScore}</p>
                  </div>
                </div>
              </div>
            )}
            {analytics.worstDay && (
              <div className="bg-red-500/5 border border-red-500/20 dark:bg-red-500/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  <h3 className="font-semibold text-red-600 dark:text-red-400">Most Distracted Day</h3>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {formatDate(analytics.worstDay.date)}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Distraction</p>
                    <p className="font-bold text-red-500">{analytics.worstDay.distractionHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Study</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{analytics.worstDay.studyHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Score</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{analytics.worstDay.productivityScore}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Study & Distraction Trends</h2>
            </div>
            <div className="flex gap-2">
              {[14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    chartDays === d
                      ? "gradient-brand text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <StudyHoursChart data={chartData as never} />
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Mood & Focus Trends</h2>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-xl" />
          ) : (
            <MoodFocusChart data={chartData as never} />
          )}
        </div>

        {/* Monthly summary */}
        {!loading && analytics && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {analytics.monthly.month} Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Study", value: `${analytics.monthly.totalStudyHours}h` },
                { label: "Days Logged", value: analytics.monthly.daysLogged },
                { label: "Avg Mood", value: `${analytics.monthly.avgMoodScore.toFixed(1)}/10` },
                { label: "Consistency", value: `${analytics.monthly.consistencyScore}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly breakdown */}
        {!loading && analytics && analytics.weekly.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
              Weekly Breakdown (Last 8 Weeks)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Week</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Study</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Mood</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Focus</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Days</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">Goal %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {analytics.weekly.map((week, i) => {
                    const goalPct = Math.min(
                      Math.round((week.totalStudyHours / week.weeklyGoal) * 100),
                      100
                    );
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                          Week {analytics.weekly.length - i}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {week.totalStudyHours}h
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {week.avgMoodScore.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {week.avgFocusScore.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                          {week.daysLogged}/7
                        </td>
                        <td className="py-2.5 px-3 text-right hidden md:table-cell">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            goalPct >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            goalPct >= 50 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}>
                            {goalPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
