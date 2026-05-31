"use client";

import React, { useState } from "react";
import { SkillSlider } from "./SkillSlider";
import { 
  Monitor, 
  Cpu, 
  Database, 
  Cloud, 
  Smartphone, 
  Code, 
  Sparkles, 
  Loader2, 
  Clock, 
  ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const CAREER_GOALS = [
  {
    id: "fullstack",
    title: "Full Stack Web Developer",
    desc: "Build modern web apps from frontend UI to database backend.",
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: "ai_ml",
    title: "AI / ML Engineer",
    desc: "Integrate LLMs, build data pipelines, train models in Python.",
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    id: "backend",
    title: "Backend Engineer",
    desc: "Architect APIs, databases, microservices, and system scaling.",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: "frontend",
    title: "Frontend Specialist",
    desc: "Master layout, styling, responsiveness, animations, and speed.",
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: "devops",
    title: "DevOps / Cloud Engineer",
    desc: "Automate builds, manage servers, Docker containers, and CI/CD.",
    icon: <Cloud className="w-5 h-5" />,
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    desc: "Build cross-platform mobile apps for iOS and Android.",
    icon: <Smartphone className="w-5 h-5" />,
  },
] as const;

export function OnboardingForm({ onSubmit, isLoading }: OnboardingFormProps) {
  const [careerGoal, setCareerGoal] = useState<typeof CAREER_GOALS[number]["id"]>("fullstack");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [skills, setSkills] = useState({
    javascript: 1,
    python: 0,
    react: 1,
    nodejs: 0,
    databases: 0,
    git: 1,
    docker: 0,
    systemDesign: 0,
    dsa: 0,
  });

  const handleSkillChange = (name: string, value: number) => {
    setSkills((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      careerGoal,
      weeklyHours,
      skills,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
      {/* 1. Goal Selection */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="w-2 h-6 gradient-brand rounded-full inline-block"></span>
          1. Choose Your Career Destination
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 -mt-3">
          Your AI coach will tailor the entire learning speed, stack, and project roadmap to this specific goal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAREER_GOALS.map((goal) => (
            <div
              key={goal.id}
              onClick={() => !isLoading && setCareerGoal(goal.id)}
              className={cn(
                "card card-interactive p-4 flex gap-3.5 items-start border-2",
                careerGoal === goal.id
                  ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/[0.02]"
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl flex-shrink-0 shadow-sm",
                careerGoal === goal.id 
                  ? "bg-indigo-500 text-white shadow-indigo-500/20" 
                  : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500"
              )}>
                {goal.icon}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{goal.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{goal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Skill Levels */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="w-2 h-6 gradient-brand rounded-full inline-block"></span>
          2. Rate Your Current Tech Skills
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 -mt-3">
          Answer honestly. The coach will use this to figure out where you have knowledge gaps and bypass lessons you already know.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkillSlider
            label="JavaScript / TypeScript"
            name="javascript"
            value={skills.javascript}
            onChange={handleSkillChange}
            description="Core language, arrays, async, promises, TypeScript syntax."
            disabled={isLoading}
          />
          <SkillSlider
            label="Python"
            name="python"
            value={skills.python}
            onChange={handleSkillChange}
            description="Data types, OOP, libraries, fast API scripting."
            disabled={isLoading}
          />
          <SkillSlider
            label="React / Next.js"
            name="react"
            value={skills.react}
            onChange={handleSkillChange}
            description="Components, hooks, virtual DOM, routing, SSR rendering."
            disabled={isLoading}
          />
          <SkillSlider
            label="Node.js / Express"
            name="nodejs"
            value={skills.nodejs}
            onChange={handleSkillChange}
            description="Event loop, middleware, file system, server creation."
            disabled={isLoading}
          />
          <SkillSlider
            label="Databases (SQL / NoSQL)"
            name="databases"
            value={skills.databases}
            onChange={handleSkillChange}
            description="Queries, relations, keys, normalization, index structures."
            disabled={isLoading}
          />
          <SkillSlider
            label="Git / Github"
            name="git"
            value={skills.git}
            onChange={handleSkillChange}
            description="Branching, merging, PR review workflows, merge conflicts."
            disabled={isLoading}
          />
          <SkillSlider
            label="Docker / DevOps basics"
            name="docker"
            value={skills.docker}
            onChange={handleSkillChange}
            description="Containers, images, ports, simple cloud deployments."
            disabled={isLoading}
          />
          <SkillSlider
            label="System Design"
            name="systemDesign"
            value={skills.systemDesign}
            onChange={handleSkillChange}
            description="Caching, CDN, horizontal scaling, load balancing, DNS."
            disabled={isLoading}
          />
          <SkillSlider
            label="Data Structures & Algorithms"
            name="dsa"
            value={skills.dsa}
            onChange={handleSkillChange}
            description="Arrays, hash maps, binary trees, recursion, sorting."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 3. Availability */}
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="w-2 h-6 gradient-brand rounded-full inline-block"></span>
          3. Study Dedication
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <label className="label flex items-center gap-1.5" htmlFor="weeklyHours">
              <Clock className="w-4 h-4 text-indigo-500" />
              How many hours can you commit to studying per week?
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              The AI Coach uses this to distribute study target weeks mathematically.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => !isLoading && setWeeklyHours(Math.max(5, weeklyHours - 5))}
              className="btn btn-secondary btn-icon"
              disabled={isLoading || weeklyHours <= 5}
            >
              -
            </button>
            <span className="text-base font-black text-slate-800 dark:text-white min-w-[100px] text-center">
              {weeklyHours} hrs/wk
            </span>
            <button
              type="button"
              onClick={() => !isLoading && setWeeklyHours(Math.min(80, weeklyHours + 5))}
              className="btn btn-secondary btn-icon"
              disabled={isLoading || weeklyHours >= 80}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg font-bold min-w-[220px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Build My Learning Path
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
