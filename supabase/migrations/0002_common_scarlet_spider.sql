CREATE TABLE "app_opportunity_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"insurance_company" text NOT NULL,
	"insurance_type" "app_insurance_type_enum" NOT NULL,
	"monthly_premium" numeric(12, 2),
	"expected_commission" numeric(12, 2),
	"notes" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_opportunity_products" ADD CONSTRAINT "app_opportunity_products_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_opportunity_products" ADD CONSTRAINT "app_opportunity_products_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;