"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface ProductivityGaugeProps {
  score: number; // 0-100
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#6366f1";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 60) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 40) return "Low";
  return "Very Low";
}

export function ProductivityGauge({ score }: ProductivityGaugeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            data={data}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            {/* Background track */}
            <RadialBar
              background={{ fill: "rgba(148,163,184,0.1)" }}
              dataKey="value"
              cornerRadius={8}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold"
            style={{ color }}
          >
            {score > 0 ? score.toFixed(0) : "–"}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      <div className="text-center mt-1">
        <p
          className="text-sm font-semibold"
          style={{ color }}
        >
          {score > 0 ? label : "No log yet"}
        </p>
        <p className="text-xs text-slate-400">Today&apos;s Score</p>
      </div>
    </div>
  );
}
