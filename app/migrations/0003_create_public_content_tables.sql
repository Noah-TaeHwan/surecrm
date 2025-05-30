-- 공개 페이지 관련 테이블 생성 마이그레이션
-- 실행 날짜: 2024-12-19

-- Enum 타입 생성
CREATE TYPE content_type AS ENUM (
  'terms_of_service',
  'privacy_policy',
  'faq',
  'announcement',
  'help_article'
);

CREATE TYPE content_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE language AS ENUM (
  'ko',
  'en',
  'ja',
  'zh'
);

-- 공개 콘텐츠 관리 테이블 (이용약관, 개인정보처리방침 등)
CREATE TABLE public_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type content_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- 마크다운 또는 HTML 형태
  version TEXT NOT NULL DEFAULT '1.0',
  language language NOT NULL DEFAULT 'ko',
  status content_status NOT NULL DEFAULT 'draft',
  effective_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),
  metadata JSONB, -- 추가 메타데이터 (SEO, 태그 등)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FAQ 테이블
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  language language NOT NULL DEFAULT 'ko',
  author_id UUID REFERENCES profiles(id),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 공지사항 테이블
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general', -- general, maintenance, feature, etc.
  priority INTEGER NOT NULL DEFAULT 0, -- 0: normal, 1: high, 2: urgent
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  language language NOT NULL DEFAULT 'ko',
  author_id UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사용자 후기 테이블
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5, -- 1-5 별점
  initial TEXT NOT NULL, -- 이니셜 (예: "김")
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  language language NOT NULL DEFAULT 'ko',
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사이트 설정 테이블
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false, -- 공개 API에서 접근 가능한지
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 페이지 조회수 추적 테이블
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  user_id UUID REFERENCES profiles(id), -- 로그인한 사용자인 경우
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_public_contents_type_status ON public_contents(type, status);
CREATE INDEX idx_public_contents_language ON public_contents(language);
CREATE INDEX idx_public_contents_effective_date ON public_contents(effective_date);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_published ON faqs(is_published);
CREATE INDEX idx_faqs_language ON faqs(language);
CREATE INDEX idx_faqs_order ON faqs("order");

CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);

CREATE INDEX idx_testimonials_published ON testimonials(is_published);
CREATE INDEX idx_testimonials_verified ON testimonials(is_verified);
CREATE INDEX idx_testimonials_order ON testimonials("order");

CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_public ON site_settings(is_public);

CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);

-- 기본 데이터 삽입
INSERT INTO public_contents (type, title, content, version, status, effective_date) VALUES
(
  'terms_of_service',
  '서비스 이용약관',
  '# 서비스 이용약관

## 제 1 장 총칙

### 제 1 조 (목적)
이 약관은 SureCRM(이하 ''회사''라 함)이 제공하는 보험설계사 고객관리 서비스(이하 ''서비스''라 함)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

### 제 2 조 (정의)
① ''서비스''란 회사가 제공하는 모든 서비스를 의미합니다.
② ''이용자''란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
③ ''아이디(ID)''란 이용자의 식별과 서비스 이용을 위하여 이용자가 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.

### 제 3 조 (약관의 효력 및 변경)
① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
② 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.

## 제 2 장 서비스 이용

### 제 4 조 (서비스의 제공)
① 회사는 다음과 같은 서비스를 제공합니다:
- 보험설계사를 위한 고객관리 서비스
- 소개 관계 네트워킹 시각화 서비스
- 영업 파이프라인 관리 서비스
- 캘린더 및 미팅 관리 서비스
- 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스

② 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 지정할 수 있습니다.

### 제 5 조 (서비스의 중단)
① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
② 제1항에 의한 서비스 중단의 경우에는 회사는 제8조에 정한 방법으로 이용자에게 통지합니다. 다만, 회사가 사전에 통지할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.',
  '1.0',
  'published',
  NOW()
),
(
  'privacy_policy',
  '개인정보처리방침',
  '# 개인정보처리방침

SureCRM(이하 ''회사''라 함)은 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.

## 제 1 조 (개인정보의 수집 및 이용 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 서비스 제공: 고객관리 서비스, 소개 관계 네트워킹, 영업 파이프라인 관리, 캘린더 및 미팅 관리 등 서비스 제공과 관련한 목적으로 개인정보를 처리합니다.
2. 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지와 비인가 사용방지, 가입의사 확인, 가입 및 가입횟수 제한, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달 등을 목적으로 개인정보를 처리합니다.

## 제 2 조 (수집하는 개인정보의 항목 및 수집방법)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

1. 필수 항목: 이메일 주소, 비밀번호, 이름
2. 선택 항목: 프로필 이미지, 전화번호, 직업정보
3. 서비스 이용 과정에서 생성/수집되는 정보: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록

개인정보는 서비스 가입 과정에서 이용자가 개인정보 수집에 대한 동의를 하고 직접 정보를 입력하는 방식으로 수집됩니다.',
  '1.0',
  'published',
  NOW()
);

