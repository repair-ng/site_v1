# RE-PAIR

A small Next.js app that connects users to repairmen: pick a location →
enter your address → choose a service → sign up → pay a flat connection
fee → get redirected to WhatsApp with your job details pre-filled.

It also has a lightweight job-notification loop for your repairmen: you
(the admin) push a note when a job comes in, and any repairman with the
job board open sees it within a few seconds and can claim it on WhatsApp.

## The customer flow

1. **Location** — searchable dropdown of the areas you currently cover,
   plus a "notify me" link for everyone else. A scrolling banner of
   repair photos sits above it (customize in `lib/config.ts`).
2. **Address** — free-text exact address.
3. **Service** — searchable dropdown of repair categories.
4. **Sign up** — name, phone, email, required before payment.
5. **Payment** — flat ₦100 fee via the Paystack checkout component (see
   below).
6. **Confirmation** — opens WhatsApp with a pre-filled message containing
   the location, address, service, and payment reference.

## The repairman flow

- **`/repairmen`** — a job board repairmen keep open in a browser tab. It
  polls every 6 seconds for new postings and can fire a browser
  notification (if they grant permission) so they don't have to watch the
  tab. Tapping "I'll take this job" opens WhatsApp with a pre-filled claim
  message, sent to the same middleman number as the customer flow.
- **`/admin`** — password-gated page where you push a new job notification
  (free-text message plus optional service/location tags). It shows up on
  `/repairmen` within one polling cycle.

This is intentionally the simple version: one shared job board rather than
notifying a specific repairman directly. See "Where to take this next" at
the bottom for the direct-to-repairman upgrade path.

## 1. Customize your data

Almost everything you'll want to change lives in **`lib/config.ts`**:

- `LOCATIONS` — the areas shown in the location dropdown
- `SERVICES` — the repair categories shown in the service dropdown
- `CONNECTION_FEE_NGN` — the flat fee (currently 100)
- `WHATSAPP_NUMBER` — the middleman WhatsApp number, international format
  with no `+` or leading zero (e.g. `2348031234567`)
- `HERO_IMAGES` — the photos in the landing-page banner. It ships with
  placeholder illustrations at `public/images/hero/*.svg` so the app looks
  right out of the box — drop real photos of repairmen at work into
  `public/images/`, then point `HERO_IMAGES` at their paths.

## 2. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without any environment variables set, payment
runs in **demo mode** — you can click all the way through the flow and
simulate a successful payment, which is useful for testing before you have
real Paystack credentials.

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

## 5. Wire up the job board for real use

- `lib/notifications.ts` — the `JobNotification` shape.
- `lib/notifications-store.ts` — where notifications are stored. Falls
  back to in-memory (fine for local dev) if no Redis is configured — see
  the comments in that file for why that's not reliable once deployed.
- `lib/admin-auth.ts` — the shared-password check for `/admin`.
- `app/api/notifications/route.ts` — public, read-only; polled by
  `/repairmen`.
- `app/api/admin/notifications/route.ts` — password-gated; `/admin` posts
  new notifications here.

To make it solid in production:

1. Set `ADMIN_PASSWORD` (any strong string) so `/admin` isn't open to
   anyone with the URL.
2. Add a Redis database — from your Vercel project, **Storage → Marketplace
   Database Providers**, search "Upstash", create one, and connect it to
   this project. It injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`
   automatically; `lib/notifications-store.ts` picks them up with no code
   changes.

## Where to take this next

You mentioned wanting notifications to go straight from a job to the
specific repairman assigned to it, rather than a shared job board — this
version is the deliberately simple first step toward that. Natural next
moves, roughly in order of effort:

- **Real push, not just in-tab**: today's "browser notification" only
  fires while `/repairmen` is open in a tab. True push (delivered even
  when the tab or browser is closed) needs a service worker plus Web Push
  subscriptions (VAPID keys) — a bigger addition, but a well-trodden one.
- **Per-repairman accounts**: give each repairman a login (e.g. via
  Supabase Auth or Clerk) and a profile with their services/location, so
  `/admin` can target one person instead of broadcasting to everyone on
  `/repairmen`.
- **Auto-notify on order, no admin step**: once `PaymentStep.tsx` confirms
  payment, call `addNotification()` directly (from
  `app/api/payment/webhook/route.ts`, once that's wired to a real
  provider) instead of you typing a message into `/admin` by hand.

## 6. Deploy to Vercel

```bash
npx vercel
```

or connect the repo at [vercel.com/new](https://vercel.com/new). No build
configuration is needed — it's a standard Next.js app. Just remember to
add the environment variables from `.env.example` in the Vercel project
settings once you're ready for real payments.
