import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateProject } from "@/services/architect.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectName,
      description,
      problemStatement,
      targetUsers,
      teamSize,
      timeline,
      scalabilityGoal,
      budget,
      architecture,
      methodology,
      proposedStack,
    } = body;

    // Basic validation
    if (!projectName || !description || !problemStatement || !proposedStack) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call Gemini AI service
    const feedback = await validateProject({
      projectName,
      description,
      problemStatement,
      targetUsers,
      teamSize,
      timeline,
      scalabilityGoal,
      budget,
      architecture,
      methodology,
      proposedStack,
    });

    // Save to database
    const validation = await prisma.projectValidation.create({
      data: {
        userId: session.user.id,
        projectName,
        description,
        problemStatement,
        targetUsers,
        teamSize,
        timeline,
        scalabilityGoal,
        budget,
        architecture,
        methodology,
        proposedStack: JSON.stringify(proposedStack),
        verdict: feedback.verdict,
        overallScore: feedback.overallScore,
        scoreBreakdown: JSON.stringify(feedback.scores),
        aiFeedback: JSON.stringify(feedback),
      },
    });

    return NextResponse.json({
      data: {
        ...validation,
        proposedStack,
        scoreBreakdown: feedback.scores,
        aiFeedback: feedback,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[Project Architect API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
