-- Notifications Feature 시드 데이터 생성
-- 관리자 계정 UID: 80b0993a-4194-4165-be5a-aec24b88cd80

-- 1. 기본 프로필 생성 (관리자)
INSERT INTO profiles (id, full_name, role, is_active) 
VALUES ('80b0993a-4194-4165-be5a-aec24b88cd80', '관리자', 'system_admin', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 2. 기본 팀 생성
INSERT INTO teams (id, name, description, admin_id, is_active)
VALUES (
  'team-001',
  '기본 팀',
  '시스템 기본 팀입니다.',
  '80b0993a-4194-4165-be5a-aec24b88cd80',
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. 기본 파이프라인 단계 생성
INSERT INTO pipeline_stages (id, agent_id, name, "order", color, is_default)
VALUES 
  ('stage-001', '80b0993a-4194-4165-be5a-aec24b88cd80', '첫 상담', 1, '#3B82F6', true),
  ('stage-002', '80b0993a-4194-4165-be5a-aec24b88cd80', '니즈 분석', 2, '#8B5CF6', true),
  ('stage-003', '80b0993a-4194-4165-be5a-aec24b88cd80', '상품 설명', 3, '#F59E0B', true),
  ('stage-004', '80b0993a-4194-4165-be5a-aec24b88cd80', '계약 검토', 4, '#EF4444', true),
  ('stage-005', '80b0993a-4194-4165-be5a-aec24b88cd80', '계약 완료', 5, '#10B981', true)
ON CONFLICT (id) DO NOTHING;

-- 4. 샘플 고객 생성
INSERT INTO clients (id, agent_id, full_name, phone, current_stage_id, importance, is_active)
VALUES 
  ('client-001', '80b0993a-4194-4165-be5a-aec24b88cd80', '김철수', '010-1234-5678', 'stage-001', 'high', true),
  ('client-002', '80b0993a-4194-4165-be5a-aec24b88cd80', '이영희', '010-2345-6789', 'stage-002', 'medium', true),
  ('client-003', '80b0993a-4194-4165-be5a-aec24b88cd80', '박지성', '010-3456-7890', 'stage-003', 'high', true),
  ('client-004', '80b0993a-4194-4165-be5a-aec24b88cd80', '최민수', '010-4567-8901', 'stage-005', 'medium', true),
  ('client-005', '80b0993a-4194-4165-be5a-aec24b88cd80', '홍길동', '010-5678-9012', 'stage-001', 'low', true),
  ('client-006', '80b0993a-4194-4165-be5a-aec24b88cd80', '정수진', '010-6789-0123', 'stage-002', 'normal', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 알림 설정 생성
INSERT INTO notification_settings (
  user_id,
  email_notifications,
  sms_notifications,
  push_notifications,
  kakao_notifications,
  meeting_reminders,
  goal_deadlines,
  new_referrals,
  client_milestones,
  team_updates,
  system_alerts,
  birthday_reminders,
  follow_up_reminders,
  quiet_hours_start,
  quiet_hours_end,
  weekend_notifications
) VALUES (
  '80b0993a-4194-4165-be5a-aec24b88cd80',
  true,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  '22:00',
  '08:00',
  false
) ON CONFLICT (user_id) DO NOTHING;

-- 6. 기본 알림 템플릿 생성
INSERT INTO notification_templates (
  user_id,
  team_id,
  type,
  channel,
  name,
  subject,
  body_template,
  variables,
  is_default,
  is_active
) VALUES 
  (
    NULL,
    NULL,
    'meeting_reminder',
    'in_app',
    '미팅 알림 기본 템플릿',
    '미팅 알림',
    '{{clientName}}님과의 미팅이 {{timeUntil}} 후 시작됩니다.',
    '{"clientName": "string", "timeUntil": "string"}',
    true,
    true
  ),
  (
    NULL,
    NULL,
    'new_referral',
    'in_app',
    '신규 소개 알림 템플릿',
    '새로운 고객 소개',
    '{{referrerName}}님이 {{newClientName}}님을 소개해주셨습니다.',
    '{"referrerName": "string", "newClientName": "string"}',
    true,
    true
  ),
  (
    NULL,
    NULL,
    'client_milestone',
    'in_app',
    '고객 마일스톤 알림 템플릿',
    '고객 마일스톤 달성',
    '{{clientName}}님이 {{milestone}}을 달성했습니다.',
    '{"clientName": "string", "milestone": "string"}',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- 7. 샘플 알림 생성
INSERT INTO notification_queue (
  user_id,
  type,
  channel,
  priority,
  title,
  message,
  recipient,
  scheduled_at,
  status,
  read_at
) VALUES 
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'new_referral',
    'in_app',
    'normal',
    '새로운 고객 등록',
    '이영희님이 김철수님의 소개로 등록되었습니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '5 minutes',
    'delivered',
    NULL
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'meeting_reminder',
    'in_app',
    'high',
    '미팅 예정',
    '박지성님과의 미팅이 30분 후 시작됩니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '25 minutes',
    'delivered',
    NULL
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'client_milestone',
    'in_app',
    'normal',
    '계약 체결 완료',
    '최민수님의 보험 계약이 체결되었습니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '1 hour',
    'read',
    NOW() - INTERVAL '50 minutes'
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'new_referral',
    'in_app',
    'normal',
    '소개 네트워크 업데이트',
    '김철수님이 새로운 고객을 소개해주셨습니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '2 hours',
    'read',
    NOW() - INTERVAL '90 minutes'
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'meeting_reminder',
    'in_app',
    'urgent',
    '일정 변경 알림',
    '내일 오후 2시 미팅이 3시로 변경되었습니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '3 hours',
    'delivered',
    NULL
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'system_alert',
    'in_app',
    'low',
    '월간 보고서 준비',
    '이번 달 성과 보고서가 준비되었습니다.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '1 day',
    'read',
    NOW() - INTERVAL '20 hours'
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'birthday_reminder',
    'in_app',
    'normal',
    '고객 생일 알림',
    '홍길동님의 생일이 내일입니다. 축하 메시지를 보내보세요!',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '10 minutes',
    'delivered',
    NULL
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'follow_up_reminder',
    'in_app',
    'normal',
    '팔로업 알림',
    '정수진님과의 팔로업 미팅 일정을 잡아주세요.',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    NOW() - INTERVAL '45 minutes',
    'delivered',
    NULL
  )
ON CONFLICT DO NOTHING;

-- 8. 기본 알림 규칙 생성
INSERT INTO notification_rules (
  user_id,
  name,
  description,
  trigger_event,
  conditions,
  actions,
  is_active
) VALUES 
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    '미팅 30분 전 알림',
    '모든 미팅 30분 전에 알림을 보냅니다.',
    'meeting_scheduled',
    '{"timeBeforeMeeting": 30}',
    '[{"type": "send_notification", "channel": "in_app", "template": "meeting_reminder"}]',
    true
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    '신규 고객 등록 알림',
    '새로운 고객이 등록될 때 알림을 보냅니다.',
    'client_created',
    '{}',
    '[{"type": "send_notification", "channel": "in_app", "template": "new_client"}]',
    true
  )
ON CONFLICT DO NOTHING;

-- 9. 알림 구독 설정
INSERT INTO notification_subscriptions (
  user_id,
  entity_type,
  entity_id,
  notification_types,
  channels,
  is_active
) VALUES 
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'client',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    ARRAY['new_referral', 'client_milestone', 'birthday_reminder'],
    ARRAY['in_app', 'email'],
    true
  ),
  (
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    'meeting',
    '80b0993a-4194-4165-be5a-aec24b88cd80',
    ARRAY['meeting_reminder'],
    ARRAY['in_app', 'push'],
    true
  )
ON CONFLICT DO NOTHING;

-- 성공 메시지
SELECT 'Notifications 시드 데이터가 성공적으로 생성되었습니다!' as message; 