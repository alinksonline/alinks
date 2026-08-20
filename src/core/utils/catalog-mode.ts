export type CatalogMode = "products" | "services" | "both";

export function normalizeCatalogMode(value: string | null | undefined): CatalogMode {
  if (value === "products" || value === "services") return value;
  return "both";
}

export function catalogModeShowsProducts(mode: CatalogMode): boolean {
  return mode === "products" || mode === "both";
}

export function catalogModeShowsServices(mode: CatalogMode): boolean {
  return mode === "services" || mode === "both";
}

export const DELIVERY_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
  "failed",
  "pickup_ready",
  "not_required",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export function isDeliveryStatus(value: string): value is DeliveryStatus {
  return (DELIVERY_STATUSES as readonly string[]).includes(value);
}

export function deliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    failed: "Failed",
    pickup_ready: "Ready for pickup",
    not_required: "No delivery",
  };
  return labels[status] ?? status;
}
