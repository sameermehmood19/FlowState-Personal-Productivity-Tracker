import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const dailyLogSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  studyHours: z
    .number()
    .min(0, "Must be 0 or more")
    .max(24, "Cannot exceed 24 hours"),
  moodScore: z
    .number()
    .int()
    .min(1, "Mood score must be 1–10")
    .max(10, "Mood score must be 1–10"),
  focusScore: z
    .number()
    .int()
    .min(1, "Focus score must be 1–10")
    .max(10, "Focus score must be 1–10"),
  sleepHours: z
    .number()
    .min(0, "Must be 0 or more")
    .max(24, "Cannot exceed 24 hours"),
  exerciseCompleted: z.boolean(),
  distractionHours: z
    .number()
    .min(0, "Must be 0 or more")
    .max(24, "Cannot exceed 24 hours"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const settingsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  weeklyGoal: z
    .number()
    .min(1, "Must be at least 1 hour")
    .max(168, "Cannot exceed 168 hours/week"),
  dailyGoal: z
    .number()
    .min(0.5, "Must be at least 0.5 hours")
    .max(24, "Cannot exceed 24 hours"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const logFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minMood: z.number().int().min(1).max(10).optional(),
  maxMood: z.number().int().min(1).max(10).optional(),
  minFocus: z.number().int().min(1).max(10).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LogFilterInput = z.infer<typeof logFilterSchema>;
