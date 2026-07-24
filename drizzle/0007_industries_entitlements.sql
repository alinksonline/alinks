-- Industries F0 + Presence MVP: industry registry fields, entitlements, Superadmin overrides.
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "industry_group" varchar(40) NOT NULL DEFAULT 'general';
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "industry_type" varchar(40) NOT NULL DEFAULT 'general';
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "creator_partner_tier" varchar(10);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "creator_partner_accepted_at" timestamp with time zone;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "creator_discount_pct_monthly" integer;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "creator_discount_pct_yearly" integer;

-- Backfill industry_group / industry_type from legacy vertical.
UPDATE "businesses" SET
  "industry_group" = CASE "vertical"
    WHEN 'presence' THEN 'presence'
    WHEN 'salon' THEN 'salon_beauty'
    WHEN 'beauty' THEN 'salon_beauty'
    WHEN 'kirana' THEN 'retail'
    WHEN 'grocery' THEN 'retail'
    WHEN 'ecommerce' THEN 'retail'
    WHEN 'restaurant' THEN 'food'
    WHEN 'clinic' THEN 'bookings'
    WHEN 'pharmacy' THEN 'pharmacy'
    ELSE 'general'
  END,
  "industry_type" = CASE "vertical"
    WHEN 'presence' THEN 'business_profile_only'
    WHEN 'salon' THEN 'salon'
    WHEN 'beauty' THEN 'beauty_spa'
    WHEN 'kirana' THEN 'kirana'
    WHEN 'grocery' THEN 'kirana'
    WHEN 'ecommerce' THEN 'ecommerce'
    WHEN 'restaurant' THEN 'restaurant'
    WHEN 'clinic' THEN 'clinic'
    WHEN 'pharmacy' THEN 'pharmacy_otc'
    ELSE 'general'
  END
WHERE "industry_group" = 'general' AND "vertical" IS NOT NULL AND "vertical" <> 'general';

CREATE TABLE IF NOT EXISTS "tenant_module_entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "sku" varchar(80) NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "source" varchar(40) DEFAULT 'onboarding' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_module_entitlements_business_sku"
  ON "tenant_module_entitlements" ("business_id", "sku");

CREATE TABLE IF NOT EXISTS "module_price_overrides" (
  "sku" varchar(80) PRIMARY KEY NOT NULL,
  "monthly_price" integer,
  "yearly_price" integer,
  "enabled" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "industry_settings" (
  "industry_group" varchar(40) PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "creator_discount_pct_monthly" integer,
  "creator_discount_pct_yearly" integer,
  "creator_launch_coupon" varchar(40),
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
