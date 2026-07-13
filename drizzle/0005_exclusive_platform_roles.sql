-- Enforce exclusive platform roles: tenant XOR superadmin (never both / never other values).
ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_role_exclusive";--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_role_exclusive" CHECK ("role" IN ('tenant', 'superadmin'));--> statement-breakpoint

ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_role_exclusive";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_role_exclusive" CHECK ("role" IN ('tenant', 'superadmin'));
