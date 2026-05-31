"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Link as LinkIcon,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicExplanation {
  overview: string;
  whyItMatters: string;
  keyConceptsToMaster: Array<{ concept: string; description: string }>;
  studyPlan: Array<{ day: number; task: string; duration: string }>;
  commonMistakes: string[];
  resources: Array<{
    name: string;
    type: "course" | "book" | "docs" | "practice" | "video";
    url?: string;
    why: string;
  }>;
  milestoneTest: string;
}

interface TopicExplainModalProps {
  topicId: string;
  topicTitle: string;
  topicCategory: string;
  onClose: () => void;
}

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  course: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  book: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  docs: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  practice: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  video: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function TopicExplainModal({
  topicId,
  topicTitle,
  topicCategory,
  onClose,
}: TopicExplainModalProps) {
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [expandedConcepts, setExpandedConcepts] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/topic-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setExplanation(json.data);
        setGenerated(true);
      } else {
        setError(json.error || "Failed to generate explanation");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">AI Topic Deep Dive</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                <span className="font-bold text-indigo-500">{topicTitle}</span>
                {" · "}
                <span className="capitalize">{topicCategory}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!generated && !loading && !error && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Get AI Study Guide</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Generate a personalized deep-dive for <strong>{topicTitle}</strong> — including key concepts, day-by-day plan, resources, and milestone test.
                </p>
              </div>
              <button
                onClick={generate}
                className="btn btn-primary mx-auto flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Study Guide
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gemini is crafting your guide...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing your learning profile & career goal</p>
              </div>
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-rose-600 dark:text-rose-400 flex-1">{error}</p>
              <button onClick={generate} className="btn btn-secondary btn-sm text-xs font-bold">
                Retry
              </button>
            </div>
          )}

          {explanation && (
            <div className="space-y-4 animate-fade-in">
              {/* Overview */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Overview</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{explanation.overview}</p>
              </div>

              {/* Why it matters */}
              <div className="bg-indigo-500/8 dark:bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/15">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Why This Matters for Your Goal</p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{explanation.whyItMatters}</p>
              </div>

              {/* Key Concepts */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedConcepts(!expandedConcepts)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Key Concepts to Master ({explanation.keyConceptsToMaster.length})
                    </span>
                  </div>
                  {expandedConcepts ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedConcepts && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {explanation.keyConceptsToMaster.map((kc, i) => (
                      <div key={i} className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{kc.concept}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{kc.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Plan */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPlan(!expandedPlan)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Day-by-Day Study Plan ({explanation.studyPlan.length} days)
                    </span>
                  </div>
                  {expandedPlan ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedPlan && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {explanation.studyPlan.map((day, i) => (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center flex-shrink-0">
                          {day.day}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-300">{day.task}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{day.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Mistakes */}
              <div className="bg-amber-500/8 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">Common Mistakes to Avoid</p>
                </div>
                <ul className="space-y-1.5">
                  {explanation.commonMistakes.map((m, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex gap-1.5">
                      <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Resources</p>
                <div className="space-y-2">
                  {explanation.resources.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              {r.name}
                              <LinkIcon className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{r.name}</span>
                          )}
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize", RESOURCE_TYPE_COLORS[r.type] || "bg-slate-200 text-slate-600")}>
                            {r.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Test */}
              <div className="bg-emerald-500/8 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Milestone: How to Know You've Mastered It</p>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{explanation.milestoneTest}</p>
              </div>

              {/* Regenerate */}
              <div className="text-center pt-2">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="text-xs text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3 h-3" />
                  Regenerate with Gemini
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
