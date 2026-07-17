# RE-PAIR

A small Next.js app that connects users to repairmen: pick a location →
enter your address → choose a service → sign up → pay a flat connection
fee → get redirected to WhatsApp with your job details pre-filled.

## The flow

1. **Location** — searchable dropdown of the areas you currently cover,
   plus a "notify me" link for everyone else.
2. **Address** — free-text exact address.
3. **Service** — searchable dropdown of repair categories.
4. **Sign up** — name, phone, email, required before payment.
5. **Payment** — flat ₦100 fee via the OPay checkout component (see below).
6. **Confirmation** — opens WhatsApp with a pre-filled message containing
   the location, address, service, and payment reference.

## 1. Customize your data

Almost everything you'll want to change lives in **`lib/config.ts`**:

- `LOCATIONS` — the areas shown in the location dropdown
- `SERVICES` — the repair categories shown in the service dropdown
- `CONNECTION_FEE_NGN` — the flat fee (currently 100)
- `WHATSAPP_NUMBER` — the middleman WhatsApp number, international format
  with no `+` or leading zero (e.g. `2348031234567`)

## 2. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without any environment variables set, payment
runs in **demo mode** — you can click all the way through the flow and
simulate a successful payment, which is useful for testing before you have
real OPay credentials.

## 3. Wire up real Paystack payments

The checkout is built as a swappable component:

- `components/payment/PaymentGateway.tsx` defines the contract every
  provider implements, and re-exports whichever one is "active."
- `components/payment/PaystackCheckout.tsx` is today's implementation
  (`OpayCheckout.tsx` is still in the repo, unused, in case you ever want
  to switch back or compare the two).
- `app/api/payment/initiate/route.ts` calls Paystack's Initialize
  Transaction API.
- `app/api/payment/webhook/route.ts` receives Paystack's server-to-server
  payment webhook and verifies its signature.
- `app/payment/callback/page.tsx` is where Paystack redirects the
  customer's browser back to after checkout.

To go live:

1. Get your `PAYSTACK_SECRET_KEY` from your Paystack dashboard under
   **Settings → API Keys & Webhooks**.
2. Set the two variables in `.env.example` as real environment variables
   (locally in `.env.local`, and in your Vercel project settings).
3. In the same Paystack dashboard page, set your webhook URL to
   `https://<your-app>.vercel.app/api/payment/webhook`.
4. Open `app/api/payment/webhook/route.ts` — it has a `TODO` marking
   where to persist order status (a real database or
   [Vercel KV](https://vercel.com/docs/storage/vercel-kv), rather than the
   `console.log` placeholder currently there).

If you ever switch providers again, build a component matching the
`PaymentGatewayProps` shape and change one import line in
`PaymentGateway.tsx` — nothing else in the app needs to change.

## 4. Connect signups and "notify me" to something real

`app/api/signup/route.ts` and `app/api/notify/route.ts` currently just log
what's submitted. Swap in a real database, CRM, or email tool (Supabase,
Postgres, Mailchimp, a Google Sheet, etc.) — both files have `TODO`
comments showing where.

## 5. Deploy to Vercel

```bash
npx vercel
```

or connect the repo at [vercel.com/new](https://vercel.com/new). No build
configuration is needed — it's a standard Next.js app. Just remember to
add the environment variables from `.env.example` in the Vercel project
settings once you're ready for real payments.
