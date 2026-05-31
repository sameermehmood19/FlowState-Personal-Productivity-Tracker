"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Play, 
  CheckCircle, 
  HelpCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Sparkles
} from "lucide-react";
import { TopicExplainModal } from "./TopicExplainModal";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    category: string;
    orderIndex: number;
    status: string; // "pending" | "in_progress" | "completed"
    weekTarget: number;
    whyNow: string;
    milestone: string;
    resources: string[];
  };
  onStatusChange: (id: string, status: "pending" | "in_progress" | "completed") => Promise<void>;
}

export function TopicCard({ topic, onStatusChange }: TopicCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10",
          text: "text-emerald-500",
          badge: "badge-success",
          dot: "status-completed",
          label: "Completed",
        };
      case "in_progress":
        return {
          bg: "bg-amber-500/5 border-amber-500/20 dark:border-amber-500/10",
          text: "text-amber-500",
          badge: "badge-warning",
          dot: "status-in_progress",
          label: "In Progress",
        };
      default:
        return {
          bg: "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800",
          text: "text-slate-400 dark:text-slate-500",
          badge: "badge-neutral",
          dot: "status-pending",
          label: "To Study",
        };
    }
  };

  const statusDetails = getStatusDetails(topic.status);

  const handleStatusClick = async (newStatus: "pending" | "in_progress" | "completed") => {
    if (updating) return;
    try {
      setUpdating(true);
      await onStatusChange(topic.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        "topic-card flex flex-col transition-all duration-200",
        statusDetails.bg,
        expanded && "shadow-sm border-slate-350 dark:border-slate-700"
      )}
    >
      <div className="flex items-start justify-between gap-4 w-full cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("topic-status-dot", statusDetails.dot)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                #{topic.orderIndex}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {topic.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-auto sm:ml-0">
                Target: Week {topic.weekTarget}
              </span>
            </div>
            <h3 className={cn(
              "text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 truncate",
              topic.status === "completed" && "line-through text-slate-400 dark:text-slate-500"
            )}>
              {topic.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {topic.status === "pending" && (
              <button
                onClick={() => handleStatusClick("in_progress")}
                disabled={updating}
                className="btn btn-secondary btn-sm font-bold text-[11px] py-1 px-2.5 flex items-center gap-1 hover:border-amber-400/50 hover:bg-amber-400/5"
              >
                <Play className="w-3 h-3 text-amber-500 fill-amber-500" />
                Start
              </button>
            )}
            {topic.status === "in_progress" && (
              <button
                onClick={() => handleStatusClick("completed")}
                disabled={updating}
                className="btn btn-secondary btn-sm font-bold text-[11px] py-1 px-2.5 flex items-center gap-1 hover:border-emerald-400/50 hover:bg-emerald-400/5"
              >
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Finish
              </button>
            )}
            {topic.status === "completed" && (
              <button
                onClick={() => handleStatusClick("pending")}
                disabled={updating}
                className="btn btn-secondary btn-sm font-bold text-[11px] py-1 px-2.5 flex items-center gap-1 hover:border-slate-300 dark:hover:border-slate-700"
              >
                Reset
              </button>
            )}
            {/* Ask AI button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="btn btn-secondary btn-sm font-bold text-[11px] py-1 px-2.5 flex items-center gap-1 hover:border-indigo-400/50 hover:bg-indigo-400/5 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Get AI study guide for this topic"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Ask AI
            </button>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {showAIModal && (
        <TopicExplainModal
          topicId={topic.id}
          topicTitle={topic.title}
          topicCategory={topic.category}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-slide-down">
          {topic.whyNow && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Why in this order?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 leading-relaxed font-medium">
                {topic.whyNow}
              </p>
            </div>
          )}

          {topic.milestone && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Verification Milestone
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-bold">
                {topic.milestone}
              </p>
            </div>
          )}

          {topic.resources && topic.resources.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Curated Resources
              </h4>
              <div className="flex flex-wrap gap-2">
                {topic.resources.map((res, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-950/50 hover:underline cursor-pointer"
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
