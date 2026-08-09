import { NextRequest, NextResponse } from "next/server";
import { addNotification, listNotifications } from "@/lib/notifications-store";
import { checkAdminAuth } from "@/lib/admin-auth";

// GET here just re-uses the public list — kept separate from
// /api/notifications so the admin page has one endpoint to talk to.
export async function GET(req: NextRequest) {
  const { ok, demo } = checkAdminAuth(req.headers.get("x-admin-key"));
  if (!ok) return NextResponse.json({ message: "Wrong password." }, { status: 401 });

  const notifications = await listNotifications();
  return NextResponse.json({ notifications, demo });
}

export async function POST(req: NextRequest) {
  const { ok, demo } = checkAdminAuth(req.headers.get("x-admin-key"));
  if (!ok) return NextResponse.json({ message: "Wrong password." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const message = body?.message?.trim();

  if (!message) {
    return NextResponse.json({ message: "A message is required." }, { status: 400 });
  }

  const notification = await addNotification({
    message,
    serviceName: body?.serviceName || undefined,
    locationName: body?.locationName || undefined,
  });

  return NextResponse.json({ ok: true, notification, demo });
}
