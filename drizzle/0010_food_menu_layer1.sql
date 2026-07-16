-- W1.C Food Layer 1: digital menu display (platform config; orders via WhatsApp)
CREATE TABLE IF NOT EXISTS "menu_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "name" varchar(120) NOT NULL,
  "description" text,
  "section" varchar(60) DEFAULT 'Mains' NOT NULL,
  "price" integer DEFAULT 0 NOT NULL,
  "is_veg" boolean DEFAULT true NOT NULL,
  "is_available" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "image_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "menu_items_business_idx" ON "menu_items" ("business_id");
