-- =============================================
-- 📋 테이블 Prefix 네이밍 컨벤션 적용 마이그레이션
-- 
-- 새로운 네이밍 규칙:
-- - app_: 일반 앱 기능들 (사용자가 사용하는 주요 기능)
-- - public_: 공통/공개 기능들 (여러 기능에서 공유하는 데이터)  
-- - admin_: 관리자 전용 기능들 (백오피스/운영자 기능)
-- 
-- 패턴: {prefix}_{기능명}_{테이블명}
-- Enum 패턴: {prefix}_{기능명}_{enum명}_enum
-- =============================================

-- 🔄 1. Enum 재생성 (기존 enum drop 후 새로 생성)

-- 기존 enum 삭제
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS importance CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS insurance_type CASCADE;
DROP TYPE IF EXISTS meeting_type CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;
DROP TYPE IF EXISTS referral_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS invitation_status CASCADE;
DROP TYPE IF EXISTS theme CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS language CASCADE;

-- 새로운 네이밍 컨벤션에 맞는 enum 생성
CREATE TYPE app_user_role_enum AS ENUM ('agent', 'team_admin', 'system_admin');
CREATE TYPE app_importance_enum AS ENUM ('high', 'medium', 'low');
CREATE TYPE app_gender_enum AS ENUM ('male', 'female');
CREATE TYPE app_insurance_type_enum AS ENUM ('life', 'health', 'auto', 'prenatal', 'property', 'other');
CREATE TYPE app_meeting_type_enum AS ENUM ('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');
CREATE TYPE app_meeting_status_enum AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE app_referral_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE app_document_type_enum AS ENUM ('policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other');
CREATE TYPE app_invitation_status_enum AS ENUM ('pending', 'used', 'expired', 'cancelled');
CREATE TYPE app_theme_enum AS ENUM ('light', 'dark');

-- Public 관련 enum
CREATE TYPE public_content_type_enum AS ENUM ('terms_of_service', 'privacy_policy', 'faq', 'announcement', 'help_article');
CREATE TYPE public_content_status_enum AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public_language_enum AS ENUM ('ko', 'en', 'ja', 'zh');

-- Calendar 관련 enum
CREATE TYPE app_calendar_view_enum AS ENUM ('month', 'week', 'day', 'agenda');
CREATE TYPE app_calendar_meeting_status_enum AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE app_calendar_meeting_type_enum AS ENUM ('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other');
CREATE TYPE app_calendar_reminder_type_enum AS ENUM ('none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day');
CREATE TYPE app_calendar_recurrence_type_enum AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- 🔄 2. 기존 테이블명 변경

-- App Core 테이블들
ALTER TABLE IF EXISTS app_profiles RENAME TO app_user_profiles;
ALTER TABLE IF EXISTS app_teams RENAME TO app_user_teams;
ALTER TABLE IF EXISTS app_clients RENAME TO app_client_profiles;
ALTER TABLE IF EXISTS app_insurance_info RENAME TO app_client_insurance;
ALTER TABLE IF EXISTS app_referrals RENAME TO app_client_referrals;
ALTER TABLE IF EXISTS app_meetings RENAME TO app_client_meetings;
ALTER TABLE IF EXISTS app_invitations RENAME TO app_user_invitations;
ALTER TABLE IF EXISTS app_documents RENAME TO app_client_documents;

-- Public 테이블들
ALTER TABLE IF EXISTS public_contents RENAME TO public_site_contents;
ALTER TABLE IF EXISTS public_faqs RENAME TO public_site_faqs;
ALTER TABLE IF EXISTS public_announcements RENAME TO public_site_announcements;
ALTER TABLE IF EXISTS public_testimonials RENAME TO public_site_testimonials;
ALTER TABLE IF EXISTS public_page_views RENAME TO public_site_analytics;

-- Admin 테이블들
ALTER TABLE IF EXISTS admin_audit_logs RENAME TO admin_system_audit_logs;
ALTER TABLE IF EXISTS admin_settings RENAME TO admin_system_settings;
ALTER TABLE IF EXISTS admin_stats_cache RENAME TO admin_system_stats_cache;

-- Calendar 테이블들 (만약 존재한다면)
ALTER TABLE IF EXISTS calendar_meeting_templates RENAME TO app_calendar_meeting_templates;
ALTER TABLE IF EXISTS calendar_meeting_checklists RENAME TO app_calendar_meeting_checklists;
ALTER TABLE IF EXISTS calendar_meeting_reminders RENAME TO app_calendar_meeting_reminders;
ALTER TABLE IF EXISTS calendar_meeting_attendees RENAME TO app_calendar_meeting_attendees;
ALTER TABLE IF EXISTS calendar_meeting_notes RENAME TO app_calendar_meeting_notes;
ALTER TABLE IF EXISTS calendar_settings RENAME TO app_calendar_settings;
ALTER TABLE IF EXISTS calendar_recurring_meetings RENAME TO app_calendar_recurring_meetings;

