import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Receives OPay's server-to-server payment notification (the `callbackUrl`
// passed in /api/payment/initiate).
//
// This is the source of truth for "was this actually paid" — the browser
// redirect back to your site (returnUrl / app/payment/callback) can be
// closed, spoofed, or never happen, so don't mark an order paid from that
// alone in a real deployment.
//
// Before going live:
//  1. Confirm the exact payload shape and signature scheme for your OPay
//     product in the current docs (https://documentation.opaycheckout.com) —
//     OPay signs callback payloads and you must verify that signature here
//     before trusting the body.
//  2. Persist the result (e.g. Vercel KV, Postgres) keyed by `reference` /
//     `orderNo`, so app/payment/callback can look it up after the customer
//     is redirected back.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);

  // TODO: verify OPay's signature on `payload` before trusting it.
  console.log("[opay webhook] received", payload);

  // TODO: mark the matching order as paid in your database, e.g.:
  // await db.orders.update({ where: { reference: payload.reference }, data: { status: "paid" } });

  return NextResponse.json({ received: true });
}
