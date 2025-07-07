CREATE TYPE "public"."app_subscription_status_enum" AS ENUM('trial', 'active', 'past_due', 'cancelled', 'expired');--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "client_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "meeting_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "priority" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "expected_outcome" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "contact_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "contact_method" SET DEFAULT 'in_person';--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "estimated_commission" SET DATA TYPE numeric(12, 0);--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "product_interest" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "reminder" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "reminder" SET DEFAULT '30_minutes';--> statement-breakpoint
ALTER TABLE "app_client_meetings" ALTER COLUMN "send_client_invite" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "sync_to_google" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD COLUMN "subscription_status" "app_subscription_status_enum" DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD COLUMN "subscription_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD COLUMN "lemonsqueezy_subscription_id" text;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD COLUMN "lemonsqueezy_customer_id" text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" DROP COLUMN "google_meet_enabled";--> statement-breakpoint
DROP TYPE "public"."app_meeting_contact_method_enum";--> statement-breakpoint
DROP TYPE "public"."app_meeting_expected_outcome_enum";--> statement-breakpoint
DROP TYPE "public"."app_meeting_priority_enum";--> statement-breakpoint
DROP TYPE "public"."app_meeting_product_interest_enum";