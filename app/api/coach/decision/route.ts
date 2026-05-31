import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/gemini";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current learning profile
    const profile = await prisma.learningProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Learning profile not found. Please complete setup first." }, { status: 404 });
    }

    // Get user's validated projects
    const projects = await prisma.projectValidation.findMany({
      where: { userId: session.user.id },
    });

    if (projects.length === 0) {
      return NextResponse.json({ error: "No validated projects found in Project Architect." }, { status: 400 });
    }

    const currentSkills = JSON.parse(profile.currentLevel);
    const projectsListStr = projects.map(p => `
PROJECT NAME: ${p.projectName}
DESCRIPTION: ${p.description}
PROPOSED STACK: ${p.proposedStack}
VERDICT: ${p.verdict}
OVERALL SCORE: ${p.overallScore}
`).join("\n");

    const prompt = `You are a strict, world-class engineering mentor. Analyze this developer's profile and their list of validated project ideas. Decide EXACTLY which project they should build FIRST to maximize their learning, align with their career goal, and match their current capabilities.

CAREER GOAL: ${profile.careerGoal}
SKILLS (0-5): ${JSON.stringify(currentSkills)}

SAVED PROJECT BLUEPRINTS:
${projectsListStr}

Your job:
1. Compare all projects.
2. Select the absolute best one for them to build FIRST. Explain why it beats the others (be direct, e.g. "Project X is too advanced for your Node skills, start with Project Y because it builds database fundamentals").
3. Estimate realistic development time.

Respond with ONLY valid JSON:
{
  "title": "string (the name of the project chosen)",
  "description": "string (brief overview of what they will build)",
  "techStack": ["string (technologies needed)"],
  "whyThisFirst": "string (strict mentoring rationale on why this one comes first, comparing it to other ideas)",
  "estimatedDays": number
}`;

    const decision = await generateJSON<any>(prompt);
    return NextResponse.json({ data: decision });
  } catch (error: any) {
    console.error("[Decision Engine API Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
