-- Storage 정책 설정
-- contract-attachments 버킷 정책

-- 1. 계약 첨부파일 업로드 정책 (INSERT)
CREATE POLICY "Users can upload contract attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'contract-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 계약 첨부파일 조회 정책 (SELECT)
CREATE POLICY "Users can view their contract attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'contract-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 계약 첨부파일 삭제 정책 (DELETE)
CREATE POLICY "Users can delete their contract attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'contract-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- client-documents 버킷 정책

-- 4. 고객 문서 업로드 정책 (INSERT)
CREATE POLICY "Users can upload client documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'client-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. 고객 문서 조회 정책 (SELECT)
CREATE POLICY "Users can view their client documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'client-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. 고객 문서 삭제 정책 (DELETE)
CREATE POLICY "Users can delete their client documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'client-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. 관리자는 모든 파일에 접근 가능 (선택사항)
CREATE POLICY "Service role can access all files" ON storage.objects
FOR ALL USING (
  auth.role() = 'service_role'
);

-- RLS 활성화 확인
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 