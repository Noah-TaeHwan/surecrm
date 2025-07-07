-- 💡 보험계약 테이블에 새로운 필드들 추가
-- 실행일: 2024-12-24
-- 목적: 테스터 피드백 반영 - 필수 필드들 추가

-- 납입주기 enum 타입 생성
CREATE TYPE app_payment_cycle_enum AS ENUM (
  'monthly',      -- 월납
  'quarterly',    -- 분기납  
  'semi-annual',  -- 반년납
  'annual',       -- 연납
  'lump-sum'      -- 일시납
);

-- 기존 보험계약 테이블에 새로운 컬럼들 추가
ALTER TABLE app_client_insurance_contracts 
ADD COLUMN IF NOT EXISTS insurance_code TEXT,                    -- 보종코드
ADD COLUMN IF NOT EXISTS payment_due_date DATE,                  -- 납기일
ADD COLUMN IF NOT EXISTS contractor_ssn TEXT,                    -- 계약자 주민번호
ADD COLUMN IF NOT EXISTS contractor_phone TEXT,                  -- 계약자 연락처
ADD COLUMN IF NOT EXISTS insured_ssn TEXT,                       -- 피보험자 주민번호
ADD COLUMN IF NOT EXISTS insured_phone TEXT,                     -- 피보험자 연락처
ADD COLUMN IF NOT EXISTS premium_amount DECIMAL(15,2),           -- 납입보험료 (통합)
ADD COLUMN IF NOT EXISTS payment_cycle app_payment_cycle_enum;   -- 납입주기

-- 기존 데이터의 호환성을 위한 기본값 설정
UPDATE app_client_insurance_contracts 
SET payment_cycle = 'monthly' 
WHERE payment_cycle IS NULL;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_insurance_contracts_insurance_code 
ON app_client_insurance_contracts(insurance_code);

CREATE INDEX IF NOT EXISTS idx_insurance_contracts_payment_due_date 
ON app_client_insurance_contracts(payment_due_date);

CREATE INDEX IF NOT EXISTS idx_insurance_contracts_contractor_phone 
ON app_client_insurance_contracts(contractor_phone);

-- 주석 추가
COMMENT ON COLUMN app_client_insurance_contracts.insurance_code IS '보종코드 (예: 01-01-01)';
COMMENT ON COLUMN app_client_insurance_contracts.payment_due_date IS '납기일';
COMMENT ON COLUMN app_client_insurance_contracts.contractor_ssn IS '계약자 주민번호';
COMMENT ON COLUMN app_client_insurance_contracts.contractor_phone IS '계약자 연락처';
COMMENT ON COLUMN app_client_insurance_contracts.insured_ssn IS '피보험자 주민번호';
COMMENT ON COLUMN app_client_insurance_contracts.insured_phone IS '피보험자 연락처';
COMMENT ON COLUMN app_client_insurance_contracts.premium_amount IS '납입보험료 (통합)';
COMMENT ON COLUMN app_client_insurance_contracts.payment_cycle IS '납입주기 (월납/분기납/반년납/연납/일시납)'; 