# 최종 최적화된 SureCRM 데이터 모델 (Supabase/PostgreSQL)

## 1. 핵심 엔터티(Entities)

- **User**: 보험설계사 및 관리자
- **Team**: 설계사 팀 그룹
- **Client**: 보험 고객 기본 정보
- **ClientDetail**: 고객 민감 정보 (주민등록번호 등)
- **InsuranceInfo**: 보험 유형별 상세 정보
- **Referral**: 고객 간 소개 관계
- **PipelineStage**: 영업 프로세스 단계
- **Meeting**: 고객 미팅 및 일정
- **Invitation**: 초대장 시스템
- **Document**: 고객 문서 및 이미지

## 2. 각 엔터티의 필드 정의

### User

- `id` (UUID, PK): Supabase Auth 연동 사용자 ID
- `email` (string, unique, NOT NULL): 로그인 이메일
- `full_name` (string, NOT NULL): 이름
- `phone` (string, nullable): 전화번호
- `profile_image_url` (string, nullable): 프로필 이미지 경로
- `company` (string, nullable): 소속 보험사
- `role` (enum: 'agent', 'team_admin', 'system_admin', NOT NULL, default: 'agent'): 사용자 역할
- `team_id` (UUID, FK, nullable): 소속 팀 ID
- `invited_by_id` (UUID, FK, nullable): 초대한 사용자 ID
- `invitations_left` (integer, NOT NULL, default: 2): 남은 초대장 수량
- `google_calendar_token` (JSONB, nullable): 구글 캘린더 인증 토큰 및 메타데이터
- `settings` (JSONB, nullable): 사용자 개인 설정 (테마, 알림 등)
- `is_active` (boolean, NOT NULL, default: true): 계정 활성 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간
- `last_login_at` (timestamp with time zone, nullable): 마지막 로그인 시간

### Team

- `id` (UUID, PK): 팀 고유 식별자
- `name` (string, NOT NULL): 팀 이름
- `description` (text, nullable): 팀 설명
- `admin_id` (UUID, FK, NOT NULL): 팀 관리자 ID
- `settings` (JSONB, nullable): 팀 설정 (데이터 공유 범위 등)
- `is_active` (boolean, NOT NULL, default: true): 팀 활성 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### Client

- `id` (UUID, PK): 고객 고유 식별자
- `agent_id` (UUID, FK, NOT NULL): 담당 보험설계사 ID
- `team_id` (UUID, FK, nullable): 팀 ID (팀 공유 시)
- `full_name` (string, NOT NULL): 고객 이름
- `email` (string, nullable): 이메일
- `phone` (string, NOT NULL): 전화번호
- `telecom_provider` (string, nullable): 통신사
- `address` (text, nullable): 주소(상세)
- `occupation` (string, nullable): 직업(상세)
- `has_driving_license` (boolean, nullable): 운전여부(O/X)
- `height` (integer, nullable): 키(cm)
- `weight` (integer, nullable): 몸무게(kg)
- `tags` (text[], nullable): 태그 배열
- `importance` (enum: 'high', 'medium', 'low', NOT NULL, default: 'medium'): 중요도
- `current_stage_id` (UUID, FK, NOT NULL): 현재 영업 단계 ID
- `referred_by_id` (UUID, FK, nullable): 소개자 고객 ID
- `notes` (text, nullable): 메모
- `custom_fields` (JSONB, nullable): 사용자 정의 필드
- `is_active` (boolean, NOT NULL, default: true): 고객 활성 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### ClientDetail

- `id` (UUID, PK): 상세 정보 고유 식별자
- `client_id` (UUID, FK, NOT NULL): 고객 ID
- `ssn` (text, encrypted, nullable): 주민등록번호 (암호화 저장)
- `birth_date` (date, nullable): 생년월일
- `gender` (enum: 'male', 'female', nullable): 성별
- `consent_date` (timestamp with time zone, nullable): 개인정보 동의 날짜
- `consent_details` (JSONB, nullable): 동의 세부 내용
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### InsuranceInfo

