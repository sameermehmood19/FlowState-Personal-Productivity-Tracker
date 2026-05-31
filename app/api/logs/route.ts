import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogs, createLog, getAllLogs } from "@/services/logs.service";
import { generateInsights } from "@/services/insights.service";
import { dailyLogSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      minMood: searchParams.get("minMood")
        ? parseInt(searchParams.get("minMood")!)
        : undefined,
      maxMood: searchParams.get("maxMood")
        ? parseInt(searchParams.get("maxMood")!)
        : undefined,
      minFocus: searchParams.get("minFocus")
        ? parseInt(searchParams.get("minFocus")!)
        : undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? "date",
      sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
    };

    const result = await getLogs(session.user.id, options);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = dailyLogSchema.safeParse(body);
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

    const log = await createLog(
      session.user.id,
      {
        ...parsed.data,
        notes: parsed.data.notes ?? undefined,
      },
      user?.dailyGoal ?? 8
    );

    // Regenerate insights asynchronously
    const allLogs = await getAllLogs(session.user.id);
    generateInsights(session.user.id, allLogs).catch(console.error);

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json(
      {
        error:
          status === 409
            ? "A log for this date already exists"
            : "Internal server error",
      },
      { status }
    );
  }
}
