CREATE TYPE "public"."app_payment_cycle_enum" AS ENUM('monthly', 'quarterly', 'semi-annual', 'annual', 'lump-sum');--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "insurance_code" text;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "payment_due_date" date;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "contractor_ssn" text;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "contractor_phone" text;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "insured_ssn" text;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "insured_phone" text;--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "premium_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "app_client_insurance_contracts" ADD COLUMN "payment_cycle" "app_payment_cycle_enum";