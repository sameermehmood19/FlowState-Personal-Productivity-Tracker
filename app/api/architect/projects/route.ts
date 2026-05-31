import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.projectValidation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const parsedProjects = projects.map((p) => {
      try {
        return {
          ...p,
          proposedStack: JSON.parse(p.proposedStack),
          scoreBreakdown: JSON.parse(p.scoreBreakdown),
          aiFeedback: JSON.parse(p.aiFeedback),
        };
      } catch {
        return p;
      }
    });

    return NextResponse.json({ data: parsedProjects });
  } catch (error) {
    console.error("[Project List API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
