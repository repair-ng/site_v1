"use client";

import { useState } from "react";
import { LocationStep } from "@/components/steps/LocationStep";
import { AddressStep } from "@/components/steps/AddressStep";
import { ServiceStep } from "@/components/steps/ServiceStep";
import { SignupStep } from "@/components/steps/SignupStep";
import { PaymentStep } from "@/components/steps/PaymentStep";
import { ConfirmationStep } from "@/components/steps/ConfirmationStep";
import { FlowState, initialFlowState, Step } from "@/lib/flow";

export default function Home() {
  const [step, setStep] = useState<Step>("location");
  const [flow, setFlow] = useState<FlowState>(initialFlowState);

  function update(patch: Partial<FlowState>) {
    setFlow((prev) => ({ ...prev, ...patch }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-navy px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        
        <span className="font-display text-xl font-semibold tracking-tight text-white">
          RE
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal font-display text-lg font-bold text-white">
          PAIR
        </div>
      </div>

      {step === "location" && (
        <LocationStep
          locationId={flow.locationId}
          onSelect={(id) => update({ locationId: id })}
          onNext={() => setStep("address")}
        />
      )}

      {step === "address" && (
        <AddressStep
          locationId={flow.locationId}
          address={flow.address}
          onChange={(address) => update({ address })}
          onNext={() => setStep("service")}
          onBack={() => setStep("location")}
        />
      )}

      {step === "service" && (
        <ServiceStep
          serviceId={flow.serviceId}
          onSelect={(id) => update({ serviceId: id })}
          onNext={() => setStep("signup")}
          onBack={() => setStep("address")}
        />
      )}

      {step === "signup" && (
        <SignupStep
          onComplete={(user) => {
            update({ user });
            setStep("payment");
          }}
          onBack={() => setStep("service")}
        />
      )}

      {step === "payment" && (
        <PaymentStep
          flow={flow}
          onSuccess={(reference) => {
            update({ paymentReference: reference });
            setStep("confirmation");
          }}
          onBack={() => setStep("signup")}
        />
      )}

      {step === "confirmation" && <ConfirmationStep flow={flow} />}

      <p className="mt-10 text-center text-xs text-white/30">
        RE-PAIR connects you to independent repairmen. Payments are handled by
        our checkout partner and are non-refundable once a repairman is
        assigned.
      </p>
    </main>
  );
}
