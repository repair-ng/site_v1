export type Step =
  | "location"
  | "address"
  | "service"
  | "signup"
  | "payment"
  | "confirmation";

export type FlowState = {
  locationId: string | null;
  address: string;
  serviceId: string | null;
  user: {
    name: string;
    phone: string;
    email: string;
  } | null;
  paymentReference: string | null;
};

export const initialFlowState: FlowState = {
  locationId: null,
  address: "",
  serviceId: null,
  user: null,
  paymentReference: null,
};
