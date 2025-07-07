-- 구독 상태 ENUM 타입 생성
CREATE TYPE app_subscription_status_enum AS ENUM (
  'trial',      -- 14일 무료 체험
  'active',     -- 활성 구독
  'past_due',   -- 결제 연체
  'cancelled',  -- 취소된 구독
  'expired'     -- 만료된 구독
);

-- app_user_profiles 테이블에 구독 관련 컬럼 추가
ALTER TABLE app_user_profiles 
ADD COLUMN subscription_status app_subscription_status_enum DEFAULT 'trial' NOT NULL,
ADD COLUMN trial_ends_at TIMESTAMPTZ,
ADD COLUMN subscription_ends_at TIMESTAMPTZ,
ADD COLUMN lemonsqueezy_subscription_id TEXT,
ADD COLUMN lemonsqueezy_customer_id TEXT;

-- 기존 사용자들의 14일 무료 체험 설정
UPDATE app_user_profiles 
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_app_user_profiles_subscription_status ON app_user_profiles(subscription_status);
CREATE INDEX idx_app_user_profiles_trial_ends_at ON app_user_profiles(trial_ends_at);
CREATE INDEX idx_app_user_profiles_subscription_ends_at ON app_user_profiles(subscription_ends_at);
CREATE INDEX idx_app_user_profiles_lemonsqueezy_subscription_id ON app_user_profiles(lemonsqueezy_subscription_id);

-- RLS 정책은 기존과 동일하게 유지 (사용자 본인만 접근 가능) 