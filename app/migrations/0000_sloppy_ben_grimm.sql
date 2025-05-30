
CREATE TYPE "public"."document_type" AS ENUM('policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."importance" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."insurance_type" AS ENUM('life', 'health', 'auto', 'prenatal', 'property', 'other');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'used', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."meeting_type" AS ENUM('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('agent', 'team_admin', 'system_admin');--> statement-breakpoint
CREATE TYPE "public"."calendar_view" AS ENUM('month', 'week', 'day', 'agenda');--> statement-breakpoint
CREATE TYPE "public"."recurrence_type" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day');--> statement-breakpoint
CREATE TYPE "public"."client_source" AS ENUM('referral', 'cold_call', 'marketing', 'website', 'social_media', 'event', 'partner', 'other');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('prospect', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost', 'dormant');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('phone', 'email', 'kakao', 'sms', 'in_person', 'video_call');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('client_added', 'client_updated', 'meeting_scheduled', 'meeting_completed', 'meeting_cancelled', 'referral_received', 'referral_converted', 'goal_achieved', 'stage_changed', 'document_uploaded', 'insurance_added');--> statement-breakpoint
CREATE TYPE "public"."goal_period" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('clients', 'meetings', 'revenue', 'referrals', 'conversion_rate');--> statement-breakpoint
CREATE TYPE "public"."metric_period" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('meeting_reminder', 'goal_achievement', 'goal_deadline', 'new_referral', 'client_milestone', 'team_update', 'system_alert', 'birthday_reminder', 'follow_up_reminder', 'contract_expiry', 'payment_due');--> statement-breakpoint
CREATE TYPE "public"."gift_type" AS ENUM('flowers', 'fruit_basket', 'gift_card', 'meal_voucher', 'coffee_voucher', 'custom_gift', 'none');--> statement-breakpoint
CREATE TYPE "public"."gratitude_status" AS ENUM('planned', 'scheduled', 'sent', 'delivered', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gratitude_type" AS ENUM('thank_you_call', 'thank_you_message', 'gift_delivery', 'meal_invitation', 'event_invitation', 'custom');--> statement-breakpoint
CREATE TYPE "public"."influencer_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."invitation_source" AS ENUM('direct_link', 'email', 'sms', 'kakao_talk', 'qr_code', 'referral_bonus');--> statement-breakpoint
CREATE TYPE "public"."invitation_type" AS ENUM('standard', 'premium', 'team_admin', 'beta_tester');--> statement-breakpoint
CREATE TYPE "public"."usage_action" AS ENUM('viewed', 'clicked', 'registered', 'completed');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'invited', 'registered', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."connection_type" AS ENUM('direct_referral', 'family_member', 'colleague', 'friend', 'business_partner', 'community_member');--> statement-breakpoint
CREATE TYPE "public"."network_analysis_type" AS ENUM('centrality', 'clustering', 'path_analysis', 'influence_mapping', 'growth_tracking');--> statement-breakpoint
CREATE TYPE "public"."network_node_type" AS ENUM('client', 'prospect', 'influencer', 'partner', 'external');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'sms', 'push', 'kakao');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."automation_action" AS ENUM('send_notification', 'create_task', 'schedule_meeting', 'move_to_stage', 'assign_to_user', 'send_email');--> statement-breakpoint
CREATE TYPE "public"."automation_trigger" AS ENUM('stage_entry', 'stage_exit', 'time_in_stage', 'client_created', 'meeting_scheduled', 'document_uploaded');--> statement-breakpoint
CREATE TYPE "public"."pipeline_view_type" AS ENUM('kanban', 'list', 'table', 'timeline', 'funnel');--> statement-breakpoint
CREATE TYPE "public"."stage_action_type" AS ENUM('moved_to_stage', 'stage_created', 'stage_updated', 'stage_deleted', 'bulk_move', 'automation_triggered');--> statement-breakpoint
CREATE TYPE "public"."chart_type" AS ENUM('line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'funnel', 'gauge');--> statement-breakpoint
CREATE TYPE "public"."report_format" AS ENUM('pdf', 'excel', 'csv', 'json', 'html');--> statement-breakpoint
CREATE TYPE "public"."report_frequency" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'generating', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('performance', 'pipeline', 'client_analysis', 'referral_analysis', 'meeting_analysis', 'revenue', 'conversion', 'activity', 'custom');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'export', 'import', 'share', 'invite');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('active', 'inactive', 'error', 'pending', 'expired');--> statement-breakpoint
CREATE TYPE "public"."integration_type" AS ENUM('google_calendar', 'kakao_talk', 'slack', 'email', 'sms', 'webhook', 'api');--> statement-breakpoint
CREATE TYPE "public"."setting_category" AS ENUM('general', 'notifications', 'privacy', 'security', 'integrations', 'appearance', 'billing', 'team');--> statement-breakpoint
CREATE TYPE "public"."setting_type" AS ENUM('boolean', 'string', 'number', 'json', 'array', 'enum');--> statement-breakpoint
CREATE TYPE "public"."collaboration_type" AS ENUM('shared_client', 'joint_meeting', 'referral_handoff', 'knowledge_share', 'peer_review');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('member', 'admin', 'owner', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive', 'pending', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."team_event_type" AS ENUM('member_joined', 'member_left', 'member_promoted', 'member_demoted', 'settings_changed', 'goal_created', 'goal_achieved', 'milestone_reached');--> statement-breakpoint

CREATE TABLE "client_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"ssn" text,
	"birth_date" date,
	"gender" "gender",
	"consent_date" timestamp with time zone,
	"consent_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_details_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"telecom_provider" text,
	"address" text,
	"occupation" text,
	"has_driving_license" boolean,
	"height" integer,
	"weight" integer,
	"tags" text[],
	"importance" "importance" DEFAULT 'medium' NOT NULL,
	"current_stage_id" uuid NOT NULL,
	"referred_by_id" uuid,
	"notes" text,
	"custom_fields" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"insurance_info_id" uuid,
	"agent_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"insurance_type" "insurance_type" NOT NULL,
	"details" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_email" text,
	"message" text,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"used_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "invitations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"location" text,
	"meeting_type" "meeting_type" NOT NULL,
	"status" "meeting_status" DEFAULT 'scheduled' NOT NULL,
	"google_event_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"team_id" uuid,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"color" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"profile_image_url" text,
	"company" text,
	"role" "user_role" DEFAULT 'agent' NOT NULL,
	"team_id" uuid,
	"invited_by_id" uuid,
	"invitations_left" integer DEFAULT 2 NOT NULL,
	"google_calendar_token" jsonb,
	"settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"referral_date" date DEFAULT now() NOT NULL,
	"notes" text,
	"status" "referral_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"admin_id" uuid NOT NULL,
	"settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"default_view" "calendar_view" DEFAULT 'month' NOT NULL,
	"working_hours" jsonb,
	"time_zone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"google_calendar_sync" boolean DEFAULT false NOT NULL,
	"default_meeting_duration" integer DEFAULT 60 NOT NULL,
	"default_reminder" "reminder_type" DEFAULT '30_minutes' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_settings_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "meeting_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"client_id" uuid,
	"agent_id" uuid,
	"external_email" text,
	"external_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"response_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"reminder_time" timestamp with time zone NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_duration" integer DEFAULT 60 NOT NULL,
	"default_location" text,
	"checklist" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_meeting_id" uuid NOT NULL,
	"recurrence_type" "recurrence_type" NOT NULL,
	"recurrence_interval" integer DEFAULT 1 NOT NULL,
	"recurrence_end" timestamp with time zone,
	"max_occurrences" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"total_contacts" integer DEFAULT 0,
	"last_contact_date" timestamp with time zone,
	"average_response_time" integer,
	"engagement_score" numeric(5, 2),
	"conversion_probability" numeric(5, 2),
	"lifetime_value" numeric(12, 2),
	"acquisition_cost" numeric(10, 2),
	"referral_count" integer DEFAULT 0,
	"referral_value" numeric(12, 2) DEFAULT '0',
	"last_analyzed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_analytics_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "client_contact_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"contact_method" "contact_method" NOT NULL,
	"subject" text,
	"content" text,
	"duration" integer,
	"outcome" text,
	"next_action" text,
	"next_action_date" timestamp with time zone,
	"attachments" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"birth_date" timestamp with time zone,
	"gender" text,
	"occupation" text,
	"phone" text,
	"email" text,
	"has_insurance" boolean DEFAULT false,
	"insurance_details" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"value" numeric(12, 2),
	"achieved_at" timestamp with time zone NOT NULL,
	"is_significant" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"preferred_contact_method" "contact_method" DEFAULT 'phone',
	"preferred_contact_time" jsonb,
	"communication_style" text,
	"interests" text[],
	"concerns" text[],
	"budget" jsonb,
	"risk_tolerance" text,
	"investment_goals" text[],
	"special_needs" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_preferences_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "client_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"widget_type" text NOT NULL,
	"title" text NOT NULL,
	"position" jsonb NOT NULL,
	"config" jsonb NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"goal_type" "goal_type" NOT NULL,
	"target_value" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"period" "goal_period" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"action_url" text,
	"action_label" text,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"date" date NOT NULL,
	"period" "metric_period" NOT NULL,
	"new_clients" integer DEFAULT 0 NOT NULL,
	"total_meetings" integer DEFAULT 0 NOT NULL,
	"completed_meetings" integer DEFAULT 0 NOT NULL,
	"cancelled_meetings" integer DEFAULT 0 NOT NULL,
	"new_referrals" integer DEFAULT 0 NOT NULL,
	"converted_referrals" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_deal_size" numeric(12, 2) DEFAULT '0' NOT NULL,
	"pipeline_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quick_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"label" text NOT NULL,
	"icon" text,
	"url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gratitude_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"gratitude_type" "gratitude_type" NOT NULL,
	"gift_type" "gift_type" DEFAULT 'none' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"scheduled_date" date,
	"sent_date" date,
	"delivered_date" date,
	"status" "gratitude_status" DEFAULT 'planned' NOT NULL,
	"cost" numeric(10, 2) DEFAULT '0',
	"vendor" text,
	"tracking_number" text,
	"recipient_feedback" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gratitude_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"gratitude_type" "gratitude_type" NOT NULL,
	"gift_type" "gift_type" DEFAULT 'none' NOT NULL,
	"title_template" text NOT NULL,
	"message_template" text NOT NULL,
	"estimated_cost" numeric(10, 2) DEFAULT '0',
	"recommended_vendors" text[],
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"tier" "influencer_tier" DEFAULT 'bronze' NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"successful_referrals" integer DEFAULT 0 NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_contract_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"network_depth" integer DEFAULT 0 NOT NULL,
	"network_width" integer DEFAULT 0 NOT NULL,
	"relationship_strength" numeric(3, 2) DEFAULT '0' NOT NULL,
	"last_referral_date" date,
	"last_gratitude_date" date,
	"preferred_contact_method" "contact_method",
	"special_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "influencer_profiles_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "network_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"analysis_date" date NOT NULL,
	"total_influencers" integer DEFAULT 0 NOT NULL,
	"average_conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_network_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"average_network_depth" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_network_width" numeric(5, 2) DEFAULT '0' NOT NULL,
	"top_influencer_ids" text[],
	"network_growth_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"analysis_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"month" date NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"successful_count" integer DEFAULT 0 NOT NULL,
	"average_time_between_referrals" integer DEFAULT 0,
	"preferred_referral_day" text,
	"preferred_referral_time" text,
	"seasonal_trends" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"date" date NOT NULL,
	"invitations_sent" integer DEFAULT 0 NOT NULL,
	"invitations_viewed" integer DEFAULT 0 NOT NULL,
	"invitations_used" integer DEFAULT 0 NOT NULL,
	"new_registrations" integer DEFAULT 0 NOT NULL,
	"conversion_rate" integer DEFAULT 0 NOT NULL,
	"top_source" "invitation_source",
	"analytics_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"template_id" uuid,
	"target_audience" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"max_invitations" integer,
	"current_invitations" integer DEFAULT 0 NOT NULL,
	"bonus_rewards" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_referral_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"referral_source" text,
	"referral_details" jsonb,
	"conversion_path" jsonb,
	"attribution_score" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_id" uuid NOT NULL,
	"invitation_id" uuid NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" integer NOT NULL,
	"reward_description" text NOT NULL,
	"is_granted" boolean DEFAULT false NOT NULL,
	"granted_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"message_template" text NOT NULL,
	"type" "invitation_type" DEFAULT 'standard' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"action" "usage_action" NOT NULL,
	"action_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"company" text,
	"referred_by" text,
	"request_message" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" "waitlist_status" DEFAULT 'waiting' NOT NULL,
	"invited_at" timestamp with time zone,
	"invitation_id" uuid,
	"registered_at" timestamp with time zone,
	"registered_user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "network_analysis_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"analysis_type" "network_analysis_type" NOT NULL,
	"analysis_date" timestamp with time zone DEFAULT now() NOT NULL,
	"total_nodes" integer DEFAULT 0 NOT NULL,
	"total_connections" integer DEFAULT 0 NOT NULL,
	"network_density" numeric(5, 4) DEFAULT '0',
	"average_path_length" numeric(5, 2) DEFAULT '0',
	"clustering_coefficient" numeric(5, 4) DEFAULT '0',
	"top_influencers" jsonb,
	"community_structure" jsonb,
	"growth_metrics" jsonb,
	"recommendations" jsonb,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid NOT NULL,
	"connection_type" "connection_type" NOT NULL,
	"strength" numeric(3, 2) DEFAULT '1.0' NOT NULL,
	"bidirectional" boolean DEFAULT true NOT NULL,
	"description" text,
	"established_date" date,
	"last_interaction" timestamp with time zone,
	"interaction_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"event_type" text NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"location" text,
	"attendee_count" integer DEFAULT 0 NOT NULL,
	"new_connections" integer DEFAULT 0 NOT NULL,
	"follow_up_actions" jsonb,
	"outcomes" jsonb,
	"cost" numeric(10, 2),
	"roi" numeric(8, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL,
	"interaction_type" text NOT NULL,
	"interaction_date" timestamp with time zone NOT NULL,
	"description" text,
	"outcome" text,
	"strength_change" numeric(3, 2) DEFAULT '0',
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"client_id" uuid,
	"node_type" "network_node_type" NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"position" text,
	"location" text,
	"tags" text[],
	"centrality_score" numeric(8, 4) DEFAULT '0',
	"influence_score" numeric(8, 4) DEFAULT '0',
	"connections_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid,
	"opportunity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"potential_value" numeric(12, 2),
	"probability" numeric(3, 2) DEFAULT '0.5',
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'identified' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"actual_value" numeric(12, 2),
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"queue_id" uuid,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"status" "notification_status" NOT NULL,
	"response_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"trigger_event" text NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_triggered" timestamp with time zone,
	"trigger_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"kakao_notifications" boolean DEFAULT false NOT NULL,
	"meeting_reminders" boolean DEFAULT true NOT NULL,
	"goal_deadlines" boolean DEFAULT true NOT NULL,
	"new_referrals" boolean DEFAULT true NOT NULL,
	"client_milestones" boolean DEFAULT true NOT NULL,
	"team_updates" boolean DEFAULT true NOT NULL,
	"system_alerts" boolean DEFAULT true NOT NULL,
	"birthday_reminders" boolean DEFAULT true NOT NULL,
	"follow_up_reminders" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" text DEFAULT '22:00',
	"quiet_hours_end" text DEFAULT '08:00',
	"weekend_notifications" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"notification_types" text[] NOT NULL,
	"channels" text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"name" text NOT NULL,
	"subject" text,
	"body_template" text NOT NULL,
	"variables" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"date" date NOT NULL,
	"stage_id" uuid NOT NULL,
	"clients_entered" integer DEFAULT 0 NOT NULL,
	"clients_exited" integer DEFAULT 0 NOT NULL,
	"clients_remaining" integer DEFAULT 0 NOT NULL,
	"average_time_in_stage" numeric(8, 2),
	"conversion_rate" numeric(5, 2),
	"total_value" numeric(15, 2) DEFAULT '0',
	"average_value" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"trigger" "automation_trigger" NOT NULL,
	"trigger_conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"stage_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"execution_count" integer DEFAULT 0 NOT NULL,
	"last_executed" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_bottlenecks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"stage_id" uuid NOT NULL,
	"analysis_date" date NOT NULL,
	"clients_stuck" integer DEFAULT 0 NOT NULL,
	"average_stuck_time" numeric(8, 2),
	"bottleneck_score" numeric(5, 2),
	"recommendations" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"stage_id" uuid,
	"goal_type" text NOT NULL,
	"target_value" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0',
	"period" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"view_type" "pipeline_view_type" DEFAULT 'kanban' NOT NULL,
	"filters" jsonb,
	"sort_by" text DEFAULT 'created_at',
	"sort_order" text DEFAULT 'desc',
	"group_by" text,
	"visible_stages" text[],
	"column_settings" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"action_type" "stage_action_type" NOT NULL,
	"reason" text,
	"notes" text,
	"time_in_previous_stage" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"stages" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_dashboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"layout" jsonb NOT NULL,
	"widgets" jsonb NOT NULL,
	"filters" jsonb,
	"refresh_interval" integer DEFAULT 300,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"report_instance_id" uuid,
	"format" "report_format" NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_downloaded" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"schedule_id" uuid,
	"name" text NOT NULL,
	"type" "report_type" NOT NULL,
	"format" "report_format" NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"file_path" text,
	"file_size" integer,
	"parameters" jsonb,
	"data" jsonb,
	"metadata" jsonb,
	"generated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"date" date NOT NULL,
	"metric_type" text NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"previous_value" numeric(15, 2),
	"change_percent" numeric(5, 2),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" "report_frequency" NOT NULL,
	"format" "report_format" DEFAULT 'pdf' NOT NULL,
	"recipients" text[] NOT NULL,
	"filters" jsonb,
	"next_run_at" timestamp with time zone,
	"last_run_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"run_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"email" text NOT NULL,
	"frequency" "report_frequency" NOT NULL,
	"format" "report_format" DEFAULT 'pdf' NOT NULL,
	"filters" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sent" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"type" "report_type" NOT NULL,
	"category" text,
	"config" jsonb NOT NULL,
	"layout" jsonb,
	"filters" jsonb,
	"charts" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"key_hash" text NOT NULL,
	"permissions" text[] NOT NULL,
	"last_used_at" timestamp with time zone,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"rate_limit" integer DEFAULT 1000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"action" "audit_action" NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"description" text NOT NULL,
	"changes" jsonb,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backup_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"schedule" text NOT NULL,
	"include_data" text[] NOT NULL,
	"exclude_data" text[],
	"storage_config" jsonb NOT NULL,
	"retention_days" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_backup_at" timestamp with time zone,
	"next_backup_at" timestamp with time zone,
	"backup_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"rollout_percentage" integer DEFAULT 0 NOT NULL,
	"target_users" text[],
	"target_teams" text[],
	"conditions" jsonb,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"type" "integration_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"config" jsonb NOT NULL,
	"credentials" jsonb,
	"status" "integration_status" DEFAULT 'pending' NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_error_at" timestamp with time zone,
	"error_message" text,
	"sync_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "setting_category" NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"type" "setting_type" NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "team_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"category" "setting_category" NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"type" "setting_type" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"description" text,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "setting_category" NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"type" "setting_type" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "team_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid,
	"event_type" "team_event_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"entity_type" text,
	"entity_id" uuid,
	"changes" jsonb,
	"metadata" jsonb,
	"is_important" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"target_members" text[],
	"read_by" text[] DEFAULT '{}',
	"expires_at" timestamp with time zone,
	"attachments" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"initiated_by" uuid NOT NULL,
	"participants" text[] NOT NULL,
	"type" "collaboration_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"related_entity_type" text,
	"related_entity_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"outcomes" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_value" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"unit" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp with time zone,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assigned_members" text[],
	"milestones" jsonb,
	"rewards" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_knowledge_base" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"tags" text[],
	"is_public" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"attachments" jsonb,
	"related_articles" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"permissions" text[],
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"invited_by" uuid,
	"last_active_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"period" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"total_clients" integer DEFAULT 0 NOT NULL,
	"new_clients" integer DEFAULT 0 NOT NULL,
	"total_meetings" integer DEFAULT 0 NOT NULL,
	"completed_meetings" integer DEFAULT 0 NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"successful_referrals" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"average_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"active_members" integer DEFAULT 0 NOT NULL,
	"top_performer_id" uuid,
	"metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"category" text,
	"template" jsonb NOT NULL,
	"variables" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp with time zone,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_details" ADD CONSTRAINT "client_details_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_current_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("current_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_referred_by_id_clients_id_fk" FOREIGN KEY ("referred_by_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_insurance_info_id_insurance_info_id_fk" FOREIGN KEY ("insurance_info_id") REFERENCES "public"."insurance_info"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_info" ADD CONSTRAINT "insurance_info_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_profiles_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_used_by_id_profiles_id_fk" FOREIGN KEY ("used_by_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_clients_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_clients_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_admin_id_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_settings" ADD CONSTRAINT "calendar_settings_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_reminders" ADD CONSTRAINT "meeting_reminders_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_templates" ADD CONSTRAINT "meeting_templates_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_meetings" ADD CONSTRAINT "recurring_meetings_parent_meeting_id_meetings_id_fk" FOREIGN KEY ("parent_meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_analytics" ADD CONSTRAINT "client_analytics_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contact_history" ADD CONSTRAINT "client_contact_history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contact_history" ADD CONSTRAINT "client_contact_history_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_family_members" ADD CONSTRAINT "client_family_members_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_milestones" ADD CONSTRAINT "client_milestones_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_milestones" ADD CONSTRAINT "client_milestones_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_preferences" ADD CONSTRAINT "client_preferences_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tag_assignments" ADD CONSTRAINT "client_tag_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tag_assignments" ADD CONSTRAINT "client_tag_assignments_tag_id_client_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."client_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tags" ADD CONSTRAINT "client_tags_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_actions" ADD CONSTRAINT "quick_actions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_history" ADD CONSTRAINT "gratitude_history_influencer_id_influencer_profiles_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_history" ADD CONSTRAINT "gratitude_history_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_templates" ADD CONSTRAINT "gratitude_templates_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_templates" ADD CONSTRAINT "gratitude_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_analysis" ADD CONSTRAINT "network_analysis_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_analysis" ADD CONSTRAINT "network_analysis_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_patterns" ADD CONSTRAINT "referral_patterns_influencer_id_influencer_profiles_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_patterns" ADD CONSTRAINT "referral_patterns_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_analytics" ADD CONSTRAINT "invitation_analytics_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_analytics" ADD CONSTRAINT "invitation_analytics_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_campaigns" ADD CONSTRAINT "invitation_campaigns_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_campaigns" ADD CONSTRAINT "invitation_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_campaigns" ADD CONSTRAINT "invitation_campaigns_template_id_invitation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."invitation_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_referral_tracking" ADD CONSTRAINT "invitation_referral_tracking_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_rewards" ADD CONSTRAINT "invitation_rewards_inviter_id_profiles_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_rewards" ADD CONSTRAINT "invitation_rewards_invitee_id_profiles_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_rewards" ADD CONSTRAINT "invitation_rewards_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_templates" ADD CONSTRAINT "invitation_templates_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_templates" ADD CONSTRAINT "invitation_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_usage_logs" ADD CONSTRAINT "invitation_usage_logs_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_usage_logs" ADD CONSTRAINT "invitation_usage_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_waitlist" ADD CONSTRAINT "invitation_waitlist_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_waitlist" ADD CONSTRAINT "invitation_waitlist_registered_user_id_profiles_id_fk" FOREIGN KEY ("registered_user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_analysis_results" ADD CONSTRAINT "network_analysis_results_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_analysis_results" ADD CONSTRAINT "network_analysis_results_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_connections" ADD CONSTRAINT "network_connections_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_connections" ADD CONSTRAINT "network_connections_source_node_id_network_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."network_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_connections" ADD CONSTRAINT "network_connections_target_node_id_network_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."network_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_events" ADD CONSTRAINT "network_events_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_events" ADD CONSTRAINT "network_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_interactions" ADD CONSTRAINT "network_interactions_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_interactions" ADD CONSTRAINT "network_interactions_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_opportunities" ADD CONSTRAINT "network_opportunities_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_opportunities" ADD CONSTRAINT "network_opportunities_source_node_id_network_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."network_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_opportunities" ADD CONSTRAINT "network_opportunities_target_node_id_network_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."network_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_history" ADD CONSTRAINT "notification_history_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_history" ADD CONSTRAINT "notification_history_queue_id_notification_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."notification_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_analytics" ADD CONSTRAINT "pipeline_analytics_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_analytics" ADD CONSTRAINT "pipeline_analytics_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_analytics" ADD CONSTRAINT "pipeline_analytics_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_automations" ADD CONSTRAINT "pipeline_automations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_automations" ADD CONSTRAINT "pipeline_automations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_automations" ADD CONSTRAINT "pipeline_automations_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_bottlenecks" ADD CONSTRAINT "pipeline_bottlenecks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_bottlenecks" ADD CONSTRAINT "pipeline_bottlenecks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_bottlenecks" ADD CONSTRAINT "pipeline_bottlenecks_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_goals" ADD CONSTRAINT "pipeline_goals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_goals" ADD CONSTRAINT "pipeline_goals_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_goals" ADD CONSTRAINT "pipeline_goals_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_views" ADD CONSTRAINT "pipeline_views_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_views" ADD CONSTRAINT "pipeline_views_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_from_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_to_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_templates" ADD CONSTRAINT "stage_templates_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_templates" ADD CONSTRAINT "stage_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_dashboards" ADD CONSTRAINT "report_dashboards_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_dashboards" ADD CONSTRAINT "report_dashboards_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_report_instance_id_report_instances_id_fk" FOREIGN KEY ("report_instance_id") REFERENCES "public"."report_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_instances" ADD CONSTRAINT "report_instances_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_instances" ADD CONSTRAINT "report_instances_template_id_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_instances" ADD CONSTRAINT "report_instances_schedule_id_report_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."report_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_template_id_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_subscriptions" ADD CONSTRAINT "report_subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_subscriptions" ADD CONSTRAINT "report_subscriptions_template_id_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_configurations" ADD CONSTRAINT "backup_configurations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_configurations" ADD CONSTRAINT "backup_configurations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_settings" ADD CONSTRAINT "team_settings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_settings" ADD CONSTRAINT "team_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_activities" ADD CONSTRAINT "team_activities_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_activities" ADD CONSTRAINT "team_activities_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_announcements" ADD CONSTRAINT "team_announcements_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_announcements" ADD CONSTRAINT "team_announcements_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_collaborations" ADD CONSTRAINT "team_collaborations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_collaborations" ADD CONSTRAINT "team_collaborations_initiated_by_profiles_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_goals" ADD CONSTRAINT "team_goals_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_goals" ADD CONSTRAINT "team_goals_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_knowledge_base" ADD CONSTRAINT "team_knowledge_base_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_knowledge_base" ADD CONSTRAINT "team_knowledge_base_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_performance" ADD CONSTRAINT "team_performance_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_performance" ADD CONSTRAINT "team_performance_top_performer_id_profiles_id_fk" FOREIGN KEY ("top_performer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;