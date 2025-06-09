-- 기존 사용자들에게 초대장을 생성해주는 함수
CREATE OR REPLACE FUNCTION public.create_invitations_for_existing_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  invitation_code TEXT;
BEGIN
  -- 초대장이 없는 모든 사용자에게 초대장 생성
  FOR user_record IN 
    SELECT up.id, up.full_name 
    FROM public.app_user_profiles up
    LEFT JOIN public.app_user_invitations inv ON up.id = inv.inviter_id
    WHERE inv.inviter_id IS NULL
  LOOP
    -- 초대장 코드 생성 (8자리 랜덤 코드)
    invitation_code := upper(substr(md5(random()::text || user_record.id::text), 1, 8));

    -- 초대장 2개 생성
    FOR i IN 1..2 LOOP
      INSERT INTO public.app_user_invitations (inviter_id, code, status, created_at)
      VALUES (
        user_record.id,
        invitation_code || '_' || i::text,
        'pending',
        NOW()
      );
    END LOOP;

    RAISE NOTICE '사용자 %에게 초대장 2개 생성됨 (코드: %)', user_record.full_name, invitation_code;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 실행 (한 번만)
SELECT public.create_invitations_for_existing_users();

-- 함수 삭제 (정리)
DROP FUNCTION IF EXISTS public.create_invitations_for_existing_users(); 