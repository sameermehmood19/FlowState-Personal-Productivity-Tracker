import { generateJSON } from "@/lib/gemini";

export type CareerGoal =
  | "fullstack"
  | "ai_ml"
  | "backend"
  | "frontend"
  | "devops"
  | "mobile";

export interface SkillLevels {
  javascript: number; // 0-5
  python: number;
  react: number;
  nodejs: number;
  databases: number;
  git: number;
  docker: number;
  systemDesign: number;
  dsa: number;
}

export interface CoachInput {
  careerGoal: CareerGoal;
  skills: SkillLevels;
  weeklyHours: number;
  savedProjectIdeas?: string[]; // project names for cross-module recommendation
}

export interface CoachRoadmap {
  summary: string;
  criticalGaps: string[];
  learningOrder: Array<{
    order: number;
    topic: string;
    category: string;
    whyNow: string;
    weekTarget: number;
    estimatedHours: number;
    resources: string[];
    milestone: string;
  }>;
  thirtyDayPlan: {
    week1: { focus: string; dailyTasks: string[] };
    week2: { focus: string; dailyTasks: string[] };
    week3: { focus: string; dailyTasks: string[] };
    week4: { focus: string; dailyTasks: string[] };
  };
  sixtyDayPlan: string;
  ninetyDayPlan: string;
  projectRecommendation: {
    title: string;
    description: string;
    techStack: string[];
    whyThisFirst: string;
    estimatedDays: number;
  };
  strictWarnings: string[];
}

const CAREER_GOAL_LABELS: Record<CareerGoal, string> = {
  fullstack: "Full Stack Web Developer",
  ai_ml: "AI / ML Engineer",
  backend: "Backend Engineer",
  frontend: "Frontend Specialist",
  devops: "DevOps / Cloud Engineer",
  mobile: "Mobile Developer (React Native / Flutter)",
};

export async function generateCoachRoadmap(
  input: CoachInput,
  savedProjectIdeas?: string[]
): Promise<CoachRoadmap> {
  const skillsStr = Object.entries(input.skills)
    .map(([k, v]) => `  - ${k}: ${v}/5`)
    .join("\n");

  const projectStr =
    savedProjectIdeas && savedProjectIdeas.length > 0
      ? `\nSAVED PROJECT IDEAS (from Project Architect):\n${savedProjectIdeas.map((p) => `  - ${p}`).join("\n")}`
      : "";

  const prompt = `You are an expert software engineering mentor who has coached hundreds of developers into their first jobs at companies like Google, Amazon, and successful startups. You create strict, personalized learning roadmaps.

You are STRICT: you do NOT give options or confusion. You tell the developer EXACTLY what to learn, in EXACTLY what order, and WHY. You are like a firm but caring coach who knows what works.

Developer Profile:
CAREER GOAL: ${CAREER_GOAL_LABELS[input.careerGoal]}
AVAILABLE TIME: ${input.weeklyHours} hours per week

CURRENT SKILL LEVELS (0=none, 5=expert):
${skillsStr}
${projectStr}

Your job:
1. Identify the CRITICAL gaps blocking them from their goal
2. Create a strict priority order — later topics MUST depend on earlier ones
3. Give a concrete 30/60/90 day plan based on their available hours
4. Recommend ONE specific project to build first (that matches their current level and teaches the most)
5. Give strict warnings about common mistakes developers make at this stage
6. If they have saved project ideas, pick the best one for them to build first

Remember: the goal is to get them job-ready in the shortest time. Be ruthless about priority. They should NOT be learning Docker before they have solid fundamentals.

Respond with ONLY valid JSON matching this exact schema:
{
  "summary": "string (2-3 honest sentences about their current situation and path ahead)",
  "criticalGaps": ["string (skills they must acquire before anything else)"],
  "learningOrder": [
    {
      "order": number,
      "topic": "string",
      "category": "string (e.g., 'Programming Fundamentals', 'Frontend', 'Backend', 'DevOps', 'AI/ML')",
      "whyNow": "string (why this comes before the next topic — be specific)",
      "weekTarget": number (which week they should complete this by),
      "estimatedHours": number (total hours to complete),
      "resources": ["string (specific book, course, or doc — be specific, e.g., 'javascript.info', 'The Odin Project')"],
      "milestone": "string (what they should be able to DO when they finish this topic)"
    }
  ],
  "thirtyDayPlan": {
    "week1": { "focus": "string", "dailyTasks": ["string"] },
    "week2": { "focus": "string", "dailyTasks": ["string"] },
    "week3": { "focus": "string", "dailyTasks": ["string"] },
    "week4": { "focus": "string", "dailyTasks": ["string"] }
  },
  "sixtyDayPlan": "string (paragraph describing weeks 5-8)",
  "ninetyDayPlan": "string (paragraph describing weeks 9-12)",
  "projectRecommendation": {
    "title": "string",
    "description": "string (what to build and why)",
    "techStack": ["string"],
    "whyThisFirst": "string (why this specific project at their level)",
    "estimatedDays": number
  },
  "strictWarnings": ["string (common mistakes to avoid — be direct and specific)"]
}`;

  return await generateJSON<CoachRoadmap>(prompt);
}
