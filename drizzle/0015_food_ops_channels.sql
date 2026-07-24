-- W3.B Food ops: pickup / delivery / dine-in channels + ticket board
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "food_pickup_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "food_delivery_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "food_dine_in_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "food_pickup_instructions" text;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "food_delivery_instructions" text;

CREATE TABLE IF NOT EXISTS "food_tables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "label" varchar(40) NOT NULL,
  "code" varchar(20) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "food_tables_business_code_idx"
  ON "food_tables" ("business_id", "code");

CREATE TABLE IF NOT EXISTS "food_order_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "order_code" varchar(20) NOT NULL,
  "channel" varchar(20) NOT NULL,
  "status" varchar(24) DEFAULT 'new' NOT NULL,
  "table_id" uuid REFERENCES "food_tables"("id") ON DELETE SET NULL,
  "table_label" varchar(40),
  "items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "total" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "customer_name" varchar(120),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "food_order_tickets_business_status_idx"
  ON "food_order_tickets" ("business_id", "status");
