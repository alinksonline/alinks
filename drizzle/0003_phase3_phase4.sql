CREATE TABLE IF NOT EXISTS "ai_usage" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "month_key" varchar(7) NOT NULL,
  "task_type" varchar(40) NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade;
CREATE TABLE IF NOT EXISTS "promo_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(32) NOT NULL UNIQUE,
  "description" varchar(200),
  "discount_months" integer DEFAULT 1 NOT NULL,
  "max_redemptions" integer DEFAULT 100 NOT NULL,
  "redemption_count" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "promo_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "promo_code_id" uuid NOT NULL,
  "tenant_id" uuid NOT NULL,
  "redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade;
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade;
CREATE TABLE IF NOT EXISTS "staff_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "name" varchar(120) NOT NULL,
  "role" varchar(40) DEFAULT 'stylist' NOT NULL,
  "slot_capacity" integer DEFAULT 1 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade;
CREATE TABLE IF NOT EXISTS "clinic_licenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "license_number" varchar(64) NOT NULL,
  "doctor_name" varchar(120) NOT NULL,
  "council" varchar(80) DEFAULT 'NMC' NOT NULL,
  "document_url" text,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "clinic_licenses" ADD CONSTRAINT "clinic_licenses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade;
CREATE TABLE IF NOT EXISTS "ad_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid,
  "placement" varchar(40) DEFAULT 'tenant_footer' NOT NULL,
  "advertiser" varchar(120) NOT NULL,
  "creative_url" text,
  "target_url" text NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "ad_slots" ADD CONSTRAINT "ad_slots_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null;
CREATE TABLE IF NOT EXISTS "supabase_connectors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "project_url" text NOT NULL,
  "anon_key_ref" varchar(64) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "supabase_connectors" ADD CONSTRAINT "supabase_connectors_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "ai_credits" integer DEFAULT 0 NOT NULL;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "locale" varchar(10) DEFAULT 'en' NOT NULL;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "region" varchar(4) DEFAULT 'IN' NOT NULL;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "ads_opt_in" boolean DEFAULT false NOT NULL;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "active_business_id" uuid;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "seo_meta" jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "slot_capacity" integer DEFAULT 1 NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "ads_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "vertical_gate_status" varchar(20) DEFAULT 'approved' NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "pharmacy_otc_approved" boolean DEFAULT false NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "grocery_fresh_mode" boolean DEFAULT false NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "meta_catalog_enabled" boolean DEFAULT false NOT NULL;
