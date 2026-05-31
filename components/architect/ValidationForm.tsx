"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

interface ValidationFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function ValidationForm({ onSubmit, isLoading }: ValidationFormProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    problemStatement: "",
    targetUsers: "Developers",
    teamSize: "Solo",
    timeline: "1 month",
    scalabilityGoal: "1K users",
    budget: "Low",
    architecture: "Monolith",
    methodology: "Agile/Scrum",
    proposedStack: {
      frontend: "",
      backend: "",
      database: "",
      cache: "",
      devops: "",
      auth: "",
      storage: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      proposedStack: {
        ...prev.proposedStack,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.description || !formData.problemStatement || !formData.proposedStack.frontend || !formData.proposedStack.database) {
      alert("Please fill in all required fields (Project Name, Description, Problem Statement, Frontend tech, and Database tech).");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
      {/* General Project Info Section */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="w-2 h-6 gradient-brand rounded-full inline-block"></span>
          1. General Project Information
        </h2>
        <div className="space-y-4">
          <div className="form-group">
            <label className="label" htmlFor="projectName">
              Project Name *
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              required
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., TaskSphere, DevMeet, AutoAnalytica"
              className="input"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label" htmlFor="problemStatement">
                What exact problem does this solve? *
              </label>
              <textarea
                id="problemStatement"
                name="problemStatement"
                required
                value={formData.problemStatement}
                onChange={handleChange}
                placeholder="Be specific. e.g., 'Freelance developers struggle to track and invoice time spent on context-switching across 5+ client codebases.'"
                className="input textarea h-24"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="description">
                Project Description / Pitch *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain what the app does. e.g., 'A lightweight local desktop dashboard that hooks into git repositories, automatically logs active coding sessions, and compiles downloadable client invoices.'"
                className="input textarea h-24"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="label" htmlFor="targetUsers">
                Target Users
              </label>
              <select
                id="targetUsers"
                name="targetUsers"
                value={formData.targetUsers}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="Consumers">Consumers (B2C)</option>
                <option value="Developers">Developers</option>
                <option value="Students / Learners">Students / Learners</option>
                <option value="SMEs / Startups">SMEs / Startups (B2B)</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="teamSize">
                Team Size
              </label>
              <select
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="Solo">Solo Developer</option>
                <option value="2-5">2 - 5 people</option>
                <option value="5-20">5 - 20 people</option>
                <option value="20+">20+ enterprise</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="timeline">
                Timeline Goal
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="1 week">1 week</option>
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months+">6 months+</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="scalabilityGoal">
                Scalability Goal
              </label>
              <select
                id="scalabilityGoal"
                name="scalabilityGoal"
                value={formData.scalabilityGoal}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="MVP only">MVP only (Static)</option>
                <option value="1K users">Moderate (~1K users)</option>
                <option value="1M users">High scalability (~1M users)</option>
                <option value="Enterprise-scale">Enterprise High-Availability</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label" htmlFor="budget">
                Budget Tier
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="Free / Open Source">Free / Open-Source Tier only</option>
                <option value="Low">Low (under $50/mo)</option>
                <option value="Medium">Medium ($50 - $500/mo)</option>
                <option value="Enterprise Scale">Enterprise / Venture Funded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Architecture Section */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="w-2 h-6 gradient-brand rounded-full inline-block"></span>
          2. Proposed Technical Architecture
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label" htmlFor="architecture">
                Architecture Pattern *
              </label>
              <select
                id="architecture"
                name="architecture"
                value={formData.architecture}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="Monolith">Modular Monolith (Single deployment, split modules)</option>
                <option value="Microservices">Microservices (Split services, API gateway)</option>
                <option value="Serverless">Serverless Architecture (Supabase / Firebase / Cloudflare Workers)</option>
                <option value="Event-Driven">Event-Driven Architecture (Message brokers, decoupled)</option>
                <option value="MVC">Traditional MVC (Django, Rails, Laravel)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="methodology">
                Development Methodology *
              </label>
              <select
                id="methodology"
                name="methodology"
                value={formData.methodology}
                onChange={handleChange}
                className="input select"
                disabled={isLoading}
              >
                <option value="Agile/Scrum">Agile / Scrum (Sprints, backlog)</option>
                <option value="Kanban">Kanban (Continuous flow, visual board)</option>
                <option value="Shape Up">Shape Up (Basecamp style, 6-week cycles)</option>
                <option value="Waterfall">Waterfall (Sequential development)</option>
                <option value="Lean / Fast MVP">Lean MVP (No formal process, build daily)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 my-4 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Proposed Technology Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="label" htmlFor="frontend">
                  Frontend *
                </label>
                <input
                  type="text"
                  id="frontend"
                  name="frontend"
                  required
                  value={formData.proposedStack.frontend}
                  onChange={handleStackChange}
                  placeholder="e.g., Next.js 15, React, Vue, HTML/CSS"
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="backend">
                  Backend (if separate)
                </label>
                <input
                  type="text"
                  id="backend"
                  name="backend"
                  value={formData.proposedStack.backend}
                  onChange={handleStackChange}
                  placeholder="e.g., Node.js, Django, Go, Express"
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="database">
                  Database *
                </label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  required
                  value={formData.proposedStack.database}
                  onChange={handleStackChange}
                  placeholder="e.g., PostgreSQL, SQLite, MongoDB"
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="cache">
                  Cache Store (optional)
                </label>
                <input
                  type="text"
                  id="cache"
                  name="cache"
                  value={formData.proposedStack.cache}
                  onChange={handleStackChange}
                  placeholder="e.g., Redis, Memcached"
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="auth">
                  Auth Provider (optional)
                </label>
                <input
                  type="text"
                  id="auth"
                  name="auth"
                  value={formData.proposedStack.auth}
                  onChange={handleStackChange}
                  placeholder="e.g., NextAuth, Clerk, Firebase Auth"
                  className="input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="storage">
                  File Storage (optional)
                </label>
                <input
                  type="text"
                  id="storage"
                  name="storage"
                  value={formData.proposedStack.storage}
                  onChange={handleStackChange}
                  placeholder="e.g., AWS S3, Supabase Storage, Local"
                  className="input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="label" htmlFor="devops">
                DevOps & Hosting (optional)
              </label>
              <input
                type="text"
                id="devops"
                name="devops"
                value={formData.proposedStack.devops}
                onChange={handleStackChange}
                placeholder="e.g., Vercel, Docker + Render, AWS ECS, VPS"
                className="input"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg font-bold min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Evaluating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Evaluate Project Proposal
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