-- 기본 FAQ 데이터 삽입
INSERT INTO faqs (question, answer, category, "order") VALUES
('SureCRM은 무료로 사용할 수 있나요?', '초대를 통해 가입한 사용자는 베타 기간 동안 모든 기능을 무료로 이용할 수 있습니다. 정식 출시 후에는 기본 기능은 계속 무료로 제공되며, 고급 기능은 유료 플랜으로 제공될 예정입니다.', 'general', 1),
('어떻게 초대를 받을 수 있나요?', '현재 SureCRM은 초대 전용 베타 서비스입니다. 이미 사용 중인 보험설계사로부터 초대를 받아 사용하실 수 있습니다.', 'general', 2),
('기존 고객 데이터를 가져올 수 있나요?', '네, CSV, 엑셀 파일에서 고객 데이터를 쉽게 가져올 수 있습니다. 또한 구글 연락처와의 연동도 지원합니다. 가져온 후에는 소개 관계를 설정하는 직관적인 인터페이스를 제공합니다.', 'data', 1),
('데이터는 안전하게 보관되나요?', '고객의 개인정보 보호는 최우선 과제입니다. 모든 데이터는 암호화되어 저장되며, 해당 사용자만 접근할 수 있습니다. 개인정보 취급방침에 따라 엄격하게 관리됩니다.', 'data', 2),
('팀원들과 함께 사용할 수 있나요?', '네, 팀 기능을 통해 여러 설계사가 함께 사용할 수 있습니다. 팀원 초대, 권한 관리, 팀 대시보드 등을 제공하여 협업을 지원합니다.', 'team', 1);

-- 기본 후기 데이터 삽입
INSERT INTO testimonials (name, role, company, quote, rating, initial, is_verified, is_published, "order") VALUES
('김영수', '수석 보험설계사', '메리츠화재', 'SureCRM 덕분에 소개 네트워크를 체계적으로 관리할 수 있게 되었습니다. 매월 신규 고객이 30% 이상 증가했어요.', 5, '김', true, true, 1),
('박지은', '팀장', '삼성생명', '팀원들과 고객 정보를 공유하고 협업하기가 훨씬 쉬워졌습니다. 특히 소개 관계 시각화 기능이 정말 유용해요.', 5, '박', true, true, 2),
('이민호', '보험설계사', '현대해상', '고객 관리가 이렇게 간단할 줄 몰랐습니다. 파이프라인 관리로 계약 전환율이 크게 향상되었어요.', 5, '이', true, true, 3),
('최수진', '지점장', 'KB손해보험', '전체 지점의 성과를 한눈에 볼 수 있어서 관리가 편해졌습니다. 데이터 기반 의사결정이 가능해졌어요.', 5, '최', true, true, 4);

-- 기본 사이트 설정 삽입
INSERT INTO site_settings (key, value, type, description, is_public) VALUES
('site_name', 'SureCRM', 'string', '사이트 이름', true),
('site_description', '보험설계사를 위한 소개 네트워크 관리 솔루션', 'string', '사이트 설명', true),
('contact_email', 'contact@surecrm.co.kr', 'string', '연락처 이메일', true),
('support_email', 'support@surecrm.co.kr', 'string', '지원 이메일', true),
('beta_mode', 'true', 'boolean', '베타 모드 활성화', false),
('invite_only', 'true', 'boolean', '초대 전용 모드', false);

COMMENT ON TABLE public_contents IS '공개 콘텐츠 관리 테이블 (이용약관, 개인정보처리방침 등)';
COMMENT ON TABLE faqs IS 'FAQ 테이블';
COMMENT ON TABLE announcements IS '공지사항 테이블';
COMMENT ON TABLE testimonials IS '사용자 후기 테이블';
COMMENT ON TABLE site_settings IS '사이트 설정 테이블';
COMMENT ON TABLE page_views IS '페이지 조회수 추적 테이블'; 