-- SureCRM RLS 정책 설정
-- 개발 및 회원가입을 위한 기본 정책들

-- 1. 먼저 모든 테이블에 RLS 활성화
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.teams;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.invitations;

-- 3. Teams 테이블 정책
-- 모든 사용자가 읽을 수 있도록 (초대코드 검증 등을 위해)
CREATE POLICY "Allow read access to teams" ON public.teams
    FOR SELECT
    USING (true);

-- 인증된 사용자만 팀 생성 가능
CREATE POLICY "Allow insert for authenticated users" ON public.teams
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 팀 관리자만 팀 수정 가능
CREATE POLICY "Allow update for team admins" ON public.teams
    FOR UPDATE
    USING (auth.uid() = admin_id)
    WITH CHECK (auth.uid() = admin_id);

-- 4. Profiles 테이블 정책
-- 자신의 프로필만 읽기 가능
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 자신의 프로필 생성 가능 (회원가입시)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Invitations 테이블 정책
-- 모든 사용자가 초대코드 읽기 가능 (회원가입시 검증을 위해)
CREATE POLICY "Allow read access to invitations" ON public.invitations
    FOR SELECT
    USING (true);

-- 인증된 사용자만 초대코드 생성 가능
CREATE POLICY "Allow insert for authenticated users" ON public.invitations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 초대코드 사용 시 업데이트 가능 (회원가입시)
CREATE POLICY "Allow update for signup process" ON public.invitations
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 6. Clients 테이블 정책 (기본)
-- 자신이 속한 팀의 클라이언트만 조회 가능
CREATE POLICY "Users can view team clients" ON public.clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.team_id = clients.agent_id
        )
        OR 
        auth.uid() = clients.agent_id
    );

-- 인증된 사용자만 클라이언트 생성 가능
CREATE POLICY "Allow insert for authenticated users" ON public.clients
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Service Role은 모든 정책을 우회할 수 있도록 설정
-- (이미 기본적으로 설정되어 있지만 명시적으로 확인)

-- 8. Anon 사용자를 위한 추가 정책 (초대코드 확인용)
CREATE POLICY "Allow anon to read invitations for validation" ON public.invitations
    FOR SELECT
    TO anon
    USING (true);

-- 완료 메시지
SELECT 'RLS 정책 설정이 완료되었습니다.' as message; 