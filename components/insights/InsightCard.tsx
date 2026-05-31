import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, Zap, X, Sparkles } from "lucide-react";
import type { Insight } from "@/types";

interface InsightCardProps {
  insight: Insight;
  onMarkRead?: (id: string) => void;
  compact?: boolean;
}

const TYPE_CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-500",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  positive: {
    icon: CheckCircle,
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    label: "Positive",
  },
  neutral: {
    icon: Info,
    bg: "bg-slate-500/5 dark:bg-slate-500/10 border-slate-500/20",
    iconColor: "text-slate-400",
    badge: "bg-slate-500/15 text-slate-500 dark:text-slate-400",
    label: "Info",
  },
  motivation: {
    icon: Zap,
    bg: "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-500",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    label: "Motivation",
  },
};

export function InsightCard({ insight, onMarkRead, compact = false }: InsightCardProps) {
  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.neutral;
  const Icon = config.icon;
  const isAI = insight.message.startsWith("[AI]");
  const displayMessage = isAI ? insight.message.replace(/^\[AI\]\s*/, "") : insight.message;

  return (
    <div
      className={cn(
        "border rounded-xl transition-all",
        config.bg,
        compact ? "p-3" : "p-4",
        insight.read ? "opacity-60" : ""
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", config.iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", config.badge)}>
              {config.label}
            </span>
            <span className="text-xs text-slate-400 capitalize">{insight.category}</span>
            {isAI && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            )}
            {!compact && (
              <span className="text-xs text-slate-400 ml-auto">
                {formatDate(insight.date)}
              </span>
            )}
          </div>
          <p className={cn("text-slate-700 dark:text-slate-300", compact ? "text-xs" : "text-sm")}>
            {displayMessage}
          </p>
        </div>
        {!insight.read && onMarkRead && (
          <button
            onClick={() => onMarkRead(insight.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-black/5"
            title="Mark as read"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
