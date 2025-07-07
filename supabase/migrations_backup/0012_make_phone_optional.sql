-- 🔧 전화번호 필드를 선택사항으로 변경
-- 이름만 필수로 하고, 전화번호는 선택사항으로 변경

ALTER TABLE app_client_profiles 
ALTER COLUMN phone DROP NOT NULL;

-- 인덱스 및 제약조건 확인 (전화번호가 null일 수 있으므로)
-- 기존 유니크 제약조건이 있다면 조정이 필요할 수 있음

-- 주석 추가
COMMENT ON COLUMN app_client_profiles.phone IS '고객 전화번호 (선택사항)';
COMMENT ON COLUMN app_client_profiles.full_name IS '고객 이름 (필수)'; 