ALTER TABLE "app_client_meetings" ADD COLUMN "priority" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "expected_outcome" text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "contact_method" text DEFAULT 'in_person';--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "estimated_commission" numeric(12, 0);--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "product_interest" text;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "sync_to_google" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "send_client_invite" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD COLUMN "reminder" text DEFAULT '30_minutes';