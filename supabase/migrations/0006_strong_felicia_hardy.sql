ALTER TABLE "app_calendar_settings" ADD COLUMN "webhook_channel_id" text;--> statement-breakpoint
ALTER TABLE "app_calendar_settings" ADD COLUMN "webhook_resource_id" text;--> statement-breakpoint
ALTER TABLE "app_calendar_settings" ADD COLUMN "webhook_expires_at" timestamp with time zone;