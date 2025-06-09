-- =============================================================================
-- SureCRM 수정된 RLS (Row Level Security) 정책
-- 실제 데이터베이스에서 확인한 정확한 컬럼명 사용
-- =============================================================================

-- =============================================================================
-- 1. 핵심 테이블 RLS 정책 (실제 존재하는 테이블들)
-- =============================================================================

-- ===== app_user_profiles 테이블 =====
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.app_user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.app_user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Team admins can view team members" ON public.app_user_profiles
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'team_admin'
    )
  );

-- ===== app_user_teams 테이블 =====
ALTER TABLE public.app_user_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view own team" ON public.app_user_teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team" ON public.app_user_teams
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON public.app_user_teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND admin_id = auth.uid());

-- ===== app_pipeline_stages 테이블 =====
ALTER TABLE public.app_pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible pipeline stages" ON public.app_pipeline_stages
  FOR SELECT USING (
    agent_id = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own pipeline stages" ON public.app_pipeline_stages
  FOR ALL USING (
    agent_id = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

-- ===== app_client_profiles 테이블 =====
ALTER TABLE public.app_client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible clients" ON public.app_client_profiles
  FOR SELECT USING (
    agent_id = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own clients" ON public.app_client_profiles
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Users can update accessible clients" ON public.app_client_profiles
  FOR UPDATE USING (
    agent_id = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY "Users can delete accessible clients" ON public.app_client_profiles
  FOR DELETE USING (
    agent_id = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

-- ===== app_client_details 테이블 =====
ALTER TABLE public.app_client_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client details" ON public.app_client_details
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage client details" ON public.app_client_details
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
      )
    )
  );

-- ===== app_client_insurance 테이블 =====
ALTER TABLE public.app_client_insurance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insurance info" ON public.app_client_insurance
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage insurance info" ON public.app_client_insurance
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
      )
    )
  );

