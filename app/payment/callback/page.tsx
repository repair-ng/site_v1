"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobTicket } from "@/components/JobTicket";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/config";

// ---------------------------------------------------------------------------
// This is OPay's `returnUrl` destination: where the customer's browser lands
// after a real (non-demo) checkout. It reads back the snapshot saved to
// sessionStorage right before the redirect, and — since a browser redirect
// can be closed or spoofed — treats the webhook in
// app/api/payment/webhook/route.ts as the actual source of truth once you've
// wired up persistence there. For now this page trusts arrival here as
// "paid" so the flow is complete end-to-end; tighten that before going live.
// ---------------------------------------------------------------------------

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const params = useSearchParams();
  const reference = params.get("reference");
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    const raw = sessionStorage.getItem(`repair:${reference}`);
    if (!raw) return;
    const { customer, metadata } = JSON.parse(raw);

    const message = buildWhatsAppMessage({
      locationName: metadata.location,
      address: metadata.address,
      serviceName: metadata.service,
      reference,
    });
    const whatsappLink = buildWhatsAppLink(message);
    setLink(whatsappLink);
    sessionStorage.removeItem(`repair:${reference}`);

    const t = setTimeout(() => window.open(whatsappLink, "_blank"), 400);
    return () => clearTimeout(t);
  }, [reference]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-navy px-4 py-10">
      <JobTicket
        step="confirmation"
        ticketNo={6}
        eyebrow="Payment confirmed"
        title="You're connected"
        subtitle="We're opening WhatsApp with your job details filled in."
      >
        {reference && (
          <div className="rounded-ticket border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            Payment reference: <span className="font-mono">{reference}</span>
          </div>
        )}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-ticket bg-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-tealDark"
          >
            Open WhatsApp chat
          </a>
        ) : (
          <p className="mt-4 text-sm text-ink/60">
            We couldn&apos;t find your request details in this browser. If you
            switched devices, message us your payment reference directly.
          </p>
        )}
      </JobTicket>
    </main>
  );
}
