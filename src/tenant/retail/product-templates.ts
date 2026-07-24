/** Starter products for retail storefront MVP (open taxonomy). */

export type ProductTemplate = {
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  brand?: string;
  sku: string;
  stock: number;
  sortOrder: number;
};

export const RETAIL_PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: "Steel water bottle 1L",
    description: "Insulated steel bottle",
    price: 399,
    mrp: 499,
    category: "Kitchen",
    brand: "House",
    sku: "KIT-BOT-1L",
    stock: 40,
    sortOrder: 1,
  },
  {
    name: "Cotton T-shirt M",
    description: "Unisex soft cotton tee",
    price: 449,
    mrp: 599,
    category: "Fashion",
    brand: "Local",
    sku: "FAS-TEE-M",
    stock: 30,
    sortOrder: 2,
  },
  {
    name: "USB-C cable 1m",
    description: "Fast charge data cable",
    price: 199,
    mrp: 299,
    category: "Electronics",
    brand: "Generic",
    sku: "ELE-USB-C1",
    stock: 80,
    sortOrder: 3,
  },
  {
    name: "Handwash 250ml",
    description: "Mild liquid handwash",
    price: 89,
    mrp: 99,
    category: "Grocery",
    brand: "CleanCare",
    sku: "GRO-HW-250",
    stock: 100,
    sortOrder: 4,
  },
  {
    name: "LED bulb 9W",
    description: "Cool white LED",
    price: 129,
    mrp: 179,
    category: "Home",
    brand: "BrightLite",
    sku: "HOM-LED-9",
    stock: 60,
    sortOrder: 5,
  },
  {
    name: "Notebook A5 (pack of 3)",
    description: "Ruled notebooks",
    price: 149,
    category: "Stationery",
    brand: "WriteRight",
    sku: "STA-NB-A5",
    stock: 50,
    sortOrder: 6,
  },
  {
    name: "Face cream 50g",
    description: "Daily moisturizer",
    price: 249,
    mrp: 299,
    category: "Beauty",
    brand: "Glow",
    sku: "BEA-CRM-50",
    stock: 25,
    sortOrder: 7,
  },
  {
    name: "Kids building blocks",
    description: "Colour set for ages 3+",
    price: 599,
    mrp: 799,
    category: "Toys",
    brand: "PlayMax",
    sku: "TOY-BLK-01",
    stock: 20,
    sortOrder: 8,
  },
];

export const KIRANA_PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: "Toor dal 1kg",
    description: "Unpolished toor dal",
    price: 160,
    category: "Pulses",
    brand: "Loose",
    sku: "KIR-DAL-1",
    stock: 50,
    sortOrder: 1,
  },
  {
    name: "Sunflower oil 1L",
    description: "Refined cooking oil",
    price: 145,
    mrp: 160,
    category: "Oils",
    brand: "Fortune",
    sku: "KIR-OIL-1",
    stock: 40,
    sortOrder: 2,
  },
  {
    name: "Amul Taaza 1L",
    description: "Toned milk pouch",
    price: 66,
    category: "Dairy",
    brand: "Amul",
    sku: "KIR-MILK-1",
    stock: 30,
    sortOrder: 3,
  },
  {
    name: "Maggi 2-min 70g",
    description: "Masala noodles",
    price: 14,
    category: "Snacks",
    brand: "Nestlé",
    sku: "KIR-MAG-70",
    stock: 100,
    sortOrder: 4,
  },
  {
    name: "Tata Salt 1kg",
    description: "Iodised salt",
    price: 28,
    category: "Staples",
    brand: "Tata",
    sku: "KIR-SALT-1",
    stock: 80,
    sortOrder: 5,
  },
  {
    name: "Britannia Good Day 100g",
    description: "Butter cookies",
    price: 30,
    category: "Snacks",
    brand: "Britannia",
    sku: "KIR-GD-100",
    stock: 60,
    sortOrder: 6,
  },
];
