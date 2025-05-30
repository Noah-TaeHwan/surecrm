-- Supabase SQL Editor에서 실행할 초대코드 생성 스크립트
-- 이 스크립트는 외래키 제약을 우회하여 테스트용 초대코드를 생성합니다.

-- 1. 임시로 외래키 제약 조건 비활성화 (필요한 경우)
-- ALTER TABLE public.invitations DISABLE TRIGGER ALL;

-- 2. 테스트용 초대코드들 생성
INSERT INTO public.invitations (
  id, 
  code, 
  inviter_id, 
  status, 
  expires_at, 
  created_at
) VALUES 
  (
    gen_random_uuid(),
    'SURECRM-2024',
    gen_random_uuid(), -- 임시 inviter_id
    'pending',
    '2025-12-31T23:59:59+00:00',
    NOW()
  ),
  (
    gen_random_uuid(),
    'WELCOME-123',
    gen_random_uuid(), -- 임시 inviter_id
    'pending',
    '2025-12-31T23:59:59+00:00',
    NOW()
  ),
  (
    gen_random_uuid(),
    'BETA-TEST',
    gen_random_uuid(), -- 임시 inviter_id
    'pending',
    '2025-12-31T23:59:59+00:00',
    NOW()
  ),
  (
    gen_random_uuid(),
    'QUICK-START',
    gen_random_uuid(), -- 임시 inviter_id
    'pending',
    '2025-12-31T23:59:59+00:00',
    NOW()
  ),
  (
    gen_random_uuid(),
    'ADMIN-INVITE',
    gen_random_uuid(), -- 임시 inviter_id
    'pending',
    '2025-12-31T23:59:59+00:00',
    NOW()
  );

-- 3. 외래키 제약 조건 다시 활성화 (필요한 경우)
-- ALTER TABLE public.invitations ENABLE TRIGGER ALL;

-- 4. 생성된 초대코드들 확인
SELECT 
  id,
  code,
  status,
  expires_at,
  created_at
FROM public.invitations 
WHERE status = 'pending'
ORDER BY created_at DESC; 