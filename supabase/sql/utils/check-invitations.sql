-- 현재 초대장 상태 확인
SELECT 
  code,
  status,
  inviter_id,
  invitee_email,
  created_at,
  expires_at,
  used_at
FROM invitations
ORDER BY created_at DESC;

-- 프로필 정보 확인
SELECT 
  id,
  full_name,
  role,
  invitations_left,
  is_active
FROM profiles
ORDER BY created_at DESC; 