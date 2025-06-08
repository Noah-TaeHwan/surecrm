-- 🗂️ SureCRM Storage 버킷 생성 및 정책 설정

-- 1. 보험계약 첨부파일 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-attachments',
  'contract-attachments', 
  false, -- 비공개 버킷
  10485760, -- 10MB 제한
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. 클라이언트 문서 버킷 생성  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  false, -- 비공개 버킷
  10485760, -- 10MB 제한
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 3. RLS 정책 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 4. 보험계약 첨부파일 - 조회 정책
CREATE POLICY "계약 첨부파일 조회 정책" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contract-attachments' 
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (storage.foldername(name))[2]::uuid
  )
);

-- 5. 보험계약 첨부파일 - 업로드 정책  
CREATE POLICY "계약 첨부파일 업로드 정책" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'contract-attachments'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (storage.foldername(name))[2]::uuid
  )
);

-- 6. 보험계약 첨부파일 - 삭제 정책
CREATE POLICY "계약 첨부파일 삭제 정책" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'contract-attachments'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (storage.foldername(name))[2]::uuid
  )
);

-- 7. 클라이언트 문서 - 조회 정책
CREATE POLICY "클라이언트 문서 조회 정책" ON storage.objects
FOR SELECT  
USING (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT up.id::uuid
    FROM app_user_profiles up
    WHERE up.id::text = auth.uid()::text
  )
);

-- 8. 클라이언트 문서 - 업로드 정책
CREATE POLICY "클라이언트 문서 업로드 정책" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT up.id::uuid
    FROM app_user_profiles up  
    WHERE up.id::text = auth.uid()::text
  )
);

-- 9. 클라이언트 문서 - 삭제 정책
CREATE POLICY "클라이언트 문서 삭제 정책" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT up.id::uuid
    FROM app_user_profiles up
    WHERE up.id::text = auth.uid()::text  
  )
);

-- 10. 관리자 권한 - 모든 파일 접근 (Service Role)
CREATE POLICY "관리자 전체 접근 정책" ON storage.objects
FOR ALL
USING (auth.role() = 'service_role');

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ SureCRM Storage 버킷 및 RLS 정책 설정 완료';
  RAISE NOTICE '📁 생성된 버킷: contract-attachments, client-documents';
  RAISE NOTICE '🔒 RLS 정책: 에이전트별 파일 접근 제한';
  RAISE NOTICE '📏 파일 제한: 10MB, PDF/Word/Excel/이미지만 허용';
END $$; 