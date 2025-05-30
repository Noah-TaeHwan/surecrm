-- 🏗️ 테이블 이름 변경 - Prefix 적용
-- Migration: 20241219000002_rename_tables_with_prefixes
-- 목적: 테이블 관리 개선을 위한 prefix 적용 (app_, public_, admin_)

-- ===== Core 비즈니스 테이블들: app_ prefix =====

-- 1. Profiles 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles RENAME TO app_profiles;
        RAISE NOTICE 'Table profiles renamed to app_profiles';
    END IF;
END $$;

-- 2. Teams 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'teams') THEN
        ALTER TABLE teams RENAME TO app_teams;
        RAISE NOTICE 'Table teams renamed to app_teams';
    END IF;
END $$;

-- 3. Clients 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients RENAME TO app_clients;
        RAISE NOTICE 'Table clients renamed to app_clients';
    END IF;
END $$;

-- 4. Client Details 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_details') THEN
        ALTER TABLE client_details RENAME TO app_client_details;
        RAISE NOTICE 'Table client_details renamed to app_client_details';
    END IF;
END $$;

-- 5. Insurance Info 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'insurance_info') THEN
        ALTER TABLE insurance_info RENAME TO app_insurance_info;
        RAISE NOTICE 'Table insurance_info renamed to app_insurance_info';
    END IF;
END $$;

-- 6. Referrals 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'referrals') THEN
        ALTER TABLE referrals RENAME TO app_referrals;
        RAISE NOTICE 'Table referrals renamed to app_referrals';
    END IF;
END $$;

-- 7. Meetings 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'meetings') THEN
        ALTER TABLE meetings RENAME TO app_meetings;
        RAISE NOTICE 'Table meetings renamed to app_meetings';
    END IF;
END $$;

-- 8. Invitations 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invitations') THEN
        ALTER TABLE invitations RENAME TO app_invitations;
        RAISE NOTICE 'Table invitations renamed to app_invitations';
    END IF;
END $$;

-- 9. Documents 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
        ALTER TABLE documents RENAME TO app_documents;
        RAISE NOTICE 'Table documents renamed to app_documents';
    END IF;
END $$;

-- 10. Pipeline Stages 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pipeline_stages') THEN
        ALTER TABLE pipeline_stages RENAME TO app_pipeline_stages;
        RAISE NOTICE 'Table pipeline_stages renamed to app_pipeline_stages';
    END IF;
END $$;

-- ===== Public 페이지 테이블들: public_ prefix =====

-- 1. FAQ 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faqs') THEN
        ALTER TABLE faqs RENAME TO public_faqs;
        RAISE NOTICE 'Table faqs renamed to public_faqs';
    END IF;
END $$;

-- 2. Announcements 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements') THEN
        ALTER TABLE announcements RENAME TO public_announcements;
        RAISE NOTICE 'Table announcements renamed to public_announcements';
    END IF;
END $$;

-- 3. Testimonials 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        ALTER TABLE testimonials RENAME TO public_testimonials;
        RAISE NOTICE 'Table testimonials renamed to public_testimonials';
    END IF;
END $$;

-- 4. Site Settings 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_settings') THEN
        ALTER TABLE site_settings RENAME TO public_site_settings;
        RAISE NOTICE 'Table site_settings renamed to public_site_settings';
    END IF;
END $$;

-- 5. Page Views 테이블
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_views') THEN
        ALTER TABLE page_views RENAME TO public_page_views;
        RAISE NOTICE 'Table page_views renamed to public_page_views';
    END IF;
END $$;

-- ===== RLS 정책 업데이트 =====

-- App 테이블들 RLS 설정
ALTER TABLE IF EXISTS app_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Public 테이블들 RLS 설정 (읽기 전용 공개)
ALTER TABLE IF EXISTS public_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_page_views ENABLE ROW LEVEL SECURITY;

-- ===== 업데이트된 RLS 정책들 =====

-- App Profiles 정책
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_profiles') THEN
        -- 기존 정책 삭제
        DROP POLICY IF EXISTS "Users can view own profile" ON app_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON app_profiles;
        
        -- 새 정책 생성
        CREATE POLICY "Users can view own profile" ON app_profiles
            FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON app_profiles
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "System admins can view all profiles" ON app_profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM app_profiles 
                    WHERE id = auth.uid() 
                    AND role = 'system_admin'
                )
            );
    END IF;
END $$;

