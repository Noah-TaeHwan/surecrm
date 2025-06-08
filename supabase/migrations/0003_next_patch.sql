CREATE TYPE "public"."app_contract_document_type_enum" AS ENUM('contract', 'policy', 'application', 'identification', 'medical_report', 'vehicle_registration', 'other_document');--> statement-breakpoint
CREATE TYPE "public"."app_contract_status_enum" AS ENUM('draft', 'active', 'cancelled', 'expired', 'suspended');--> statement-breakpoint
CREATE TABLE "app_client_contract_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_display_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"document_type" "app_contract_document_type_enum" NOT NULL,
	"description" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_insurance_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"opportunity_product_id" uuid,
	"product_name" text NOT NULL,
	"insurance_company" text NOT NULL,
	"insurance_type" "app_insurance_type_enum" NOT NULL,
	"contract_number" text,
	"policy_number" text,
	"contract_date" date NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"contractor_name" text NOT NULL,
	"insured_name" text NOT NULL,
	"beneficiary_name" text,
	"monthly_premium" numeric(12, 2),
	"annual_premium" numeric(12, 2),
	"coverage_amount" numeric(15, 2),
	"agent_commission" numeric(12, 2),
	"status" "app_contract_status_enum" DEFAULT 'active' NOT NULL,
	"is_renewal_contract" boolean DEFAULT false NOT NULL,
	"parent_contract_id" uuid,
	"special_clauses" text,
	"payment_method" text,
	"payment_period" integer,
	"notes" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_client_contract_attachments" ADD CONSTRAINT "app_client_contract_attachments_contract_id_app_client_insurance_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."app_client_insurance_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_contract_attachments" ADD CONSTRAINT "app_client_contract_attachments_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD CONSTRAINT "app_client_insurance_contracts_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD CONSTRAINT "app_client_insurance_contracts_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD CONSTRAINT "app_client_insurance_contracts_opportunity_product_id_app_opportunity_products_id_fk" FOREIGN KEY ("opportunity_product_id") REFERENCES "public"."app_opportunity_products"("id") ON DELETE no action ON UPDATE no action;