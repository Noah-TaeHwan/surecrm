-- 초대장 시드 데이터 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. 시스템 관리자 프로필 생성 (초대장을 발송할 사용자)
INSERT INTO profiles (
  id, 
  full_name, 
  role, 
  invitations_left, 
  is_active,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '시스템 관리자',
  'system_admin',
  999,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. 테스트용 초대장들 생성
INSERT INTO invitations (
  code,
  inviter_id,
  invitee_email,
  message,
  status,
  expires_at,
  created_at
) VALUES 
(
  'NYMCDZ4F',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  '테스트용 초대장입니다.',
  'pending',
  NOW() + INTERVAL '30 days',
  NOW()
),
(
  'WELCOME1',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  '환영합니다! SureCRM에 가입하세요.',
  'pending',
  NOW() + INTERVAL '30 days',
  NOW()
),
(
  'BETA2024',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  '베타 테스터 초대장입니다.',
  'pending',
  NOW() + INTERVAL '60 days',
  NOW()
) ON CONFLICT (code) DO NOTHING;

-- 3. 생성된 초대장 확인
SELECT 
  code,
  inviter_id,
  message,
  status,
  expires_at,
  created_at
FROM invitations 
ORDER BY created_at DESC; 