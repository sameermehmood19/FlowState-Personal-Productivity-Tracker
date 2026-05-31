import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.learningProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        topics: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ data: null });
    }

    const parsedProfile = {
      ...profile,
      currentLevel: JSON.parse(profile.currentLevel),
      roadmap: JSON.parse(profile.roadmap),
      topics: profile.topics.map((t) => {
        try {
          return {
            ...t,
            resources: JSON.parse(t.resources),
          };
        } catch {
          return t;
        }
      }),
    };

    return NextResponse.json({ data: parsedProfile });
  } catch (error) {
    console.error("[Learning Profile API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
