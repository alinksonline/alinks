import type { SalonPackage } from "@/core/types/commerce";

export const SALON_PACKAGE_TEMPLATES: Omit<SalonPackage, "id" | "businessId">[] = [
  { name: "Haircut + Wash", description: "Classic cut with shampoo and blow dry", price: 499, durationMinutes: 45, category: "salon", isActive: true },
  { name: "Hair Spa", description: "Deep conditioning hair spa treatment", price: 899, durationMinutes: 60, category: "salon", isActive: true },
  { name: "Global Colour", description: "Full head global hair colour", price: 2499, durationMinutes: 120, category: "salon", isActive: true },
  { name: "Highlights", description: "Partial highlights with toner", price: 3499, durationMinutes: 150, category: "salon", isActive: true },
  { name: "Keratin Treatment", description: "Smoothening keratin treatment", price: 4999, durationMinutes: 180, category: "salon", isActive: true },
  { name: "Bridal Makeup", description: "Full bridal makeup with hair styling", price: 8999, durationMinutes: 180, category: "beauty", isActive: true },
  { name: "Party Makeup", description: "Evening party makeup look", price: 2999, durationMinutes: 90, category: "beauty", isActive: true },
  { name: "Manicure + Pedicure", description: "Classic mani-pedi combo", price: 799, durationMinutes: 75, category: "beauty", isActive: true },
  { name: "Facial Glow", description: "Fruit facial with cleanup", price: 699, durationMinutes: 60, category: "beauty", isActive: true },
  { name: "Threading Combo", description: "Eyebrow, upper lip, forehead", price: 199, durationMinutes: 20, category: "beauty", isActive: true },
  { name: "Waxing Full Legs", description: "Full legs waxing", price: 599, durationMinutes: 45, category: "beauty", isActive: true },
  { name: "Head Massage", description: "Relaxing oil head massage", price: 399, durationMinutes: 30, category: "salon", isActive: true },
];