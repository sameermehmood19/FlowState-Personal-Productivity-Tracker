"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { RoadmapView } from "@/components/coach/RoadmapView";
import { Loader2, RefreshCw, Sparkles, GraduationCap } from "lucide-react";

export default function CoachPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProjects, setHasProjects] = useState(false);
  const [decision, setDecision] = useState<any | null>(null);

  useEffect(() => {
    fetchProfileAndProjects();
  }, []);

  const fetchProfileAndProjects = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const profRes = await fetch("/api/coach/profile");
      const profJson = await profRes.json();

      if (profRes.ok && profJson.data) {
        setProfile(profJson.data);
        // If there's an existing project recommendation in the roadmap, set it as default decision
        if (profJson.data.roadmap?.projectRecommendation) {
          setDecision(profJson.data.roadmap.projectRecommendation);
        }
      } else {
        // Not setup yet, redirect
        router.push("/coach/setup");
        return;
      }

      // Fetch projects to see if they have validations
      const projRes = await fetch("/api/architect/projects");
      const projJson = await projRes.json();
      if (projRes.ok && projJson.data) {
        setHasProjects(projJson.data.length > 0);
      }
    } catch (err) {
      console.error("Error fetching coach dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicStatusChange = async (topicId: string, status: "pending" | "in_progress" | "completed") => {
    try {
      const res = await fetch(`/api/coach/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Update local status of the modified topic
        setProfile((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            topics: prev.topics.map((t: any) => 
              t.id === topicId ? { ...t, status } : t
            ),
          };
        });
      }
    } catch (err) {
      console.error("Error updating topic status:", err);
    }
  };

  const handleReevaluateDecision = async () => {
    try {
      const res = await fetch("/api/coach/decision", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.data) {
        setDecision(json.data);
      } else {
        alert(json.error || "Failed to analyze project blueprints.");
      }
    } catch (err) {
      console.error("Error evaluating project decision:", err);
      alert("An error occurred during evaluation.");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Learning Coach"
        subtitle="Your personalized structured learning coach. Stop guessing what to study next — execute."
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="space-y-6 pt-4">
            <div className="card p-6 h-40 skeleton"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 h-32 skeleton"></div>
              <div className="card p-5 h-32 skeleton"></div>
            </div>
            <div className="card p-6 h-96 skeleton"></div>
          </div>
        ) : profile ? (
          <RoadmapView
            roadmap={profile.roadmap}
            topics={profile.topics}
            onStatusChange={handleTopicStatusChange}
            decision={decision}
            onReevaluateDecision={handleReevaluateDecision}
            hasProjects={hasProjects}
            onResetOnboarding={() => router.push("/coach/setup")}
          />
        ) : (
          <div className="card p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Initialize Learning Coach</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Set up your personalized career goal and skills profile to generate your structured learning path.
              </p>
            </div>
            <button
              onClick={() => router.push("/coach/setup")}
              className="btn btn-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Configure AI Coach Setup
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
