-- W3.A Automotive: vehicle inventory (enquiry-only, no car checkout)
CREATE TABLE IF NOT EXISTS "vehicle_listings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "title" varchar(160) NOT NULL,
  "description" text,
  "condition" varchar(20) DEFAULT 'used' NOT NULL,
  "visibility" varchar(20) DEFAULT 'open' NOT NULL,
  "make" varchar(80),
  "model" varchar(80),
  "year" integer,
  "fuel" varchar(40),
  "km_driven" integer,
  "price_label" varchar(80),
  "price_amount" integer,
  "city" varchar(80),
  "image_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "vehicle_listings_business_idx" ON "vehicle_listings" ("business_id");