-- ===== app_client_referrals 테이블 =====
ALTER TABLE public.app_client_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible referrals" ON public.app_client_referrals
  FOR SELECT USING (
    agent_id = auth.uid()
    OR referrer_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
    OR referred_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage accessible referrals" ON public.app_client_referrals
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_client_meetings 테이블 =====
ALTER TABLE public.app_client_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible meetings" ON public.app_client_meetings
  FOR SELECT USING (
    agent_id = auth.uid()
    OR client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage accessible meetings" ON public.app_client_meetings
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_user_invitations 테이블 =====
ALTER TABLE public.app_user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON public.app_user_invitations
  FOR SELECT USING (inviter_id = auth.uid() OR used_by_id = auth.uid());

CREATE POLICY "Users can create invitations" ON public.app_user_invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update own invitations" ON public.app_user_invitations
  FOR UPDATE USING (inviter_id = auth.uid());

-- ===== app_client_documents 테이블 =====
ALTER TABLE public.app_client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible documents" ON public.app_client_documents
  FOR SELECT USING (
    agent_id = auth.uid()
    OR client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage accessible documents" ON public.app_client_documents
  FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 2. 보험계약 관련 테이블 RLS 정책
-- =============================================================================

-- ===== app_opportunity_products 테이블 =====
ALTER TABLE public.app_opportunity_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible opportunities" ON public.app_opportunity_products
  FOR SELECT USING (
    agent_id = auth.uid()
    OR client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage accessible opportunities" ON public.app_opportunity_products
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_client_insurance_contracts 테이블 =====
ALTER TABLE public.app_client_insurance_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible contracts" ON public.app_client_insurance_contracts
  FOR SELECT USING (
    agent_id = auth.uid()
    OR client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage accessible contracts" ON public.app_client_insurance_contracts
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_client_contract_attachments 테이블 =====
ALTER TABLE public.app_client_contract_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible contract attachments" ON public.app_client_contract_attachments
  FOR SELECT USING (
    agent_id = auth.uid()
    OR contract_id IN (
      SELECT id FROM public.app_client_insurance_contracts 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage accessible contract attachments" ON public.app_client_contract_attachments
  FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 3. Admin 테이블 RLS 정책
-- =============================================================================

-- ===== admin_system_audit_logs 테이블 =====
ALTER TABLE public.admin_system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view audit logs" ON public.admin_system_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "System admins can create audit logs" ON public.admin_system_audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== admin_system_settings 테이블 =====
ALTER TABLE public.admin_system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can manage settings" ON public.admin_system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== admin_system_stats_cache 테이블 =====
ALTER TABLE public.admin_system_stats_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can manage stats cache" ON public.admin_system_stats_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- =============================================================================
-- 4. Calendar 기능 테이블 RLS 정책
-- =============================================================================

-- ===== app_calendar_meeting_templates 테이블 =====
ALTER TABLE public.app_calendar_meeting_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meeting templates" ON public.app_calendar_meeting_templates
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_calendar_meeting_checklists 테이블 =====
ALTER TABLE public.app_calendar_meeting_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage accessible checklists" ON public.app_calendar_meeting_checklists
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- ===== app_calendar_meeting_reminders 테이블 =====
ALTER TABLE public.app_calendar_meeting_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage accessible reminders" ON public.app_calendar_meeting_reminders
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- ===== app_calendar_meeting_attendees 테이블 =====
ALTER TABLE public.app_calendar_meeting_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage accessible attendees" ON public.app_calendar_meeting_attendees
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- ===== app_calendar_meeting_notes 테이블 =====
ALTER TABLE public.app_calendar_meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage accessible meeting notes" ON public.app_calendar_meeting_notes
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- ===== app_calendar_settings 테이블 =====
ALTER TABLE public.app_calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar settings" ON public.app_calendar_settings
  FOR ALL USING (agent_id = auth.uid());

-- ===== app_calendar_recurring_meetings 테이블 (parent_meeting_id 기반) =====
ALTER TABLE public.app_calendar_recurring_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring meetings" ON public.app_calendar_recurring_meetings
  FOR ALL USING (
    parent_meeting_id IN (
      SELECT id FROM public.app_client_meetings 
      WHERE agent_id = auth.uid()
    )
  );

-- ===== app_calendar_sync_logs 테이블 =====
ALTER TABLE public.app_calendar_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs" ON public.app_calendar_sync_logs
  FOR SELECT USING (agent_id = auth.uid());

-- =============================================================================
-- 5. 나머지 테이블들 (대부분 user_id 사용)
-- =============================================================================

-- ===== Dashboard 관련 테이블들 =====
ALTER TABLE public.app_dashboard_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible performance metrics" ON public.app_dashboard_performance_metrics
  FOR SELECT USING (
    agent_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

ALTER TABLE public.app_dashboard_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible goals" ON public.app_dashboard_goals
  FOR ALL USING (
    agent_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

ALTER TABLE public.app_dashboard_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity logs" ON public.app_dashboard_activity_logs
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_dashboard_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own dashboard notifications" ON public.app_dashboard_notifications
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own dashboard widgets" ON public.app_dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_dashboard_quick_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quick actions" ON public.app_dashboard_quick_actions
  FOR ALL USING (user_id = auth.uid());

-- ===== Notification 관련 테이블들 (user_id 사용) =====
ALTER TABLE public.app_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification settings" ON public.app_notification_settings
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification templates" ON public.app_notification_templates
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification queue" ON public.app_notification_queue
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_notification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification history" ON public.app_notification_history
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_notification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification rules" ON public.app_notification_rules
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_notification_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification subscriptions" ON public.app_notification_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ===== Pipeline 관련 테이블들 (user_id 사용) =====
ALTER TABLE public.app_pipeline_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible pipeline history" ON public.app_pipeline_stage_history
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

ALTER TABLE public.app_pipeline_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible pipeline views" ON public.app_pipeline_views
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_pipeline_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible pipeline analytics" ON public.app_pipeline_analytics
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_pipeline_stage_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible pipeline templates" ON public.app_pipeline_stage_templates
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_pipeline_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible pipeline goals" ON public.app_pipeline_goals
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_pipeline_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible pipeline automations" ON public.app_pipeline_automations
  FOR ALL USING (user_id = auth.uid());

-- ===== Reports 관련 테이블들 (user_id 사용) =====
ALTER TABLE public.app_report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible report templates" ON public.app_report_templates
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible report schedules" ON public.app_report_schedules
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_report_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible report instances" ON public.app_report_instances
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_report_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible report dashboards" ON public.app_report_dashboards
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_report_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible report metrics" ON public.app_report_metrics
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_report_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible report exports" ON public.app_report_exports
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_report_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible report subscriptions" ON public.app_report_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ===== Settings 관련 테이블들 (user_id 사용) =====
ALTER TABLE public.app_settings_user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings profiles" ON public.app_settings_user_profiles
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_settings_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own integrations" ON public.app_settings_integrations
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_settings_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own backups" ON public.app_settings_backups
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_settings_change_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own change logs" ON public.app_settings_change_logs
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.app_settings_theme_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own theme preferences" ON public.app_settings_theme_preferences
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.app_settings_security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own security logs" ON public.app_settings_security_logs
  FOR SELECT USING (user_id = auth.uid());

-- ===== Team 관련 테이블들 =====
ALTER TABLE public.app_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team data" ON public.app_team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team members" ON public.app_team_members
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

ALTER TABLE public.app_team_stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view stats cache" ON public.app_team_stats_cache
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

ALTER TABLE public.app_team_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view performance metrics" ON public.app_team_performance_metrics
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

ALTER TABLE public.app_team_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view team goals" ON public.app_team_goals
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team goals" ON public.app_team_goals
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

ALTER TABLE public.app_team_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view activity logs" ON public.app_team_activity_logs
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

ALTER TABLE public.app_team_communication_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view communication channels" ON public.app_team_communication_channels
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage communication channels" ON public.app_team_communication_channels
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin')
    )
  );

ALTER TABLE public.app_team_training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view training records" ON public.app_team_training_records
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.app_user_profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================================================
-- 6. 빠르게 적용할 기타 테이블들
-- =============================================================================

-- Influencer 관련
ALTER TABLE public.app_influencer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible influencer profiles" ON public.app_influencer_profiles FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_influencer_gratitude_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible gratitude history" ON public.app_influencer_gratitude_history FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_influencer_network_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible network analysis" ON public.app_influencer_network_analysis FOR SELECT USING (agent_id = auth.uid());

ALTER TABLE public.app_influencer_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible activity logs" ON public.app_influencer_activity_logs FOR SELECT USING (agent_id = auth.uid());

ALTER TABLE public.app_influencer_gratitude_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own gratitude templates" ON public.app_influencer_gratitude_templates FOR ALL USING (agent_id = auth.uid());

-- Network 관련 (agent_id 사용)
ALTER TABLE public.app_network_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible network data" ON public.app_network_nodes FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_network_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible network edges" ON public.app_network_edges FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_network_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible network stats" ON public.app_network_stats FOR SELECT USING (agent_id = auth.uid());

ALTER TABLE public.app_network_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible network interactions" ON public.app_network_interactions FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_network_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible network opportunities" ON public.app_network_opportunities FOR ALL USING (agent_id = auth.uid());

-- Invitation 관련 (user_id 사용)
ALTER TABLE public.app_invitation_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invitation usage logs" ON public.app_invitation_usage_logs FOR SELECT USING (user_id = auth.uid());

-- Client 확장 테이블들
ALTER TABLE public.app_client_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible client tags" ON public.app_client_tags FOR ALL USING (
  agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid())
);

ALTER TABLE public.app_client_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible tag assignments" ON public.app_client_tag_assignments FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid()))
);

ALTER TABLE public.app_client_contact_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible contact history" ON public.app_client_contact_history FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_client_family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible family members" ON public.app_client_family_members FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid()))
);

ALTER TABLE public.app_client_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible client preferences" ON public.app_client_preferences FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid()))
);

