import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllLogs } from "@/services/logs.service";
import { generateCsvContent } from "@/utils/csv";
import { format } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await getAllLogs(session.user.id);
    const csv = generateCsvContent(logs);
    const filename = `flowstate-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
