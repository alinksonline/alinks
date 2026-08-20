-- Product vs service fulfillment + tenant post-purchase policy
ALTER TABLE "store_products"
  ADD COLUMN IF NOT EXISTS "product_type" varchar(20) NOT NULL DEFAULT 'physical';
ALTER TABLE "store_products"
  ADD COLUMN IF NOT EXISTS "delivery_mode" varchar(20) NOT NULL DEFAULT 'location';

ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "customer_cancel_orders" boolean NOT NULL DEFAULT true;
ALTER TABLE "businesses"
  ADD COLUMN IF NOT EXISTS "customer_modify_orders" boolean NOT NULL DEFAULT false;
