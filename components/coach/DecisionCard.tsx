"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Calendar, Check, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionCardProps {
  decision: {
    title: string;
    description: string;
    techStack: string[];
    whyThisFirst: string;
    estimatedDays: number;
  } | null;
  onReevaluate: () => Promise<void>;
  hasProjects: boolean;
}

export function DecisionCard({ decision, onReevaluate, hasProjects }: DecisionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleReevaluate = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await onReevaluate();
    } finally {
      setLoading(false);
    }
  };

  if (!hasProjects) {
    return (
      <div className="card p-6 border-l-4 border-l-amber-400 bg-amber-500/5 dark:bg-amber-500/[0.02]">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Cross-Module Project Matcher
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          You have no blueprints evaluated in <strong>Project Architect</strong> yet. Submit your project ideas there, and the Learning Coach will automatically analyze which one you should build first to match your learning curve!
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 dark:from-indigo-500/[0.01] dark:to-violet-500/[0.01] shadow-sm relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute right-0 top-0 w-32 h-32 gradient-brand opacity-10 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge badge-brand mb-2 animate-pulse-glow">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            AI Recommended Project
          </span>
          {decision ? (
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              {decision.title}
            </h3>
          ) : (
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Need a project build recommendation?
            </h3>
          )}
        </div>

        <button
          onClick={handleReevaluate}
          disabled={loading}
          className="btn btn-secondary btn-sm font-bold text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {decision ? "Re-evaluate Blueprints" : "Analyze My Blueprints"}
        </button>
      </div>

      {decision ? (
        <div className="mt-4 space-y-4 animate-scale-in">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
            {decision.description}
          </p>

          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Why build this one first?
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
              "{decision.whyThisFirst}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {decision.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold self-end sm:self-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Est: ~{decision.estimatedDays} days coding
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            We'll compare all your blueprints evaluated in **Project Architect** against your current level to pick which one maximizes your growth and has the best learning payoff right now.
          </p>
          <button
            onClick={handleReevaluate}
            disabled={loading}
            className="btn btn-primary btn-sm font-bold text-xs mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                Analyzing...
              </>
            ) : (
              <>
                Run Decision Engine
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
