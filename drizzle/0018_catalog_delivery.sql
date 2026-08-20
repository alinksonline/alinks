-- Tenant catalog page toggle + delivery operations
ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "catalog_mode" varchar(20) NOT NULL DEFAULT 'both';
ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "delivery_ops" varchar(20) NOT NULL DEFAULT 'manual';
ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "delivery_partner_name" varchar(80);
