export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  category?: string;
  /** Optional multi-brand tag */
  brand?: string;
  description?: string;
  stock?: number;
  sku?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderPayload {
  orderId: string;
  businessId: string;
  items: CartItem[];
  total: number;
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "pending" | "paid" | "cod_pending";
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  createdAt: string;
}

export interface SalonPackage {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: "salon" | "beauty";
  imageUrl?: string;
  isActive: boolean;
}

export interface BookingPayload {
  bookingId: string;
  businessId: string;
  packageId: string;
  packageName: string;
  price: number;
  slotDate: string;
  slotTime: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: "pending" | "paid";
  createdAt: string;
}