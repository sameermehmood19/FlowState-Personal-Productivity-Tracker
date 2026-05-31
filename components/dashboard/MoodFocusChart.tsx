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
  ReferenceLine,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface MoodFocusChartProps {
  data: ChartDataPoint[];
}

export function MoodFocusChart({ data }: MoodFocusChartProps) {
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
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
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
        <ReferenceLine y={7} stroke="rgba(99,102,241,0.2)" strokeDasharray="4 2" />
        <Line
          type="monotone"
          dataKey="moodScore"
          name="Mood"
          stroke="#ec4899"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#ec4899" }}
        />
        <Line
          type="monotone"
          dataKey="focusScore"
          name="Focus"
          stroke="#06b6d4"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#06b6d4" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
