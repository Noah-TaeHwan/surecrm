-- 초기 시드 데이터 생성
-- 어드민 계정 (UID: 80b0993a-4194-4165-be5a-aec24b88cd80)

-- 1. 프로필 생성 (auth.users는 이미 존재한다고 가정)
INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    company,
    role,
    invitations_left,
    is_active,
    created_at,
    updated_at
) VALUES (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    '관리자',
    '010-1234-5678',
    'SureCRM',
    'system_admin',
    2,
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    role = EXCLUDED.role,
    updated_at = now();

-- 2. 기본 파이프라인 스테이지 생성
INSERT INTO public.pipeline_stages (
    id,
    agent_id,
    name,
    "order",
    color,
    is_default,
    created_at,
    updated_at
) VALUES 
    (gen_random_uuid(), '80b0993a-4194-4165-be5a-aec24b88cd80', '잠재고객', 1, '#3B82F6', true, now(), now()),
    (gen_random_uuid(), '80b0993a-4194-4165-be5a-aec24b88cd80', '상담중', 2, '#F59E0B', true, now(), now()),
    (gen_random_uuid(), '80b0993a-4194-4165-be5a-aec24b88cd80', '제안서 발송', 3, '#8B5CF6', true, now(), now()),
    (gen_random_uuid(), '80b0993a-4194-4165-be5a-aec24b88cd80', '계약 체결', 4, '#10B981', true, now(), now()),
    (gen_random_uuid(), '80b0993a-4194-4165-be5a-aec24b88cd80', '계약 완료', 5, '#059669', true, now(), now())
ON CONFLICT DO NOTHING;

-- 3. 초대장 2장 생성
INSERT INTO public.invitations (
    id,
    code,
    inviter_id,
    message,
    status,
    created_at,
    expires_at
) VALUES 
    (gen_random_uuid(), 'ADMIN-INVITE-001', '80b0993a-4194-4165-be5a-aec24b88cd80', '보험설계사를 위한 SureCRM에 초대합니다!', 'pending', now(), now() + interval '30 days'),
    (gen_random_uuid(), 'ADMIN-INVITE-002', '80b0993a-4194-4165-be5a-aec24b88cd80', '보험설계사를 위한 SureCRM에 초대합니다!', 'pending', now(), now() + interval '30 days')
ON CONFLICT (code) DO NOTHING;

-- 완료 메시지
SELECT 'Initial seed data created successfully!' as message; 