- `id` (UUID, PK): 보험 정보 고유 식별자
- `client_id` (UUID, FK, NOT NULL): 고객 ID
- `insurance_type` (enum: 'life', 'health', 'auto', 'prenatal', 'property', 'other', NOT NULL): 보험 유형
- `details` (JSONB, NOT NULL): 보험 유형별 세부 정보
  - 태아보험:
    ```json
    {
      "due_date": "2023-12-31",
      "conception_method": "natural|ivf",
      "abortion_prevention_meds": true|false,
      "abnormal_findings": true|false,
      "disability_test_findings": true|false
    }
    ```
  - 자동차보험:
    ```json
    {
      "vehicle_number": "12가3456",
      "owner_name": "홍길동",
      "vehicle_type": "승용차",
      "manufacturer": "현대",
      "requires_policy_photo": true,
      "policy_photo_exception": "DB손해보험 제외"
    }
    ```
- `is_active` (boolean, NOT NULL, default: true): 정보 활성 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### Referral

- `id` (UUID, PK): 소개 관계 고유 식별자
- `referrer_id` (UUID, FK, NOT NULL): 소개한 고객 ID
- `referred_id` (UUID, FK, NOT NULL): 소개받은 고객 ID
- `agent_id` (UUID, FK, NOT NULL): 담당 보험설계사 ID
- `referral_date` (date, NOT NULL, default: CURRENT_DATE): 소개 날짜
- `notes` (text, nullable): 소개 관련 메모
- `status` (enum: 'active', 'inactive', NOT NULL, default: 'active'): 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### PipelineStage

- `id` (UUID, PK): 영업 단계 고유 식별자
- `agent_id` (UUID, FK, nullable): 개인 설정인 경우 소유자 ID
- `team_id` (UUID, FK, nullable): 팀 공유 설정인 경우 팀 ID
- `name` (string, NOT NULL): 단계 이름 (예: 첫 상담, 니즈 분석, 상품 설명, 계약 검토, 계약 완료)
- `order` (integer, NOT NULL): 표시 순서
- `color` (string, NOT NULL): 색상 코드 (HEX)
- `is_default` (boolean, NOT NULL, default: false): 기본 제공 단계 여부
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### Meeting

- `id` (UUID, PK): 미팅 고유 식별자
- `client_id` (UUID, FK, NOT NULL): 미팅 대상 고객 ID
- `agent_id` (UUID, FK, NOT NULL): 담당 보험설계사 ID
- `title` (string, NOT NULL): 미팅 제목
- `description` (text, nullable): 미팅 설명
- `start_time` (timestamp with time zone, NOT NULL): 시작 시간
- `end_time` (timestamp with time zone, NOT NULL): 종료 시간
- `location` (text, nullable): 장소
- `meeting_type` (enum: 'first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other', NOT NULL): 미팅 유형
- `status` (enum: 'scheduled', 'completed', 'cancelled', 'rescheduled', NOT NULL, default: 'scheduled'): 상태
- `google_event_id` (string, nullable): 구글 캘린더 이벤트 ID
- `notes` (text, nullable): 미팅 노트
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

### Invitation

- `id` (UUID, PK): 초대장 고유 식별자
- `code` (string, unique, NOT NULL): 초대 코드
- `inviter_id` (UUID, FK, NOT NULL): 초대한 사용자 ID
- `invitee_email` (string, nullable): 초대받은 이메일
- `message` (text, nullable): 개인 메시지
- `status` (enum: 'pending', 'used', 'expired', 'cancelled', NOT NULL, default: 'pending'): 상태
- `used_by_id` (UUID, FK, nullable): 사용한 사용자 ID
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `expires_at` (timestamp with time zone, NOT NULL, default: now() + interval '7 days'): 만료 시간
- `used_at` (timestamp with time zone, nullable): 사용 시간

### Document

- `id` (UUID, PK): 문서 고유 식별자
- `client_id` (UUID, FK, NOT NULL): 관련 고객 ID
- `insurance_info_id` (UUID, FK, nullable): 관련 보험 정보 ID
- `agent_id` (UUID, FK, NOT NULL): 업로드한 보험설계사 ID
- `document_type` (enum: 'policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other', NOT NULL): 문서 유형
- `file_name` (string, NOT NULL): 파일명
- `file_path` (string, NOT NULL): 저장 경로 (Supabase Storage)
- `mime_type` (string, NOT NULL): 파일 형식
- `size` (integer, NOT NULL): 파일 크기 (바이트)
- `description` (text, nullable): 설명
- `is_active` (boolean, NOT NULL, default: true): 파일 활성 상태
- `created_at` (timestamp with time zone, NOT NULL, default: now()): 생성 시간
- `updated_at` (timestamp with time zone, NOT NULL, default: now()): 수정 시간

