"use client";

import React from "react";

interface SkillSliderProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  description: string;
  disabled?: boolean;
}

const LEVEL_LABELS = [
  "No experience / absolute beginner",
  "Novice (followed basic tutorial)",
  "Beginner (written simple scripts)",
  "Competent (built small solo apps)",
  "Proficient (architect, test, clean code)",
  "Expert (production-scale architect)",
];

export function SkillSlider({
  label,
  name,
  value,
  onChange,
  description,
  disabled = false,
}: SkillSliderProps) {
  return (
    <div className="form-group bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
        <span className="text-base font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded min-w-[36px] text-center">
          {value}/5
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(name, parseInt(e.target.value))}
        className="skill-slider mt-3 mb-2"
        disabled={disabled}
      />

      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block italic">
        Level {value}: {LEVEL_LABELS[value]}
      </span>
    </div>
  );
}
