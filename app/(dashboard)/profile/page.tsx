"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Flame,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  weeklyGoal: number;
  dailyGoal: number;
  createdAt: string;
  _count: { logs: number };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<{
    longestStreak: number;
    allTimeTotalHours: number;
    consistencyScore: number;
    avgMoodScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/analytics"),
        ]);
        const [profileJson, analyticsJson] = await Promise.all([
          profileRes.json(),
          analyticsRes.json(),
        ]);
        if (profileJson.data) setProfile(profileJson.data);
        if (analyticsJson.data) setAnalytics(analyticsJson.data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      <Header title="Profile" subtitle="Your FlowState account" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-2xl">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
              {loading ? "?" : initials ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <>
                  <div className="skeleton h-6 w-40 mb-2" />
                  <div className="skeleton h-4 w-52" />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {profile?.name}
                  </h2>
                  <p className="text-slate-400 text-sm">{profile?.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Member since{" "}
                    {profile?.createdAt
                      ? format(new Date(profile.createdAt), "MMMM yyyy")
                      : "–"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {[
              { icon: Mail, label: "Email", value: profile?.email },
              {
                icon: Calendar,
                label: "Member Since",
                value: profile?.createdAt
                  ? format(new Date(profile.createdAt), "MMM d, yyyy")
                  : "–",
              },
              {
                icon: Target,
                label: "Daily Goal",
                value: profile?.dailyGoal ? `${profile.dailyGoal}h/day` : "–",
              },
              {
                icon: Target,
                label: "Weekly Goal",
                value: profile?.weeklyGoal ? `${profile.weeklyGoal}h/week` : "–",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  {loading ? (
                    <div className="skeleton h-4 w-24 mt-0.5" />
                  ) : (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                      {value ?? "–"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All-time stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            All-Time Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: BookOpen,
                label: "Total Logs",
                value: profile?._count.logs ?? 0,
                color: "text-indigo-500",
              },
              {
                icon: BookOpen,
                label: "Study Hours",
                value: analytics?.allTimeTotalHours
                  ? `${analytics.allTimeTotalHours}h`
                  : "–",
                color: "text-violet-500",
              },
              {
                icon: Flame,
                label: "Longest Streak",
                value: analytics?.longestStreak
                  ? `${analytics.longestStreak}d`
                  : "–",
                color: "text-amber-500",
              },
              {
                icon: Award,
                label: "Consistency",
                value: analytics?.consistencyScore
                  ? `${analytics.consistencyScore}%`
                  : "–",
                color: "text-emerald-500",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-4"
              >
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                {loading ? (
                  <div className="skeleton h-6 w-16 mx-auto mb-1" />
                ) : (
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