## 3. 관계 정의

- **One Team → many Users**: 한 팀에 여러 보험설계사가 소속
- **One User → many Clients**: 한 보험설계사는 여러 고객을 관리
- **One Client → one ClientDetail**: 고객 기본 정보와 민감 정보 분리
- **One Client → many InsuranceInfo**: 한 고객은 여러 유형의 보험 정보를 가질 수 있음
- **One Client → many Referrals (as referrer)**: 한 고객은 여러 다른 고객을 소개 가능
- **One Client → many Referrals (as referred)**: 한 고객은 여러 소개 관계의 피소개자가 될 수 있음
- **One Client → many Documents**: 한 고객은 여러 문서/이미지를 가질 수 있음
- **One InsuranceInfo → many Documents**: 보험 정보에 여러 문서가 연결될 수 있음
- **One PipelineStage → many Clients**: 하나의 영업 단계에 여러 고객 배치
- **One Client → many Meetings**: 한 고객은 여러 미팅 일정을 가짐
- **One User → many Meetings**: 한 보험설계사는 여러 미팅 일정을 관리
- **One User → many Invitations**: 한 보험설계사는 여러 초대장 발급 가능

## 4. CRUD 작업 및 권한

| Entity        | Create                  | Read                         | Update                  | Delete             |
| ------------- | ----------------------- | ---------------------------- | ----------------------- | ------------------ |
| User          | 초대로만 가입           | 자신/팀 관리자/시스템 관리자 | 자신/시스템 관리자      | 비활성화만 가능    |
| Team          | 팀 관리자/시스템 관리자 | 팀원/시스템 관리자           | 팀 관리자/시스템 관리자 | 비활성화만 가능    |
| Client        | 보험설계사/팀 관리자    | 담당자/팀원/시스템 관리자    | 담당자/팀 관리자        | 비활성화만 가능    |
| ClientDetail  | 담당 설계사             | 담당자/시스템 관리자         | 담당자                  | 비활성화만 가능    |
| InsuranceInfo | 담당 설계사             | 담당자/팀원/시스템 관리자    | 담당자                  | 비활성화만 가능    |
| Referral      | 담당 설계사             | 담당자/팀원/시스템 관리자    | 담당 설계사             | 담당 설계사        |
| PipelineStage | 담당자/팀 관리자        | 담당자/팀원/시스템 관리자    | 담당자/팀 관리자        | 비사용 시에만 가능 |
| Meeting       | 담당 설계사             | 담당자/팀원/시스템 관리자    | 담당 설계사             | 담당 설계사        |
| Invitation    | 초대장 보유 시          | 발급자/시스템 관리자         | 상태 변경만 가능        | 취소만 가능        |
| Document      | 담당 설계사             | 담당자/팀원/시스템 관리자    | 담당 설계사             | 비활성화만 가능    |

## 5. 규칙 및 제약 조건

### 개인정보 보호 및 보안

- **민감 정보 암호화**: 주민등록번호 등 민감 정보는 암호화하여 저장 (pgsodium 확장 활용)
- **데이터 분리**: 기본 고객 정보와 민감 정보는 별도 테이블로 분리 (ClientDetail)
- **개인정보 동의**: 개인정보 수집/이용 동의 정보 기록 및 관리
- **접근 제한**: RLS를 통해 민감 정보는 담당 설계사와 시스템 관리자만 접근 가능
- **감사 로그**: 민감 정보 접근 및 변경 시 감사 로그 생성
- **데이터 파기**: 동의 철회 또는 일정 기간 경과 후 민감 정보 자동 암호화 강화 또는 익명화

### 인증 및 초대 시스템

- **초대 전용 가입**: MVP 단계에서는 초대장을 통해서만 시스템에 가입 가능
- **초대장 할당**: 모든 신규 사용자는 가입 시 기본 2장의 초대장을 받음
- **초대장 만료**: 초대장은 발급 후 7일이 지나면 자동으로 만료 (트리거 활용)
- **초대 제한**: 초대장 수량이 0 이하인 경우 새 초대장을 발급할 수 없음

### 데이터 무결성

- **소개 관계 순환 방지**: A→B→C→A와 같은 순환 소개 관계 발생 시 트리거로 차단
- **미팅 시간 유효성**: `start_time < end_time` 제약 조건으로 시간 역전 현상 방지
- **미팅 중복 방지**: 같은 설계사의 미팅 시간이 겹치지 않도록 제약 조건 설정
- **데이터 보존**: 고객 및 사용자 데이터는 삭제되지 않고 `is_active=false`로 비활성화
- **파일 관리**: 고객 또는 보험 정보 비활성화 시 관련 문서도 자동으로 비활성화

