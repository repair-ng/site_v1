"use client";

import { useState } from "react";
import { JobTicket } from "@/components/JobTicket";

export function SignupStep({
  onComplete,
  onBack,
}: {
  onComplete: (user: { name: string; phone: string; email: string }) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      if (!res.ok) throw new Error("failed");
      onComplete({ name, phone, email });
    } catch {
      setError("Couldn't save your details — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <JobTicket
      step="signup"
      ticketNo={4}
      eyebrow="One quick step"
      title="Create your account"
      subtitle="We need this to confirm your payment and keep you posted on your repair."
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Full name" htmlFor="name">
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada Obi"
            className="w-full rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] focus:border-signal focus:outline-none"
          />
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="080X XXX XXXX"
            className="w-full rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] focus:border-signal focus:outline-none"
          />
        </Field>
        <Field label="Email (optional)" htmlFor="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-ticket border border-line bg-paper px-4 py-3 text-[15px] focus:border-signal focus:outline-none"
          />
        </Field>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="mt-2 w-full rounded-ticket bg-signal py-3 text-sm font-semibold text-white transition-colors hover:bg-signalDark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
        >
          {submitting ? "Saving..." : "Continue to payment"}
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </JobTicket>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink/60">
        {label}
      </label>
      {children}
    </div>
  );
}
