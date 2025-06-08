# 📁 SureCRM Supabase Storage 설정 가이드

## 🎯 목표

보험계약 첨부파일 업로드 기능을 위한 Supabase Storage 설정

## 📋 설정 단계

### 1. Supabase 대시보드 접속

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. SureCRM 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭

### 2. Storage 버킷 생성

#### 📂 contract-attachments 버킷

1. **"New bucket"** 버튼 클릭
2. 설정값 입력:
   ```
   Name: contract-attachments
   Public bucket: OFF (체크 해제)
   File size limit: 10 MB
   Allowed MIME types:
   - application/pdf
   - application/vnd.openxmlformats-officedocument.wordprocessingml.document
   - application/msword
   - application/vnd.ms-excel
   - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   - image/jpeg
   - image/png
   - image/gif
   ```
3. **"Create bucket"** 클릭

#### 📂 client-documents 버킷

1. **"New bucket"** 버튼 클릭
2. 동일한 설정으로 `client-documents` 버킷 생성

### 3. RLS(Row Level Security) 정책 설정

#### SQL Editor 접속

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **"New query"** 클릭
3. 아래 SQL 스크립트 복사 붙여넣기:

```sql
-- RLS 정책 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 보험계약 첨부파일 정책들
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

-- 클라이언트 문서 정책들
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

-- 관리자(Service Role) 전체 접근 정책
CREATE POLICY "관리자 전체 접근 정책" ON storage.objects
FOR ALL
USING (auth.role() = 'service_role');
```

4. **"Run"** 버튼 클릭하여 실행

### 4. 환경변수 확인

#### .env 파일 확인

프로젝트 루트의 `.env` 파일에 다음 환경변수가 설정되어 있는지 확인:

```env
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 클라이언트용 (VITE_ 접두사)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 환경변수 값 확인 방법

1. Supabase 대시보드 → **Settings** → **API**
2. **Project URL**: `SUPABASE_URL`과 `VITE_SUPABASE_URL`에 사용
3. **anon public**: `SUPABASE_ANON_KEY`와 `VITE_SUPABASE_ANON_KEY`에 사용
4. **service_role**: `SUPABASE_SERVICE_ROLE_KEY`에 사용

### 5. 테스트 방법

#### 첨부파일 업로드 테스트

1. SureCRM 애플리케이션 실행
2. 고객 상세 페이지 → 보험 탭
3. "새 계약 등록" 클릭
4. 첨부파일 업로드 섹션에서 파일 선택
5. 계약 등록 완료 후 Storage에서 파일 확인

#### 브라우저 개발자 도구 확인

- Network 탭에서 Storage API 호출 확인
- Console에서 업로드 로그 확인:
  ```
  📎 보험계약 첨부파일 업로드 시작
  📁 Supabase Storage 업로드 중...
  ✅ 파일 업로드 성공
  ```

## 🚨 문제 해결

### 업로드 실패 시 체크리스트

1. **버킷 존재 확인**: Storage 탭에서 버킷이 생성되었는지 확인
2. **RLS 정책 확인**: SQL Editor에서 정책이 생성되었는지 확인
3. **환경변수 확인**: 올바른 URL과 키가 설정되었는지 확인
4. **파일 크기 확인**: 10MB 이하인지 확인
5. **파일 형식 확인**: 허용된 MIME 타입인지 확인

### 일반적인 에러 메시지

- `bucket not found`: 버킷 이름 오타 또는 미생성
- `policy violation`: RLS 정책 설정 오류
- `file too large`: 파일 크기 제한 초과
- `invalid mime type`: 허용되지 않은 파일 형식

## ✅ 설정 완료 확인

모든 설정이 완료되면:

1. 두 개의 버킷 생성됨 (`contract-attachments`, `client-documents`)
2. 6개의 RLS 정책 활성화됨
3. 첨부파일 업로드/다운로드 정상 작동
4. 에이전트별 파일 접근 제한 적용됨

---

## 📞 지원

설정 중 문제가 발생하면 다음을 확인해주세요:

1. Supabase 프로젝트가 활성화 상태인지
2. 데이터베이스 Migration이 완료되었는지
3. 브라우저 콘솔에 나타나는 에러 메시지
