/** Starter services for bookings industry types (reuses salon_packages table). */

export type BookingServiceTemplate = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  paymentMode: "free" | "pay_at_salon" | "pay_then_book";
  capacity: number;
};

export const CLINIC_SERVICE_TEMPLATES: BookingServiceTemplate[] = [
  {
    name: "General consultation",
    description: "First visit consult — no diagnosis stored on ALINKS",
    price: 500,
    durationMinutes: 20,
    category: "clinic",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Follow-up visit",
    description: "Short follow-up slot",
    price: 300,
    durationMinutes: 15,
    category: "clinic",
    paymentMode: "free",
    capacity: 1,
  },
  {
    name: "Health check package",
    description: "Basic screening package (pay at clinic)",
    price: 1499,
    durationMinutes: 45,
    category: "clinic",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
];

export const CONSULT_SERVICE_TEMPLATES: BookingServiceTemplate[] = [
  {
    name: "30-min consult",
    description: "Video or in-person consult",
    price: 999,
    durationMinutes: 30,
    category: "consult",
    paymentMode: "free",
    capacity: 1,
  },
  {
    name: "60-min deep dive",
    description: "Extended strategy session",
    price: 1999,
    durationMinutes: 60,
    category: "consult",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Intro call (free)",
    description: "15-minute discovery",
    price: 0,
    durationMinutes: 15,
    category: "consult",
    paymentMode: "free",
    capacity: 1,
  },
];

export const LEGAL_SERVICE_TEMPLATES: BookingServiceTemplate[] = [
  {
    name: "Legal consultation (30 min)",
    description: "Initial consult — not full case management",
    price: 1500,
    durationMinutes: 30,
    category: "legal",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Document review slot",
    description: "Bring documents for review",
    price: 2500,
    durationMinutes: 45,
    category: "legal",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
];

export const VENUE_SERVICE_TEMPLATES: BookingServiceTemplate[] = [
  {
    name: "Half-day hall (morning)",
    description: "9 AM – 2 PM · up to 100 guests",
    price: 15000,
    durationMinutes: 300,
    category: "venue",
    paymentMode: "pay_at_salon",
    capacity: 100,
  },
  {
    name: "Full-day banquet",
    description: "9 AM – 10 PM · up to 200 guests",
    price: 45000,
    durationMinutes: 720,
    category: "venue",
    paymentMode: "pay_at_salon",
    capacity: 200,
  },
  {
    name: "Evening lawn package",
    description: "4 PM – 11 PM · up to 150 guests",
    price: 35000,
    durationMinutes: 420,
    category: "venue",
    paymentMode: "free",
    capacity: 150,
  },
];

export function templatesForBookingType(industryType: string): BookingServiceTemplate[] {
  switch (industryType) {
    case "clinic":
    case "clinic_healthcare":
      return CLINIC_SERVICE_TEMPLATES;
    case "legal_lawyers":
      return LEGAL_SERVICE_TEMPLATES;
    case "venue_banquet":
      return VENUE_SERVICE_TEMPLATES;
    case "professional_consult":
    default:
      return CONSULT_SERVICE_TEMPLATES;
  }
}
