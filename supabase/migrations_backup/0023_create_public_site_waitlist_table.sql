-- public_site_waitlist 테이블 생성
CREATE TABLE
  public.public_site_waitlist (
    id UUID DEFAULT gen_random_uuid () NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::TEXT, NOW()) NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    CONSTRAINT public_site_waitlist_pkey PRIMARY KEY (id),
    CONSTRAINT public_site_waitlist_email_key UNIQUE (email)
  );

-- 테이블 설명 추가
COMMENT ON TABLE public.public_site_waitlist IS '랜딩 페이지 초대장 신청 대기자 명단';

-- RLS (Row Level Security) 활성화
ALTER TABLE public.public_site_waitlist ENABLE ROW LEVEL SECURITY;

-- 익명 사용자를 포함한 모든 사용자가 INSERT (신청) 가능하도록 정책 생성
CREATE POLICY "Allow anyone to insert into waitlist" ON public.public_site_waitlist FOR INSERT
WITH
  CHECK (TRUE);

-- SELECT, UPDATE, DELETE는 기본적으로 막혀있음 (관리자만 가능)
-- (필요 시 추가 정책 설정) 