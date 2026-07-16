/** Workshop / detailing packages → salon_packages table. */

export type AutoServiceTemplate = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  paymentMode: "free" | "pay_at_salon" | "pay_then_book";
  capacity: number;
};

export const WORKSHOP_SERVICE_TEMPLATES: AutoServiceTemplate[] = [
  {
    name: "General service",
    description: "Oil + filter + basic checks",
    price: 2499,
    durationMinutes: 120,
    category: "service",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "AC service",
    description: "Gas check + filter clean",
    price: 1999,
    durationMinutes: 90,
    category: "service",
    paymentMode: "free",
    capacity: 1,
  },
  {
    name: "Free inspection",
    description: "15-point check — book a free slot",
    price: 0,
    durationMinutes: 30,
    category: "service",
    paymentMode: "free",
    capacity: 1,
  },
  {
    name: "Express wash",
    description: "Exterior wash + vacuum",
    price: 399,
    durationMinutes: 45,
    category: "detailing",
    paymentMode: "free",
    capacity: 2,
  },
];

export const DETAILING_SERVICE_TEMPLATES: AutoServiceTemplate[] = [
  {
    name: "Basic wash & vacuum",
    description: "Exterior + interior vacuum",
    price: 499,
    durationMinutes: 60,
    category: "detailing",
    paymentMode: "free",
    capacity: 2,
  },
  {
    name: "Full detailing",
    description: "Polish + interior deep clean",
    price: 3499,
    durationMinutes: 240,
    category: "detailing",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Ceramic coat enquiry slot",
    description: "Free consult + quote",
    price: 0,
    durationMinutes: 30,
    category: "detailing",
    paymentMode: "free",
    capacity: 1,
  },
];

export function serviceTemplatesForAutoType(industryType: string): AutoServiceTemplate[] {
  if (industryType === "car_detailing") return DETAILING_SERVICE_TEMPLATES;
  return WORKSHOP_SERVICE_TEMPLATES;
}
