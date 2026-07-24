-- W3.C Analytics lite — aggregated page views + link clicks (no client PII)
CREATE TABLE IF NOT EXISTS "analytics_daily" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "day" date NOT NULL,
  "event_type" varchar(24) NOT NULL,
  "path_key" varchar(160) NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "analytics_daily_biz_day_event_path"
  ON "analytics_daily" ("business_id", "day", "event_type", "path_key");

CREATE INDEX IF NOT EXISTS "analytics_daily_biz_day_idx"
  ON "analytics_daily" ("business_id", "day");
