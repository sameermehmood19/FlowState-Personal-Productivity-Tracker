import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalyticsData, getChartData, getHeatmapData } from "@/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "full";
    const days = parseInt(searchParams.get("days") ?? "30");

    if (type === "chart") {
      const data = await getChartData(session.user.id, days);
      return NextResponse.json({ data });
    }

    if (type === "heatmap") {
      const data = await getHeatmapData(session.user.id);
      return NextResponse.json({ data });
    }

    const data = await getAnalyticsData(session.user.id);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
