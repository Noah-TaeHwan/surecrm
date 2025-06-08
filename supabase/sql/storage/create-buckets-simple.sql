-- 🗂️ SureCRM Storage 버킷 생성 (간단 버전)

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

-- 완료 메시지
SELECT 
  '✅ Storage 버킷 생성 완료' as status,
  string_agg(name, ', ') as created_buckets
FROM storage.buckets 
WHERE id IN ('contract-attachments', 'client-documents'); 