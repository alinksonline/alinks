-- W1.B+: soft holds for pay-then-book (10–15 min)
ALTER TABLE "appointment_holds" ADD COLUMN IF NOT EXISTS "hold_expires_at" timestamp with time zone;
ALTER TABLE "appointment_holds" ADD COLUMN IF NOT EXISTS "checkout_session_id" uuid;
