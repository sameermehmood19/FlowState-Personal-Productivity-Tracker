"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
  Flame,
  Activity,
  BookOpen,
  Layers,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SmartAlert {
  id: string;
  type: "error" | "warning" | "info" | "success";
  category: "Burnout" | "Consistency" | "Progress" | "Streak" | "Blueprint" | "Rest";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Burnout: Activity,
  Consistency: Clock,
  Progress: BookOpen,
  Streak: Flame,
  Blueprint: Layers,
  Rest: Clock,
};

const TYPE_CONFIG = {
  error: {
    icon: XCircle,
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-500/20",
    iconColor: "text-rose-500",
    title: "text-rose-700 dark:text-rose-400",
    text: "text-rose-600/90 dark:text-rose-400/80",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
    action: "text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-500/20",
    iconColor: "text-amber-500",
    title: "text-amber-700 dark:text-amber-400",
    text: "text-amber-600/90 dark:text-amber-400/80",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    action: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
  },
  info: {
    icon: Info,
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-500",
    title: "text-indigo-700 dark:text-indigo-400",
    text: "text-indigo-600/90 dark:text-indigo-400/80",
    badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    action: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    title: "text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-600/90 dark:text-emerald-400/80",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    action: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
  },
};

function AlertBanner({ alert, onDismiss }: { alert: SmartAlert; onDismiss: (id: string) => void }) {
  const config = TYPE_CONFIG[alert.type];
  const TypeIcon = config.icon;
  const CategoryIcon = CATEGORY_ICONS[alert.category] ?? Info;

  return (
    <div
      className={cn(
        "relative rounded-xl border px-4 py-3 flex items-start gap-3 transition-all duration-300 animate-slide-up",
        config.bg,
        config.border
      )}
    >
      <TypeIcon className={cn("w-4.5 h-4.5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className={cn("text-xs font-black", config.title)}>{alert.title}</span>
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", config.badge)}>
            <CategoryIcon className="w-2.5 h-2.5" />
            {alert.category}
          </span>
        </div>
        <p className={cn("text-xs leading-relaxed", config.text)}>{alert.message}</p>
        {alert.actionLabel && alert.actionHref && (
          <Link
            href={alert.actionHref}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-bold mt-1.5 transition-colors",
              config.action
            )}
          >
            {alert.actionLabel}
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SmartAlertBanner() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/ai/alerts");
        const json = await res.json();
        if (res.ok && json.data) {
          setAlerts(json.data);
        }
      } catch {
        // Silently fail — alerts are non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (loading || visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      {visibleAlerts.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
