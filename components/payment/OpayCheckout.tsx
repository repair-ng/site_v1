"use client";

import { useState } from "react";
import { PaymentGatewayProps } from "./PaymentGateway";

export function OpayCheckout({
  amountNgn,
  reference,
  customer,
  metadata,
  onSuccess,
  onCancel,
  onError,
}: PaymentGatewayProps) {
  const [status, setStatus] = useState<"idle" | "starting" | "demo">("idle");

  async function startCheckout() {
    setStatus("starting");
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNgn, reference, customer, metadata }),
      });
      const data = await res.json();

      if (!res.ok) {
        onError(data?.message || "Could not start payment.");
        setStatus("idle");
        return;
      }

      if (data.demo) {
        // No OPAY_* env vars configured yet — see /app/api/payment/initiate/route.ts.
        // Lets you click through the whole flow before real credentials exist.
        setStatus("demo");
        return;
      }

      // A full-page redirect to Opay's hosted checkout loses React state, so
      // stash what /payment/callback needs to finish the job (build the
      // WhatsApp message) once the customer is redirected back.
      sessionStorage.setItem(
        `fixam:${reference}`,
        JSON.stringify({ reference, customer, metadata })
      );

      // Real Opay Checkout: send the browser to the hosted payment page.
      window.location.href = data.checkoutUrl;
    } catch {
      onError("Network error starting payment. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div>
      <div className="rounded-ticket border border-line bg-paper px-4 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/60">Connection fee</span>
          <span className="font-mono text-base font-semibold text-ink">
            ₦{amountNgn.toLocaleString()}
          </span>
        </div>
      </div>

      {status !== "demo" ? (
        <button
          type="button"
          onClick={startCheckout}
          disabled={status === "starting"}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-ticket bg-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-tealDark disabled:opacity-60"
        >
          {status === "starting" ? "Starting checkout..." : "Pay with OPay"}
        </button>
      ) : (
        <div className="mt-4 rounded-ticket border border-signal/30 bg-signal/5 px-4 py-3">
          <p className="text-xs font-medium text-signal">
            DEMO MODE — no OPAY_* keys are set in this deployment yet, so this
            simulates a successful payment instead of opening a real
            checkout. Add your Opay credentials in the environment
            variables to go live.
          </p>
          <button
            type="button"
            onClick={() => onSuccess(reference)}
            className="mt-3 w-full rounded-ticket bg-signal py-2.5 text-sm font-semibold text-white hover:bg-signalDark"
          >
            Simulate successful payment
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="mt-3 w-full text-center text-xs font-medium text-ink/50 hover:text-ink/70"
      >
        Cancel and go back
      </button>
    </div>
  );
}
