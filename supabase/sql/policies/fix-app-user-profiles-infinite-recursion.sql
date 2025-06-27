-- =============================================================================
-- app_user_profiles 무한 재귀 문제 해결
-- 'infinite recursion detected in policy for relation "app_user_profiles"' 해결
-- =============================================================================

-- 기존 문제 있는 정책들을 모두 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "Team admins can view team members" ON public.app_user_profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "system_admins_can_view_all_profiles" ON public.app_user_profiles;
DROP POLICY IF EXISTS "Allow users to manage their own profile and admins to view team" ON public.app_user_profiles;

-- RLS 활성화
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. 본인 프로필 조회 (재귀 없음)
CREATE POLICY "safe_own_profile_select" ON public.app_user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. 본인 프로필 수정 (재귀 없음)
CREATE POLICY "safe_own_profile_update" ON public.app_user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. 본인 프로필 삽입 (회원가입 시)
CREATE POLICY "safe_own_profile_insert" ON public.app_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. 시스템이 새 사용자 프로필을 생성할 수 있도록 허용 (서버 사이드)
CREATE POLICY "safe_system_profile_insert" ON public.app_user_profiles
  FOR INSERT WITH CHECK (true); 