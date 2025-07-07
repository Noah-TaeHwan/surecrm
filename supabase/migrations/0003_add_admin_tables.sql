-- ========================================
-- 어드민(백오피스) 관련 테이블 추가
-- ========================================

-- 대기자 명단 테이블
CREATE TABLE IF NOT EXISTS public_site_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  role TEXT,
  message TEXT,
  source TEXT, -- 'landing', 'direct', 'referral', etc.
  is_contacted BOOLEAN NOT NULL DEFAULT false,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES app_user_profiles(id),
  notes TEXT, -- 관리자 메모
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 문의사항 테이블
CREATE TABLE IF NOT EXISTS public_site_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in-progress, resolved
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES app_user_profiles(id),
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_waitlist_email ON public_site_waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public_site_waitlist(created_at DESC);
CREATE INDEX idx_waitlist_is_contacted ON public_site_waitlist(is_contacted);

CREATE INDEX idx_contacts_email ON public_site_contacts(email);
CREATE INDEX idx_contacts_created_at ON public_site_contacts(created_at DESC);
CREATE INDEX idx_contacts_status ON public_site_contacts(status);

-- RLS 정책
ALTER TABLE public_site_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_site_contacts ENABLE ROW LEVEL SECURITY;

-- 관리자만 waitlist 읽기/쓰기 가능
CREATE POLICY "Admin can view waitlist" ON public_site_waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY "Admin can manage waitlist" ON public_site_waitlist
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('team_admin', 'system_admin')
    )
  );

-- 관리자만 contacts 읽기/쓰기 가능
CREATE POLICY "Admin can view contacts" ON public_site_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('team_admin', 'system_admin')
    )
  );

CREATE POLICY "Admin can manage contacts" ON public_site_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('team_admin', 'system_admin')
    )
  );

-- 익명 사용자는 waitlist에 추가만 가능
CREATE POLICY "Anonymous can insert waitlist" ON public_site_waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 익명 사용자는 contacts에 추가만 가능
CREATE POLICY "Anonymous can insert contacts" ON public_site_contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON public_site_waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public_site_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 