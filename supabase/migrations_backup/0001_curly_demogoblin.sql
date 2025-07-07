CREATE TABLE "app_client_checkup_purposes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"is_insurance_premium_concern" boolean DEFAULT false NOT NULL,
	"is_coverage_concern" boolean DEFAULT false NOT NULL,
	"is_medical_history_concern" boolean DEFAULT false NOT NULL,
	"needs_death_benefit" boolean DEFAULT false NOT NULL,
	"needs_implant_plan" boolean DEFAULT false NOT NULL,
	"needs_caregiver_insurance" boolean DEFAULT false NOT NULL,
	"needs_dementia_insurance" boolean DEFAULT false NOT NULL,
	"current_savings_location" text,
	"additional_concerns" text,
	"priority_level" text,
	"last_updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_checkup_purposes_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_client_consultation_companions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"relationship" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'restricted' NOT NULL,
	"consent_date" timestamp with time zone,
	"consent_expiry" timestamp with time zone,
	"added_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_consultation_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"consultation_date" date NOT NULL,
	"note_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"contract_details" jsonb,
	"follow_up_date" date,
	"follow_up_notes" text,
	"importance" text DEFAULT 'medium' NOT NULL,
	"category" text,
	"tags" text[],
	"attachments" jsonb,
	"related_contacts" text[],
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'restricted' NOT NULL,
	"is_confidential" boolean DEFAULT false NOT NULL,
	"accessible_by" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_interest_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"interested_in_auto_insurance" boolean DEFAULT false NOT NULL,
	"interested_in_dementia" boolean DEFAULT false NOT NULL,
	"interested_in_dental" boolean DEFAULT false NOT NULL,
	"interested_in_driver_insurance" boolean DEFAULT false NOT NULL,
	"interested_in_health_checkup" boolean DEFAULT false NOT NULL,
	"interested_in_medical_expenses" boolean DEFAULT false NOT NULL,
	"interested_in_fire_insurance" boolean DEFAULT false NOT NULL,
	"interested_in_caregiver" boolean DEFAULT false NOT NULL,
	"interested_in_cancer" boolean DEFAULT false NOT NULL,
	"interested_in_savings" boolean DEFAULT false NOT NULL,
	"interested_in_liability" boolean DEFAULT false NOT NULL,
	"interested_in_legal_advice" boolean DEFAULT false NOT NULL,
	"interested_in_tax" boolean DEFAULT false NOT NULL,
	"interested_in_investment" boolean DEFAULT false NOT NULL,
	"interested_in_pet_insurance" boolean DEFAULT false NOT NULL,
	"interested_in_accident_insurance" boolean DEFAULT false NOT NULL,
	"interested_in_traffic_accident" boolean DEFAULT false NOT NULL,
	"additional_interests" text[],
	"interest_notes" text,
	"last_updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_interest_categories_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_client_medical_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"has_recent_diagnosis" boolean DEFAULT false NOT NULL,
	"has_recent_suspicion" boolean DEFAULT false NOT NULL,
	"has_recent_medication" boolean DEFAULT false NOT NULL,
	"has_recent_treatment" boolean DEFAULT false NOT NULL,
	"has_recent_hospitalization" boolean DEFAULT false NOT NULL,
	"has_recent_surgery" boolean DEFAULT false NOT NULL,
	"recent_medical_details" text,
	"has_additional_exam" boolean DEFAULT false NOT NULL,
	"additional_exam_details" text,
	"has_major_hospitalization" boolean DEFAULT false NOT NULL,
	"has_major_surgery" boolean DEFAULT false NOT NULL,
	"has_long_term_treatment" boolean DEFAULT false NOT NULL,
	"has_long_term_medication" boolean DEFAULT false NOT NULL,
	"major_medical_details" text,
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'confidential' NOT NULL,
	"consent_date" timestamp with time zone,
	"last_updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_medical_history_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "app_client_checkup_purposes" ADD CONSTRAINT "app_client_checkup_purposes_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_checkup_purposes" ADD CONSTRAINT "app_client_checkup_purposes_last_updated_by_app_user_profiles_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_consultation_companions" ADD CONSTRAINT "app_client_consultation_companions_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_consultation_companions" ADD CONSTRAINT "app_client_consultation_companions_added_by_app_user_profiles_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_consultation_notes" ADD CONSTRAINT "app_client_consultation_notes_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_consultation_notes" ADD CONSTRAINT "app_client_consultation_notes_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_interest_categories" ADD CONSTRAINT "app_client_interest_categories_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_interest_categories" ADD CONSTRAINT "app_client_interest_categories_last_updated_by_app_user_profiles_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_medical_history" ADD CONSTRAINT "app_client_medical_history_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_medical_history" ADD CONSTRAINT "app_client_medical_history_last_updated_by_app_user_profiles_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;