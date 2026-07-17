import { Step } from "@/lib/flow";

const STEP_ORDER: { id: Step; label: string }[] = [
  { id: "location", label: "Location" },
  { id: "address", label: "Address" },
  { id: "service", label: "Service" },
  { id: "signup", label: "Sign up" },
  { id: "payment", label: "Pay" },
  { id: "confirmation", label: "Connect" },
];

export function JobTicket({
  step,
  ticketNo,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  onBack,
}: {
  step: Step;
  ticketNo: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}) {
  const index = STEP_ORDER.findIndex((s) => s.id === step);

  return (
    <div className="w-full max-w-md">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white"
        >
          ← Back
        </button>
      )}
      <div className="job-ticket px-6 pb-6 pt-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="ticket-number text-xs text-ink/40">
            №{String(ticketNo).padStart(4, "0")}
          </span>
          <span className="ticket-number text-xs text-ink/40">
            STEP {index + 1} / {STEP_ORDER.length}
          </span>
        </div>

        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
          {eyebrow}
        </div>
        <h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-tight text-navy">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-ink/60">{subtitle}</p>
        )}

        <div className="mt-6">{children}</div>
      </div>

      {/* progress dashes below the ticket, like a queue counter */}
      <div className="mt-4 flex justify-center gap-1.5">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 w-6 rounded-full transition-colors ${
              i <= index ? "bg-signal" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {footer}
    </div>
  );
}
