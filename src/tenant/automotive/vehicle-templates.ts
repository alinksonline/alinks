export type VehicleTemplate = {
  title: string;
  description: string;
  condition: "new" | "used" | "two_wheeler";
  visibility: "open" | "teaser" | "private";
  make: string;
  model: string;
  year: number;
  fuel: string;
  kmDriven: number | null;
  priceLabel: string;
  priceAmount: number | null;
  city: string;
  sortOrder: number;
};

export const USED_DEALER_VEHICLES: VehicleTemplate[] = [
  {
    title: "2019 Maruti Swift VXI",
    description: "Single owner · service history · test drive welcome",
    condition: "used",
    visibility: "open",
    make: "Maruti",
    model: "Swift",
    year: 2019,
    fuel: "Petrol",
    kmDriven: 42000,
    priceLabel: "₹5.45 Lakh",
    priceAmount: 545000,
    city: "Pune",
    sortOrder: 1,
  },
  {
    title: "2021 Hyundai Creta SX",
    description: "Diesel · sunroof · price on request",
    condition: "used",
    visibility: "teaser",
    make: "Hyundai",
    model: "Creta",
    year: 2021,
    fuel: "Diesel",
    kmDriven: 28000,
    priceLabel: "On request",
    priceAmount: null,
    city: "Pune",
    sortOrder: 2,
  },
  {
    title: "2020 Honda City ZX",
    description: "Petrol · automatic · clean papers",
    condition: "used",
    visibility: "open",
    make: "Honda",
    model: "City",
    year: 2020,
    fuel: "Petrol",
    kmDriven: 35000,
    priceLabel: "₹9.80 Lakh",
    priceAmount: 980000,
    city: "Mumbai",
    sortOrder: 3,
  },
];

export const NEW_DEALER_VEHICLES: VehicleTemplate[] = [
  {
    title: "Tata Nexon Smart+",
    description: "Ex-showroom range · book test drive",
    condition: "new",
    visibility: "open",
    make: "Tata",
    model: "Nexon",
    year: 2025,
    fuel: "Petrol",
    kmDriven: null,
    priceLabel: "From ₹8.00 Lakh*",
    priceAmount: 800000,
    city: "Bengaluru",
    sortOrder: 1,
  },
  {
    title: "Mahindra XUV 3XO",
    description: "Contact for offers · no online purchase on ALINKS",
    condition: "new",
    visibility: "open",
    make: "Mahindra",
    model: "XUV 3XO",
    year: 2025,
    fuel: "Petrol",
    kmDriven: null,
    priceLabel: "On request",
    priceAmount: null,
    city: "Bengaluru",
    sortOrder: 2,
  },
];

export function vehicleTemplatesForType(industryType: string): VehicleTemplate[] {
  if (industryType === "car_dealer_new") return NEW_DEALER_VEHICLES;
  return USED_DEALER_VEHICLES;
}
