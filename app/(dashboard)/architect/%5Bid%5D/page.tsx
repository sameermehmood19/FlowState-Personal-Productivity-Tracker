"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FeedbackReport } from "@/components/architect/FeedbackReport";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";

export default function ArchitectProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/architect/projects/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setProject(json.data);
      } else {
        setError(json.error || "Failed to load project details.");
      }
    } catch (err) {
      console.error("Error fetching project detail:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12 bg-slate-50 dark:bg-slate-950">
      <Header
        title={project?.projectName || "Blueprint Details"}
        subtitle={project ? `Evaluated on ${new Date(project.createdAt).toLocaleDateString()}` : "Loading architectural blueprint review..."}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full space-y-6">
        <button
          onClick={() => router.push("/architect")}
          className="btn btn-secondary btn-sm flex items-center gap-1 font-bold animate-fade-in"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Architect
        </button>

        {loading ? (
          <div className="space-y-6 pt-4">
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 skeleton rounded-xl flex-shrink-0"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-5 skeleton w-1/3"></div>
                <div className="h-3.5 skeleton w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="card p-4 h-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 skeleton rounded-full mb-2"></div>
                  <div className="h-3 skeleton w-16"></div>
                </div>
              ))}
            </div>
            <div className="card p-6 h-48 skeleton"></div>
          </div>
        ) : error ? (
          <div className="card p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Error Loading Project</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              {error}
            </p>
            <button
              onClick={fetchProjectDetail}
              className="btn btn-secondary flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : project ? (
          <FeedbackReport
            feedback={project.aiFeedback}
            projectName={project.projectName}
          />
        ) : null}
      </main>
    </div>
  );
}
