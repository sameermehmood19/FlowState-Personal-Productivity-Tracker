import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "in_progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find topic and check ownership via profile
    const topic = await prisma.learningTopic.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!topic || topic.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const updated = await prisma.learningTopic.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[Topic Update API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
