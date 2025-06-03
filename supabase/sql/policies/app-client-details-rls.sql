-- app_client_details 테이블에 대한 RLS 정책 추가
-- Supabase SQL Editor에서 실행하세요

-- RLS 활성화
ALTER TABLE public.app_client_details ENABLE ROW LEVEL SECURITY;

-- 조회 정책: 본인의 고객 세부정보만 볼 수 있음
CREATE POLICY "Users can view own client details" ON public.app_client_details
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- 삽입 정책: 본인의 고객 세부정보만 생성할 수 있음
CREATE POLICY "Users can insert own client details" ON public.app_client_details
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- 수정 정책: 본인의 고객 세부정보만 수정할 수 있음
CREATE POLICY "Users can update own client details" ON public.app_client_details
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- 삭제 정책: 본인의 고객 세부정보만 삭제할 수 있음
CREATE POLICY "Users can delete own client details" ON public.app_client_details
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = auth.uid()
    )
  );

-- 정책 적용 완료 확인
SELECT 'app_client_details RLS 정책이 성공적으로 적용되었습니다!' as message; 