### 보험 유형별 특수 처리

- **태아보험 정보**: 태아 출생 예정일, 임신 과정, 의료 정보 등 저장
- **자동차보험 정보**: 차량 정보와 필요 서류(사진) 관리
- **유연한 확장성**: JSONB 타입을 활용해 보험 유형별 다양한 정보 저장 가능

## 6. PostgreSQL 구현 (SQL 코드)

```sql
-- 순환 참조 문제를 해결하기 위한 구현 순서 조정

-- 먼저 teams 테이블 생성 (admin_id 없이)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- users 테이블 생성
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('agent', 'team_admin', 'system_admin')) NOT NULL DEFAULT 'agent',
  team_id UUID REFERENCES teams(id),
  invited_by_id UUID REFERENCES users(id),
  invitations_left INTEGER NOT NULL DEFAULT 2,
  google_calendar_token JSONB,
  settings JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 이제 teams 테이블에 admin_id 필드 추가
ALTER TABLE teams ADD COLUMN admin_id UUID REFERENCES users(id);

-- pipeline_stages 테이블 생성 (client 테이블 참조 전)
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- agent_id 또는 team_id 중 하나는 반드시 있어야 함
  CHECK ((agent_id IS NULL AND team_id IS NOT NULL) OR (agent_id IS NOT NULL AND team_id IS NULL))
);

-- clients 테이블 생성
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES users(id) NOT NULL,
  team_id UUID REFERENCES teams(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  telecom_provider TEXT,
  address TEXT,
  occupation TEXT,
  has_driving_license BOOLEAN,
  height INTEGER,
  weight INTEGER,
  tags TEXT[],
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')) NOT NULL DEFAULT 'medium',
  current_stage_id UUID REFERENCES pipeline_stages(id) NOT NULL,
  referred_by_id UUID REFERENCES clients(id),
  notes TEXT,
  custom_fields JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- 이름 + 전화번호 조합 유일성 제약 (같은 설계사 기준)
  UNIQUE (agent_id, full_name, phone)
);

-- client_details 테이블 생성 (민감 정보)
CREATE TABLE client_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL UNIQUE, -- 1:1 관계
  ssn TEXT, -- pgsodium으로 암호화 필요
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- insurance_info 테이블 생성
CREATE TABLE insurance_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  insurance_type TEXT CHECK (insurance_type IN ('life', 'health', 'auto', 'prenatal', 'property', 'other')) NOT NULL,
  details JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- referrals 테이블 생성
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES clients(id) NOT NULL,
  referred_id UUID REFERENCES clients(id) NOT NULL,
  agent_id UUID REFERENCES users(id) NOT NULL,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- 같은 소개 관계가 중복되지 않도록
  UNIQUE (referrer_id, referred_id),
  -- 자기 자신을 소개할 수 없음
  CHECK (referrer_id != referred_id)
);

-- meetings 테이블 생성
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  agent_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) NOT NULL DEFAULT 'scheduled',
  google_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- 미팅 종료 시간은 시작 시간보다 늦어야 함
  CHECK (end_time > start_time)
);

-- invitations 테이블 생성
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  inviter_id UUID REFERENCES users(id) NOT NULL,
  invitee_email TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'used', 'expired', 'cancelled')) NOT NULL DEFAULT 'pending',
  used_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + interval '7 days',
  used_at TIMESTAMP WITH TIME ZONE
);

-- documents 테이블 생성
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  insurance_info_id UUID REFERENCES insurance_info(id),
  agent_id UUID REFERENCES users(id) NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'policy', 'id_card', 'vehicle_registration', 'vehicle_photo',
    'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other'
  )) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_clients_agent_id ON clients(agent_id);
CREATE INDEX idx_clients_team_id ON clients(team_id);
CREATE INDEX idx_clients_current_stage_id ON clients(current_stage_id);
CREATE INDEX idx_clients_referred_by_id ON clients(referred_by_id);
CREATE INDEX idx_insurance_info_client_id ON insurance_info(client_id);
CREATE INDEX idx_insurance_info_type ON insurance_info(insurance_type);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_agent_id ON referrals(agent_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_agent_id ON meetings(agent_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_insurance_info_id ON documents(insurance_info_id);
CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_invitations_inviter_id ON invitations(inviter_id);

-- JSONB 필드 인덱싱
CREATE INDEX idx_insurance_info_details ON insurance_info USING gin (details);
CREATE INDEX idx_client_custom_fields ON clients USING gin (custom_fields);

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- (다른 테이블에도 동일하게 적용)

-- 소개 관계 순환 방지 트리거
CREATE OR REPLACE FUNCTION check_referral_cycle()
RETURNS TRIGGER AS $$
DECLARE
  cycle_exists BOOLEAN;
BEGIN
  -- 자기 자신을 소개하는 경우 체크 (이미 CHECK 제약조건으로 처리됨)
  IF NEW.referrer_id = NEW.referred_id THEN
    RAISE EXCEPTION '자기 자신을 소개할 수 없습니다';
  END IF;

  -- 순환 소개 관계 체크
  WITH RECURSIVE referral_path(referrer_id, referred_id, path, cycle) AS (
    -- 시작점: 새로 추가하려는 소개 관계
    SELECT
      NEW.referrer_id,
      NEW.referred_id,
      ARRAY[NEW.referrer_id, NEW.referred_id],
      NEW.referrer_id = NEW.referred_id
    UNION ALL
    -- 기존 소개 관계를 재귀적으로 탐색
    SELECT
      r.referrer_id,
      r.referred_id,
      path || r.referred_id,
      r.referred_id = ANY(path)
    FROM
      referrals r,
      referral_path rp
    WHERE
      r.referrer_id = rp.referred_id AND
      NOT cycle
  )
  SELECT EXISTS (SELECT 1 FROM referral_path WHERE cycle) INTO cycle_exists;

  IF cycle_exists THEN
    RAISE EXCEPTION '순환 소개 관계가 발생합니다';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_referral_cycle
BEFORE INSERT OR UPDATE ON referrals
FOR EACH ROW EXECUTE FUNCTION check_referral_cycle();

-- Row Level Security 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
-- (다른 테이블에도 동일하게 적용)

-- 정책 예시: 자신의 고객만 조회 가능 (일반 설계사)
CREATE POLICY client_user_policy ON clients
  FOR SELECT
  USING (agent_id = auth.uid() OR
         team_id IN (SELECT id FROM teams WHERE admin_id = auth.uid()) OR
         auth.role() IN ('system_admin', 'team_admin') AND
         team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));

-- 민감 정보 테이블에 대한 강화된 정책
CREATE POLICY client_detail_access_policy ON client_details
  FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE agent_id = auth.uid()) OR
         auth.role() = 'system_admin');
```

