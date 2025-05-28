-- Auth 사용자 생성 시 자동으로 프로필 생성하는 트리거

-- 1. 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 사용자의 프로필 생성
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    invitations_left,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    2, -- 기본 초대장 2장
    true,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 생성 (auth.users 테이블에 사용자 생성 시 실행)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 초대장 자동 생성 함수
CREATE OR REPLACE FUNCTION public.create_user_invitations()
RETURNS TRIGGER AS $$
DECLARE
  invitation_code TEXT;
  i INTEGER;
BEGIN
  -- 새 사용자에게 2장의 초대장 생성
  FOR i IN 1..2 LOOP
    -- 랜덤 초대 코드 생성 (ABC-DEF-GHI 형식)
    invitation_code := (
      SELECT string_agg(
        substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
               floor(random() * 36 + 1)::int, 1), 
        ''
      )
      FROM generate_series(1, 3)
    ) || '-' || (
      SELECT string_agg(
        substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
               floor(random() * 36 + 1)::int, 1), 
        ''
      )
      FROM generate_series(1, 3)
    ) || '-' || (
      SELECT string_agg(
        substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
               floor(random() * 36 + 1)::int, 1), 
        ''
      )
      FROM generate_series(1, 3)
    );

    -- 중복 확인 후 초대장 생성
    WHILE EXISTS (SELECT 1 FROM public.invitations WHERE code = invitation_code) LOOP
      invitation_code := (
        SELECT string_agg(
          substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
                 floor(random() * 36 + 1)::int, 1), 
          ''
        )
        FROM generate_series(1, 3)
      ) || '-' || (
        SELECT string_agg(
          substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
                 floor(random() * 36 + 1)::int, 1), 
          ''
        )
        FROM generate_series(1, 3)
      ) || '-' || (
        SELECT string_agg(
          substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
                 floor(random() * 36 + 1)::int, 1), 
          ''
        )
        FROM generate_series(1, 3)
      );
    END LOOP;

    -- 초대장 생성
    INSERT INTO public.invitations (
      code,
      inviter_id,
      message,
      status,
      expires_at,
      created_at
    )
    VALUES (
      invitation_code,
      NEW.id,
      '보험설계사를 위한 SureCRM에 초대합니다!',
      'pending',
      NOW() + INTERVAL '30 days',
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 프로필 생성 후 초대장 생성 트리거
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_invitations(); 