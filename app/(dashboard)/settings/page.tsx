"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { settingsSchema, changePasswordSchema, type SettingsInput, type ChangePasswordInput } from "@/lib/validations";
import { Save, Lock, Target } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        const json = await res.json();
        if (json.data) {
          reset({
            name: json.data.name,
            weeklyGoal: json.data.weeklyGoal,
            dailyGoal: json.data.dailyGoal,
          });
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [reset]);

  const onSaveSettings = async (data: SettingsInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordInput) => {
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to change password");
        return;
      }
      toast.success("Password updated!");
      resetPw();
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-2xl">
        {/* Goal Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Profile & Goals</h2>
              <p className="text-xs text-slate-400">Update your name and productivity targets</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-12 rounded-xl" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSaveSettings)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  id="settings-name"
                  {...register("name")}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Daily Study Goal
                    <span className="text-slate-400 font-normal ml-1">(hours)</span>
                  </label>
                  <input
                    id="settings-daily-goal"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    {...register("dailyGoal", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.dailyGoal && (
                    <p className="text-red-400 text-xs mt-1">{errors.dailyGoal.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Weekly Study Goal
                    <span className="text-slate-400 font-normal ml-1">(hours)</span>
                  </label>
                  <input
                    id="settings-weekly-goal"
                    type="number"
                    step="1"
                    min="1"
                    max="168"
                    {...register("weeklyGoal", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.weeklyGoal && (
                    <p className="text-red-400 text-xs mt-1">{errors.weeklyGoal.message}</p>
                  )}
                </div>
              </div>

              <button
                id="save-settings-btn"
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </form>
          )}
        </div>

        {/* Password change */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <Lock className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-slate-400">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleSubmitPw(onChangePassword)} className="space-y-4">
            {[
              { id: "current-password", name: "currentPassword" as const, label: "Current Password", autoComplete: "current-password" },
              { id: "new-password", name: "newPassword" as const, label: "New Password", autoComplete: "new-password" },
              { id: "confirm-password", name: "confirmPassword" as const, label: "Confirm New Password", autoComplete: "new-password" },
            ].map(({ id, name, label, autoComplete }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {label}
                </label>
                <input
                  id={id}
                  type="password"
                  autoComplete={autoComplete}
                  {...registerPw(name)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {pwErrors[name] && (
                  <p className="text-red-400 text-xs mt-1">{pwErrors[name]?.message}</p>
                )}
              </div>
            ))}

            <button
              id="change-password-btn"
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
