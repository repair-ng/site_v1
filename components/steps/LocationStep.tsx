"use client";

import { useState } from "react";
import { JobTicket } from "@/components/JobTicket";
import { SearchableSelect } from "@/components/SearchableSelect";
import { LOCATIONS } from "@/lib/config";

export function LocationStep({
  locationId,
  onSelect,
  onNext,
}: {
  locationId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submitNotify(e: React.FormEvent) {
    e.preventDefault();
    setNotifyStatus("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setNotifyStatus("sent");
    } catch {
      setNotifyStatus("error");
    }
  }

  return (
    <JobTicket
      step="location"
      ticketNo={1}
      eyebrow=""
      title="Where do you need a repairman?"
      subtitle=""
    >
      <SearchableSelect
        options={LOCATIONS}
        value={locationId}
        onChange={onSelect}
        placeholder="Search for your area..."
      />

      <button
        type="button"
        disabled={!locationId}
        onClick={onNext}
        className="mt-5 w-full rounded-ticket bg-signal py-3 text-sm font-semibold text-white transition-colors hover:bg-signalDark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
      >
        Continue
      </button>

      <div className="mt-6 border-t border-line pt-4 text-center">
        {!notifyOpen ? (
          <button
            type="button"
            onClick={() => setNotifyOpen(true)}
            className="text-sm font-medium text-teal underline decoration-teal/40 underline-offset-4 hover:text-tealDark">
            If you don't see your area, you can request to be notified when we launch there.
          </button>
        ) : notifyStatus === "sent" ? (
          <p className="text-sm text-success">
            You&apos;re on the list — we&apos;ll email you the moment we launch near you.
          </p>
        ) : (
          <form onSubmit={submitNotify} className="flex flex-col gap-2 text-left">
            <label className="text-xs font-medium text-ink/60" htmlFor="notify-email">
              Email address
            </label>
            <input
              id="notify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-ticket border border-line px-3 py-2 text-sm focus:border-signal focus:outline-none"
            />
            <button
              type="submit"
              disabled={notifyStatus === "sending"}
              className="mt-1 rounded-ticket bg-teal py-2.5 text-sm font-semibold text-white hover:bg-tealDark disabled:opacity-60"
            >
              {notifyStatus === "sending" ? "Submitting..." : "Notify me"}
            </button>
            {notifyStatus === "error" && (
              <p className="text-xs text-danger">Something went wrong — try again.</p>
            )}
          </form>
        )}
      </div>
    </JobTicket>
  );
}
