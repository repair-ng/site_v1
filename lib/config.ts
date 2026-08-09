// ---------------------------------------------------------------------------
// RE-PAIR — app configuration
// Everything you're likely to want to change lives in this one file:
// the list of live locations, the list of repair services, the connection
// fee, and the WhatsApp number that receives the handoff message.
// ---------------------------------------------------------------------------

export type Location = {
  id: string;
  name: string; // e.g. "Ikeja, Lagos"
};

// Locations you currently cover. Add/remove freely — the searchable
// dropdown on the home screen is generated from this list.
export const LOCATIONS: Location[] = [
  { id: "ikeja", name: "Ikeja, Lagos" },
  { id: "yaba", name: "Yaba, Lagos" },
  { id: "surulere", name: "Surulere, Lagos" },
  { id: "lekki", name: "Lekki, Lagos" },
  { id: "ajah", name: "Ajah, Lagos" },
  { id: "ikorodu", name: "Ikorodu, Lagos" },
  { id: "victoria-island", name: "Victoria Island, Lagos" },
  { id: "festac", name: "Festac Town, Lagos" },
  { id: "abuja-central", name: "Abuja Central, FCT" },
  { id: "wuse", name: "Wuse, Abuja" },
];

// Images shown in the auto-scrolling banner at the top of the landing page.
// Ships with the placeholder illustrations in /public/images/hero — drop
// your own photos of repairmen at work into that folder (or anywhere in
// /public) and update the paths below. Each entry needs a `src` (path
// under /public, starting with "/") and descriptive `alt` text.
export type HeroImage = { src: string; alt: string };

export const HERO_IMAGES: HeroImage[] = [
  { src: "/images/hero/autoRepairMan.png", alt: "Technician repairing a smartphone" },
  { src: "/images/hero/phoneRepairMan.png", alt: "Repairman servicing a home appliance" },
  { src: "/images/hero/acRepairMan.png", alt: "Technician servicing an air conditioner" },
  { src: "/images/hero/electricalRepairMan.png", alt: "Electrician fixing household wiring" },
];

export type Service = {
  id: string;
  name: string;
  description?: string;
};

// Repair categories you currently support. Shown as a dropdown on the
// service-selection screen.
export const SERVICES: Service[] = [
  { id: "phone", name: "Phone & tablet repair", description: "Cracked screens, batteries, charging ports" },
  { id: "laptop", name: "Laptop & computer repair", description: "Hardware faults, screen, keyboard" },
  { id: "ac", name: "Air conditioner repair", description: "Servicing, gas refill, faults" },
  { id: "fridge", name: "Fridge & freezer repair", description: "Cooling issues, compressor faults" },
  { id: "washing-machine", name: "Washing machine repair", description: "Not spinning, leaks, drainage" },
  { id: "generator", name: "Generator repair", description: "Servicing and fault diagnosis" },
  { id: "electrical", name: "Electrical wiring & sockets", description: "Wiring faults, sockets, switches" },
  { id: "plumbing", name: "Plumbing", description: "Pipes, taps, leaks, blockages" },
  { id: "tv", name: "TV & home electronics", description: "Screen, sound, power faults" },
];

// The flat connection fee charged before the user is handed off to a
// repairman, in Naira.
export const CONNECTION_FEE_NGN = 100;

// The WhatsApp number (middleman line) that every paid connection is routed
// to. Use the international format without "+" or leading zeros,
// e.g. Nigerian number 0803 123 4567 -> "2348031234567".
export const WHATSAPP_NUMBER = "08162510102";

// Builds the pre-filled WhatsApp message the user's browser opens after a
// successful payment, so the middleman immediately has what they need.
export function buildWhatsAppMessage(params: {
  locationName: string;
  address: string;
  serviceName: string;
  reference: string;
}) {
  const { locationName, address, serviceName, reference } = params;
  return (
    `Hello, I'd like to be connected to a repairman.\n\n` +
    `Service needed: ${serviceName}\n` +
    `Location: ${locationName}\n` +
    `Address: ${address}\n` +
    `Payment reference: ${reference}`
  );
}

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Message a repairman sends (via the same WhatsApp line) when they tap
// "I'll take this job" on the job board at /repairmen.
export function buildJobClaimMessage(params: { jobId: string; summary: string }) {
  return (
    `Hi, I'd like to take this job.\n\n` +
    `Job ref: ${params.jobId}\n` +
    `${params.summary}`
  );
}