ALTER TABLE public.app_client_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible client analytics" ON public.app_client_analytics FOR SELECT USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid()))
);

ALTER TABLE public.app_client_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible client milestones" ON public.app_client_milestones FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_client_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible stage history" ON public.app_client_stage_history FOR SELECT USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid() OR team_id IN (SELECT team_id FROM public.app_user_profiles WHERE id = auth.uid()))
);

ALTER TABLE public.app_client_data_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team admins can view data access logs" ON public.app_client_data_access_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.app_user_profiles WHERE id = auth.uid() AND role IN ('team_admin', 'system_admin'))
);

ALTER TABLE public.app_client_data_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System admins can manage data backups" ON public.app_client_data_backups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.app_user_profiles WHERE id = auth.uid() AND role = 'system_admin')
);

-- 나머지 확장 테이블들도 빠르게 처리
ALTER TABLE public.app_client_checkup_purposes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible checkup purposes" ON public.app_client_checkup_purposes FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid())
);

ALTER TABLE public.app_client_consultation_companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible consultation companions" ON public.app_client_consultation_companions FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid())
);

ALTER TABLE public.app_client_consultation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible consultation notes" ON public.app_client_consultation_notes FOR ALL USING (agent_id = auth.uid());

ALTER TABLE public.app_client_interest_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible interest categories" ON public.app_client_interest_categories FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid())
);

ALTER TABLE public.app_client_medical_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage accessible medical history" ON public.app_client_medical_history FOR ALL USING (
  client_id IN (SELECT id FROM public.app_client_profiles WHERE agent_id = auth.uid())
);

-- =============================================================================
-- 7. Public 테이블 RLS 정책 (공개 콘텐츠)
-- =============================================================================

-- ===== public_site_contents 테이블 =====
ALTER TABLE public.public_site_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published content" ON public.public_site_contents
  FOR SELECT USING (status = 'published');

