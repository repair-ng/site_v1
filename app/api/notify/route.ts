import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Stores "notify me when you launch near me" emails.
//
// This is a stub: it just logs the email so the flow works end-to-end.
// Swap the body of `saveNotifyRequest` for a real destination, e.g.:
//   - insert into a Postgres/Supabase table
//   - add a subscriber via Mailchimp/Resend/Brevo's API
//   - append a row to a Google Sheet via its API
// ---------------------------------------------------------------------------

async function saveNotifyRequest(email: string) {
  console.log(`[notify] new location request from ${email}`);
  // TODO: replace with a real integration.
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ message: "A valid email is required." }, { status: 400 });
  }

  await saveNotifyRequest(email);
  return NextResponse.json({ ok: true });
}
