-- 🔒 SureCRM Storage 보안 정책 수정

-- 기존 정책 삭제 (잘못된 정책들)
DROP POLICY IF EXISTS "계약 첨부파일 조회 정책" ON storage.objects;
DROP POLICY IF EXISTS "계약 첨부파일 업로드 정책" ON storage.objects;
DROP POLICY IF EXISTS "계약 첨부파일 삭제 정책" ON storage.objects;
DROP POLICY IF EXISTS "클라이언트 문서 조회 정책" ON storage.objects;
DROP POLICY IF EXISTS "클라이언트 문서 업로드 정책" ON storage.objects;
DROP POLICY IF EXISTS "클라이언트 문서 삭제 정책" ON storage.objects;

-- 🔒 수정된 보안 정책 생성

-- 1. 보험계약 첨부파일 - 조회 정책 (수정됨)
CREATE POLICY "계약 첨부파일 조회 정책_v2" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contract-attachments' 
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (string_to_array(name, '/'))[2]::uuid  -- contracts/{contractId}/{file} 구조에 맞춤
  )
);

-- 2. 보험계약 첨부파일 - 업로드 정책 (수정됨)
CREATE POLICY "계약 첨부파일 업로드 정책_v2" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'contract-attachments'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);

-- 3. 보험계약 첨부파일 - 삭제 정책 (수정됨)
CREATE POLICY "계약 첨부파일 삭제 정책_v2" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'contract-attachments'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid 
    FROM app_client_insurance_contracts 
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);

-- 4. 클라이언트 문서 - 조회 정책 (단순화됨)
CREATE POLICY "클라이언트 문서 조회 정책_v2" ON storage.objects
FOR SELECT  
USING (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid
    FROM app_client_profiles
    WHERE id = (string_to_array(name, '/'))[2]::uuid  -- clients/{clientId}/{file} 구조
  )
);

-- 5. 클라이언트 문서 - 업로드 정책 (단순화됨)
CREATE POLICY "클라이언트 문서 업로드 정책_v2" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid
    FROM app_client_profiles
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);

-- 6. 클라이언트 문서 - 삭제 정책 (단순화됨)
CREATE POLICY "클라이언트 문서 삭제 정책_v2" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-documents'
  AND auth.uid() IN (
    SELECT DISTINCT agent_id::uuid
    FROM app_client_profiles
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);

-- 7. 관리자 권한은 유지 (Service Role 전체 접근)
-- 이미 존재하는 정책이므로 생략

-- 🔍 정책 확인 쿼리
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- 완료 메시지
SELECT 
  '✅ Storage 보안 정책 수정 완료' as status,
  'contract-attachments, client-documents 버킷 RLS 정책 업데이트됨' as details; 