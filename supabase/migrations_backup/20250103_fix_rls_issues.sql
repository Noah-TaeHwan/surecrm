-- =============================================================================
-- SureCRM RLS 이슈 해결 마이그레이션
-- 2025-01-03: 모든 테이블 RLS 활성화 및 정책 추가
-- =============================================================================

-- =============================================================================
-- 1. 모든 public 테이블에 대해 RLS 활성화
-- =============================================================================

-- Admin 테이블들
ALTER TABLE public.admin_system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_stats_cache ENABLE ROW LEVEL SECURITY;

-- App Admin 테이블들
ALTER TABLE public.app_admin_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admin_sessions ENABLE ROW LEVEL SECURITY;

-- Calendar 테이블들
ALTER TABLE public.app_calendar_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_meeting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_recurring_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Client 테이블들 (핵심)
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

-- Dashboard 테이블들
ALTER TABLE public.app_dashboard_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Influencer 테이블들
ALTER TABLE public.app_influencer_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_gratitude_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_gratitude_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_network_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_influencer_profiles ENABLE ROW LEVEL SECURITY;

-- Invitation 테이블들
ALTER TABLE public.app_invitation_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_invitations ENABLE ROW LEVEL SECURITY;

-- Network 테이블들
ALTER TABLE public.app_network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_network_stats ENABLE ROW LEVEL SECURITY;

-- Notification 테이블들
ALTER TABLE public.app_notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notification_templates ENABLE ROW LEVEL SECURITY;

-- Opportunity/Pipeline 테이블들
ALTER TABLE public.app_opportunity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_pipeline_views ENABLE ROW LEVEL SECURITY;

-- Report 테이블들
ALTER TABLE public.app_report_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_report_templates ENABLE ROW LEVEL SECURITY;

-- Settings 테이블들
ALTER TABLE public.app_settings_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_theme_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_user_profiles ENABLE ROW LEVEL SECURITY;

-- Team 테이블들
ALTER TABLE public.app_team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_team_training_records ENABLE ROW LEVEL SECURITY;

-- User 테이블들
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_teams ENABLE ROW LEVEL SECURITY;

-- Public site 테이블들
ALTER TABLE public.public_site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_site_testimonials ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. 누락된 테이블에 대한 기본 RLS 정책 추가
-- 정책이 있지만 RLS가 비활성화된 테이블들의 정책 활성화는 위에서 이미 처리됨
-- 정책이 없는 테이블들에 대해서만 기본 정책 추가
-- =============================================================================

-- Calendar 관련 - 누락된 정책들
CREATE POLICY IF NOT EXISTS "Users can manage their calendar attendees" ON public.app_calendar_meeting_attendees
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view/manage their interest categories" ON public.app_client_interest_categories
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage their consultation notes" ON public.app_client_consultation_notes
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage their family members" ON public.app_client_family_members
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team admins can view data access logs" ON public.app_client_data_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "System admins can manage data backups" ON public.app_client_data_backups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- Dashboard 관련
CREATE POLICY IF NOT EXISTS "Users can view their dashboard notifications" ON public.app_dashboard_notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their dashboard widgets" ON public.app_dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their network stats" ON public.app_network_stats
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

-- Admin 관련
CREATE POLICY IF NOT EXISTS "System admins can manage admin widgets" ON public.app_admin_dashboard_widgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "System admins can manage security alerts" ON public.app_admin_security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "System admins can manage admin sessions" ON public.app_admin_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- Report 관련
CREATE POLICY IF NOT EXISTS "Users can manage their report dashboards" ON public.app_report_dashboards
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their report exports" ON public.app_report_exports
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their report instances" ON public.app_report_instances
  FOR SELECT USING (user_id = auth.uid());

-- Settings 관련
CREATE POLICY IF NOT EXISTS "Users can manage their change logs" ON public.app_settings_change_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their integrations" ON public.app_settings_integrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their security logs" ON public.app_settings_security_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their theme preferences" ON public.app_settings_theme_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their settings profiles" ON public.app_settings_user_profiles
  FOR ALL USING (user_id = auth.uid());

