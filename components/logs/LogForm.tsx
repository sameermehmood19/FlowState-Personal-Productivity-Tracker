"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Save, X, Dumbbell } from "lucide-react";
import { dailyLogSchema, type DailyLogInput } from "@/lib/validations";
import type { DailyLog } from "@/types";
import { cn } from "@/lib/utils";

interface LogFormProps {
  log?: DailyLog;
  onSuccess: () => void;
  onCancel: () => void;
}

function ScoreSlider({
  label,
  id,
  value,
  onChange,
  error,
}: {
  label: string;
  id: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  const colors = [
    "",
    "text-red-500",
    "text-red-400",
    "text-orange-500",
    "text-orange-400",
    "text-amber-500",
    "text-yellow-500",
    "text-lime-500",
    "text-green-500",
    "text-emerald-500",
    "text-emerald-400",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className={cn("text-lg font-bold", colors[value] ?? "text-indigo-500")}>
          {value}/10
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Very Low</span>
        <span>Excellent</span>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function LogForm({ log, onSuccess, onCancel }: LogFormProps) {
  const isEditing = !!log;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DailyLogInput>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: {
      date: log
        ? format(new Date(log.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      studyHours: log?.studyHours ?? 4,
      moodScore: log?.moodScore ?? 5,
      focusScore: log?.focusScore ?? 5,
      sleepHours: log?.sleepHours ?? 7,
      exerciseCompleted: log?.exerciseCompleted ?? false,
      distractionHours: log?.distractionHours ?? 1,
      notes: log?.notes ?? "",
    },
  });

  const mood = watch("moodScore");
  const focus = watch("focusScore");
  const exercise = watch("exerciseCompleted");

  const onSubmit = async (data: DailyLogInput) => {
    try {
      const url = isEditing ? `/api/logs/${log.id}` : "/api/logs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to save log");
        return;
      }

      toast.success(isEditing ? "Log updated!" : "Log added!");
      onSuccess();
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Date */}
      <div>
        <label htmlFor="log-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Date
        </label>
        <input
          id="log-date"
          type="date"
          {...register("date")}
          max={format(new Date(), "yyyy-MM-dd")}
          className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {errors.date && (
          <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Study + Sleep + Distraction hours */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="study-hours" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Study Hours
          </label>
          <input
            id="study-hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            {...register("studyHours", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {errors.studyHours && (
            <p className="text-red-400 text-xs mt-1">{errors.studyHours.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="sleep-hours" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Sleep Hours
          </label>
          <input
            id="sleep-hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            {...register("sleepHours", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {errors.sleepHours && (
            <p className="text-red-400 text-xs mt-1">{errors.sleepHours.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="distraction-hours" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Distraction Hrs
          </label>
          <input
            id="distraction-hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            {...register("distractionHours", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {errors.distractionHours && (
            <p className="text-red-400 text-xs mt-1">{errors.distractionHours.message}</p>
          )}
        </div>
      </div>

      {/* Mood & Focus sliders */}
      <ScoreSlider
        label="Mood Score"
        id="mood-score"
        value={mood}
        onChange={(v) => setValue("moodScore", v)}
        error={errors.moodScore?.message}
      />

      <ScoreSlider
        label="Focus Score"
        id="focus-score"
        value={focus}
        onChange={(v) => setValue("focusScore", v)}
        error={errors.focusScore?.message}
      />

      {/* Exercise toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            exercise ? "gradient-success shadow-md" : "bg-slate-200 dark:bg-slate-700"
          )}>
            <Dumbbell className={cn("w-4.5 h-4.5", exercise ? "text-white" : "text-slate-400")} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Exercise</p>
            <p className="text-xs text-slate-400">Did you exercise today?</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="exercise-toggle"
            {...register("exerciseCompleted")}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="How did today go? Any highlights or challenges..."
          {...register("notes")}
          className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
        />
        {errors.notes && (
          <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          id="log-save-btn"
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white gradient-brand rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? "Update" : "Save Log"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
