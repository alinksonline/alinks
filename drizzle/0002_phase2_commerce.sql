CREATE TABLE IF NOT EXISTS "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"razorpay_order_id" varchar(64),
	"amount_paise" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'INR' NOT NULL,
	"status" varchar(20) DEFAULT 'created' NOT NULL,
	"payment_method" varchar(20) DEFAULT 'upi' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE IF NOT EXISTS "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"code" varchar(16) NOT NULL,
	"target_url" varchar(512) NOT NULL,
	"label" varchar(120),
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_links_code_unique" UNIQUE("code")
);
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE IF NOT EXISTS "salon_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"category" varchar(20) DEFAULT 'salon' NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "salon_packages" ADD CONSTRAINT "salon_packages_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE IF NOT EXISTS "write_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"sheet_tab" varchar(40) NOT NULL,
	"row_data" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_retry_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "write_queue" ADD CONSTRAINT "write_queue_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "cod_enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "custom_domain_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "domain_verify_token" varchar(64);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "razorpay_sub_merchant_id" varchar(64);
