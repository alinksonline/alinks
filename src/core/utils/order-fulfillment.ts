import type { CartItem, CatalogProduct } from "@/core/types/commerce";

export type ProductKind = "physical" | "service";
export type ServicePlace = "doorstep" | "location";

/** Physical goods and doorstep services need an address. At-shop services do not. */
export function itemRequiresAddress(item: {
  productType?: string | null;
  deliveryMode?: string | null;
}): boolean {
  const kind = normalizeProductKind(item.productType);
  if (kind === "physical") return true;
  return normalizeServicePlace(item.deliveryMode) === "doorstep";
}

export function cartRequiresAddress(
  items: Array<{ productType?: string | null; deliveryMode?: string | null }>,
): boolean {
  return items.some(itemRequiresAddress);
}

/** Copy catalog price/type onto cart lines. Returns null if any productId is unknown. */
export function resolveCartAgainstCatalog(
  items: CartItem[],
  catalog: CatalogProduct[],
): CartItem[] | null {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const out: CartItem[] = [];
  for (const item of items) {
    const qty = Math.floor(Number(item.qty) || 0);
    if (qty <= 0) continue;
    const product = byId.get(item.productId);
    if (!product) return null;
    out.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: Math.min(qty, 99),
      productType: product.productType,
      deliveryMode: product.deliveryMode,
    });
  }
  return out;
}

export function normalizeProductKind(value: string | null | undefined): ProductKind {
  return value?.toLowerCase() === "service" ? "service" : "physical";
}

export function normalizeServicePlace(value: string | null | undefined): ServicePlace {
  return value?.toLowerCase() === "doorstep" ? "doorstep" : "location";
}

export function fulfillmentLabel(item: {
  productType?: string | null;
  deliveryMode?: string | null;
}): string {
  const kind = normalizeProductKind(item.productType);
  if (kind === "physical") return "Physical item — delivery address required";
  if (normalizeServicePlace(item.deliveryMode) === "doorstep") {
    return "Service at your door — address required";
  }
  return "Service at the shop — no address needed";
}

export function cartFulfillmentSummary(items: CartItem[]): {
  requiresAddress: boolean;
  physicalCount: number;
  doorstepServiceCount: number;
  atLocationServiceCount: number;
} {
  let physicalCount = 0;
  let doorstepServiceCount = 0;
  let atLocationServiceCount = 0;
  for (const item of items) {
    const kind = normalizeProductKind(item.productType);
    if (kind === "physical") physicalCount += 1;
    else if (normalizeServicePlace(item.deliveryMode) === "doorstep") doorstepServiceCount += 1;
    else atLocationServiceCount += 1;
  }
  return {
    requiresAddress: cartRequiresAddress(items),
    physicalCount,
    doorstepServiceCount,
    atLocationServiceCount,
  };
}
