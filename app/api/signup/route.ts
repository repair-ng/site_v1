import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Creates a user account before payment. This is a stub: it validates and
// logs the submission so the flow works end-to-end.
//
// To make this real, replace `saveUser` with a call to your database
// (Postgres/Supabase/Vercel KV) or an auth provider (Clerk, Auth.js,
// Supabase Auth). Whatever you choose, return a stable user id so you can
// look the customer back up from the Opay webhook.
// ---------------------------------------------------------------------------

async function saveUser(user: { name: string; phone: string; email: string }) {
  console.log("[signup] new user", user);
  // TODO: replace with a real integration, e.g.:
  // const { data } = await supabase.from("users").insert(user).select().single();
  // return data;
  return { id: `local-${Date.now()}`, ...user };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, phone, email } = body ?? {};

  if (!name || !phone) {
    return NextResponse.json({ message: "Name and phone are required." }, { status: 400 });
  }

  const user = await saveUser({ name, phone, email: email ?? "" });
  return NextResponse.json({ ok: true, user });
}
