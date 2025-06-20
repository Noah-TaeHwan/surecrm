-- app_user_profiles 무한 재귀 문제 해결
-- 기존 정책들을 삭제하고 안전한 정책으로 교체

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_user_profiles;
DROP POLICY IF EXISTS "Team admins can view team members" ON public.app_user_profiles;

-- 새로운 안전한 정책들
-- 1. 본인 프로필 조회/수정 (안전)
CREATE POLICY "users_can_view_own_profile" ON public.app_user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.app_user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. 시스템 관리자는 모든 프로필 조회 가능 (무한 재귀 방지)
CREATE POLICY "system_admins_can_view_all_profiles" ON public.app_user_profiles
  FOR SELECT USING (
    -- 본인 프로필이거나
    auth.uid() = id
    OR 
    -- 시스템 관리자인 경우 (auth.jwt를 사용해서 재귀 방지)
    (auth.jwt() ->> 'role')::text = 'system_admin'
  );

-- 3. 팀 관련 접근은 함수로 분리해서 처리
-- (다른 테이블에서 team_id를 확인할 때는 함수 사용) 