/** Starter menu for Food Layer 1 (India SMB friendly). */

export type MenuTemplateItem = {
  name: string;
  description: string;
  section: string;
  price: number;
  isVeg: boolean;
  sortOrder: number;
};

export const FOOD_MENU_TEMPLATES: MenuTemplateItem[] = [
  {
    name: "Masala Chai",
    description: "Fresh ginger chai",
    section: "Beverages",
    price: 40,
    isVeg: true,
    sortOrder: 1,
  },
  {
    name: "Filter Coffee",
    description: "South Indian filter coffee",
    section: "Beverages",
    price: 60,
    isVeg: true,
    sortOrder: 2,
  },
  {
    name: "Veg Manchurian",
    description: "Crispy veg balls in spicy gravy",
    section: "Starters",
    price: 180,
    isVeg: true,
    sortOrder: 10,
  },
  {
    name: "Chicken 65",
    description: "Spicy fried chicken bites",
    section: "Starters",
    price: 220,
    isVeg: false,
    sortOrder: 11,
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese in tomato butter gravy",
    section: "Mains",
    price: 280,
    isVeg: true,
    sortOrder: 20,
  },
  {
    name: "Chicken Biryani",
    description: "Dum biryani with raita",
    section: "Mains",
    price: 320,
    isVeg: false,
    sortOrder: 21,
  },
  {
    name: "Veg Thali",
    description: "Dal, sabzi, rice, roti, salad",
    section: "Mains",
    price: 199,
    isVeg: true,
    sortOrder: 22,
  },
  {
    name: "Butter Naan",
    description: "Tandoor naan with butter",
    section: "Breads",
    price: 50,
    isVeg: true,
    sortOrder: 30,
  },
  {
    name: "Jeera Rice",
    description: "Cumin basmati rice",
    section: "Breads",
    price: 120,
    isVeg: true,
    sortOrder: 31,
  },
  {
    name: "Gulab Jamun",
    description: "2 pcs warm gulab jamun",
    section: "Desserts",
    price: 80,
    isVeg: true,
    sortOrder: 40,
  },
];

export const CATERING_MENU_TEMPLATES: MenuTemplateItem[] = [
  {
    name: "Mini Party Pack (10 pax)",
    description: "Starters + mains + dessert for ~10 guests",
    section: "Event packages",
    price: 4999,
    isVeg: true,
    sortOrder: 1,
  },
  {
    name: "Corporate Lunch (per plate)",
    description: "Thali-style corporate lunch",
    section: "Event packages",
    price: 249,
    isVeg: true,
    sortOrder: 2,
  },
  {
    name: "Wedding Veg Buffet (per plate)",
    description: "Multi-course veg buffet",
    section: "Event packages",
    price: 799,
    isVeg: true,
    sortOrder: 3,
  },
  {
    name: "Custom enquiry",
    description: "Tell us date, headcount, and cuisine — we quote on WhatsApp",
    section: "Enquiry",
    price: 0,
    isVeg: true,
    sortOrder: 10,
  },
];
