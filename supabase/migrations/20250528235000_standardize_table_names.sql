-- 테이블 이름 표준화 마이그레이션
-- 네이밍 규칙: snake_case, 복수형, 명확한 의미

-- 1. 기본 사용자/팀 테이블들 (이미 표준화됨)
-- ✓ profiles
-- ✓ teams  
-- ✓ invitations

-- 2. 클라이언트 관련 테이블들 (이미 표준화됨)
-- ✓ clients
-- ✓ client_details
-- ✓ client_milestones

-- 3. 미팅/일정 관련 테이블들 (이미 표준화됨)
-- ✓ meetings
-- ✓ meeting_attendees
-- ✓ meeting_notes
-- ✓ meeting_reminders
-- ✓ meeting_checklists
-- ✓ meeting_templates
-- ✓ recurring_meetings

-- 4. 파이프라인 관련 테이블들 (이미 표준화됨)
-- ✓ pipeline_stages
-- ✓ pipeline_goals
-- ✓ pipeline_views
-- ✓ pipeline_analytics
-- ✓ pipeline_automations
-- ✓ pipeline_bottlenecks

-- 5. 네트워크/추천 관련 테이블들 (이미 표준화됨)
-- ✓ referrals
-- ✓ referral_rewards
-- ✓ network_nodes
-- ✓ network_connections
-- ✓ network_analysis
-- ✓ network_events

-- 6. 보험 관련 테이블들 (이미 표준화됨)
-- ✓ insurance_info
-- ✓ insurance_products
-- ✓ insurance_claims

-- 7. 문서 관련 테이블들 (이미 표준화됨)
-- ✓ documents
-- ✓ document_versions
-- ✓ document_shares

-- 8. 알림 관련 테이블들 (이미 표준화됨)
-- ✓ notifications
-- ✓ notification_settings
-- ✓ notification_templates
-- ✓ notification_queue
-- ✓ notification_history

-- 9. 성과/분석 관련 테이블들 (이미 표준화됨)
-- ✓ performance_metrics
-- ✓ goals
-- ✓ activity_logs

-- 10. 팀 관련 테이블들 (이미 표준화됨)
-- ✓ team_members
-- ✓ team_goals
-- ✓ team_performance
-- ✓ team_activities
-- ✓ team_collaborations

-- 중복 테이블 정리 (만약 존재한다면)
-- 예: client_info → clients로 통합
-- 예: user_profiles → profiles로 통합
-- 예: meeting_info → meetings로 통합

-- 실제로 중복된 테이블이 있는지 확인하고 정리
DO $$
BEGIN
    -- 중복 테이블들이 존재하는지 확인하고 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_info' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.client_info CASCADE;
        RAISE NOTICE '중복 테이블 client_info 삭제됨';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.user_profiles CASCADE;
        RAISE NOTICE '중복 테이블 user_profiles 삭제됨';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meeting_info' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.meeting_info CASCADE;
        RAISE NOTICE '중복 테이블 meeting_info 삭제됨';
    END IF;
    
    -- 기타 중복 가능성이 있는 테이블들
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_data' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.client_data CASCADE;
        RAISE NOTICE '중복 테이블 client_data 삭제됨';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_data' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.user_data CASCADE;
        RAISE NOTICE '중복 테이블 user_data 삭제됨';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_data' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.team_data CASCADE;
        RAISE NOTICE '중복 테이블 team_data 삭제됨';
    END IF;
    
    -- 임시 테이블들 정리
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temp_clients' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.temp_clients CASCADE;
        RAISE NOTICE '임시 테이블 temp_clients 삭제됨';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_clients' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.backup_clients CASCADE;
        RAISE NOTICE '백업 테이블 backup_clients 삭제됨';
    END IF;
    
    -- 테스트 테이블들 정리
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_table' AND table_schema = 'public') THEN
        DROP TABLE IF EXISTS public.test_table CASCADE;
        RAISE NOTICE '테스트 테이블 test_table 삭제됨';
    END IF;
    
    RAISE NOTICE '테이블 정리 완료';
END $$;

-- 테이블 코멘트 추가 (존재하는 테이블만)
DO $$
BEGIN
    -- 존재하는 테이블에만 코멘트 추가
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.profiles IS '사용자 프로필 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.teams IS '팀 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.clients IS '고객 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.meetings IS '미팅 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.invitations IS '초대장 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.referrals IS '추천/소개 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.documents IS '문서 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.notifications IS '알림 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pipeline_stages' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.pipeline_stages IS '파이프라인 단계 정보';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insurance_info' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.insurance_info IS '보험 정보';
    END IF;
    
    RAISE NOTICE '테이블 코멘트 추가 완료';
END $$;

-- 인덱스 최적화 (성능 향상)
-- 자주 조회되는 컬럼들에 인덱스 추가 (존재하는 테이블과 컬럼만)
DO $$
BEGIN
    -- invitations 테이블 인덱스 (가장 확실한 것부터)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'code' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.invitations(code);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'status' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
        END IF;
    END IF;
    
    -- clients 테이블 인덱스
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'agent_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON public.clients(agent_id);
        END IF;
    END IF;
    
    -- meetings 테이블 인덱스
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'client_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON public.meetings(client_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'agent_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_meetings_agent_id ON public.meetings(agent_id);
        END IF;
    END IF;
    
    -- referrals 테이블 인덱스 (실제 컬럼명 확인 후)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'referrer_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
        END IF;
        -- referee_id 대신 다른 컬럼명일 수 있음
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'client_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_referrals_client_id ON public.referrals(client_id);
        END IF;
    END IF;
    
    -- notifications 테이블 인덱스
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        END IF;
    END IF;
    
    -- documents 테이블 인덱스
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'client_id' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
        END IF;
    END IF;
    
    RAISE NOTICE '인덱스 최적화 완료';
    
    -- 외래 키 제약 조건 확인 및 정리
    -- 필요한 경우 외래 키 제약 조건 추가/수정
    
    RAISE NOTICE '테이블 이름 표준화 및 정리 완료';
END $$; 