-- 🔄 3. 컬럼 타입 업데이트 (enum 참조 수정)

-- app_user_profiles 테이블
ALTER TABLE app_user_profiles 
  ALTER COLUMN role TYPE app_user_role_enum USING role::text::app_user_role_enum,
  ALTER COLUMN theme TYPE app_theme_enum USING theme::text::app_theme_enum;

-- app_client_profiles 테이블  
ALTER TABLE app_client_profiles
  ALTER COLUMN importance TYPE app_importance_enum USING importance::text::app_importance_enum;

-- app_client_details 테이블
ALTER TABLE app_client_details
  ALTER COLUMN gender TYPE app_gender_enum USING gender::text::app_gender_enum;

-- app_client_insurance 테이블
ALTER TABLE app_client_insurance
  ALTER COLUMN insurance_type TYPE app_insurance_type_enum USING insurance_type::text::app_insurance_type_enum;

-- app_client_meetings 테이블
ALTER TABLE app_client_meetings
  ALTER COLUMN meeting_type TYPE app_meeting_type_enum USING meeting_type::text::app_meeting_type_enum,
  ALTER COLUMN status TYPE app_meeting_status_enum USING status::text::app_meeting_status_enum;

-- app_client_referrals 테이블
ALTER TABLE app_client_referrals
  ALTER COLUMN status TYPE app_referral_status_enum USING status::text::app_referral_status_enum;

-- app_user_invitations 테이블
ALTER TABLE app_user_invitations
  ALTER COLUMN status TYPE app_invitation_status_enum USING status::text::app_invitation_status_enum;

-- app_client_documents 테이블
ALTER TABLE app_client_documents
  ALTER COLUMN document_type TYPE app_document_type_enum USING document_type::text::app_document_type_enum;

-- Public 테이블들
ALTER TABLE public_site_contents
  ALTER COLUMN type TYPE public_content_type_enum USING type::text::public_content_type_enum,
  ALTER COLUMN status TYPE public_content_status_enum USING status::text::public_content_status_enum,
  ALTER COLUMN language TYPE public_language_enum USING language::text::public_language_enum;

ALTER TABLE public_site_faqs
  ALTER COLUMN language TYPE public_language_enum USING language::text::public_language_enum;

ALTER TABLE public_site_announcements
  ALTER COLUMN language TYPE public_language_enum USING language::text::public_language_enum;

ALTER TABLE public_site_testimonials
  ALTER COLUMN language TYPE public_language_enum USING language::text::public_language_enum;

-- 🔄 4. RLS 정책 업데이트

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON app_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON app_profiles;
DROP POLICY IF EXISTS "Users can view own clients" ON app_clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON app_clients;
DROP POLICY IF EXISTS "Users can update own clients" ON app_clients;

-- 새로운 테이블명으로 정책 재생성
CREATE POLICY "Users can view own profile" ON app_user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON app_user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own clients" ON app_client_profiles
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Users can insert own clients" ON app_client_profiles
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Users can update own clients" ON app_client_profiles
  FOR UPDATE USING (auth.uid() = agent_id);

-- 🔄 5. 트리거 함수 업데이트

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 새로운 테이블명으로 트리거 함수 재생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 🔄 6. 인덱스 재생성 (필요한 경우)

-- 주요 테이블들의 인덱스 확인 및 재생성
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_role ON app_user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_team_id ON app_user_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_agent_id ON app_client_profiles(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_client_profiles_team_id ON app_client_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_app_client_meetings_client_id ON app_client_meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_app_client_meetings_agent_id ON app_client_meetings(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_client_meetings_scheduled_at ON app_client_meetings(scheduled_at);

-- ✅ 완료 로그
DO $$
BEGIN
    RAISE NOTICE '🎉 테이블 네이밍 컨벤션 적용 완료!';
    RAISE NOTICE '📋 적용된 규칙:';
    RAISE NOTICE '   - app_: 일반 앱 기능들';
    RAISE NOTICE '   - public_: 공통/공개 기능들';
    RAISE NOTICE '   - admin_: 관리자 전용 기능들';
    RAISE NOTICE '🔧 패턴: {prefix}_{기능명}_{테이블명}';
END $$; 