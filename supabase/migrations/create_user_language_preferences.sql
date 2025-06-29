-- 사용자 언어 설정을 위한 컬럼 추가
ALTER TABLE app_user_profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(2) DEFAULT 'ko' CHECK (preferred_language IN ('ko', 'en', 'ja')),
ADD COLUMN IF NOT EXISTS language_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_preferred_language 
ON app_user_profiles(preferred_language);

-- 언어 설정 업데이트 시 자동으로 timestamp 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_language_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.preferred_language IS DISTINCT FROM NEW.preferred_language THEN
        NEW.language_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_language_timestamp
    BEFORE UPDATE ON app_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_language_timestamp();

-- 기존 사용자들에 대해 기본 언어 설정
UPDATE app_user_profiles 
SET preferred_language = 'ko', language_updated_at = NOW() 
WHERE preferred_language IS NULL; 