import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogById, updateLog, deleteLog, getAllLogs } from "@/services/logs.service";
import { generateInsights } from "@/services/insights.service";
import { dailyLogSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const log = await getLogById(id, session.user.id);
    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ data: log });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = dailyLogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyGoal: true },
    });

    const log = await updateLog(
      id,
      session.user.id,
      parsed.data as Parameters<typeof updateLog>[2],
      user?.dailyGoal ?? 8
    );

    // Regenerate insights asynchronously
    const allLogs = await getAllLogs(session.user.id);
    generateInsights(session.user.id, allLogs).catch(console.error);

    return NextResponse.json({ data: log });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message === "Log not found" ? message : "Internal server error" },
      { status: message === "Log not found" ? 404 : 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteLog(id, session.user.id);
    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message === "Log not found" ? message : "Internal server error" },
      { status: message === "Log not found" ? 404 : 500 }
    );
  }
}
