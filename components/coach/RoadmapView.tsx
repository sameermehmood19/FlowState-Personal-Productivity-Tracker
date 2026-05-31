"use client";

import React, { useState } from "react";
import { TopicCard } from "./TopicCard";
import { DecisionCard } from "./DecisionCard";
import { CoachRoadmap } from "@/services/coach.service";
import { 
  Sparkles, 
  AlertOctagon, 
  Map, 
  CalendarDays, 
  Flag, 
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapViewProps {
  roadmap: CoachRoadmap;
  topics: any[];
  onStatusChange: (id: string, status: "pending" | "in_progress" | "completed") => Promise<void>;
  decision: any | null;
  onReevaluateDecision: () => Promise<void>;
  hasProjects: boolean;
  onResetOnboarding: () => void;
}

export function RoadmapView({
  roadmap,
  topics,
  onStatusChange,
  decision,
  onReevaluateDecision,
  hasProjects,
  onResetOnboarding,
}: RoadmapViewProps) {
  const [activeTab, setActiveTab] = useState<"path" | "30day" | "vision">("path");

  // Calculate stats
  const total = topics.length;
  const completed = topics.filter((t) => t.status === "completed").length;
  const inProgress = topics.filter((t) => t.status === "in_progress").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* 1. Header Overview & Progress Bar */}
      <div className="card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded">
              Active Roadmap
            </span>
            <p className="text-base text-slate-700 dark:text-slate-350 leading-relaxed font-semibold mt-3">
              {roadmap.summary}
            </p>
          </div>
          <button
            onClick={onResetOnboarding}
            className="btn btn-ghost btn-sm font-bold text-xs"
          >
            Re-run Setup
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
            <span>Overall Roadmap Progress</span>
            <span className="text-indigo-500">{completed}/{total} Topics ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            />
          </div>
        </div>
      </div>

      {/* 2. Critical Gaps & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roadmap.criticalGaps && roadmap.criticalGaps.length > 0 && (
          <div className="card p-5 border-l-4 border-l-rose-500 bg-rose-500/[0.02]">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              Critical Knowledge Gaps
            </h3>
            <ul className="space-y-2">
              {roadmap.criticalGaps.map((gap, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {roadmap.strictWarnings && roadmap.strictWarnings.length > 0 && (
          <div className="card p-5 border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Strict Coach Warnings
            </h3>
            <ul className="space-y-2">
              {roadmap.strictWarnings.map((warning, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-350 font-semibold flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Decision Engine: Which Project to build first */}
      <DecisionCard
        decision={decision}
        onReevaluate={onReevaluateDecision}
        hasProjects={hasProjects}
      />

      {/* 4. Tab Selectors */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("path")}
          className={cn(
            "pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "path"
              ? "border-indigo-500 text-slate-800 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          <Map className="w-4 h-4" />
          Strict Learning Path
        </button>
        <button
          onClick={() => setActiveTab("30day")}
          className={cn(
            "pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "30day"
              ? "border-indigo-500 text-slate-800 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          First 30 Days Tasks
        </button>
        <button
          onClick={() => setActiveTab("vision")}
          className={cn(
            "pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "vision"
              ? "border-indigo-500 text-slate-800 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          <Flag className="w-4 h-4" />
          60-90 Day Outlook
        </button>
      </div>

      {/* 5. Tab Content rendering */}
      {activeTab === "path" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            Tip: Complete these in exact order. Click a card to read explanations, resources, and milestone checkpoints!
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      ) : activeTab === "30day" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {["week1", "week2", "week3", "week4"].map((w, index) => {
            const weekData = (roadmap.thirtyDayPlan as any)[w];
            if (!weekData) return null;
            return (
              <div key={w} className="card p-5 space-y-4">
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                  Week {index + 1} focus
                </span>
                <h4 className="text-sm font-black text-slate-850 dark:text-white -mt-2">
                  {weekData.focus}
                </h4>
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Daily Actions checklist
                  </span>
                  {weekData.dailyTasks.map((task: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-350">
                      <div className="w-4 h-4 rounded border border-indigo-400/30 flex items-center justify-center mt-0.5 flex-shrink-0 bg-slate-50 dark:bg-slate-900">
                        <span className="text-[10px] font-extrabold text-indigo-500">{i + 1}</span>
                      </div>
                      <span className="font-semibold leading-relaxed">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="card p-6 space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
              Weeks 5 to 8 (Day 60 Vision)
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              {roadmap.sixtyDayPlan}
            </p>
          </div>

          <div className="card p-6 space-y-3">
            <span className="text-[10px] font-black uppercase text-violet-500 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded">
              Weeks 9 to 12 (Day 90 Vision)
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              {roadmap.ninetyDayPlan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
