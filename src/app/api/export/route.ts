import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { buildBackup } from "@/lib/data-transfer/export";
import { toDateKey } from "@/lib/time";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const backup = await buildBackup(userId);
  const filename = `timescheduler-backup-${toDateKey(new Date())}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
