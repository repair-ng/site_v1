import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Starts an OPay Cashier (Checkout) transaction.
//
// Docs: https://documentation.opaycheckout.com/cashier-create
//
// Required environment variables (see .env.example):
//   OPAY_MERCHANT_ID   - your OPay merchant id
//   OPAY_PUBLIC_KEY     - public key, sent as "Authorization: Bearer <key>"
//   OPAY_API_BASE       - https://api.opaycheckout.com for live,
//                          https://testapi.opaycheckout.com for sandbox
//   APP_BASE_URL        - your deployed app's URL, used to build the
//                          return/callback/cancel URLs OPay redirects to
//
// If these aren't set yet, this route responds with { demo: true } so the
// rest of the app can still be clicked through end-to-end. This is the one
// file to revisit when you're ready to go live with real OPay credentials —
// nothing else in the codebase needs to change.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { amountNgn, reference, customer, metadata } = body ?? {};

  if (!amountNgn || !reference || !customer) {
    return NextResponse.json({ message: "Missing payment details." }, { status: 400 });
  }

  const merchantId = process.env.OPAY_MERCHANT_ID;
  const publicKey = process.env.OPAY_PUBLIC_KEY;
  const apiBase = process.env.OPAY_API_BASE;
  const appBaseUrl = process.env.APP_BASE_URL;

  if (!merchantId || !publicKey || !apiBase || !appBaseUrl) {
    // Not configured yet — let the client fall back to its demo flow.
    return NextResponse.json({ demo: true });
  }

  try {
    const res = await fetch(`${apiBase}/api/v1/international/cashier/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${publicKey}`,
        MerchantId: merchantId,
      },
      body: JSON.stringify({
        country: "NG",
        reference,
        amount: { total: String(amountNgn), currency: "NGN" },
        returnUrl: `${appBaseUrl}/payment/callback?reference=${reference}`,
        callbackUrl: `${appBaseUrl}/api/payment/webhook`,
        cancelUrl: `${appBaseUrl}/?cancelled=1`,
        evokeOpay: true,
        expireAt: 30,
        product: {
          name: metadata?.service || "Repair connection fee",
          description: `Fixam connection fee — ${metadata?.location ?? ""}`,
        },
        userInfo: {
          userId: customer.phone,
          userName: customer.name,
          userMobile: customer.phone,
          userEmail: customer.email || undefined,
        },
      }),
    });

    const data = await res.json();

    if (data.code !== "00000") {
      return NextResponse.json(
        { message: data.message || "OPay could not start the transaction." },
        { status: 502 }
      );
    }

    return NextResponse.json({ checkoutUrl: data.data.cashierUrl, orderNo: data.data.orderNo });
  } catch (err) {
    return NextResponse.json({ message: "Could not reach OPay." }, { status: 502 });
  }
}
