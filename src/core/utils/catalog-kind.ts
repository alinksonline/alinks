import type { CatalogProduct } from "@/core/types/commerce";
import { normalizeProductKind } from "@/core/utils/order-fulfillment";

export type CatalogKind = "physical" | "service";

export function catalogKindOf(product: Pick<CatalogProduct, "productType">): CatalogKind {
  return normalizeProductKind(product.productType);
}

export function splitCatalog(products: CatalogProduct[]): {
  physical: CatalogProduct[];
  services: CatalogProduct[];
} {
  const physical: CatalogProduct[] = [];
  const services: CatalogProduct[] = [];
  for (const p of products) {
    if (catalogKindOf(p) === "service") services.push(p);
    else physical.push(p);
  }
  return { physical, services };
}

export function catalogPath(kind: CatalogKind): "products" | "service-shop" {
  return kind === "service" ? "service-shop" : "products";
}

export function catalogTitle(kind: CatalogKind): string {
  return kind === "service" ? "Services" : "Products";
}
