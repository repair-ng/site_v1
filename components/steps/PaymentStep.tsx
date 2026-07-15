"use client";

import { useState } from "react";
import { JobTicket } from "@/components/JobTicket";
import { PaymentGateway } from "@/components/payment/PaymentGateway";
import { CONNECTION_FEE_NGN, LOCATIONS, SERVICES } from "@/lib/config";
import { FlowState } from "@/lib/flow";

export function PaymentStep({
  flow,
  onSuccess,
  onBack,
}: {
  flow: FlowState;
  onSuccess: (reference: string) => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const location = LOCATIONS.find((l) => l.id === flow.locationId);
  const service = SERVICES.find((s) => s.id === flow.serviceId);
  const reference = `FXM-${Date.now()}`;

  if (!flow.user || !location || !service) return null;

  return (
    <JobTicket
      step="payment"
      ticketNo={5}
      eyebrow="Last step"
      title="Pay to get connected"
      subtitle="A small fee to connect you to a trusted repairman using WhatsApp — no charge from us after that."
      onBack={onBack}
    >
      <div className="mb-4 space-y-1.5 text-sm">
        <SummaryRow label="Service" value={service.name} />
        <SummaryRow label="Location" value={location.name} />
        <SummaryRow label="Address" value={flow.address} />
      </div>

      <PaymentGateway
        amountNgn={CONNECTION_FEE_NGN}
        reference={reference}
        customer={flow.user}
        metadata={{
          location: location.name,
          service: service.name,
          address: flow.address,
        }}
        onSuccess={onSuccess}
        onCancel={onBack}
        onError={(message) => setError(message)}
      />

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </JobTicket>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
