"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number; // 0 - 10
  label: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreRing({ score, label, size = "md" }: ScoreRingProps) {
  const percentage = Math.min(Math.max(score * 10, 0), 100);
  const radius = size === "lg" ? 36 : size === "sm" ? 18 : 26;
  const strokeWidth = size === "lg" ? 6 : size === "sm" ? 3 : 4.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  const getColorClass = () => {
    if (score >= 7.5) return "stroke-emerald-500 text-emerald-500";
    if (score >= 5.0) return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };

  const getBgColorClass = () => {
    if (score >= 7.5) return "stroke-emerald-500/10";
    if (score >= 5.0) return "stroke-amber-500/10";
    return "stroke-rose-500/10";
  };

  const sizeClasses = {
    sm: "w-14 h-14 text-xs font-bold",
    md: "w-20 h-20 text-base font-bold",
    lg: "w-28 h-28 text-2xl font-black",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("score-ring", sizeClasses[size])}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
        >
          {/* Track */}
          <circle
            className={cn("fill-transparent", getBgColorClass())}
            strokeWidth={strokeWidth}
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
          {/* Progress */}
          <circle
            className={cn("fill-transparent transition-all duration-500 ease-out", getColorClass())}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            score >= 7.5 ? "text-emerald-500" : score >= 5 ? "text-amber-500" : "text-rose-500"
          )}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center max-w-[90px] leading-tight">
        {label}
      </span>
    </div>
  );
}
