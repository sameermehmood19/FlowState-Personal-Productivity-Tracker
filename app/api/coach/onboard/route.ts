import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoachRoadmap, CoachInput } from "@/services/coach.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { careerGoal, skills, weeklyHours } = body;

    if (!careerGoal || !skills || !weeklyHours) {
      return NextResponse.json({ error: "Missing required onboarding data" }, { status: 400 });
    }

    // 1. Fetch user's saved project names for cross-module integration
    const savedProjects = await prisma.projectValidation.findMany({
      where: { userId: session.user.id },
      select: { projectName: true },
    });
    const projectNames = savedProjects.map((p) => p.projectName);

    // 2. Generate custom roadmap via Gemini AI Coach
    const input: CoachInput = {
      careerGoal,
      skills,
      weeklyHours: Number(weeklyHours),
    };
    const roadmap = await generateCoachRoadmap(input, projectNames);

    // 3. Save or update LearningProfile in the database using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if profile already exists
      const existingProfile = await tx.learningProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (existingProfile) {
        // Delete all existing topics first
        await tx.learningTopic.deleteMany({
          where: { profileId: existingProfile.id },
        });
      }

      // Upsert profile
      const profile = await tx.learningProfile.upsert({
        where: { userId: session.user.id },
        update: {
          careerGoal,
          currentLevel: JSON.stringify(skills),
          weeklyHours: Number(weeklyHours),
          roadmap: JSON.stringify(roadmap),
        },
        create: {
          userId: session.user.id,
          careerGoal,
          currentLevel: JSON.stringify(skills),
          weeklyHours: Number(weeklyHours),
          roadmap: JSON.stringify(roadmap),
        },
      });

      // Create new topics
      const topicsData = roadmap.learningOrder.map((item) => ({
        profileId: profile.id,
        title: item.topic,
        category: item.category,
        orderIndex: item.order,
        status: "pending",
        weekTarget: item.weekTarget,
        whyNow: item.whyNow,
        milestone: item.milestone,
        resources: JSON.stringify(item.resources),
      }));

      await tx.learningTopic.createMany({
        data: topicsData,
      });

      // Fetch complete updated profile
      return await tx.learningProfile.findUnique({
        where: { id: profile.id },
        include: {
          topics: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    });

    // Parse values for return
    const parsedResult = {
      ...result,
      currentLevel: JSON.parse(result!.currentLevel),
      roadmap: JSON.parse(result!.roadmap),
      topics: result!.topics.map((t) => ({
        ...t,
        resources: JSON.parse(t.resources),
      })),
    };

    return NextResponse.json({ data: parsedResult }, { status: 200 });
  } catch (error: any) {
    console.error("[Learning Onboard API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