-- App Clients 정책
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_clients') THEN
        -- 기존 정책 삭제
        DROP POLICY IF EXISTS "Users can view own clients" ON app_clients;
        DROP POLICY IF EXISTS "Users can insert own clients" ON app_clients;
        DROP POLICY IF EXISTS "Users can update own clients" ON app_clients;
        
        -- 새 정책 생성
        CREATE POLICY "Users can view own clients" ON app_clients
            FOR SELECT USING (auth.uid() = agent_id);
        
        CREATE POLICY "Users can insert own clients" ON app_clients
            FOR INSERT WITH CHECK (auth.uid() = agent_id);
        
        CREATE POLICY "Users can update own clients" ON app_clients
            FOR UPDATE USING (auth.uid() = agent_id);
    END IF;
END $$;

-- App Invitations 정책
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_invitations') THEN
        CREATE POLICY "Users can view own invitations" ON app_invitations
            FOR SELECT USING (auth.uid() = inviter_id);
        
        CREATE POLICY "Users can create invitations" ON app_invitations
            FOR INSERT WITH CHECK (auth.uid() = inviter_id);
        
        CREATE POLICY "System admins can manage all invitations" ON app_invitations
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM app_profiles 
                    WHERE id = auth.uid() 
                    AND role = 'system_admin'
                )
            );
    END IF;
END $$;

-- Public 테이블들 정책 (공개 읽기)
DO $$ 
BEGIN
    -- Public FAQs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'public_faqs') THEN
        CREATE POLICY "Anyone can view published faqs" ON public_faqs
            FOR SELECT USING (is_published = true);
        
        CREATE POLICY "System admins can manage faqs" ON public_faqs
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM app_profiles 
                    WHERE id = auth.uid() 
                    AND role = 'system_admin'
                )
            );
    END IF;
    
    -- Public Announcements
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'public_announcements') THEN
        CREATE POLICY "Anyone can view published announcements" ON public_announcements
            FOR SELECT USING (is_published = true);
        
        CREATE POLICY "System admins can manage announcements" ON public_announcements
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM app_profiles 
                    WHERE id = auth.uid() 
                    AND role = 'system_admin'
                )
            );
    END IF;
    
    -- Public Testimonials
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'public_testimonials') THEN
        CREATE POLICY "Anyone can view published testimonials" ON public_testimonials
            FOR SELECT USING (is_published = true);
        
        CREATE POLICY "System admins can manage testimonials" ON public_testimonials
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM app_profiles 
                    WHERE id = auth.uid() 
                    AND role = 'system_admin'
                )
            );
    END IF;
END $$;

-- ===== 인덱스 업데이트 =====

-- App 테이블 인덱스들
CREATE INDEX IF NOT EXISTS idx_app_profiles_role ON app_profiles(role);
CREATE INDEX IF NOT EXISTS idx_app_profiles_team_id ON app_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_app_profiles_is_active ON app_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_app_clients_agent_id ON app_clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_app_clients_team_id ON app_clients(team_id);
CREATE INDEX IF NOT EXISTS idx_app_clients_current_stage_id ON app_clients(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_app_clients_is_active ON app_clients(is_active);

CREATE INDEX IF NOT EXISTS idx_app_invitations_inviter_id ON app_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_app_invitations_status ON app_invitations(status);
CREATE INDEX IF NOT EXISTS idx_app_invitations_expires_at ON app_invitations(expires_at);

-- Public 테이블 인덱스들
CREATE INDEX IF NOT EXISTS idx_public_faqs_is_published ON public_faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_public_faqs_category ON public_faqs(category);
CREATE INDEX IF NOT EXISTS idx_public_announcements_is_published ON public_announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_public_announcements_is_pinned ON public_announcements(is_pinned);

-- ===== 트리거 업데이트 =====

-- Auth 트리거 함수 업데이트 (app_profiles 테이블명 변경 반영)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 코멘트 업데이트 =====

COMMENT ON TABLE app_profiles IS '앱 사용자 프로필 - auth.users 확장';
COMMENT ON TABLE app_teams IS '팀 관리 테이블';
COMMENT ON TABLE app_clients IS '고객 정보 테이블';
COMMENT ON TABLE app_invitations IS '초대장 관리 테이블';

COMMENT ON TABLE public_faqs IS '공개 FAQ 테이블';
COMMENT ON TABLE public_announcements IS '공개 공지사항 테이블';
COMMENT ON TABLE public_testimonials IS '공개 고객 후기 테이블'; 