-- RLS (Row Level Security) 정책 설정
-- 이 스크립트는 Supabase SQL Editor에서 실행해야 합니다.

-- =============================================================================
-- 1. 기본 테이블들 RLS 활성화
-- =============================================================================

-- Profiles 테이블 (사용자는 자신의 프로필만 접근)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Teams 테이블 (팀 멤버만 접근)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update team" ON public.teams
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pipeline Stages 테이블 (팀 멤버만 접근)
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view pipeline stages" ON public.pipeline_stages
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage pipeline stages" ON public.pipeline_stages
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Clients 테이블 (담당자와 팀 멤버만 접근)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team clients" ON public.clients
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage team clients" ON public.clients
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Client Details 테이블 (클라이언트와 연결된 정책)
ALTER TABLE public.client_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team client details" ON public.client_details
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team client details" ON public.client_details
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- App Client Details 테이블 (새로운 테이블 정책 추가)
ALTER TABLE public.app_client_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view app client details" ON public.app_client_details
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage app client details" ON public.app_client_details
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- Insurance Info 테이블
ALTER TABLE public.insurance_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team insurance info" ON public.insurance_info
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team insurance info" ON public.insurance_info
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Referrals 테이블
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team referrals" ON public.referrals
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team referrals" ON public.referrals
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Meetings 테이블
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team meetings" ON public.meetings
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team meetings" ON public.meetings
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Invitations 테이블
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON public.invitations
  FOR SELECT USING (inviter_id = auth.uid());

CREATE POLICY "Users can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update own invitations" ON public.invitations
  FOR UPDATE USING (inviter_id = auth.uid());

-- Documents 테이블
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team documents" ON public.documents
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team documents" ON public.documents
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 2. Dashboard 관련 테이블들
-- =============================================================================

-- Performance Metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team performance metrics" ON public.performance_metrics
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    ) OR agent_id = auth.uid()
  );

CREATE POLICY "Users can manage own performance metrics" ON public.performance_metrics
  FOR ALL USING (agent_id = auth.uid());

-- Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team goals" ON public.goals
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.profiles 
      WHERE id = auth.uid()
    ) OR agent_id = auth.uid()
  );

CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (agent_id = auth.uid());

-- Activity Logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Dashboard Widgets
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard widgets" ON public.dashboard_widgets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own dashboard widgets" ON public.dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

-- Quick Actions
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick actions" ON public.quick_actions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own quick actions" ON public.quick_actions
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- 3. Clients 관련 테이블들
-- =============================================================================

-- Client Tags
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team client tags" ON public.client_tags
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team client tags" ON public.client_tags
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM public.profiles 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Client Tag Assignments
ALTER TABLE public.client_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team client tag assignments" ON public.client_tag_assignments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team client tag assignments" ON public.client_tag_assignments
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Client Preferences
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team client preferences" ON public.client_preferences
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team client preferences" ON public.client_preferences
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Client Milestones
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team client milestones" ON public.client_milestones
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage team client milestones" ON public.client_milestones
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE team_id IN (
        SELECT team_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 4. 나머지 모든 테이블들에 대한 기본 RLS 활성화
-- =============================================================================

-- 팀 관련 테이블들
ALTER TABLE public.team_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- 설정 관련 테이블들
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 리포트 관련 테이블들
ALTER TABLE public.report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_dashboards ENABLE ROW LEVEL SECURITY;

-- 파이프라인 관련 테이블들
ALTER TABLE public.stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_bottlenecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_analytics ENABLE ROW LEVEL SECURITY;

-- 알림 관련 테이블들
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- 네트워크 관련 테이블들
ALTER TABLE public.network_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_analysis_results ENABLE ROW LEVEL SECURITY;

-- 초대 관련 테이블들
ALTER TABLE public.invitation_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_analytics ENABLE ROW LEVEL SECURITY;

-- 인플루언서 관련 테이블들
ALTER TABLE public.referral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. 기본 팀 기반 정책 (나머지 테이블들용)
-- =============================================================================

-- 팀 기반 접근 정책 함수 생성
CREATE OR REPLACE FUNCTION public.is_team_member(target_team_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND team_id = target_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 모든 팀 관련 테이블에 기본 정책 적용
DO $$
DECLARE
    table_name text;
    table_names text[] := ARRAY[
        'team_templates', 'team_performance', 'team_members', 'team_knowledge_base',
        'team_goals', 'team_collaborations', 'team_announcements', 'team_activities',
        'user_settings', 'team_settings', 'integrations', 'feature_flags',
        'backup_configurations', 'audit_logs', 'api_keys',
        'report_subscriptions', 'report_metrics', 'report_schedules', 'report_templates',
        'report_instances', 'report_exports', 'report_dashboards',
        'stage_templates', 'stage_history', 'pipeline_views', 'pipeline_goals',
        'pipeline_bottlenecks', 'pipeline_automations', 'pipeline_analytics',
        'notification_subscriptions', 'notification_settings', 'notification_rules',
        'notification_templates', 'notification_queue', 'notification_history',
        'network_opportunities', 'network_interactions', 'network_events',
        'network_nodes', 'network_connections', 'network_analysis_results',
        'invitation_waitlist', 'invitation_usage_logs', 'invitation_rewards',
        'invitation_referral_tracking', 'invitation_templates', 'invitation_campaigns',
        'invitation_analytics', 'referral_patterns', 'network_analysis',
        'gratitude_templates', 'gratitude_history', 'influencer_profiles'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- 테이블이 존재하는지 확인
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            -- 기본 정책 생성 (팀 멤버만 접근)
            EXECUTE format('
                CREATE POLICY "Team members only" ON public.%I
                FOR ALL USING (
                    CASE 
                        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''team_id'') 
                        THEN public.is_team_member(team_id)
                        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''user_id'') 
                        THEN user_id = auth.uid()
                        ELSE auth.role() = ''authenticated''
                    END
                );
            ', table_name, table_name, table_name);
        END IF;
    END LOOP;
END $$;

-- System settings는 관리자만 접근
DROP POLICY IF EXISTS "Team members only" ON public.system_settings;
CREATE POLICY "Admins only" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'team_admin'
    )
  );

-- =============================================================================
-- 완료 메시지
-- =============================================================================

-- 정책 적용 완료 확인
SELECT 'RLS 정책이 성공적으로 적용되었습니다!' as message; 