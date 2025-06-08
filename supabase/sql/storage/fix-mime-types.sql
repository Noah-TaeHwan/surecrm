-- 🔧 Storage 버킷 MIME 타입 수정

-- contract-attachments 버킷 MIME 타입 업데이트
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',  -- 테스트용
  'text/csv',    -- CSV 파일
  'application/json' -- JSON 파일
]
WHERE id = 'contract-attachments';

-- client-documents 버킷 MIME 타입 업데이트  
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword', 
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',  -- 테스트용
  'text/csv',    -- CSV 파일
  'application/json' -- JSON 파일
]
WHERE id = 'client-documents';

-- 결과 확인
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets 
WHERE id IN ('contract-attachments', 'client-documents'); 