CREATE POLICY "System admins can manage all content" ON public.public_site_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== public_site_faqs 테이블 =====
ALTER TABLE public.public_site_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs" ON public.public_site_faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "System admins can manage FAQs" ON public.public_site_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== public_site_announcements 테이블 =====
ALTER TABLE public.public_site_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published announcements" ON public.public_site_announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "System admins can manage announcements" ON public.public_site_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== public_site_testimonials 테이블 =====
ALTER TABLE public.public_site_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published testimonials" ON public.public_site_testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY "System admins can manage testimonials" ON public.public_site_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== public_site_settings 테이블 =====
ALTER TABLE public.public_site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public site settings" ON public.public_site_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "System admins can manage site settings" ON public.public_site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ===== public_site_analytics 테이블 =====
ALTER TABLE public.public_site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view page analytics" ON public.public_site_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_user_profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- Admin 확장 테이블들
ALTER TABLE public.app_admin_dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System admins can manage admin widgets" ON public.app_admin_dashboard_widgets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.app_user_profiles WHERE id = auth.uid() AND role = 'system_admin')
);

ALTER TABLE public.app_admin_security_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System admins can manage security alerts" ON public.app_admin_security_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.app_user_profiles WHERE id = auth.uid() AND role = 'system_admin')
);

ALTER TABLE public.app_admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System admins can manage admin sessions" ON public.app_admin_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.app_user_profiles WHERE id = auth.uid() AND role = 'system_admin')
);

-- =============================================================================
-- 8. 보안 헬퍼 함수들
-- =============================================================================

-- 팀 멤버 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_team_member(target_team_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_team_id UUID;
BEGIN
    -- 현재 사용자의 팀 ID 조회
    SELECT team_id INTO user_team_id
    FROM public.app_user_profiles 
    WHERE id = auth.uid();
    
    -- target_team_id가 제공되지 않은 경우, 사용자의 팀만 확인
    IF target_team_id IS NULL THEN
        RETURN user_team_id IS NOT NULL;
    END IF;
    
    -- 특정 팀 멤버인지 확인
    RETURN user_team_id = target_team_id;
END;
$$;

-- 팀 관리자 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_team_admin(target_team_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_profile RECORD;
BEGIN
    -- 현재 사용자 프로필 조회
    SELECT team_id, role INTO user_profile
    FROM public.app_user_profiles 
    WHERE id = auth.uid();
    
    -- 시스템 관리자는 모든 팀에 접근 가능
    IF user_profile.role = 'system_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- 팀 관리자 권한 확인
    IF user_profile.role != 'team_admin' THEN
        RETURN FALSE;
    END IF;
    
    -- target_team_id가 제공되지 않은 경우, 팀 관리자인지만 확인
    IF target_team_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- 특정 팀의 관리자인지 확인
    RETURN user_profile.team_id = target_team_id;
END;
$$;

-- 시스템 관리자 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- 현재 사용자의 역할 조회
    SELECT role INTO user_role
    FROM public.app_user_profiles 
    WHERE id = auth.uid();
    
    RETURN user_role = 'system_admin';
END;
$$;

-- 클라이언트 접근 권한 확인 함수
CREATE OR REPLACE FUNCTION public.can_access_client(client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_profile RECORD;
    client_agent_id UUID;
BEGIN
    -- 현재 사용자 프로필 조회
    SELECT team_id, role INTO user_profile
    FROM public.app_user_profiles 
    WHERE id = auth.uid();
    
    -- 시스템 관리자는 모든 클라이언트에 접근 가능
    IF user_profile.role = 'system_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- 클라이언트의 담당 에이전트 조회
    SELECT agent_id INTO client_agent_id
    FROM public.app_clients 
    WHERE id = client_id;
    
    -- 본인이 담당하는 클라이언트인지 확인
    IF client_agent_id = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- 팀 관리자인 경우 같은 팀의 클라이언트에 접근 가능
    IF user_profile.role = 'team_admin' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.app_user_profiles 
            WHERE id = client_agent_id 
            AND team_id = user_profile.team_id
        );
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 인덱스 최적화 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_team_id ON public.app_user_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_role ON public.app_user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_agent_id ON public.app_client_profiles(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_team_id ON public.app_client_profiles(team_id);

-- =============================================================================
-- 완료 메시지
-- =============================================================================

-- 이 스크립트는 실제 데이터베이스 스키마에서 확인한 정확한 컬럼명을 사용합니다.
-- snake_case 형식의 컬럼명(team_id, user_id, agent_id)을 정확히 적용했습니다.

COMMENT ON SCHEMA public IS 'SureCRM 정확한 컬럼명 기반 RLS 정책이 적용된 스키마';