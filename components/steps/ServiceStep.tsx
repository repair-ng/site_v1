"use client";

import { JobTicket } from "@/components/JobTicket";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SERVICES } from "@/lib/config";

export function ServiceStep({
  serviceId,
  onSelect,
  onNext,
  onBack,
}: {
  serviceId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <JobTicket
      step="service"
      ticketNo={3}
      eyebrow="Almost there"
      title="What needs fixing?"
      subtitle="Choose the closest match — the repairman will confirm the exact issue."
      onBack={onBack}
    >
      <SearchableSelect
        options={SERVICES}
        value={serviceId}
        onChange={onSelect}
        placeholder="Search repair services..."
      />
      <button
        type="button"
        disabled={!serviceId}
        onClick={onNext}
        className="mt-5 w-full rounded-ticket bg-signal py-3 text-sm font-semibold text-white transition-colors hover:bg-signalDark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
      >
        Continue
      </button>
    </JobTicket>
  );
}
