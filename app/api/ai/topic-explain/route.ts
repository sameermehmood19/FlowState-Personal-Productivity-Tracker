import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/gemini";

interface TopicExplanation {
  overview: string; // 2-3 sentence plain-English overview
  whyItMatters: string; // career relevance
  keyConceptsToMaster: Array<{
    concept: string;
    description: string;
  }>;
  studyPlan: Array<{
    day: number;
    task: string;
    duration: string;
  }>;
  commonMistakes: string[];
  resources: Array<{
    name: string;
    type: "course" | "book" | "docs" | "practice" | "video";
    url?: string;
    why: string;
  }>;
  milestoneTest: string; // how to know you've truly mastered it
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topicId } = body as { topicId: string };

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    // Fetch topic with parent profile for context
    const topic = await prisma.learningTopic.findUnique({
      where: { id: topicId },
      include: { profile: { select: { userId: true, careerGoal: true, weeklyHours: true } } },
    });

    if (!topic || topic.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const resources = JSON.parse(topic.resources || "[]");
    const resourcesStr =
      resources.length > 0
        ? `Existing resource recommendations: ${resources.join(", ")}`
        : "";

    const prompt = `You are a world-class software engineering mentor. A developer is studying the following topic as part of their learning roadmap.

TOPIC: ${topic.title}
CATEGORY: ${topic.category}
CAREER GOAL: ${topic.profile.careerGoal}
WEEKLY HOURS AVAILABLE: ${topic.profile.weeklyHours}h
WEEK TARGET: Complete by week ${topic.weekTarget}
WHY THIS TOPIC NOW: ${topic.whyNow}
SUCCESS MILESTONE: ${topic.milestone}
${resourcesStr}

Generate a detailed, practical study guide for this exact topic. Be specific — no generic "learn the basics" advice.

Respond ONLY with valid JSON:
{
  "overview": "string (2-3 sentences explaining what this topic actually is in plain English)",
  "whyItMatters": "string (specifically why this matters for their ${topic.profile.careerGoal} career goal)",
  "keyConceptsToMaster": [
    { "concept": "string", "description": "string (what it is and when you'd use it)" }
  ],
  "studyPlan": [
    { "day": number, "task": "string (concrete task for that day)", "duration": "string (e.g. '2 hours')" }
  ],
  "commonMistakes": ["string (specific mistake beginners make with this topic)"],
  "resources": [
    {
      "name": "string (specific resource name)",
      "type": "course" | "book" | "docs" | "practice" | "video",
      "url": "string (optional — only if you're certain of the URL)",
      "why": "string (why this specific resource for this specific topic)"
    }
  ],
  "milestoneTest": "string (a specific project or task that proves they've mastered this topic)"
}`;

    const explanation = await generateJSON<TopicExplanation>(prompt);

    return NextResponse.json({ data: explanation });
  } catch (error: any) {
    console.error("[Topic Explain API Error]:", error);
    
    // Handle Gemini Free Tier Quota Exhaustion Gracefully
    const isQuotaError = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    
    if (isQuotaError) {
      return NextResponse.json({
        data: {
          overview: "The Gemini AI free tier quota has been reached for today.",
          whyItMatters: "API limits protect the service from abuse. You can wait until tomorrow for the quota to reset or continue learning manually.",
          keyConceptsToMaster: [
            { concept: "API Rate Limits", description: "Understanding how external services throttle usage based on tiers." }
          ],
          studyPlan: [
            { day: 1, task: "Wait for quota reset", duration: "1 day" }
          ],
          commonMistakes: ["Assuming APIs have unlimited capacity on free tiers."],
          resources: [
            { name: "Google AI Pricing", type: "docs", why: "To understand free vs paid tier limits." }
          ],
          milestoneTest: "Successfully request a new topic explanation tomorrow."
        }
      });
    }

    return NextResponse.json(
      { error: "Failed to generate topic explanation. Please try again later." },
      { status: 500 }
    );
  }
}
