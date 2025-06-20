# 📧 Supabase 이메일 템플릿 완벽 설정 가이드

## 🎯 SureCRM 하이브리드 인증 시스템용 이메일 템플릿

### 📋 개요

SureCRM은 하이브리드 인증 시스템을 사용합니다:

- **회원가입**: 이메일 인증번호 (OTP) 방식
- **로그인**: 매직링크 방식

## 🚀 Supabase 대시보드 설정

### 1. Supabase 프로젝트 접속

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. SureCRM 프로젝트 선택
3. 좌측 메뉴에서 **Authentication** 클릭
4. **Email Templates** 탭 선택

### 2. 이메일 템플릿 설정

#### 📧 회원가입용 OTP 템플릿

**Template: Signup (Email OTP)**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SureCRM 회원가입 인증</title>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8fafc;
      }
      .container {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #1e40af;
        margin-bottom: 10px;
      }
      .otp-code {
        background: #1e40af;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        margin: 30px 0;
        font-family: 'Courier New', monospace;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
      }
      .warning {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 12px;
        margin: 20px 0;
        color: #92400e;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">SureCRM</div>
        <h1>회원가입 인증번호</h1>
        <p>SureCRM에 가입해주셔서 감사합니다!</p>
      </div>

      <p>안녕하세요!</p>
      <p>
        SureCRM 회원가입을 완료하기 위해 아래 <strong>6자리 인증번호</strong>를
        입력해주세요.
      </p>

      <div class="otp-code">{{ .Token }}</div>

      <div class="warning">
        <strong>⚠️ 중요 안내</strong><br />
        • 이 인증번호는 <strong>5분 후 만료</strong>됩니다<br />
        • 본인이 요청하지 않았다면 이 이메일을 무시하세요<br />
        • 인증번호를 타인과 공유하지 마세요
      </div>

      <p>인증이 완료되면 SureCRM의 모든 기능을 이용하실 수 있습니다.</p>

      <div class="footer">
        <p>이 이메일은 SureCRM 회원가입 요청에 의해 자동 발송되었습니다.</p>
        <p>문의사항이 있으시면 고객지원팀으로 연락해주세요.</p>
        <p style="color: #9ca3af; font-size: 12px;">
          © 2024 SureCRM. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
```

#### 🔗 로그인용 매직링크 템플릿

**Template: Magic Link (Login)**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SureCRM 로그인 링크</title>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8fafc;
      }
      .container {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #059669;
        margin-bottom: 10px;
      }
      .login-button {
        display: inline-block;
        background: #059669;
        color: white;
        padding: 16px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        margin: 30px 0;
        font-size: 16px;
        transition: background-color 0.2s;
      }
      .login-button:hover {
        background: #047857;
      }
      .backup-url {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 12px;
        margin: 20px 0;
        word-break: break-all;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #4b5563;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
      }
      .warning {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 12px;
        margin: 20px 0;
        color: #92400e;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">SureCRM</div>
        <h1>로그인 링크</h1>
        <p>안전하고 편리한 로그인을 위한 링크입니다</p>
      </div>

      <p>안녕하세요!</p>
      <p>SureCRM에 로그인하기 위해 아래 버튼을 클릭해주세요.</p>

      <div style="text-align: center;">
        <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" class="login-button">
          🔐 SureCRM 로그인하기
        </a>
      </div>

      <div class="warning">
        <strong>⚠️ 보안 안내</strong><br />
        • 이 링크는 <strong>1시간 후 만료</strong>됩니다<br />
        • 한 번 사용하면 재사용할 수 없습니다<br />
        • 본인이 요청하지 않았다면 이 이메일을 무시하세요
      </div>

      <p>
        버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저 주소창에
        붙여넣어 주세요:
      </p>

      <div class="backup-url">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</div>

      <div class="footer">
        <p>이 이메일은 SureCRM 로그인 요청에 의해 자동 발송되었습니다.</p>
        <p>문의사항이 있으시면 고객지원팀으로 연락해주세요.</p>
        <p style="color: #9ca3af; font-size: 12px;">
          © 2024 SureCRM. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
```

## 🔧 Supabase 설정 단계별 가이드

### Step 1: Email Provider 설정

1. **Settings** → **Project Settings** → **Configuration** 이동
2. **SMTP Settings** 구성:
   ```
   SMTP Host: smtp.gmail.com (Gmail 사용 시)
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: your-app-password
   SMTP Sender Name: SureCRM
   SMTP Sender Email: noreply@surecrm.com
   ```

### Step 2: URL Configuration

1. **Authentication** → **URL Configuration** 이동
2. **Site URL** 설정:
   ```
   Development: http://localhost:5173
   Production: https://your-surecrm-domain.com
   ```
3. **Redirect URLs** 추가:
   ```
   http://localhost:5173/auth/magic-link-verify
   https://your-surecrm-domain.com/auth/magic-link-verify
   ```

### Step 3: Email Templates 적용

1. **Authentication** → **Email Templates** 이동
2. **Signup (Email OTP)** 탭:
   - 위의 OTP 템플릿 HTML 코드 복사 & 붙여넣기
   - Subject: `[SureCRM] 회원가입 인증번호입니다`
3. **Magic Link** 탭:
   - 위의 매직링크 템플릿 HTML 코드 복사 & 붙여넣기
   - Subject: `[SureCRM] 로그인 링크입니다`

### Step 4: 테스트 및 검증

1. **회원가입 OTP 테스트**:

   ```typescript
   // 회원가입 시 OTP 발송 테스트
   const { error } = await supabase.auth.signInWithOtp({
     email: 'test@example.com',
     options: { shouldCreateUser: true },
   });
   ```

2. **로그인 매직링크 테스트**:
   ```typescript
   // 로그인 시 매직링크 발송 테스트
   const { error } = await supabase.auth.signInWithOtp({
     email: 'test@example.com',
     options: { shouldCreateUser: false },
   });
   ```

## 🎨 템플릿 커스터마이징 팁

### 브랜딩 일관성

- **색상**: SureCRM 브랜드 컬러 사용 (`#1e40af`, `#059669`)
- **폰트**: 시스템 폰트 사용으로 가독성 확보
- **로고**: 텍스트 기반 로고로 심플하게

### 사용자 경험 최적화

- **모바일 반응형**: viewport 메타태그 및 반응형 CSS
- **명확한 CTA**: 버튼과 링크를 명확하게 구분
- **보안 안내**: 만료 시간과 보안 주의사항 명시

### 접근성 고려

- **색상 대비**: WCAG 기준 준수
- **대체 텍스트**: 링크 작동 안 할 때 복사 가능한 URL 제공
- **명확한 언어**: 기술적 용어 최소화

## 🔍 문제 해결

### 이메일이 발송되지 않는 경우

1. SMTP 설정 확인
2. 앱 비밀번호 재생성 (Gmail 사용 시)
3. 방화벽 및 보안 설정 확인

### 스팸함으로 분류되는 경우

1. SPF, DKIM 레코드 설정
2. 발송자 이메일 도메인 인증
3. 이메일 내용 최적화

### 템플릿이 제대로 렌더링되지 않는 경우

1. HTML 문법 검증
2. 인라인 CSS 사용 권장
3. 테이블 기반 레이아웃 고려

## ✅ 체크리스트

- [ ] SMTP 설정 완료
- [ ] URL 리다이렉트 설정 완료
- [ ] OTP 템플릿 적용 완료
- [ ] 매직링크 템플릿 적용 완료
- [ ] 회원가입 OTP 테스트 성공
- [ ] 로그인 매직링크 테스트 성공
- [ ] 이메일 수신 확인
- [ ] 모바일에서 템플릿 확인
- [ ] 스팸함 분류 여부 확인

## 🚀 배포 후 모니터링

### 이메일 발송 모니터링

```sql
-- Supabase 대시보드에서 실행
SELECT
  created_at,
  email,
  confirmation_sent_at,
  email_confirmed_at
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 인증 성공률 추적

```sql
-- 회원가입 완료율 확인
SELECT
  DATE(created_at) as signup_date,
  COUNT(*) as total_signups,
  COUNT(email_confirmed_at) as confirmed_signups,
  ROUND(COUNT(email_confirmed_at) * 100.0 / COUNT(*), 2) as completion_rate
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

---

**🎯 이 가이드를 따라하시면 SureCRM의 하이브리드 인증 시스템을 위한 완벽한 이메일 템플릿이 설정됩니다!**
