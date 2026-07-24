-- W1.D Retail storefront MVP: product catalog + trade mode
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "trade_mode" varchar(20) NOT NULL DEFAULT 'retail';

CREATE TABLE IF NOT EXISTS "store_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "name" varchar(160) NOT NULL,
  "description" text,
  "price" integer DEFAULT 0 NOT NULL,
  "mrp" integer,
  "category" varchar(80) DEFAULT 'General' NOT NULL,
  "brand" varchar(80),
  "sku" varchar(64),
  "stock" integer,
  "image_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "store_products_business_idx" ON "store_products" ("business_id");
