-- Seed 데이터 삽입 스크립트
-- 실행 날짜: 2024-12-19
-- 설명: 개발 및 테스트용 기본 데이터 삽입

-- 기본 프로필 데이터 (테스트용 사용자들)
INSERT INTO profiles (id, full_name, email, role, is_active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '김영수', 'kim.youngsu@example.com', 'admin', true, NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', '박지은', 'park.jieun@example.com', 'user', true, NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440003', '이민호', 'lee.minho@example.com', 'user', true, NOW() - INTERVAL '20 days'),
('550e8400-e29b-41d4-a716-446655440004', '최수진', 'choi.sujin@example.com', 'manager', true, NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440005', '정현우', 'jung.hyunwoo@example.com', 'user', true, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 기본 팀 데이터
INSERT INTO teams (id, name, description, owner_id, is_active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '메리츠화재 강남지점', '강남 지역 보험설계사 팀', '550e8400-e29b-41d4-a716-446655440001', true, NOW() - INTERVAL '25 days'),
('660e8400-e29b-41d4-a716-446655440002', '삼성생명 서초팀', '서초 지역 영업팀', '550e8400-e29b-41d4-a716-446655440002', true, NOW() - INTERVAL '20 days'),
('660e8400-e29b-41d4-a716-446655440003', '현대해상 분당지점', '분당 지역 보험설계사 팀', '550e8400-e29b-41d4-a716-446655440003', true, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 기본 고객 데이터
INSERT INTO clients (id, name, email, phone, company, position, team_id, assigned_to, is_active, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '홍길동', 'hong.gildong@example.com', '010-1234-5678', '삼성전자', '과장', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, NOW() - INTERVAL '20 days'),
('770e8400-e29b-41d4-a716-446655440002', '김철수', 'kim.cheolsu@example.com', '010-2345-6789', 'LG전자', '대리', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, NOW() - INTERVAL '18 days'),
('770e8400-e29b-41d4-a716-446655440003', '이영희', 'lee.younghee@example.com', '010-3456-7890', '현대자동차', '차장', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, NOW() - INTERVAL '15 days'),
('770e8400-e29b-41d4-a716-446655440004', '박민수', 'park.minsu@example.com', '010-4567-8901', 'SK텔레콤', '부장', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, NOW() - INTERVAL '12 days'),
('770e8400-e29b-41d4-a716-446655440005', '정소영', 'jung.soyoung@example.com', '010-5678-9012', '네이버', '팀장', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', true, NOW() - INTERVAL '10 days'),
('770e8400-e29b-41d4-a716-446655440006', '최동훈', 'choi.donghoon@example.com', '010-6789-0123', '카카오', '선임', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', true, NOW() - INTERVAL '8 days'),
('770e8400-e29b-41d4-a716-446655440007', '한지민', 'han.jimin@example.com', '010-7890-1234', '쿠팡', '매니저', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', true, NOW() - INTERVAL '6 days'),
('770e8400-e29b-41d4-a716-446655440008', '윤서준', 'yoon.seojun@example.com', '010-8901-2345', '배달의민족', '대표', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', true, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- 기본 초대 데이터
INSERT INTO invitations (id, code, inviter_id, invitee_email, status, message, expires_at, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'WELCOME2024', '550e8400-e29b-41d4-a716-446655440001', 'newuser1@example.com', 'pending', 'SureCRM에 초대합니다!', NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days'),
('880e8400-e29b-41d4-a716-446655440002', 'INVITE2024', '550e8400-e29b-41d4-a716-446655440002', 'newuser2@example.com', 'pending', '함께 일해요!', NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),
('880e8400-e29b-41d4-a716-446655440003', 'JOIN2024', '550e8400-e29b-41d4-a716-446655440003', 'newuser3@example.com', 'used', '팀에 합류하세요', NOW() + INTERVAL '7 days', NOW() - INTERVAL '5 days'),
('880e8400-e29b-41d4-a716-446655440004', 'TEAM2024', '550e8400-e29b-41d4-a716-446655440004', 'newuser4@example.com', 'used', '우리 팀에 오세요', NOW() + INTERVAL '7 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 추가 후기 데이터 (기존 데이터에 더해서)
INSERT INTO testimonials (name, role, company, quote, rating, initial, is_verified, is_published, "order") VALUES
('강민지', '보험설계사', 'AIA생명', '고객 관리가 정말 체계적으로 변했어요. 소개 네트워크 덕분에 신규 고객 확보가 훨씬 쉬워졌습니다.', 5, '강', true, true, 5),
('송태호', '팀장', '교보생명', '팀 전체의 성과 관리가 한눈에 들어와서 좋습니다. 데이터 기반으로 의사결정할 수 있어요.', 5, '송', true, true, 6),
('임수연', '지점장', '동양생명', '지점 운영이 훨씬 효율적이 되었습니다. 특히 소개 관계 시각화가 정말 혁신적이에요.', 5, '임', true, true, 7),
('조현석', '보험설계사', '흥국생명', '처음에는 복잡할 줄 알았는데, 사용해보니 정말 직관적이고 편리합니다.', 4, '조', true, true, 8)
ON CONFLICT (name, company) DO NOTHING;

-- 추가 FAQ 데이터
INSERT INTO faqs (question, answer, category, "order") VALUES
('모바일에서도 사용할 수 있나요?', '네, SureCRM은 반응형 웹 디자인으로 제작되어 모바일, 태블릿에서도 최적화된 환경으로 이용하실 수 있습니다.', 'general', 3),
('데이터 백업은 어떻게 되나요?', '모든 데이터는 Supabase 클라우드에 안전하게 저장되며, 자동으로 백업됩니다. 데이터 손실 걱정 없이 사용하세요.', 'data', 3),
('팀원 수에 제한이 있나요?', '베타 기간 중에는 팀원 수에 제한이 없습니다. 정식 출시 후에는 플랜에 따라 차이가 있을 예정입니다.', 'team', 2),
('고객 데이터 내보내기가 가능한가요?', '네, 언제든지 CSV 형태로 고객 데이터를 내보낼 수 있습니다. 데이터 이동의 자유를 보장합니다.', 'data', 4),
('기술 지원은 어떻게 받을 수 있나요?', '이메일(support@surecrm.co.kr)로 문의하시면 24시간 내에 답변드립니다. 긴급한 경우 실시간 채팅도 지원합니다.', 'support', 1)
ON CONFLICT (question) DO NOTHING;

-- 추가 공지사항 데이터
INSERT INTO announcements (title, content, type, priority, is_published, is_pinned, published_at) VALUES
('SureCRM 베타 서비스 오픈!', '보험설계사를 위한 혁신적인 CRM 솔루션 SureCRM 베타 서비스가 시작되었습니다. 초대 코드를 통해 무료로 체험해보세요!', 'general', 1, true, true, NOW() - INTERVAL '7 days'),
('새로운 기능 업데이트 안내', '소개 네트워크 시각화 기능이 대폭 개선되었습니다. 더욱 직관적이고 빠른 인터페이스를 경험해보세요.', 'feature', 0, true, false, NOW() - INTERVAL '3 days'),
('정기 점검 안내', '서비스 안정성 향상을 위해 매주 일요일 새벽 2시-4시에 정기 점검을 실시합니다.', 'maintenance', 0, true, false, NOW() - INTERVAL '1 day')
ON CONFLICT (title) DO NOTHING;

-- 추가 사이트 설정
INSERT INTO site_settings (key, value, type, description, is_public) VALUES
('max_team_members', '50', 'number', '팀당 최대 멤버 수', false),
('max_clients_per_user', '1000', 'number', '사용자당 최대 고객 수', false),
('invitation_expiry_days', '7', 'number', '초대 코드 만료 일수', false),
('feature_network_visualization', 'true', 'boolean', '네트워크 시각화 기능 활성화', false),
('feature_team_collaboration', 'true', 'boolean', '팀 협업 기능 활성화', false),
('maintenance_mode', 'false', 'boolean', '점검 모드', false),
('app_version', '1.0.0-beta', 'string', '앱 버전', true),
('last_updated', '2024-12-19', 'string', '마지막 업데이트 날짜', true)
ON CONFLICT (key) DO NOTHING;

-- 페이지 조회수 샘플 데이터 (분석용)
INSERT INTO page_views (path, user_agent, ip_address, referrer, session_id, created_at) VALUES
('/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', 'https://google.com', 'session_001', NOW() - INTERVAL '1 hour'),
('/login', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.101', '/', 'session_002', NOW() - INTERVAL '2 hours'),
('/invite-only', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.102', 'https://twitter.com', 'session_003', NOW() - INTERVAL '3 hours'),
('/terms', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', '192.168.1.103', '/', 'session_004', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- 통계 업데이트를 위한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW public_stats_view AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE is_active = true) as total_users,
  (SELECT COUNT(*) FROM teams WHERE is_active = true) as total_teams,
  (SELECT COUNT(*) FROM clients WHERE is_active = true) as total_clients,
  (SELECT COUNT(*) FROM invitations) as total_invitations,
  (SELECT COUNT(*) FROM invitations WHERE status = 'used') as used_invitations,
  (SELECT COUNT(*) FROM invitations WHERE status = 'pending') as pending_invitations;

COMMENT ON VIEW public_stats_view IS '공개 통계 데이터를 위한 뷰'; 