-- Tenant BYO Razorpay: shop owns gateway + settlement; ALINKS is software only.
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "razorpay_key_id" varchar(64);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "razorpay_key_secret_enc" text;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "razorpay_connected_at" timestamp with time zone;
