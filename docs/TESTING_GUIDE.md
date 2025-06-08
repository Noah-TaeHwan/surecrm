# 🧪 보험계약 기능 테스트 가이드

## 📋 테스트 완료 항목

### ✅ **1. Supabase Storage 연결**

- **Status**: 정상 작동 확인
- **Buckets**: `contract-attachments`, `client-documents` 생성 완료
- **File Upload**: 업로드/삭제 정상 작동

### ✅ **2. 계약 수정 모달**

- **Status**: 기존 값 정상 로드 확인
- **Fix**: 빈 모달 문제 해결 완료

---

## 🎯 사용자 테스트 가이드

### **테스트 1: 첨부파일 업로드**

1. **고객 상세 페이지 접속**

   ```
   /clients/[clientId] → 보험계약 탭
   ```

2. **새 계약 등록 클릭**

   - 기본 정보 입력 (상품명, 보험회사 등)
   - 스크롤 하단으로 이동

3. **첨부파일 섹션에서 테스트**

   ```
   📁 파일 선택 → PDF, Word, Excel, 이미지 파일 업로드
   📋 문서 타입 선택 (계약서, 증권, 청약서 등)
   💬 설명 입력 (선택사항)
   ```

4. **저장 후 확인**
   - 계약 목록에서 "상세보기" 토글 클릭
   - 첨부파일 섹션에서 업로드된 파일 확인

### **테스트 2: 계약 수정**

1. **기존 계약 카드에서 '수정' 아이콘 클릭**

   - 📝 연필 모양 아이콘

2. **모달 확인사항**

   ```
   ✅ 제목: "보험계약 수정" (이전: "새 보험계약 등록")
   ✅ 모든 기존 값이 정상 로드됨
   ✅ 상품명, 보험회사, 금액 등 모든 필드 채워짐
   ```

3. **값 수정 후 저장**
   - 임의 값 변경 후 저장
   - 변경사항 정상 반영 확인

### **테스트 3: 파이프라인 → 계약 전환**

1. **영업 파이프라인 페이지 접속**

   ```
   /pipeline
   ```

2. **고객 카드에서 "기존 고객 영업 기회 추가"**

   - 상품명, 보험회사, 월 납입료, 예상 수수료 입력

3. **"계약전환" 버튼 클릭**
   - 고객 상세 페이지로 이동
   - 보험계약 탭에서 모달 자동 열림
   - 영업 기회 데이터가 자동 입력됨

---

## 🚨 예상 가능한 이슈 & 해결

### **이슈 1: 파일 업로드 실패**

```
❌ 증상: "mime type not supported" 에러
✅ 해결: Supabase SQL Editor에서 실행
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
  'text/plain'
]
WHERE id IN ('contract-attachments', 'client-documents');
```

### **이슈 2: 파일 크기 초과**

```
❌ 증상: 10MB 이상 파일 업로드 시 에러
✅ 해결: 파일 크기를 10MB 이하로 줄이거나 Supabase에서 제한 증가
```

### **이슈 3: RLS 정책 에러**

```
❌ 증상: Storage 접근 권한 에러
✅ 해결: Supabase Dashboard → Storage → Policies에서 정책 확인
```

---

## 📊 성공 기준

### **✅ 첨부파일 기능**

- [ ] PDF, Word, Excel, 이미지 파일 업로드 가능
- [ ] 파일 크기 10MB 이하 제한 작동
- [ ] 문서 타입 분류 및 설명 추가 가능
- [ ] 업로드된 파일이 계약 상세보기에서 확인 가능

### **✅ 계약 수정 기능**

- [ ] 수정 모달에 기존 값이 정상 로드
- [ ] 모든 필드 수정 가능
- [ ] 저장 후 변경사항 정상 반영

### **✅ 파이프라인 연동**

- [ ] 영업 기회 → 계약 전환 시 데이터 자동 입력
- [ ] 모달 자동 열림
- [ ] 계약 성사 후 KPI 대시보드에 반영

---

## 🎉 테스트 완료 시

모든 기능이 정상 작동한다면, SureCRM의 핵심 보험계약 관리 시스템이 완벽하게 구현된 것입니다!

**다음 단계 추천:**

1. **사용자 교육**: 보험설계사들에게 새 기능 안내
2. **데이터 마이그레이션**: 기존 계약 데이터 시스템 이관
3. **성과 모니터링**: KPI 대시보드 활용한 영업 성과 추적
