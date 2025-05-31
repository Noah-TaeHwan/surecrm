CREATE TYPE "public"."app_document_type_enum" AS ENUM('policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_gender_enum" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."app_importance_enum" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."app_insurance_type_enum" AS ENUM('life', 'health', 'auto', 'prenatal', 'property', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_invitation_status_enum" AS ENUM('pending', 'used', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."app_meeting_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."app_meeting_type_enum" AS ENUM('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_referral_status_enum" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."app_theme_enum" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."app_user_role_enum" AS ENUM('agent', 'team_admin', 'system_admin');--> statement-breakpoint
CREATE TYPE "public"."public_content_status_enum" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."public_content_type_enum" AS ENUM('terms_of_service', 'privacy_policy', 'faq', 'announcement', 'help_article');--> statement-breakpoint
CREATE TYPE "public"."public_language_enum" AS ENUM('ko', 'en', 'ja', 'zh');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_external_source_enum" AS ENUM('local', 'google_calendar', 'outlook', 'apple_calendar');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_meeting_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_meeting_type_enum" AS ENUM('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_recurrence_type_enum" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_reminder_type_enum" AS ENUM('none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_sync_status_enum" AS ENUM('not_synced', 'syncing', 'synced', 'sync_failed', 'sync_conflict');--> statement-breakpoint
CREATE TYPE "public"."app_calendar_view_enum" AS ENUM('month', 'week', 'day', 'agenda');--> statement-breakpoint
CREATE TYPE "public"."app_client_contact_method_enum" AS ENUM('phone', 'email', 'kakao', 'sms', 'in_person', 'video_call');--> statement-breakpoint
CREATE TYPE "public"."app_client_data_access_log_type_enum" AS ENUM('view', 'edit', 'export', 'share', 'delete');--> statement-breakpoint
CREATE TYPE "public"."app_client_privacy_level_enum" AS ENUM('public', 'restricted', 'private', 'confidential');--> statement-breakpoint
CREATE TYPE "public"."app_client_source_enum" AS ENUM('referral', 'cold_call', 'marketing', 'website', 'social_media', 'event', 'partner', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_client_status_enum" AS ENUM('prospect', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost', 'dormant');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_activity_type_enum" AS ENUM('client_added', 'client_updated', 'meeting_scheduled', 'meeting_completed', 'meeting_cancelled', 'referral_received', 'referral_converted', 'goal_achieved', 'stage_changed', 'document_uploaded', 'insurance_added');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_goal_period_enum" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_goal_type_enum" AS ENUM('clients', 'meetings', 'revenue', 'referrals', 'conversion_rate');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_metric_period_enum" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_notification_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_notification_type_enum" AS ENUM('meeting_reminder', 'goal_achievement', 'goal_deadline', 'new_referral', 'client_milestone', 'team_update', 'system_alert');--> statement-breakpoint
CREATE TYPE "public"."app_dashboard_widget_type_enum" AS ENUM('kpi_card', 'chart', 'table', 'calendar', 'list', 'progress', 'notification', 'quick_action');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_activity_type_enum" AS ENUM('new_referral', 'referral_converted', 'gratitude_sent', 'meeting_scheduled', 'tier_upgraded', 'network_expanded', 'relationship_strengthened');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_contact_method_enum" AS ENUM('phone', 'email', 'kakao', 'sms', 'in_person', 'video_call', 'letter');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_data_source_enum" AS ENUM('direct_input', 'auto_calculated', 'imported', 'api_sync');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_gift_type_enum" AS ENUM('flowers', 'food_voucher', 'coffee_voucher', 'traditional_gift', 'cash_gift', 'experience_voucher', 'custom_gift', 'none');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_gratitude_status_enum" AS ENUM('planned', 'scheduled', 'sent', 'delivered', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_gratitude_type_enum" AS ENUM('thank_you_call', 'thank_you_message', 'gift_delivery', 'meal_invitation', 'event_invitation', 'holiday_greetings', 'birthday_wishes', 'custom');--> statement-breakpoint
CREATE TYPE "public"."app_influencer_tier_enum" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."invitation_source" AS ENUM('direct_link', 'email', 'sms', 'kakao_talk', 'qr_code', 'referral_bonus');--> statement-breakpoint
CREATE TYPE "public"."invitation_type" AS ENUM('standard', 'premium', 'team_admin', 'beta_tester');--> statement-breakpoint
CREATE TYPE "public"."usage_action" AS ENUM('viewed', 'clicked', 'registered', 'completed');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'invited', 'registered', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."app_network_analysis_type_enum" AS ENUM('centrality', 'clustering', 'path_analysis', 'influence_mapping', 'growth_tracking');--> statement-breakpoint
CREATE TYPE "public"."app_network_connection_type_enum" AS ENUM('direct_referral', 'family_member', 'colleague', 'friend', 'business_partner', 'community_member');--> statement-breakpoint
CREATE TYPE "public"."app_network_node_type_enum" AS ENUM('client', 'prospect', 'influencer', 'partner', 'external');--> statement-breakpoint
CREATE TYPE "public"."app_notification_channel_enum" AS ENUM('in_app', 'email', 'sms', 'push', 'kakao');--> statement-breakpoint
CREATE TYPE "public"."app_notification_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."app_notification_status_enum" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."app_notification_type_enum" AS ENUM('meeting_reminder', 'goal_achievement', 'goal_deadline', 'new_referral', 'client_milestone', 'team_update', 'system_alert', 'birthday_reminder', 'follow_up_reminder', 'contract_expiry', 'payment_due');--> statement-breakpoint
CREATE TYPE "public"."app_pipeline_automation_action_enum" AS ENUM('send_notification', 'create_task', 'schedule_meeting', 'move_to_stage', 'assign_to_user', 'send_email');--> statement-breakpoint
CREATE TYPE "public"."app_pipeline_automation_trigger_enum" AS ENUM('stage_entry', 'stage_exit', 'time_in_stage', 'client_created', 'meeting_scheduled', 'document_uploaded');--> statement-breakpoint
CREATE TYPE "public"."app_pipeline_stage_action_type_enum" AS ENUM('moved_to_stage', 'stage_created', 'stage_updated', 'stage_deleted', 'bulk_move', 'automation_triggered');--> statement-breakpoint
CREATE TYPE "public"."app_pipeline_view_type_enum" AS ENUM('kanban', 'list', 'table', 'timeline', 'funnel');--> statement-breakpoint
CREATE TYPE "public"."app_chart_type_enum" AS ENUM('line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'funnel', 'gauge');--> statement-breakpoint
CREATE TYPE "public"."app_report_format_enum" AS ENUM('pdf', 'excel', 'csv', 'json', 'html');--> statement-breakpoint
CREATE TYPE "public"."app_report_frequency_enum" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."app_report_status_enum" AS ENUM('pending', 'generating', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."app_report_type_enum" AS ENUM('performance', 'pipeline', 'client_analysis', 'referral_analysis', 'meeting_analysis', 'revenue', 'conversion', 'activity', 'custom');--> statement-breakpoint
CREATE TYPE "public"."app_settings_category" AS ENUM('profile', 'notifications', 'system', 'security', 'integrations');--> statement-breakpoint
CREATE TYPE "public"."app_settings_integration_status" AS ENUM('active', 'inactive', 'error', 'pending');--> statement-breakpoint
CREATE TYPE "public"."app_settings_integration_type" AS ENUM('kakao_talk', 'google_calendar', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."app_settings_notification_channel" AS ENUM('email', 'sms', 'push', 'kakao');--> statement-breakpoint
CREATE TYPE "public"."app_team_activity_type_enum" AS ENUM('member_joined', 'member_left', 'member_promoted', 'member_demoted', 'goal_created', 'goal_achieved', 'meeting_scheduled', 'performance_milestone');--> statement-breakpoint
CREATE TYPE "public"."app_team_member_role_enum" AS ENUM('member', 'manager', 'admin');--> statement-breakpoint
CREATE TYPE "public"."app_team_member_status_enum" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TABLE "admin_system_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"table_name" text,
	"target_id" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "admin_system_stats_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stat_type" text NOT NULL,
	"stat_data" jsonb NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "admin_system_stats_cache_stat_type_unique" UNIQUE("stat_type")
);
--> statement-breakpoint
--> statement-breakpoint
CREATE TABLE "app_client_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"ssn" text,
	"birth_date" date,
	"gender" "app_gender_enum",
	"bank_account" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"medical_history" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_details_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_client_profiles" (
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
	"importance" "app_importance_enum" DEFAULT 'medium' NOT NULL,
	"current_stage_id" uuid NOT NULL,
	"referred_by_id" uuid,
	"notes" text,
	"custom_fields" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"insurance_info_id" uuid,
	"agent_id" uuid NOT NULL,
	"document_type" "app_document_type_enum" NOT NULL,
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
CREATE TABLE "app_client_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"insurance_type" "app_insurance_type_enum" NOT NULL,
	"policy_number" text,
	"insurer" text,
	"premium" numeric(10, 2),
	"coverage_amount" numeric(12, 2),
	"start_date" date,
	"end_date" date,
	"beneficiary" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_email" text,
	"message" text,
	"status" "app_invitation_status_enum" DEFAULT 'pending' NOT NULL,
	"used_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	CONSTRAINT "app_user_invitations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "app_client_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"meeting_type" "app_meeting_type_enum" NOT NULL,
	"status" "app_meeting_status_enum" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"location" text,
	"google_meet_link" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_pipeline_stages" (
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
CREATE TABLE "app_user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"profile_image_url" text,
	"company" text,
	"role" "app_user_role_enum" DEFAULT 'agent' NOT NULL,
	"team_id" uuid,
	"invited_by_id" uuid,
	"invitations_left" integer DEFAULT 2 NOT NULL,
	"theme" "app_theme_enum" DEFAULT 'dark' NOT NULL,
	"google_calendar_token" jsonb,
	"settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "app_client_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"referral_date" date DEFAULT now() NOT NULL,
	"status" "app_referral_status_enum" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user_teams" (
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
CREATE TABLE "public_site_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"language" "public_language_enum" DEFAULT 'ko' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_site_faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"language" "public_language_enum" DEFAULT 'ko' NOT NULL,
	"author_id" uuid,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_site_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	"session_id" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_site_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "public_content_type_enum" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"language" "public_language_enum" DEFAULT 'ko' NOT NULL,
	"status" "public_content_status_enum" DEFAULT 'draft' NOT NULL,
	"effective_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"author_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"type" text DEFAULT 'string' NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "public_site_testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"company" text NOT NULL,
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"initial" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"language" "public_language_enum" DEFAULT 'ko' NOT NULL,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_admin_dashboard_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"widget_type" text NOT NULL,
	"title" text NOT NULL,
	"config" jsonb NOT NULL,
	"position" jsonb NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_admin_security_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_by_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"last_activity" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_admin_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "app_calendar_meeting_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"client_id" uuid,
	"agent_id" uuid,
	"external_email" text,
	"external_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"response_at" timestamp with time zone,
	"google_calendar_attendee_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_meeting_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"text" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_meeting_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_meeting_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"reminder_type" "app_calendar_reminder_type_enum" NOT NULL,
	"reminder_time" timestamp with time zone NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp with time zone,
	"google_calendar_reminder_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_meeting_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_duration" integer DEFAULT 60 NOT NULL,
	"default_location" text,
	"checklist" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"google_calendar_template_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_recurring_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_meeting_id" uuid NOT NULL,
	"recurrence_type" "app_calendar_recurrence_type_enum" NOT NULL,
	"recurrence_interval" integer DEFAULT 1 NOT NULL,
	"recurrence_end" timestamp with time zone,
	"max_occurrences" integer,
	"exceptions" jsonb,
	"google_calendar_recurrence_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_calendar_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"default_view" "app_calendar_view_enum" DEFAULT 'month' NOT NULL,
	"working_hours" jsonb,
	"time_zone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"google_calendar_sync" boolean DEFAULT false NOT NULL,
	"default_meeting_duration" integer DEFAULT 60 NOT NULL,
	"default_reminder" "app_calendar_reminder_type_enum" DEFAULT '30_minutes' NOT NULL,
	"google_calendar_id" text,
	"google_access_token" text,
	"google_refresh_token" text,
	"google_token_expires_at" timestamp with time zone,
	"last_sync_at" timestamp with time zone,
	"sync_status" "app_calendar_sync_status_enum" DEFAULT 'not_synced' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_calendar_settings_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "app_calendar_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"meeting_id" uuid,
	"sync_direction" text NOT NULL,
	"sync_status" "app_calendar_sync_status_enum" NOT NULL,
	"external_source" "app_calendar_external_source_enum" NOT NULL,
	"external_event_id" text,
	"sync_result" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_analytics" (
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
	"referral_value" numeric(12, 2),
	"last_analyzed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_analytics_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_client_contact_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"contact_method" "app_client_contact_method_enum" NOT NULL,
	"subject" text,
	"content" text,
	"duration" integer,
	"outcome" text,
	"next_action" text,
	"next_action_date" timestamp with time zone,
	"attachments" jsonb,
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'restricted' NOT NULL,
	"is_confidential" boolean DEFAULT false NOT NULL,
	"accessible_by" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_data_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"accessed_by" uuid NOT NULL,
	"access_type" "app_client_data_access_log_type_enum" NOT NULL,
	"accessed_data" text[],
	"ip_address" text,
	"user_agent" text,
	"purpose" text,
	"access_result" text,
	"metadata" jsonb,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_data_backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"backup_type" text NOT NULL,
	"backup_data" jsonb NOT NULL,
	"backup_hash" text NOT NULL,
	"triggered_by" uuid NOT NULL,
	"trigger_reason" text,
	"retention_until" timestamp with time zone NOT NULL,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"encryption_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_family_members" (
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
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'confidential' NOT NULL,
	"consent_date" timestamp with time zone,
	"consent_expiry" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"value" numeric(12, 2),
	"achieved_at" timestamp with time zone NOT NULL,
	"is_significant" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"preferred_contact_method" "app_client_contact_method_enum" DEFAULT 'phone',
	"preferred_contact_time" jsonb,
	"communication_style" text,
	"interests" text[],
	"concerns" text[],
	"budget" jsonb,
	"risk_tolerance" text,
	"investment_goals" text[],
	"special_needs" text,
	"notes" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"data_processing_consent" boolean DEFAULT true NOT NULL,
	"third_party_share_consent" boolean DEFAULT false NOT NULL,
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_client_preferences_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_client_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"reason" text,
	"notes" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_client_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"privacy_level" "app_client_privacy_level_enum" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "app_dashboard_activity_type_enum" NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"impact" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"goal_type" "app_dashboard_goal_type_enum" NOT NULL,
	"target_value" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"period" "app_dashboard_goal_period_enum" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp with time zone,
	"progress_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "app_dashboard_notification_type_enum" NOT NULL,
	"priority" "app_dashboard_notification_priority_enum" DEFAULT 'normal' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"action_url" text,
	"action_label" text,
	"expires_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"date" date NOT NULL,
	"period" "app_dashboard_metric_period_enum" NOT NULL,
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
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"data_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_quick_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"action_url" text,
	"shortcut" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp with time zone,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_dashboard_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"widget_type" "app_dashboard_widget_type_enum" NOT NULL,
	"title" text NOT NULL,
	"position" jsonb NOT NULL,
	"config" jsonb NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"refresh_interval" integer DEFAULT 300,
	"last_refreshed" timestamp with time zone,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_influencer_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"activity_type" "app_influencer_activity_type_enum" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"entity_type" text,
	"entity_id" uuid,
	"impact" text,
	"value_change" numeric(12, 2),
	"previous_value" numeric(12, 2),
	"new_value" numeric(12, 2),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_influencer_gratitude_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"influencer_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"referral_id" uuid,
	"gratitude_type" "app_influencer_gratitude_type_enum" NOT NULL,
	"gift_type" "app_influencer_gift_type_enum" DEFAULT 'none' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"personalized_message" text,
	"scheduled_date" date,
	"sent_date" date,
	"delivered_date" date,
	"status" "app_influencer_gratitude_status_enum" DEFAULT 'planned' NOT NULL,
	"cost" numeric(10, 2) DEFAULT '0',
	"vendor" text,
	"tracking_number" text,
	"recipient_feedback" text,
	"internal_notes" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurring_interval" integer,
	"next_scheduled_date" date,
	"metadata" jsonb,
	"is_auto_generated" boolean DEFAULT false NOT NULL,
	"template_id" text,
	"sentiment" text,
	"delivery_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_influencer_gratitude_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"gratitude_type" "app_influencer_gratitude_type_enum" NOT NULL,
	"gift_type" "app_influencer_gift_type_enum" DEFAULT 'none' NOT NULL,
	"title" text NOT NULL,
	"message_template" text NOT NULL,
	"placeholders" text[],
	"is_default" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp with time zone,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_influencer_network_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"analysis_date" date NOT NULL,
	"analysis_period" text NOT NULL,
	"total_influencers" integer DEFAULT 0 NOT NULL,
	"active_influencers" integer DEFAULT 0 NOT NULL,
	"average_conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_network_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"average_network_depth" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_network_width" numeric(5, 2) DEFAULT '0' NOT NULL,
	"top_influencer_ids" text[],
	"network_growth_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_relationship_strength" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_gratitudes_sent" integer DEFAULT 0 NOT NULL,
	"average_gratitude_frequency" numeric(5, 2) DEFAULT '0' NOT NULL,
	"calculation_version" text DEFAULT '1.0' NOT NULL,
	"data_quality_score" numeric(3, 2) DEFAULT '0' NOT NULL,
	"missing_data_fields" text[],
	"confidence_level" numeric(3, 2) DEFAULT '0' NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_influencer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"tier" "app_influencer_tier_enum" DEFAULT 'bronze' NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"successful_referrals" integer DEFAULT 0 NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_contract_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"average_contract_value" numeric(12, 2) DEFAULT '0' NOT NULL,
	"network_depth" integer DEFAULT 0 NOT NULL,
	"network_width" integer DEFAULT 0 NOT NULL,
	"relationship_strength" numeric(3, 2) DEFAULT '0' NOT NULL,
	"last_referral_date" date,
	"last_gratitude_date" date,
	"last_contact_date" date,
	"preferred_contact_method" "app_influencer_contact_method_enum",
	"special_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"data_source" "app_influencer_data_source_enum" DEFAULT 'auto_calculated' NOT NULL,
	"data_version" integer DEFAULT 1 NOT NULL,
	"last_calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_data_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_influencer_profiles_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "app_invitation_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"action" "usage_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_network_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid NOT NULL,
	"connection_type" "app_network_connection_type_enum" NOT NULL,
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
CREATE TABLE "app_network_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"edge_id" uuid NOT NULL,
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
CREATE TABLE "app_network_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"client_id" uuid,
	"node_type" "app_network_node_type_enum" NOT NULL,
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
CREATE TABLE "app_network_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid,
	"opportunity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"potential_value" numeric(12, 2),
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'open',
	"due_date" date,
	"completed_at" timestamp with time zone,
	"outcome" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_network_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_id" uuid,
	"analysis_type" "app_network_analysis_type_enum" NOT NULL,
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
CREATE TABLE "app_notification_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"queue_id" uuid,
	"type" "app_notification_type_enum" NOT NULL,
	"channel" "app_notification_channel_enum" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"status" "app_notification_status_enum" NOT NULL,
	"response_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"type" "app_notification_type_enum" NOT NULL,
	"channel" "app_notification_channel_enum" NOT NULL,
	"priority" "app_notification_priority_enum" DEFAULT 'normal' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"status" "app_notification_status_enum" DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_notification_rules" (
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
CREATE TABLE "app_notification_settings" (
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
	CONSTRAINT "app_notification_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "app_notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"subscription_type" text NOT NULL,
	"channels" "app_notification_channel_enum"[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"type" "app_notification_type_enum" NOT NULL,
	"channel" "app_notification_channel_enum" NOT NULL,
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
CREATE TABLE "app_pipeline_analytics" (
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_pipeline_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"trigger" "app_pipeline_automation_trigger_enum" NOT NULL,
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
CREATE TABLE "app_pipeline_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"stage_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"target_type" text NOT NULL,
	"target_value" numeric(10, 2) NOT NULL,
	"current_value" numeric(10, 2) DEFAULT '0',
	"period" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_pipeline_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"action_type" "app_pipeline_stage_action_type_enum" NOT NULL,
	"reason" text,
	"notes" text,
	"time_in_previous_stage" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_pipeline_stage_templates" (
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
CREATE TABLE "app_pipeline_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"view_type" "app_pipeline_view_type_enum" DEFAULT 'kanban' NOT NULL,
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
CREATE TABLE "app_report_dashboards" (
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
CREATE TABLE "app_report_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"report_instance_id" uuid,
	"format" "app_report_format_enum" NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_downloaded" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_report_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"schedule_id" uuid,
	"name" text NOT NULL,
	"type" "app_report_type_enum" NOT NULL,
	"format" "app_report_format_enum" NOT NULL,
	"status" "app_report_status_enum" DEFAULT 'pending' NOT NULL,
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
CREATE TABLE "app_report_metrics" (
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
CREATE TABLE "app_report_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" "app_report_frequency_enum" NOT NULL,
	"format" "app_report_format_enum" DEFAULT 'pdf' NOT NULL,
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
CREATE TABLE "app_report_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"email" text NOT NULL,
	"frequency" "app_report_frequency_enum" NOT NULL,
	"format" "app_report_format_enum" DEFAULT 'pdf' NOT NULL,
	"filters" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sent" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_report_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"type" "app_report_type_enum" NOT NULL,
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
CREATE TABLE "app_settings_backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"backup_name" text NOT NULL,
	"backup_data" jsonb NOT NULL,
	"backup_version" text DEFAULT 'MVP_v1.0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"setting_category" "app_settings_category" NOT NULL,
	"setting_field" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"change_reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"integration_type" "app_settings_integration_type" NOT NULL,
	"integration_name" text NOT NULL,
	"config" jsonb NOT NULL,
	"credentials" jsonb,
	"status" "app_settings_integration_status" DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_error_message" text,
	"sync_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings_security_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"action_description" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"location" text,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings_theme_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme_mode" text DEFAULT 'dark' NOT NULL,
	"sidebar_collapsed" boolean DEFAULT false NOT NULL,
	"compact_mode" boolean DEFAULT false NOT NULL,
	"primary_color" text DEFAULT '#007bff' NOT NULL,
	"accent_color" text DEFAULT '#6c757d' NOT NULL,
	"font_size" text DEFAULT 'medium' NOT NULL,
	"font_family" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_theme_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "app_settings_user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" text DEFAULT 'ko' NOT NULL,
	"dark_mode" boolean DEFAULT true NOT NULL,
	"timezone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"notification_settings" jsonb DEFAULT '{"kakaoNotifications":true,"emailNotifications":true,"pushNotifications":true,"smsNotifications":false,"meetingReminders":true,"goalDeadlines":true,"newReferrals":true,"clientMilestones":true,"followUpReminders":true,"birthdayReminders":false,"teamUpdates":true,"systemAlerts":true,"weekendNotifications":false,"quietHoursStart":"22:00","quietHoursEnd":"08:00"}'::jsonb NOT NULL,
	"agent_settings" jsonb DEFAULT '{"workingHours":{"start":"09:00","end":"18:00","workDays":[1,2,3,4,5]},"clientManagement":{"autoFollowUpDays":7,"birthdayReminderDays":3,"contractRenewalReminderDays":30},"performanceTracking":{"monthlyGoalReminder":true,"weeklyReportGeneration":true,"achievementNotifications":true}}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "app_team_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid,
	"activity_type" "app_team_activity_type_enum" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_team_communication_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"channel_name" text NOT NULL,
	"channel_description" text,
	"channel_type" text DEFAULT 'general' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_team_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"goal_type" text NOT NULL,
	"target_metric" text NOT NULL,
	"target_value" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_team_member_role_enum" DEFAULT 'member' NOT NULL,
	"status" "app_team_member_status_enum" DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"invited_by" uuid,
	"last_active_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_team_performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"new_clients" integer DEFAULT 0 NOT NULL,
	"total_contracts" integer DEFAULT 0 NOT NULL,
	"total_premium" numeric(15, 2) DEFAULT '0' NOT NULL,
	"meetings_held" integer DEFAULT 0 NOT NULL,
	"referrals_received" integer DEFAULT 0 NOT NULL,
	"calls_made" integer DEFAULT 0 NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"follow_ups_completed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_team_stats_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"total_members" integer DEFAULT 0 NOT NULL,
	"active_members" integer DEFAULT 0 NOT NULL,
	"pending_invites" integer DEFAULT 0 NOT NULL,
	"total_clients" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_team_stats_cache_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "app_team_training_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"trainer_id" uuid,
	"training_title" text NOT NULL,
	"training_type" text NOT NULL,
	"training_duration" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"score" integer,
	"certificate_number" text,
	"expires_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_client_details" ADD CONSTRAINT "app_client_details_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_profiles" ADD CONSTRAINT "app_client_profiles_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_profiles" ADD CONSTRAINT "app_client_profiles_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_profiles" ADD CONSTRAINT "app_client_profiles_current_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("current_stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_profiles" ADD CONSTRAINT "app_client_profiles_referred_by_id_app_client_profiles_id_fk" FOREIGN KEY ("referred_by_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_documents" ADD CONSTRAINT "app_client_documents_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_documents" ADD CONSTRAINT "app_client_documents_insurance_info_id_app_client_insurance_id_fk" FOREIGN KEY ("insurance_info_id") REFERENCES "public"."app_client_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_documents" ADD CONSTRAINT "app_client_documents_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_insurance" ADD CONSTRAINT "app_client_insurance_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_invitations" ADD CONSTRAINT "app_user_invitations_inviter_id_app_user_profiles_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_invitations" ADD CONSTRAINT "app_user_invitations_used_by_id_app_user_profiles_id_fk" FOREIGN KEY ("used_by_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD CONSTRAINT "app_client_meetings_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_meetings" ADD CONSTRAINT "app_client_meetings_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stages" ADD CONSTRAINT "app_pipeline_stages_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stages" ADD CONSTRAINT "app_pipeline_stages_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_profiles" ADD CONSTRAINT "app_user_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_referrals" ADD CONSTRAINT "app_client_referrals_referrer_id_app_client_profiles_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_referrals" ADD CONSTRAINT "app_client_referrals_referred_id_app_client_profiles_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_referrals" ADD CONSTRAINT "app_client_referrals_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_teams" ADD CONSTRAINT "app_user_teams_admin_id_app_user_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_announcements" ADD CONSTRAINT "public_site_announcements_author_id_app_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_faqs" ADD CONSTRAINT "public_site_faqs_author_id_app_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_analytics" ADD CONSTRAINT "public_site_analytics_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_contents" ADD CONSTRAINT "public_site_contents_author_id_app_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_settings" ADD CONSTRAINT "public_site_settings_updated_by_app_user_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_site_testimonials" ADD CONSTRAINT "public_site_testimonials_author_id_app_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_attendees" ADD CONSTRAINT "app_calendar_meeting_attendees_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_attendees" ADD CONSTRAINT "app_calendar_meeting_attendees_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_attendees" ADD CONSTRAINT "app_calendar_meeting_attendees_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_checklists" ADD CONSTRAINT "app_calendar_meeting_checklists_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_notes" ADD CONSTRAINT "app_calendar_meeting_notes_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_notes" ADD CONSTRAINT "app_calendar_meeting_notes_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_reminders" ADD CONSTRAINT "app_calendar_meeting_reminders_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_meeting_templates" ADD CONSTRAINT "app_calendar_meeting_templates_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_recurring_meetings" ADD CONSTRAINT "app_calendar_recurring_meetings_parent_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("parent_meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_settings" ADD CONSTRAINT "app_calendar_settings_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_sync_logs" ADD CONSTRAINT "app_calendar_sync_logs_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_calendar_sync_logs" ADD CONSTRAINT "app_calendar_sync_logs_meeting_id_app_client_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."app_client_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_analytics" ADD CONSTRAINT "app_client_analytics_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_contact_history" ADD CONSTRAINT "app_client_contact_history_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_contact_history" ADD CONSTRAINT "app_client_contact_history_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_data_access_logs" ADD CONSTRAINT "app_client_data_access_logs_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_data_access_logs" ADD CONSTRAINT "app_client_data_access_logs_accessed_by_app_user_profiles_id_fk" FOREIGN KEY ("accessed_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_data_backups" ADD CONSTRAINT "app_client_data_backups_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_data_backups" ADD CONSTRAINT "app_client_data_backups_triggered_by_app_user_profiles_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_family_members" ADD CONSTRAINT "app_client_family_members_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_milestones" ADD CONSTRAINT "app_client_milestones_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_milestones" ADD CONSTRAINT "app_client_milestones_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_preferences" ADD CONSTRAINT "app_client_preferences_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_stage_history" ADD CONSTRAINT "app_client_stage_history_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_stage_history" ADD CONSTRAINT "app_client_stage_history_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_stage_history" ADD CONSTRAINT "app_client_stage_history_from_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_stage_history" ADD CONSTRAINT "app_client_stage_history_to_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_tag_assignments" ADD CONSTRAINT "app_client_tag_assignments_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_tag_assignments" ADD CONSTRAINT "app_client_tag_assignments_tag_id_app_client_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."app_client_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_tag_assignments" ADD CONSTRAINT "app_client_tag_assignments_assigned_by_app_user_profiles_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_client_tags" ADD CONSTRAINT "app_client_tags_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_activity_logs" ADD CONSTRAINT "app_dashboard_activity_logs_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_goals" ADD CONSTRAINT "app_dashboard_goals_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_goals" ADD CONSTRAINT "app_dashboard_goals_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_notifications" ADD CONSTRAINT "app_dashboard_notifications_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_performance_metrics" ADD CONSTRAINT "app_dashboard_performance_metrics_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_performance_metrics" ADD CONSTRAINT "app_dashboard_performance_metrics_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_quick_actions" ADD CONSTRAINT "app_dashboard_quick_actions_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_dashboard_widgets" ADD CONSTRAINT "app_dashboard_widgets_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_activity_logs" ADD CONSTRAINT "app_influencer_activity_logs_influencer_id_app_influencer_profiles_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."app_influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_activity_logs" ADD CONSTRAINT "app_influencer_activity_logs_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_gratitude_history" ADD CONSTRAINT "app_influencer_gratitude_history_influencer_id_app_influencer_profiles_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."app_influencer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_gratitude_history" ADD CONSTRAINT "app_influencer_gratitude_history_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_gratitude_history" ADD CONSTRAINT "app_influencer_gratitude_history_referral_id_app_client_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."app_client_referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_gratitude_templates" ADD CONSTRAINT "app_influencer_gratitude_templates_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_network_analysis" ADD CONSTRAINT "app_influencer_network_analysis_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_network_analysis" ADD CONSTRAINT "app_influencer_network_analysis_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_profiles" ADD CONSTRAINT "app_influencer_profiles_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_profiles" ADD CONSTRAINT "app_influencer_profiles_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_influencer_profiles" ADD CONSTRAINT "app_influencer_profiles_verified_by_app_user_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_invitation_usage_logs" ADD CONSTRAINT "app_invitation_usage_logs_invitation_id_app_user_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."app_user_invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_invitation_usage_logs" ADD CONSTRAINT "app_invitation_usage_logs_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_edges" ADD CONSTRAINT "app_network_edges_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_edges" ADD CONSTRAINT "app_network_edges_source_node_id_app_network_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."app_network_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_edges" ADD CONSTRAINT "app_network_edges_target_node_id_app_network_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."app_network_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_interactions" ADD CONSTRAINT "app_network_interactions_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_interactions" ADD CONSTRAINT "app_network_interactions_edge_id_app_network_edges_id_fk" FOREIGN KEY ("edge_id") REFERENCES "public"."app_network_edges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_nodes" ADD CONSTRAINT "app_network_nodes_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_nodes" ADD CONSTRAINT "app_network_nodes_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_opportunities" ADD CONSTRAINT "app_network_opportunities_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_opportunities" ADD CONSTRAINT "app_network_opportunities_source_node_id_app_network_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."app_network_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_opportunities" ADD CONSTRAINT "app_network_opportunities_target_node_id_app_network_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."app_network_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_stats" ADD CONSTRAINT "app_network_stats_agent_id_app_user_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_network_stats" ADD CONSTRAINT "app_network_stats_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_history" ADD CONSTRAINT "app_notification_history_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_history" ADD CONSTRAINT "app_notification_history_queue_id_app_notification_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."app_notification_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_queue" ADD CONSTRAINT "app_notification_queue_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_queue" ADD CONSTRAINT "app_notification_queue_template_id_app_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."app_notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_rules" ADD CONSTRAINT "app_notification_rules_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_rules" ADD CONSTRAINT "app_notification_rules_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_settings" ADD CONSTRAINT "app_notification_settings_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_subscriptions" ADD CONSTRAINT "app_notification_subscriptions_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_templates" ADD CONSTRAINT "app_notification_templates_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notification_templates" ADD CONSTRAINT "app_notification_templates_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_analytics" ADD CONSTRAINT "app_pipeline_analytics_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_analytics" ADD CONSTRAINT "app_pipeline_analytics_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_analytics" ADD CONSTRAINT "app_pipeline_analytics_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_automations" ADD CONSTRAINT "app_pipeline_automations_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_automations" ADD CONSTRAINT "app_pipeline_automations_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_automations" ADD CONSTRAINT "app_pipeline_automations_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_goals" ADD CONSTRAINT "app_pipeline_goals_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_goals" ADD CONSTRAINT "app_pipeline_goals_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_goals" ADD CONSTRAINT "app_pipeline_goals_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_history" ADD CONSTRAINT "app_pipeline_stage_history_client_id_app_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."app_client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_history" ADD CONSTRAINT "app_pipeline_stage_history_from_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_history" ADD CONSTRAINT "app_pipeline_stage_history_to_stage_id_app_pipeline_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."app_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_history" ADD CONSTRAINT "app_pipeline_stage_history_changed_by_app_user_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_templates" ADD CONSTRAINT "app_pipeline_stage_templates_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_stage_templates" ADD CONSTRAINT "app_pipeline_stage_templates_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_views" ADD CONSTRAINT "app_pipeline_views_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_pipeline_views" ADD CONSTRAINT "app_pipeline_views_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_dashboards" ADD CONSTRAINT "app_report_dashboards_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_dashboards" ADD CONSTRAINT "app_report_dashboards_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_exports" ADD CONSTRAINT "app_report_exports_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_exports" ADD CONSTRAINT "app_report_exports_report_instance_id_app_report_instances_id_fk" FOREIGN KEY ("report_instance_id") REFERENCES "public"."app_report_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_instances" ADD CONSTRAINT "app_report_instances_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_instances" ADD CONSTRAINT "app_report_instances_template_id_app_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."app_report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_instances" ADD CONSTRAINT "app_report_instances_schedule_id_app_report_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."app_report_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_metrics" ADD CONSTRAINT "app_report_metrics_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_metrics" ADD CONSTRAINT "app_report_metrics_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_schedules" ADD CONSTRAINT "app_report_schedules_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_schedules" ADD CONSTRAINT "app_report_schedules_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_schedules" ADD CONSTRAINT "app_report_schedules_template_id_app_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."app_report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_subscriptions" ADD CONSTRAINT "app_report_subscriptions_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_subscriptions" ADD CONSTRAINT "app_report_subscriptions_template_id_app_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."app_report_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_templates" ADD CONSTRAINT "app_report_templates_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_report_templates" ADD CONSTRAINT "app_report_templates_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_backups" ADD CONSTRAINT "app_settings_backups_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_change_logs" ADD CONSTRAINT "app_settings_change_logs_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_integrations" ADD CONSTRAINT "app_settings_integrations_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_security_logs" ADD CONSTRAINT "app_settings_security_logs_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_theme_preferences" ADD CONSTRAINT "app_settings_theme_preferences_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings_user_profiles" ADD CONSTRAINT "app_settings_user_profiles_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_activity_logs" ADD CONSTRAINT "app_team_activity_logs_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_activity_logs" ADD CONSTRAINT "app_team_activity_logs_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_communication_channels" ADD CONSTRAINT "app_team_communication_channels_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_communication_channels" ADD CONSTRAINT "app_team_communication_channels_created_by_app_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_goals" ADD CONSTRAINT "app_team_goals_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_goals" ADD CONSTRAINT "app_team_goals_created_by_app_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_members" ADD CONSTRAINT "app_team_members_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_members" ADD CONSTRAINT "app_team_members_user_id_app_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_members" ADD CONSTRAINT "app_team_members_invited_by_app_user_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_performance_metrics" ADD CONSTRAINT "app_team_performance_metrics_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_performance_metrics" ADD CONSTRAINT "app_team_performance_metrics_member_id_app_user_profiles_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_stats_cache" ADD CONSTRAINT "app_team_stats_cache_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_training_records" ADD CONSTRAINT "app_team_training_records_team_id_app_user_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."app_user_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_training_records" ADD CONSTRAINT "app_team_training_records_member_id_app_user_profiles_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_team_training_records" ADD CONSTRAINT "app_team_training_records_trainer_id_app_user_profiles_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."app_user_profiles"("id") ON DELETE no action ON UPDATE no action;