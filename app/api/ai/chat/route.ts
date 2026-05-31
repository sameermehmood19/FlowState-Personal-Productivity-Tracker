import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTextStream } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Gather user context data for the AI
    const [recentLogs, coachProfile, architectProjects] = await Promise.all([
      prisma.dailyLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 7,
      }),
      prisma.learningProfile.findUnique({
        where: { userId },
        include: { topics: { orderBy: { orderIndex: "asc" }, take: 10 } },
      }),
      prisma.projectValidation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { projectName: true, verdict: true, overallScore: true },
      }),
    ]);

    // Build context summary
    const avgMood =
      recentLogs.length > 0
        ? (recentLogs.reduce((s, l) => s + l.moodScore, 0) / recentLogs.length).toFixed(1)
        : "N/A";
    const avgStudy =
      recentLogs.length > 0
        ? (recentLogs.reduce((s, l) => s + l.studyHours, 0) / recentLogs.length).toFixed(1)
        : "N/A";
    const totalStudyThisWeek = recentLogs
      .slice(0, 7)
      .reduce((s, l) => s + l.studyHours, 0)
      .toFixed(1);

    const completedTopics =
      coachProfile?.topics.filter((t) => t.status === "completed").length ?? 0;
    const inProgressTopics =
      coachProfile?.topics.filter((t) => t.status === "in_progress").length ?? 0;

    const contextBlock = `
FLOWSTATE USER CONTEXT (Use this to give personalized answers):
- Recent 7-day avg study hours: ${avgStudy}h/day
- Recent 7-day avg mood: ${avgMood}/10
- Total study this week: ${totalStudyThisWeek}h
- Days logged last 7 days: ${recentLogs.length}
- Career goal: ${coachProfile?.careerGoal ?? "Not set"}
- Learning coach topics: ${completedTopics} completed, ${inProgressTopics} in progress
- Project blueprints validated: ${architectProjects.length}
${
  architectProjects.length > 0
    ? `- Blueprint results: ${architectProjects.map((p) => `"${p.projectName}" (${p.verdict}, score: ${p.overallScore.toFixed(1)})`).join(", ")}`
    : ""
}
`;

    // Build conversation history for the prompt
    const historyText =
      history.length > 0
        ? history
            .slice(-8) // last 8 messages for context window
            .map((m) => `${m.role === "user" ? "User" : "FlowBot"}: ${m.content}`)
            .join("\n")
        : "";

    const prompt = `You are FlowBot, a friendly and highly capable AI mentor embedded in FlowState — a personal productivity and developer training app. 

${contextBlock}

IMPORTANT RULES:
- Be concise but rich — max 3-4 short paragraphs or a bullet list
- Always use the user's actual data above when relevant — never give generic advice
- Be encouraging and direct — no fluff, no "Great question!"
- If asked about coding topics, be technical and precise
- Format with markdown (bold, bullets) for readability

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ""}

User: ${message}
FlowBot:`;

    // Stream the response as plain text using ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateTextStream(prompt)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err: any) {
          const isQuotaError = err?.message?.includes("quota") || err?.message?.includes("429") || err?.status === 429;
          const errorMsg = isQuotaError 
            ? "The Gemini AI free tier quota has been reached for today. The AI will be back tomorrow!" 
            : err instanceof Error ? err.message : "AI service error";
          controller.enqueue(encoder.encode(`\n\n❌ ${errorMsg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("[FlowBot Chat Error]:", error);
    return NextResponse.json(
      { error: error?.message || "AI service error. Please try again." },
      { status: 500 }
    );
  }
}
