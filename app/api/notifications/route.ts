import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/notifications-store";

// Read-only feed of job notifications, polled by /repairmen. No customer
// contact details go through here — just what the admin typed plus the
// service/location tags, matching how /app/admin/page.tsx composes them.
export async function GET() {
  const notifications = await listNotifications();
  return NextResponse.json({ notifications });
}
