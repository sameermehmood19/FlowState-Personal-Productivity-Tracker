import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  gradient?: "brand" | "success" | "warning" | "danger";
  delta?: {
    value: number;
    label: string;
    isGood?: boolean; // if undefined, positive = good
  };
  className?: string;
}

const GRADIENTS = {
  brand: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20",
  success: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  warning: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  danger: "from-red-500/10 to-pink-500/10 border-red-500/20",
};

const ICON_GRADIENTS = {
  brand: "gradient-brand",
  success: "gradient-success",
  warning: "gradient-warning",
  danger: "gradient-danger",
};

export function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  gradient = "brand",
  delta,
  className,
}: StatsCardProps) {
  const isPositiveDelta = delta ? delta.value > 0 : null;
  const isGoodChange =
    delta?.isGood !== undefined ? delta.isGood : isPositiveDelta;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border rounded-2xl p-5 card-hover",
        `bg-gradient-to-br ${GRADIENTS[gradient]}`,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {unit}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
            ICON_GRADIENTS[gradient]
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {delta && (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              isGoodChange
                ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                : delta.value === 0
                ? "text-slate-500 bg-slate-500/10"
                : "text-red-500 bg-red-500/10 dark:text-red-400"
            )}
          >
            {delta.value > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : delta.value < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(delta.value)}%
          </div>
          <span className="text-xs text-slate-400">{delta.label}</span>
        </div>
      )}
    </div>
  );
}
