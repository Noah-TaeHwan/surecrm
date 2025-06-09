-- 보험계약 테이블에 암호화된 주민등록번호 필드 추가
-- 기존 주민등록번호 필드는 유지하되, 새로운 암호화 필드를 추가

-- 1. 암호화된 주민등록번호 필드 추가
ALTER TABLE app_client_contracts 
ADD COLUMN IF NOT EXISTS contractor_ssn_encrypted TEXT,
ADD COLUMN IF NOT EXISTS insured_ssn_encrypted TEXT;

-- 2. 기존 주민등록번호 필드에 주석 추가 (deprecated 표시)
COMMENT ON COLUMN app_client_contracts.contractor_ssn IS 'DEPRECATED: 암호화되지 않은 주민등록번호. contractor_ssn_encrypted 사용 권장';
COMMENT ON COLUMN app_client_contracts.insured_ssn IS 'DEPRECATED: 암호화되지 않은 주민등록번호. insured_ssn_encrypted 사용 권장';

-- 3. 새 필드에 주석 추가
COMMENT ON COLUMN app_client_contracts.contractor_ssn_encrypted IS '계약자 주민등록번호 (AES-256-GCM 암호화)';
COMMENT ON COLUMN app_client_contracts.insured_ssn_encrypted IS '피보험자 주민등록번호 (AES-256-GCM 암호화)';

-- 4. 민감정보 접근 로그 테이블 생성
CREATE TABLE IF NOT EXISTS sensitive_data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'decrypt', 'export')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 민감정보 접근 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_sensitive_access_logs_user_id ON sensitive_data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_access_logs_created_at ON sensitive_data_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sensitive_access_logs_table_record ON sensitive_data_access_logs(table_name, record_id);

-- 6. RLS 정책 설정
ALTER TABLE sensitive_data_access_logs ENABLE ROW LEVEL SECURITY;

-- 7. 관리자만 민감정보 접근 로그를 볼 수 있도록 설정
CREATE POLICY "Admin can view access logs" ON sensitive_data_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 8. 사용자는 자신의 접근 로그만 삽입 가능
CREATE POLICY "Users can insert their own access logs" ON sensitive_data_access_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. 보험계약 테이블의 민감정보 필드 접근 시 로그 기록을 위한 함수
CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  p_table_name TEXT,
  p_record_id UUID,
  p_field_name TEXT,
  p_access_type TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO sensitive_data_access_logs (
    user_id,
    table_name,
    record_id,
    field_name,
    access_type,
    ip_address,
    created_at
  ) VALUES (
    auth.uid(),
    p_table_name,
    p_record_id,
    p_field_name,
    p_access_type,
    inet_client_addr(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 