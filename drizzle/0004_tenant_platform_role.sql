-- Platform account role on tenants (source of truth for login).
-- 'tenant' = platform client (business owner)
-- 'superadmin' = Artix operator
-- Session.role is copied from tenants.role at login — not from SUPERADMIN_EMAIL env.

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'tenant' NOT NULL;--> statement-breakpoint

-- Default everyone to platform client first
UPDATE "tenants" SET "role" = 'tenant', "updated_at" = now();--> statement-breakpoint

-- Seed / bootstrap platform superadmin only (phone 9999999999 or admin@alinks.online)
UPDATE "tenants"
SET "role" = 'superadmin', "tier" = 'enterprise', "status" = 'active', "updated_at" = now()
WHERE "phone" = '9999999999'
   OR lower("email") = 'admin@alinks.online'
   OR lower("email") = 'benjamin@alinks.online';--> statement-breakpoint

-- Keep Gmail test account as client (explicit)
UPDATE "tenants"
SET "role" = 'tenant', "updated_at" = now()
WHERE lower("email") = 'artixgeneration@gmail.com';--> statement-breakpoint

-- Align all sessions with tenants.role
UPDATE "sessions" AS s
SET "role" = t."role"
FROM "tenants" AS t
WHERE s."tenant_id" = t."id";
