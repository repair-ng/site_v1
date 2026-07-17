import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Starts a Paystack transaction.
//
// Docs: https://paystack.com/docs/api/transaction/#initialize
//
// Required environment variables (see .env.example):
//   PAYSTACK_SECRET_KEY - your Paystack secret key (sk_live_... / sk_test_...)
//   APP_BASE_URL        - your deployed app's URL, used to build the
//                          callback_url Paystack redirects to after checkout
//
// If these aren't set yet, this route responds with { demo: true } so the
// rest of the app can still be clicked through end-to-end. This is the one
// file to revisit when you're ready to go live with real Paystack
// credentials — nothing else in the codebase needs to change.
//
// Paystack's secret key must never reach the browser, which is exactly why
// this call happens here on the server rather than in the client component.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { amountNgn, reference, customer, metadata } = body ?? {};

  if (!amountNgn || !reference || !customer) {
    return NextResponse.json({ message: "Missing payment details." }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const appBaseUrl = process.env.APP_BASE_URL;

  if (!secretKey || !appBaseUrl) {
    // Not configured yet — let the client fall back to its demo flow.
    return NextResponse.json({ demo: true });
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email: customer.email || `${customer.phone}@repair.customer`,
        amount: String(Math.round(amountNgn * 100)), // Paystack expects kobo
        reference,
        currency: "NGN",
        callback_url: `${appBaseUrl}/payment/callback`,
        metadata: {
          customer_name: customer.name,
          customer_phone: customer.phone,
          location: metadata?.location,
          service: metadata?.service,
          address: metadata?.address,
        },
      }),
    });

    const data = await res.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Paystack could not start the transaction." },
        { status: 502 }
      );
    }

    return NextResponse.json({ authorizationUrl: data.data.authorization_url });
  } catch (err) {
    return NextResponse.json({ message: "Could not reach Paystack." }, { status: 502 });
  }
}
