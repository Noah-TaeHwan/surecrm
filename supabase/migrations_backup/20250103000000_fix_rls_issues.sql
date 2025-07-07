-- =============================================================================
-- SureCRM RLS 이슈 해결 마이그레이션
-- 2025-01-03: 모든 테이블 RLS 활성화 및 정책 추가
-- =============================================================================

-- 1. 모든 public 테이블에 대해 RLS 활성화
ALTER TABLE public.admin_system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admin_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_recurring_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_checkup_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_consultation_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_contract_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_insurance_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_gratitude_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_gratitude_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_network_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_invitation_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_opportunity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_theme_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_testimonials ENABLE ROW LEVEL SECURITY;

-- 2. 누락된 기본 정책들 추가
CREATE POLICY IF NOT EXISTS "Users can manage calendar attendees" ON public.app_calendar_meeting_attendees
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage interest categories" ON public.app_client_interest_categories
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage family members" ON public.app_client_family_members
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage medical history" ON public.app_client_medical_history
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage client milestones" ON public.app_client_milestones
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage client preferences" ON public.app_client_preferences
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage client tags" ON public.app_client_tags
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage tag assignments" ON public.app_client_tag_assignments
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view dashboard activity" ON public.app_dashboard_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage dashboard goals" ON public.app_dashboard_goals
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage dashboard performance" ON public.app_dashboard_performance_metrics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage quick actions" ON public.app_dashboard_quick_actions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage network nodes" ON public.app_network_nodes
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage network edges" ON public.app_network_edges
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage network interactions" ON public.app_network_interactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage network opportunities" ON public.app_network_opportunities
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view network stats" ON public.app_network_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage pipeline analytics" ON public.app_pipeline_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage pipeline automations" ON public.app_pipeline_automations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage pipeline goals" ON public.app_pipeline_goals
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view pipeline history" ON public.app_pipeline_stage_history
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage pipeline templates" ON public.app_pipeline_stage_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage pipeline views" ON public.app_pipeline_views
  FOR ALL USING (user_id = auth.uid());

-- Public site policies (읽기 가능)
CREATE POLICY IF NOT EXISTS "Public can view published announcements" ON public.public_site_announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "Admins can manage announcements" ON public.public_site_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Public can view published content" ON public.public_site_contents
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "Admins can manage content" ON public.public_site_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Public can view published FAQs" ON public.public_site_faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "Admins can manage FAQs" ON public.public_site_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Public can view site settings" ON public.public_site_settings
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage site settings" ON public.public_site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Public can view testimonials" ON public.public_site_testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "Admins can manage testimonials" ON public.public_site_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view analytics" ON public.public_site_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'RLS 이슈 해결 마이그레이션 완료';
END $$; 