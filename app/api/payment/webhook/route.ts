import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Receives Paystack's server-to-server webhook.
//
// Docs: https://paystack.com/docs/payments/webhooks/
//
// This is the source of truth for "was this actually paid" — the browser
// redirect back to your site (app/payment/callback) can be closed or
// interrupted, so don't rely on that alone in a real deployment.
//
// Set this URL in your Paystack dashboard under Settings -> API Keys &
// Webhooks:  https://<your-app>.vercel.app/api/payment/webhook
//
// Before going live:
//  1. Set PAYSTACK_SECRET_KEY (same one used in initiate/route.ts) — it's
//     what verifies the `x-paystack-signature` header below.
//  2. Persist the result (e.g. Vercel KV, Postgres) keyed by `reference`,
//     so app/payment/callback can look it up after the customer is
//     redirected back.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = await req.text();

  if (secretKey) {
    const signature = req.headers.get("x-paystack-signature");
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    if (signature !== expected) {
      // Not a genuine Paystack request — ignore it.
      return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);
  console.log("[paystack webhook] received", event?.event, event?.data?.reference);

  if (event?.event === "charge.success") {
    // TODO: mark the matching order as paid in your database, e.g.:
    // await db.orders.update({ where: { reference: event.data.reference }, data: { status: "paid" } });
  }

  return NextResponse.json({ received: true });
}
