-- Sprint B: appointments core + salon free booking + Google Calendar Connect (free)
ALTER TABLE "salon_packages" ADD COLUMN IF NOT EXISTS "payment_mode" varchar(20) NOT NULL DEFAULT 'free';
ALTER TABLE "staff_members" ADD COLUMN IF NOT EXISTS "weekly_hours" jsonb;

CREATE TABLE IF NOT EXISTS "appointment_holds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "booking_id" uuid NOT NULL UNIQUE,
  "package_id" uuid REFERENCES "salon_packages"("id") ON DELETE SET NULL,
  "package_name" varchar(120) NOT NULL,
  "staff_id" uuid REFERENCES "staff_members"("id") ON DELETE SET NULL,
  "staff_name" varchar(120),
  "slot_date" varchar(10) NOT NULL,
  "slot_time" varchar(5) NOT NULL,
  "duration_minutes" integer DEFAULT 60 NOT NULL,
  "price" integer DEFAULT 0 NOT NULL,
  "payment_mode" varchar(20) DEFAULT 'free' NOT NULL,
  "payment_status" varchar(20) DEFAULT 'none' NOT NULL,
  "status" varchar(20) DEFAULT 'confirmed' NOT NULL,
  "channel" varchar(20) DEFAULT 'web' NOT NULL,
  "google_event_id" varchar(128),
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "appointment_holds_business_date_idx"
  ON "appointment_holds" ("business_id", "slot_date");

CREATE TABLE IF NOT EXISTS "google_calendar_connectors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL UNIQUE REFERENCES "businesses"("id") ON DELETE CASCADE,
  "google_email" varchar(255),
  "refresh_token_enc" text,
  "calendar_id" varchar(255) DEFAULT 'primary',
  "is_active" boolean DEFAULT false NOT NULL,
  "connection_mode" varchar(20) DEFAULT 'stub' NOT NULL,
  "last_sync_at" timestamp with time zone,
  "last_error" text,
  "connected_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
