-- Wave 2: bookings services capacity + RE Property-Bank
ALTER TABLE "salon_packages" ADD COLUMN IF NOT EXISTS "capacity" integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS "property_listings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "title" varchar(160) NOT NULL,
  "description" text,
  "listing_type" varchar(20) DEFAULT 'sell' NOT NULL,
  "visibility" varchar(20) DEFAULT 'open' NOT NULL,
  "city" varchar(80),
  "locality" varchar(120),
  "price_label" varchar(80),
  "price_amount" integer,
  "bedrooms" integer,
  "area_sqft" integer,
  "image_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "property_listings_business_idx" ON "property_listings" ("business_id");
