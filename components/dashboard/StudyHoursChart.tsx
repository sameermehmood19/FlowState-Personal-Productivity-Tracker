"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface StudyHoursChartProps {
  data: ChartDataPoint[];
}

export function StudyHoursChart({ data }: StudyHoursChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, "auto"]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "10px",
            color: "#f8fafc",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "12px" }}
        />
        <Line
          type="monotone"
          dataKey="studyHours"
          name="Study Hours"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#6366f1" }}
        />
        <Line
          type="monotone"
          dataKey="distractionHours"
          name="Distraction Hrs"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 4, fill: "#f59e0b" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
