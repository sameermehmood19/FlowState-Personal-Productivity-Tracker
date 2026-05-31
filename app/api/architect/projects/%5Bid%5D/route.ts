import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.projectValidation.findUnique({
      where: { id },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let parsedProject = { ...project } as any;
    try {
      parsedProject.proposedStack = JSON.parse(project.proposedStack);
      parsedProject.scoreBreakdown = JSON.parse(project.scoreBreakdown);
      parsedProject.aiFeedback = JSON.parse(project.aiFeedback);
    } catch (e) {
      console.error("JSON parse error:", e);
    }

    return NextResponse.json({ data: parsedProject });
  } catch (error) {
    console.error("[Project Detail API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.projectValidation.findUnique({
      where: { id },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.projectValidation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("[Project Delete API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
