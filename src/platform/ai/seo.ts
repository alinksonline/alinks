export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
}

export function buildLocalBusinessSchema(input: {
  name: string;
  handle: string;
  vertical: string;
  url: string;
  phone?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: input.name,
    url: input.url,
    "@id": input.url,
    description: `${input.name} — ${input.vertical} services`,
    telephone: input.phone,
    areaServed: "IN",
  };
}

export function buildProductSchema(input: {
  name: string;
  price: number;
  currency?: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency ?? "INR",
      url: input.url,
    },
  };
}