"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { OnboardingForm } from "@/components/coach/OnboardingForm";
import { ChevronLeft, Loader2, GraduationCap, Award, Compass, AlertCircle } from "lucide-react";

export default function CoachSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Consulting AI Senior Mentors...");

  const handleOnboard = async (formData: any) => {
    try {
      setLoading(true);
      
      // Beautiful loading message cycle
      const interval = setInterval(() => {
        const messages = [
          "Analyzing skill proficiencies...",
          "Mapping optimal learning dependencies...",
          "Aligning syllabus with career targets...",
          "Assembling week-by-week study sprints...",
          "Configuring project recommendation engine...",
        ];
        const random = messages[Math.floor(Math.random() * messages.length)];
        setStatusMessage(random);
      }, 3500);

      const res = await fetch("/api/coach/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      clearInterval(interval);

      if (res.ok) {
        router.push("/coach");
      } else {
        const json = await res.json();
        alert(json.error || "Failed to generate learning profile. Please try again.");
      }
    } catch (err) {
      console.error("Error setting up coach:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12 bg-slate-50 dark:bg-slate-950">
      <Header
        title="AI Learning Coach Onboarding"
        subtitle="Set up your path, rate your skills, and let our strict coach architect your developer journey."
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full space-y-6">
        <button
          onClick={() => router.push("/coach")}
          className="btn btn-secondary btn-sm flex items-center gap-1 font-bold animate-fade-in"
          disabled={loading}
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel Setup
        </button>

        {loading ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center space-y-6 min-h-[400px] animate-scale-in">
            <div className="relative">
              {/* Double ring loaders */}
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-violet-500/10 border-b-violet-500 animate-spin [animation-duration:1.5s]"></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Generating Personalized Roadmap</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 italic max-w-sm mx-auto">
                "{statusMessage}"
              </p>
            </div>

            <div className="max-w-md bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-950/40 text-left space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Coach's Promise
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                Your roadmap is mathematically generated based on your goal & skill gaps. Skip weeks you already know, study in priority order, and do NOT jump ahead. Follow the decision strictly.
              </p>
            </div>
          </div>
        ) : (
          <OnboardingForm onSubmit={handleOnboard} isLoading={loading} />
        )}
      </main>
    </div>
  );
}
