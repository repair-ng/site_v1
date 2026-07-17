// ---------------------------------------------------------------------------
// Payment gateway contract
//
// Every checkout provider (Opay today, maybe Paystack/Flutterwave tomorrow)
// implements this same prop shape. To switch providers, build a component
// with this signature and change ONE import at the bottom of this file —
// nothing in PaymentStep.tsx or anywhere else needs to change.
// ---------------------------------------------------------------------------

export type PaymentGatewayProps = {
  amountNgn: number;
  reference: string;
  customer: { name: string; phone: string; email: string };
  metadata: Record<string, string>;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

export type PaymentGatewayComponent = (props: PaymentGatewayProps) => JSX.Element;

// --- Active provider --------------------------------------------------------
// Swap this single import to change providers, e.g.:
//   import { OpayCheckout as ActiveGateway } from "./OpayCheckout";
import { PaystackCheckout as ActiveGateway } from "./PaystackCheckout";

export const PaymentGateway: PaymentGatewayComponent = ActiveGateway;