-- Team 관련
CREATE POLICY IF NOT EXISTS "Team members can view activity logs" ON public.app_team_activity_logs
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view communication channels" ON public.app_team_communication_channels
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team admins can manage communication channels" ON public.app_team_communication_channels
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view team goals" ON public.app_team_goals
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team admins can manage team goals" ON public.app_team_goals
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view team members" ON public.app_team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team admins can manage team members" ON public.app_team_members
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view performance metrics" ON public.app_team_performance_metrics
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view stats cache" ON public.app_team_stats_cache
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view training records" ON public.app_team_training_records
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Public site 관련 (읽기 전용)
CREATE POLICY IF NOT EXISTS "Anyone can view published announcements" ON public.public_site_announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "System admins can manage announcements" ON public.public_site_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can view published content" ON public.public_site_contents
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "System admins can manage all content" ON public.public_site_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can view published FAQs" ON public.public_site_faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "System admins can manage FAQs" ON public.public_site_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can view site settings" ON public.public_site_settings
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System admins can manage site settings" ON public.public_site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can view published testimonials" ON public.public_site_testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "System admins can manage testimonials" ON public.public_site_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY IF NOT EXISTS "System admins can view analytics" ON public.public_site_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- =============================================================================
-- 3. 추가적인 누락된 정책들
-- =============================================================================

-- Client 관련 추가 정책들
CREATE POLICY IF NOT EXISTS "Users can manage client medical history" ON public.app_client_medical_history
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

CREATE POLICY IF NOT EXISTS "Users can manage client tag assignments" ON public.app_client_tag_assignments
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage their client analytics" ON public.app_client_analytics
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage client contact history" ON public.app_client_contact_history
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage checkup purposes" ON public.app_client_checkup_purposes
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can manage consultation companions" ON public.app_client_consultation_companions
  FOR ALL USING (
    consultation_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- 나머지 누락된 테이블들에 대한 기본 정책
CREATE POLICY IF NOT EXISTS "Users can manage their client tags" ON public.app_client_tags
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view accessible stage history" ON public.app_client_stage_history
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- Influencer 관련
CREATE POLICY IF NOT EXISTS "Users can view their influencer profiles" ON public.app_influencer_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their influencer activity logs" ON public.app_influencer_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their gratitude history" ON public.app_influencer_gratitude_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their gratitude templates" ON public.app_influencer_gratitude_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their network analysis" ON public.app_influencer_network_analysis
  FOR SELECT USING (user_id = auth.uid());

-- Network 관련
CREATE POLICY IF NOT EXISTS "Users can manage their network nodes" ON public.app_network_nodes
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their network edges" ON public.app_network_edges
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their network interactions" ON public.app_network_interactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their network opportunities" ON public.app_network_opportunities
  FOR ALL USING (user_id = auth.uid());

-- Invitation 관련
CREATE POLICY IF NOT EXISTS "Users can view their invitation usage logs" ON public.app_invitation_usage_logs
  FOR SELECT USING (user_id = auth.uid());

-- Pipeline 관련
CREATE POLICY IF NOT EXISTS "Users can view their pipeline analytics" ON public.app_pipeline_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their pipeline views" ON public.app_pipeline_views
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their pipeline templates" ON public.app_pipeline_stage_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their pipeline goals" ON public.app_pipeline_goals
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their pipeline automations" ON public.app_pipeline_automations
  FOR ALL USING (user_id = auth.uid());

-- Report 관련 추가
CREATE POLICY IF NOT EXISTS "Users can view their report metrics" ON public.app_report_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their report schedules" ON public.app_report_schedules
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their report subscriptions" ON public.app_report_subscriptions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their report templates" ON public.app_report_templates
  FOR ALL USING (user_id = auth.uid());

-- Settings 관련 추가
CREATE POLICY IF NOT EXISTS "Users can view their settings backups" ON public.app_settings_backups
  FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- 4. 인덱스 추가 (성능 최적화)
-- =============================================================================

-- RLS 정책 성능 최적화를 위한 인덱스들
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_id_role ON public.app_user_profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_team_id_role ON public.app_user_profiles(team_id, role);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_agent_id ON public.app_client_profiles(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_team_id ON public.app_client_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_app_client_meetings_agent_id ON public.app_client_meetings(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_user_invitations_inviter_id ON public.app_user_invitations(inviter_id);

-- =============================================================================
-- 마이그레이션 완료 메시지
-- =============================================================================

-- 완료 확인을 위한 함수 (선택사항)
DO $$
BEGIN
    RAISE NOTICE 'RLS 이슈 해결 마이그레이션이 성공적으로 완료되었습니다.';
    RAISE NOTICE '모든 public 테이블에 RLS가 활성화되었고 필요한 정책들이 추가되었습니다.';
END $$; 