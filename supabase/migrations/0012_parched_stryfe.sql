ALTER TABLE "public_site_testimonials" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "public_site_testimonials" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "public_site_testimonials" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "public_site_testimonials" DROP COLUMN "customer_title";