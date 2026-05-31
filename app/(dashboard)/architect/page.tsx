"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ValidationForm } from "@/components/architect/ValidationForm";
import { ProjectHistoryCard } from "@/components/architect/ProjectHistoryCard";
import { FeedbackReport } from "@/components/architect/FeedbackReport";
import { Plus, ChevronLeft, Layers, History, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArchitectPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "validate">("history");
  const [currentReport, setCurrentReport] = useState<any | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/architect/projects");
      const json = await res.json();
      if (json.data) {
        setProjects(json.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (formData: any) => {
    try {
      setValidating(true);
      const res = await fetch("/api/architect/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setCurrentReport(json.data);
        setActiveTab("history"); // Switch view
        fetchProjects(); // Reload list
      } else {
        alert(json.error || "Failed to evaluate project. Please try again.");
      }
    } catch (err) {
      console.error("Error validating project:", err);
      alert("An unexpected error occurred.");
    } finally {
      setValidating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project evaluation?")) return;

    try {
      const res = await fetch(`/api/architect/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (currentReport?.id === id) {
          setCurrentReport(null);
        }
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Project Architect"
        subtitle="Submit your project stack and architecture. Our virtual AI CTO will review your blueprint."
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("history");
                setCurrentReport(null); // Clear selected single view to show history list
              }}
              className={cn(
                "pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5",
                activeTab === "history" && !currentReport
                  ? "border-indigo-500 text-slate-800 dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <History className="w-4 h-4" />
              Blueprints History
            </button>
            <button
              onClick={() => {
                setActiveTab("validate");
                setCurrentReport(null);
              }}
              className={cn(
                "pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5",
                activeTab === "validate"
                  ? "border-indigo-500 text-slate-800 dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <Plus className="w-4 h-4" />
              New Architecture Blueprint
            </button>
          </div>
        </div>

        {/* Content Body */}
        {currentReport ? (
          <div className="space-y-4 animate-scale-in">
            <button
              onClick={() => setCurrentReport(null)}
              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to History
            </button>
            <FeedbackReport
              feedback={currentReport.aiFeedback}
              projectName={currentReport.projectName}
            />
          </div>
        ) : activeTab === "history" ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="card p-5 h-48 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-5 skeleton w-2/3"></div>
                    <div className="h-3 skeleton w-1/3"></div>
                    <div className="h-10 skeleton w-full"></div>
                  </div>
                  <div className="h-8 skeleton w-24 self-end"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No architectural reviews yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Evaluate your first software architecture proposal against modern senior-CTO principles.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("validate")}
                className="btn btn-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Review Your First Blueprint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-fade-in">
              {projects.map((project) => (
                <ProjectHistoryCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          <div className="max-w-4xl mx-auto">
            <ValidationForm onSubmit={handleValidate} isLoading={validating} />
          </div>
        )}
      </main>
    </div>
  );
}