## 7. 성능 및 확장성 고려사항

- **파티셔닝**: 향후 데이터 증가 시 `clients`, `meetings`, `documents` 테이블 파티셔닝

  - `clients` 테이블: `agent_id` 또는 `team_id` 기준 파티셔닝
  - `meetings` 테이블: 시간 범위별 파티셔닝(월/분기별)
  - `documents` 테이블: `document_type` 또는 `client_id` 기준 파티셔닝

- **효율적인 인덱싱**: 모든 주요 조회 패턴을 지원하는 인덱스 구성

  - 외래 키 필드에 기본 인덱스
  - 복합 인덱스(`agent_id, current_stage_id` 등)
  - JSONB 필드에 GIN 인덱스

- **쿼리 최적화**:

  - 복잡한 소개 네트워크 탐색을 위한 재귀 쿼리 최적화
  - 자주 사용되는 데이터 조회를 위한 Materialized Views 생성
  - 영업 파이프라인 대시보드용 집계 뷰

- **캐싱 전략**:

  - Supabase에서 지원하는 쿼리 캐싱 활용
  - 필요 시 Redis 같은 외부 캐싱 솔루션 도입 고려
  - 네트워크 뷰, 대시보드 데이터 등 자주 접근하는 데이터 캐싱

- **백업 및 복구**:

  - 주기적인 데이터베이스 백업 (Supabase 자동 백업 활용)
  - 특정 시점 복구(Point-in-Time Recovery) 설정
  - 중요 데이터 변경 전 스냅샷 생성

- **확장 경로**:
  - 추가 보험 유형을 위한 유연한 JSONB 구조
  - 사용자 역할 확장을 위한 권한 시스템 설계
  - 향후 API 통합을 위한 인터페이스 준비
