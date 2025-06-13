# 📧 SureCRM 이메일 발송 완전 설정 가이드

## 🎯 개요

SureCRM에서는 두 가지 유형의 이메일을 발송합니다:

### 1. 인증 이메일 (Supabase Auth)

- ✅ **이미 설정 완료**
- OTP 인증 이메일
- 매직링크 로그인 이메일
- 비밀번호 재설정 이메일

### 2. 트랜잭션 이메일 (Resend)

- 🚧 **추가 설정 필요**
- 웰컴 이메일
- 알림 이메일
- 마케팅 이메일

## 🚀 Resend 설정하기

### Step 1: Resend 계정 생성

1. [Resend.com](https://resend.com) 접속
2. "Get Started for Free" 클릭
3. 이메일로 회원가입
4. 이메일 인증 완료

**무료 한도:**

- 월 3,000통 무료
- 일일 100통 제한
- 개발/테스트에는 충분

### Step 2: API 키 발급

1. Resend 대시보드 로그인
2. "API Keys" 메뉴 클릭
3. "Create API Key" 버튼 클릭
4. 이름 입력 (예: "SureCRM-Production")
5. 권한: "Full access" 선택
6. API 키 복사 (`re_` 로 시작)

### Step 3: 도메인 설정 (선택사항)

**개발 단계에서는 건너뛰기 가능**

1. "Domains" 메뉴 클릭
2. "Add Domain" 클릭
3. 도메인 입력 (예: `yourdomain.com`)
4. DNS 레코드 설정
5. 인증 완료 대기

### Step 4: 환경변수 설정

프로젝트 루트에 `.env` 파일에 추가:

```bash
# 📧 이메일 발송 설정
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# 개발 환경에서는 Resend 기본 도메인 사용 가능
# FROM_EMAIL=onboarding@resend.dev
```

### Step 5: 테스트

1. 개발 서버 재시작: `npm run dev`
2. 브라우저에서 `/email-test` 접속
3. 본인 이메일 주소 입력
4. "🚀 테스트 이메일 발송" 클릭
5. 이메일함 확인

## 🧪 테스트 방법

### 1. 브라우저 테스트

```
http://localhost:5173/email-test
```

### 2. API 직접 호출

```bash
curl -X POST http://localhost:5173/api/email/send-test \
  -d "email=your@email.com&userName=테스트사용자"
```

### 3. 미리보기

```
http://localhost:5173/api/email/welcome-preview?userName=홍길동&userEmail=test@example.com
```

## 📊 현재 상태 확인

### 개발 모드 (기본)

- Resend API 키 없음
- 콘솔에 로그만 출력
- 실제 이메일 발송 안됨

### 운영 모드 (설정 완료 시)

- Resend API 키 설정됨
- 실제 이메일 발송
- 발송 이력 추적

## 🔧 문제 해결

### "RESEND_API_KEY가 설정되지 않았습니다"

- `.env` 파일에 API 키 추가
- 서버 재시작 필요

### "Invalid API key" 에러

- API 키 형식 확인 (`re_`로 시작해야 함)
- Resend 대시보드에서 키 재생성

### 이메일이 스팸함에 들어감

- 도메인 인증 설정
- SPF, DKIM 레코드 추가
- 발송량 점진적 증가

### 발송 한도 초과

- Resend 유료 플랜 업그레이드
- 또는 다른 서비스 연동 (SendGrid, AWS SES)

## 🎨 이메일 템플릿 커스터마이징

### 웰컴 이메일 수정

```typescript
// app/features/notifications/components/email-templates/welcome-email.tsx
export function WelcomeEmail({
  userName,
  userEmail,
  dashboardUrl,
}: WelcomeEmailProps) {
  // 템플릿 내용 수정
}
```

### 새 이메일 템플릿 추가

1. `email-templates/` 폴더에 새 컴포넌트 생성
2. `email-service.ts`에 발송 함수 추가
3. 필요시 API 엔드포인트 생성

## 🚀 운영 환경 배포

### Vercel 환경변수 설정

1. Vercel 프로젝트 대시보드 접속
2. "Settings" → "Environment Variables"
3. 환경변수 추가:
   ```
   RESEND_API_KEY = re_xxxxxxxxxxxxx
   FROM_EMAIL = noreply@yourdomain.com
   ```
4. 재배포

### 도메인 인증 (권장)

- 브랜드 신뢰도 향상
- 스팸 분류 방지
- 전문적인 발송자 주소

## 📈 성능 모니터링

### Resend 대시보드에서 확인 가능

- 발송량 통계
- 전달률 (Delivery Rate)
- 오픈율 (Open Rate)
- 클릭률 (Click Rate)
- 반송률 (Bounce Rate)

### SureCRM 내부 로그

- 콘솔에서 발송 로그 확인
- 에러 발생 시 상세 정보 출력

---

## ✅ 체크리스트

**개발 단계:**

- [ ] React Email 템플릿 작성 완료
- [ ] 이메일 미리보기 기능 테스트
- [ ] 콘솔 로그 출력 확인

**운영 준비:**

- [ ] Resend 계정 생성
- [ ] API 키 발급 및 설정
- [ ] 테스트 이메일 발송 성공
- [ ] 환경변수 설정 완료
- [ ] 도메인 인증 (선택)

**배포 후:**

- [ ] 실제 회원가입 테스트
- [ ] 웰컴 이메일 수신 확인
- [ ] 발송 통계 모니터링

🎉 **이제 SureCRM에서 전문적인 웰컴 이메일을 발송할 수 있습니다!**
