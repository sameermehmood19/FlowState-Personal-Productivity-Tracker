"use client";

import React from "react";
import { ProjectFeedback } from "@/services/architect.service";
import { ScoreRing } from "./ScoreRing";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Cpu, 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Layers,
  Users
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FeedbackReportProps {
  feedback: ProjectFeedback;
  projectName: string;
}

export function FeedbackReport({ feedback, projectName }: FeedbackReportProps) {
  const {
    verdict,
    overallScore,
    scores,
    summary,
    techStackAnalysis,
    architectureReview,
    methodologyCritique,
    whatCompaniesActuallyDo,
    recommendedStack,
    learningGaps,
    first30DaysRoadmap,
  } = feedback;

  const getVerdictDetails = () => {
    switch (verdict) {
      case "approved":
        return {
          bg: "verdict-bg-approved border",
          text: "text-emerald-500",
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
          title: "APPROVED FOR DEVELOPMENT",
          subtitle: "Your architecture, stack, and scope are well-aligned! You're ready to start building.",
        };
      case "revision":
        return {
          bg: "verdict-bg-revision border",
          text: "text-amber-500",
          icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
          title: "NEEDS REVISION",
          subtitle: "Your proposal has great potential but requires vital corrections before development starts.",
        };
      case "rejected":
        return {
          bg: "verdict-bg-rejected border",
          text: "text-rose-500",
          icon: <XCircle className="w-8 h-8 text-rose-500" />,
          title: "PROPOSAL REJECTED",
          subtitle: "Critical architecture or stack mismatches detected. Review the corrections below and redesign.",
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800",
          text: "text-slate-500",
          icon: <HelpCircle className="w-8 h-8 text-slate-500" />,
          title: "EVALUATION PENDING",
          subtitle: "The evaluation is processing.",
        };
    }
  };

  const verdictDetails = getVerdictDetails();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* 1. Verdict Banner */}
      <div className={`p-6 rounded-2xl ${verdictDetails.bg} flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm`}>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex-shrink-0">
          {verdictDetails.icon}
        </div>
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${verdictDetails.text}`}>
            {verdictDetails.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {verdictDetails.subtitle}
          </p>
        </div>
        <div className="md:ml-auto flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">CTO SCORE</span>
          <span className={`text-lg font-black ${verdictDetails.text}`}>
            {overallScore.toFixed(1)}/10
          </span>
        </div>
      </div>

      {/* 2. Score Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={scores.problemClarity} label="Problem Clarity" size="sm" />
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={scores.techStackFit} label="Tech Stack Fit" size="sm" />
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={scores.architectureAppropriateness} label="Architecture Fit" size="sm" />
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={scores.methodologyFit} label="Methodology" size="sm" />
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={scores.scalabilityReadiness} label="Scalability" size="sm" />
        </div>
      </div>

      {/* 3. Executive Summary */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {summary}
        </p>
      </div>

      {/* 4. Comparison System: Your Stack vs Recommended Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 border-l-4 border-l-rose-400 bg-rose-500/5 dark:bg-rose-500/[0.02]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            Proposed Stack Mismatches
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Tech Stack Analysis</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {techStackAnalysis.whyNotYours}
              </p>
            </div>
            {architectureReview.whyNotYours && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mt-4">Architecture Review</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {architectureReview.whyNotYours}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/[0.02]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Recommended Stack & Rationale
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Frontend</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recommendedStack.frontend}</p>
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Backend</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recommendedStack.backend}</p>
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Database</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recommendedStack.database}</p>
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Cache & Hosting</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recommendedStack.cache || "N/A"} / {recommendedStack.devops || "N/A"}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase">CTO Rationale</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {recommendedStack.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Detailed Review Breakdowns */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          Technical Review Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                Tech Stack
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {techStackAnalysis.rating}/10
              </span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{techStackAnalysis.verdict}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex-grow leading-relaxed">
              {techStackAnalysis.analysis}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Action Items</span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 space-y-1">
                {techStackAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-indigo-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full">
                Architecture
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {architectureReview.rating}/10
              </span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{architectureReview.verdict}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex-grow leading-relaxed">
              {architectureReview.analysis}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Action Items</span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 space-y-1">
                {architectureReview.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-violet-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-full">
                Methodology
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {methodologyCritique.rating}/10
              </span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{methodologyCritique.verdict}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex-grow leading-relaxed">
              {methodologyCritique.analysis}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Action Items</span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 space-y-1">
                {methodologyCritique.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-sky-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 6. What Companies Actually Do */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-violet-500" />
          How Startups & Big Tech Build It
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {whatCompaniesActuallyDo.examples.map((ex, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-black text-indigo-500">{ex.company}</span>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Their Approach:</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{ex.approach}</p>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Takeaway Lesson:</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium italic">
                "{ex.lesson}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Learning Gaps */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          Required Knowledge & Skill Gaps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {learningGaps.map((gap, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                    gap.importance === "critical" 
                      ? "bg-rose-50 text-rose-500 dark:bg-rose-950/40" 
                      : gap.importance === "important" 
                      ? "bg-amber-50 text-amber-500 dark:bg-amber-950/40" 
                      : "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40"
                  }`}>
                    {gap.importance}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{gap.topic}</h4>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Recommended Resource:</span>
                <span className="text-xs font-semibold text-indigo-500 hover:underline cursor-pointer">
                  {gap.resource}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. First 30 Days Roadmap */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-violet-500" />
          CTO First 30 Days Blueprint
        </h3>
        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6 ml-3">
          {first30DaysRoadmap.map((weekData, i) => (
            <div key={i} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Week {weekData.week}</span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{weekData.focus}</h4>
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {weekData.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-indigo-500 flex-shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
