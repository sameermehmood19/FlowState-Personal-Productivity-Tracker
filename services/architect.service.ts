import { generateJSON } from "@/lib/gemini";

export interface ProjectInput {
  projectName: string;
  description: string;
  problemStatement: string;
  targetUsers: string;
  teamSize: string;
  timeline: string;
  scalabilityGoal: string;
  budget: string;
  architecture: string;
  methodology: string;
  proposedStack: {
    frontend: string;
    backend: string;
    database: string;
    cache?: string;
    devops?: string;
    auth?: string;
    storage?: string;
  };
}

export interface ProjectFeedback {
  verdict: "approved" | "revision" | "rejected";
  overallScore: number;
  scores: {
    problemClarity: number;
    techStackFit: number;
    architectureAppropriateness: number;
    methodologyFit: number;
    scalabilityReadiness: number;
  };
  summary: string;
  techStackAnalysis: {
    rating: number;
    verdict: string;
    analysis: string;
    recommendations: string[];
    whyNotYours: string;
  };
  architectureReview: {
    rating: number;
    verdict: string;
    analysis: string;
    recommendations: string[];
    whyNotYours: string;
  };
  methodologyCritique: {
    rating: number;
    verdict: string;
    analysis: string;
    recommendations: string[];
  };
  whatCompaniesActuallyDo: {
    examples: Array<{
      company: string;
      approach: string;
      lesson: string;
    }>;
  };
  recommendedStack: {
    frontend: string;
    backend: string;
    database: string;
    cache: string;
    devops: string;
    auth: string;
    reasoning: string;
  };
  learningGaps: Array<{
    topic: string;
    importance: "critical" | "important" | "nice-to-have";
    resource: string;
  }>;
  first30DaysRoadmap: Array<{
    week: number;
    focus: string;
    tasks: string[];
  }>;
}

export async function validateProject(input: ProjectInput): Promise<ProjectFeedback> {
  const stackStr = Object.entries(input.proposedStack)
    .filter(([, v]) => v)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join("\n");

  const prompt = `You are a senior software architect and CTO with 15+ years of experience at companies like Google, Uber, Netflix, and various startups. You review project proposals with the rigor of a technical interview. You are honest, direct, and educational — you explain WHY certain choices are wrong, not just that they are wrong.

A developer has submitted the following project proposal for review:

PROJECT NAME: ${input.projectName}
DESCRIPTION: ${input.description}
PROBLEM STATEMENT: ${input.problemStatement}
TARGET USERS: ${input.targetUsers}

PROPOSED TECH STACK:
${stackStr}

ARCHITECTURE PATTERN: ${input.architecture}
DEVELOPMENT METHODOLOGY: ${input.methodology}
TEAM SIZE: ${input.teamSize}
SCALABILITY GOAL: ${input.scalabilityGoal}
TIMELINE: ${input.timeline}
BUDGET: ${input.budget}

Your job:
1. Evaluate whether the tech stack, architecture, and methodology are appropriate for this project's scale, team, timeline, and budget
2. Identify mismatches (e.g., microservices for a solo dev MVP, MongoDB for highly relational data)
3. Provide the verdict: "approved" if solid, "revision" if fixable issues exist, "rejected" if fundamentally flawed
4. Give detailed, educational explanations — not just what's wrong, but WHY, with real-world context
5. Tell them what companies like Airbnb, Stripe, Notion actually used at similar stages

Score each dimension 0-10. Overall score = weighted average. Verdict:
- approved: overallScore >= 7.5 and no critical issues
- revision: overallScore 5-7.4 or fixable issues
- rejected: overallScore < 5 or fundamental mismatch

Respond with ONLY valid JSON matching this exact schema:
{
  "verdict": "approved" | "revision" | "rejected",
  "overallScore": number,
  "scores": {
    "problemClarity": number,
    "techStackFit": number,
    "architectureAppropriateness": number,
    "methodologyFit": number,
    "scalabilityReadiness": number
  },
  "summary": "string (2-3 sentences, honest executive summary)",
  "techStackAnalysis": {
    "rating": number,
    "verdict": "string",
    "analysis": "string (detailed, educational)",
    "recommendations": ["string"],
    "whyNotYours": "string (explain why their choice may be suboptimal)"
  },
  "architectureReview": {
    "rating": number,
    "verdict": "string",
    "analysis": "string",
    "recommendations": ["string"],
    "whyNotYours": "string"
  },
  "methodologyCritique": {
    "rating": number,
    "verdict": "string",
    "analysis": "string",
    "recommendations": ["string"]
  },
  "whatCompaniesActuallyDo": {
    "examples": [
      {
        "company": "string",
        "approach": "string",
        "lesson": "string (what this developer can learn from this)"
      }
    ]
  },
  "recommendedStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "cache": "string",
    "devops": "string",
    "auth": "string",
    "reasoning": "string (why this exact stack for this exact project)"
  },
  "learningGaps": [
    {
      "topic": "string",
      "importance": "critical" | "important" | "nice-to-have",
      "resource": "string"
    }
  ],
  "first30DaysRoadmap": [
    {
      "week": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}`;

  const feedback = await generateJSON<ProjectFeedback>(prompt);
  return feedback;
}
