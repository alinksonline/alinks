/** Starter memberships / classes / PT for fitness industry (salon_packages table). */

export type FitnessPackageTemplate = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  paymentMode: "free" | "pay_at_salon" | "pay_then_book";
  capacity: number;
};

export const GYM_PACKAGE_TEMPLATES: FitnessPackageTemplate[] = [
  {
    name: "Trial class (free)",
    description: "One free intro class — book a slot",
    price: 0,
    durationMinutes: 60,
    category: "class",
    paymentMode: "free",
    capacity: 20,
  },
  {
    name: "Monthly membership",
    description: "Full gym access · 30 days",
    price: 1499,
    durationMinutes: 60,
    category: "membership",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Quarterly membership",
    description: "90 days access · best value",
    price: 3999,
    durationMinutes: 60,
    category: "membership",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "HIIT group class",
    description: "High intensity · 45 min",
    price: 299,
    durationMinutes: 45,
    category: "class",
    paymentMode: "free",
    capacity: 15,
  },
  {
    name: "PT starter (4 sessions)",
    description: "Personal training pack",
    price: 4999,
    durationMinutes: 45,
    category: "pt",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
];

export const YOGA_PACKAGE_TEMPLATES: FitnessPackageTemplate[] = [
  {
    name: "Trial yoga class",
    description: "First class free — book slot",
    price: 0,
    durationMinutes: 60,
    category: "class",
    paymentMode: "free",
    capacity: 20,
  },
  {
    name: "Monthly unlimited yoga",
    description: "All group classes · 30 days",
    price: 1999,
    durationMinutes: 60,
    category: "membership",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Morning flow",
    description: "Drop-in class · 60 min",
    price: 350,
    durationMinutes: 60,
    category: "class",
    paymentMode: "free",
    capacity: 18,
  },
  {
    name: "1:1 private yoga (session)",
    description: "Private session with instructor",
    price: 1200,
    durationMinutes: 60,
    category: "pt",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
];

export const PT_PACKAGE_TEMPLATES: FitnessPackageTemplate[] = [
  {
    name: "Free consult call",
    description: "15-min goals chat",
    price: 0,
    durationMinutes: 15,
    category: "pt",
    paymentMode: "free",
    capacity: 1,
  },
  {
    name: "PT single session",
    description: "45-min personal training",
    price: 999,
    durationMinutes: 45,
    category: "pt",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "PT pack (8 sessions)",
    description: "Save on multi-session pack",
    price: 6999,
    durationMinutes: 45,
    category: "pt",
    paymentMode: "pay_at_salon",
    capacity: 1,
  },
  {
    name: "Trial outdoor session",
    description: "First outdoor workout free",
    price: 0,
    durationMinutes: 45,
    category: "class",
    paymentMode: "free",
    capacity: 1,
  },
];

export function templatesForFitnessType(industryType: string): FitnessPackageTemplate[] {
  switch (industryType) {
    case "yoga_studio":
    case "dance_fitness":
      return YOGA_PACKAGE_TEMPLATES;
    case "personal_trainer":
    case "sports_coaching":
    case "martial_arts":
      return PT_PACKAGE_TEMPLATES;
    case "gym":
    case "fitness_studio":
    default:
      return GYM_PACKAGE_TEMPLATES;
  }
}
