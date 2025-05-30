-- 🔒 Admin 백오피스 전용 테이블들 생성
-- Migration: 20241219000001_add_admin_tables
-- 목적: Admin 감사 로그, 설정, 통계 캐시 테이블 추가

-- ===== Admin 감사 로그 테이블 =====
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    target_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===== Admin 시스템 설정 테이블 =====
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    updated_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===== Admin 통계 캐시 테이블 =====
CREATE TABLE IF NOT EXISTS admin_stats_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_type TEXT UNIQUE NOT NULL,
    stat_data JSONB NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- ===== 인덱스 생성 =====

-- Admin 감사 로그 최적화
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_table_name ON admin_audit_logs(table_name);

-- Admin 설정 최적화
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_is_active ON admin_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_at ON admin_settings(updated_at DESC);

-- Admin 통계 캐시 최적화
CREATE INDEX IF NOT EXISTS idx_admin_stats_cache_stat_type ON admin_stats_cache(stat_type);
CREATE INDEX IF NOT EXISTS idx_admin_stats_cache_expires_at ON admin_stats_cache(expires_at);

-- ===== RLS (Row Level Security) 설정 =====

-- Admin 테이블들은 system_admin만 접근 가능
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats_cache ENABLE ROW LEVEL SECURITY;

-- Admin 감사 로그 정책 (system_admin만 조회 가능)
CREATE POLICY "Only system_admin can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system_admin'
        )
    );

CREATE POLICY "Only system_admin can insert audit logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system_admin'
        )
    );

-- Admin 설정 정책 (system_admin만 CRUD 가능)
CREATE POLICY "Only system_admin can manage settings" ON admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system_admin'
        )
    );

-- Admin 통계 캐시 정책 (system_admin만 CRUD 가능)
CREATE POLICY "Only system_admin can manage stats cache" ON admin_stats_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system_admin'
        )
    );

-- ===== 초기 Admin 설정 데이터 =====

INSERT INTO admin_settings (key, value, description, updated_by_id) VALUES
    ('maintenance_mode', 'false', '시스템 점검 모드 설정', '00000000-0000-0000-0000-000000000000'),
    ('max_invitations_per_user', '10', '사용자당 최대 초대장 수', '00000000-0000-0000-0000-000000000000'),
    ('invitation_expiry_days', '7', '초대장 만료 일수', '00000000-0000-0000-0000-000000000000'),
    ('system_notification_enabled', 'true', '시스템 알림 활성화 여부', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (key) DO NOTHING;

-- ===== 추가 트리거 (자동 업데이트) =====

-- admin_settings 테이블의 updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_settings_updated_at();

-- ===== 코멘트 추가 =====

COMMENT ON TABLE admin_audit_logs IS 'Admin 백오피스 감사 로그 - 모든 Admin 작업 추적';
COMMENT ON TABLE admin_settings IS 'Admin 시스템 설정 - 백오피스 전용 설정 관리';
COMMENT ON TABLE admin_stats_cache IS 'Admin 통계 캐시 - 대시보드 성능 최적화용';

COMMENT ON COLUMN admin_audit_logs.action IS 'Admin이 수행한 작업 (예: CREATE_INVITATION, VIEW_USERS)';
COMMENT ON COLUMN admin_audit_logs.table_name IS '대상 테이블명';
COMMENT ON COLUMN admin_audit_logs.target_id IS '대상 레코드 ID';
COMMENT ON COLUMN admin_audit_logs.old_values IS '변경 전 데이터 (JSON)';
COMMENT ON COLUMN admin_audit_logs.new_values IS '변경 후 데이터 (JSON)';

COMMENT ON COLUMN admin_settings.key IS '설정 키 (영문 스네이크 케이스)';
COMMENT ON COLUMN admin_settings.value IS '설정 값 (JSON 형태)';
COMMENT ON COLUMN admin_settings.is_active IS '설정 활성화 여부';

COMMENT ON COLUMN admin_stats_cache.stat_type IS '통계 유형 (예: invitations_summary, users_summary)';
COMMENT ON COLUMN admin_stats_cache.stat_data IS '캐시된 통계 데이터 (JSON)';
COMMENT ON COLUMN admin_stats_cache.expires_at IS '캐시 만료 시간'; 