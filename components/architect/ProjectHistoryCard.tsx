"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectHistoryCardProps {
  project: {
    id: string;
    projectName: string;
    description: string;
    verdict: string;
    overallScore: number;
    createdAt: string | Date;
  };
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export function ProjectHistoryCard({ project, onDelete }: ProjectHistoryCardProps) {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "approved":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "Approved",
        };
      case "revision":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "Needs Revision",
        };
      case "rejected":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-500",
          icon: <XCircle className="w-4 h-4" />,
          label: "Rejected",
        };
      default:
        return {
          bg: "bg-slate-500/10 border-slate-500/20 text-slate-500",
          icon: null,
          label: "Pending",
        };
    }
  };

  const style = getVerdictStyle(project.verdict);
  const timeAgo = formatDistanceToNow(new Date(project.createdAt), { addSuffix: true });

  return (
    <div className="card card-glow p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
              {project.projectName}
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("badge", style.bg)}>
              {style.icon}
              {style.label}
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
              {project.overallScore.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3">
        {onDelete && (
          <button
            onClick={(e) => onDelete(project.id, e)}
            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/5 transition-all"
            title="Delete validation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <Link
          href={`/architect/${project.id}`}
          className="btn btn-secondary btn-sm font-bold text-xs flex items-center gap-1 ml-auto"
        >
          View Report
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
