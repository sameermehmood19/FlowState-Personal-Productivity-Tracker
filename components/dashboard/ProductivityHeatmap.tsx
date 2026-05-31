"use client";

import { useMemo } from "react";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  count: number; // 0-4
  value: number;
}

interface ProductivityHeatmapProps {
  data: HeatmapDay[];
}

const LEVEL_COLORS = [
  "bg-slate-800 dark:bg-slate-800",
  "bg-indigo-900/70 dark:bg-indigo-900/70",
  "bg-indigo-700/80 dark:bg-indigo-700/80",
  "bg-indigo-500/90 dark:bg-indigo-500/90",
  "bg-indigo-400 dark:bg-indigo-400",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  const weeks = useMemo(() => {
    const today = startOfDay(new Date());
    const dataMap = new Map(data.map((d) => [d.date, d]));

    // Build 52 weeks of grid
    const totalDays = 364;
    const startDate = subDays(today, totalDays);

    // Find the Monday of the start week
    const startDayOfWeek = startDate.getDay(); // 0=Sun
    const offsetToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
    const gridStart = subDays(startDate, -offsetToMonday);

    const allWeeks: Array<Array<{ date: string; count: number; value: number } | null>> = [];
    let currentWeek: Array<{ date: string; count: number; value: number } | null> = [];

    for (let i = 0; i < 371; i++) {
      const d = subDays(gridStart, -i);
      if (d > today) {
        currentWeek.push(null);
      } else {
        const dateStr = format(d, "yyyy-MM-dd");
        const entry = dataMap.get(dateStr);
        currentWeek.push(entry ?? { date: dateStr, count: 0, value: 0 });
      }

      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) allWeeks.push(currentWeek);

    return allWeeks;
  }, [data]);

  const months = useMemo(() => {
    const today = startOfDay(new Date());
    const result: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, wi) => {
      const firstDay = week.find(Boolean);
      if (!firstDay) return;
      const d = parseISO(firstDay.date);
      const month = d.getMonth();
      if (month !== lastMonth) {
        result.push({ label: format(d, "MMM"), col: wi });
        lastMonth = month;
      }
    });

    return result;
  }, [weeks]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {months.map(({ label, col }) => (
            <div
              key={`${label}-${col}`}
              className="text-xs text-slate-400"
              style={{ position: "relative", left: `${col * 14}px`, marginRight: "0" }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="text-xs text-slate-500 h-[11px] flex items-center"
                style={{ display: i % 2 === 0 ? "flex" : "none" }}
              >
                {i % 2 === 0 ? day.slice(0, 1) : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) =>
                  day === null ? (
                    <div key={di} className="w-[11px] h-[11px]" />
                  ) : (
                    <div
                      key={di}
                      className={cn(
                        "w-[11px] h-[11px] rounded-[2px] transition-opacity hover:opacity-80 cursor-default",
                        LEVEL_COLORS[day.count] ?? LEVEL_COLORS[0]
                      )}
                      title={`${day.date}: ${day.value > 0 ? `Score ${day.value}` : "No log"}`}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 ml-8">
          <span className="text-xs text-slate-400">Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={cn("w-[11px] h-[11px] rounded-[2px]", color)} />
          ))}
          <span className="text-xs text-slate-400">More</span>
        </div>
      </div>
    </div>
  );
}
