"use client";

import { JobTicket } from "@/components/JobTicket";
import { LOCATIONS } from "@/lib/config";

export function AddressStep({
  locationId,
  address,
  onChange,
  onNext,
  onBack,
}: {
  locationId: string | null;
  address: string;
  onChange: (address: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const location = LOCATIONS.find((l) => l.id === locationId);
  const canContinue = address.trim().length >= 6;

  return (
    <JobTicket
      step="address"
      ticketNo={2}
      eyebrow={location ? location.name : "Your area"}
      title="What's your exact address?"
      subtitle="This goes straight to the repairman assigned to your job — the more precise, the faster they'll find you."
      onBack={onBack}
    >
      <textarea
        value={address}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="House number, street name, closest landmark..."
        className="w-full resize-none rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 focus:border-signal focus:outline-none"
      />
      <button
        type="button"
        disabled={!canContinue}
        onClick={onNext}
        className="mt-5 w-full rounded-ticket bg-signal py-3 text-sm font-semibold text-white transition-colors hover:bg-signalDark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
      >
        Continue
      </button>
    </JobTicket>
  );
}
