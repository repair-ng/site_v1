"use client";

import { useEffect, useMemo } from "react";
import { JobTicket } from "@/components/JobTicket";
import { buildWhatsAppLink, buildWhatsAppMessage, LOCATIONS, SERVICES } from "@/lib/config";
import { FlowState } from "@/lib/flow";

export function ConfirmationStep({ flow }: { flow: FlowState }) {
  const location = LOCATIONS.find((l) => l.id === flow.locationId);
  const service = SERVICES.find((s) => s.id === flow.serviceId);

  const link = useMemo(() => {
    if (!location || !service || !flow.paymentReference) return null;
    const message = buildWhatsAppMessage({
      locationName: location.name,
      address: flow.address,
      serviceName: service.name,
      reference: flow.paymentReference,
    });
    return buildWhatsAppLink(message);
  }, [location, service, flow.address, flow.paymentReference]);

  // Open WhatsApp automatically once, then leave the manual button as a
  // fallback for browsers that block programmatic redirects.
  useEffect(() => {
    if (link) {
      const t = setTimeout(() => window.open(link, "_blank"), 400);
      return () => clearTimeout(t);
    }
  }, [link]);

  return (
    <JobTicket
      step="confirmation"
      ticketNo={6}
      eyebrow="Payment confirmed"
      title="You're connected"
      subtitle="We're opening WhatsApp with your job details filled in — send the message to reach the repair desk."
    >
      <div className="rounded-ticket border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
        Payment reference: <span className="font-mono">{flow.paymentReference}</span>
      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-ticket bg-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-tealDark"
        >
          Open WhatsApp chat
        </a>
      )}

      <p className="mt-4 text-center text-xs text-ink/50">
        Didn&apos;t open automatically? Use the button above — your location,
        address and issue are already filled in.
      </p>
    </JobTicket>
  );
}
