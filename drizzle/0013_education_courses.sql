-- W2.C Education: course catalogue + YouTube-only media
CREATE TABLE IF NOT EXISTS "courses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "title" varchar(160) NOT NULL,
  "description" text,
  "subject" varchar(80) DEFAULT 'General' NOT NULL,
  "mode" varchar(40) DEFAULT 'tuition' NOT NULL,
  "fee_label" varchar(80),
  "fee_amount" integer,
  "youtube_url" text,
  "youtube_video_id" varchar(20),
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "courses_business_idx" ON "courses" ("business_id");
