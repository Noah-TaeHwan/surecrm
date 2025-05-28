-- 중복되거나 불필요한 테이블들 정리

-- 1. 필요한 테이블 목록 (유지해야 할 테이블들)
-- profiles, teams, pipeline_stages, clients, client_details, 
-- insurance_info, referrals, meetings, invitations, documents

-- 2. 불필요한 테이블들 삭제 (존재하는 경우에만)
-- 주의: 실제 데이터가 있는 테이블은 신중하게 삭제해야 함

-- 중복된 common_ 접두사 테이블들 삭제
DROP TABLE IF EXISTS public.common_announcements CASCADE;
DROP TABLE IF EXISTS public.common_keys CASCADE;
DROP TABLE IF EXISTS public.common_backup_configurations CASCADE;
DROP TABLE IF EXISTS public.common_audit_logs CASCADE;
DROP TABLE IF EXISTS public.common_faqs CASCADE;
DROP TABLE IF EXISTS public.common_feature_flags CASCADE;
DROP TABLE IF EXISTS public.common_interactions CASCADE;
DROP TABLE IF EXISTS public.common_profiles CASCADE;
DROP TABLE IF EXISTS public.common_public_content CASCADE;
DROP TABLE IF EXISTS public.common_site_settings CASCADE;
DROP TABLE IF EXISTS public.common_system_settings CASCADE;
DROP TABLE IF EXISTS public.common_team_settings CASCADE;
DROP TABLE IF EXISTS public.common_teams CASCADE;
DROP TABLE IF EXISTS public.common_testimonials CASCADE;
DROP TABLE IF EXISTS public.common_user_settings CASCADE;

-- 중복된 features_ 접두사 테이블들 삭제
DROP TABLE IF EXISTS public.features_calendar_events CASCADE;
DROP TABLE IF EXISTS public.features_calendar_integrations CASCADE;
DROP TABLE IF EXISTS public.features_calendar_meetings CASCADE;
DROP TABLE IF EXISTS public.features_calendar_notifications CASCADE;
DROP TABLE IF EXISTS public.features_calendar_reminders CASCADE;
DROP TABLE IF EXISTS public.features_calendar_settings CASCADE;
DROP TABLE IF EXISTS public.features_calendar_recurring CASCADE;

-- 중복된 기타 테이블들 삭제
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.backup_configurations CASCADE;
DROP TABLE IF EXISTS public.calendar_settings CASCADE;
DROP TABLE IF EXISTS public.client_analytics CASCADE;
DROP TABLE IF EXISTS public.client_contact_history CASCADE;
DROP TABLE IF EXISTS public.client_family_members CASCADE;
DROP TABLE IF EXISTS public.client_interactions CASCADE;
DROP TABLE IF EXISTS public.client_preferences CASCADE;
DROP TABLE IF EXISTS public.client_tag_assignments CASCADE;
DROP TABLE IF EXISTS public.client_tags CASCADE;
DROP TABLE IF EXISTS public.dashboard_widgets CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.gratitude_history CASCADE;
DROP TABLE IF EXISTS public.gratitude_templates CASCADE;
DROP TABLE IF EXISTS public.influencer_profiles CASCADE;
DROP TABLE IF EXISTS public.insurance_info CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.invitation_analytics CASCADE;
DROP TABLE IF EXISTS public.invitation_campaigns CASCADE;
DROP TABLE IF EXISTS public.invitation_referral_tracking CASCADE;
DROP TABLE IF EXISTS public.invitation_rewards CASCADE;
DROP TABLE IF EXISTS public.invitation_templates CASCADE;
DROP TABLE IF EXISTS public.invitation_usage_logs CASCADE;
DROP TABLE IF EXISTS public.invitation_waitlist CASCADE;
DROP TABLE IF EXISTS public.meeting_attendees CASCADE;
DROP TABLE IF EXISTS public.meeting_checklists CASCADE;
DROP TABLE IF EXISTS public.meeting_notes CASCADE;
DROP TABLE IF EXISTS public.meeting_reminders CASCADE;

-- 확인: 현재 남아있는 테이블들 확인
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 필요한 테이블들이 존재하는지 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'profiles', 'teams', 'pipeline_stages', 'clients', 'client_details',
      'insurance_info', 'referrals', 'meetings', 'invitations', 'documents'
    ) THEN '✅ 필수 테이블'
    ELSE '❓ 확인 필요'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name; 