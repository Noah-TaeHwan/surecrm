# SureCRM 회원가입 문제 해결 가이드

## 문제 설명

1. **메일 제목 문제**: 회원가입 시 전송되는 인증 코드 메일의 제목이 "Magic Link (매직링크 로그인)"으로 표시됨
2. **회원가입 완료 오류**: OTP 인증 코드를 올바르게 입력해도 회원가입이 완료되지 않고 페이지가 새로고침됨

## 해결 방법

### 1. 데이터베이스 트리거 오류 수정 (완료)

문제: `update_language_timestamp` 트리거가 존재하지 않는 `preferred_language` 필드를 참조하여 오류 발생

```sql
-- 오류를 발생시키는 트리거 제거
DROP TRIGGER IF EXISTS trigger_update_language_timestamp ON app_user_profiles;
DROP FUNCTION IF EXISTS update_language_timestamp();
```

### 2. 메일 템플릿 수정

#### 로컬 개발 환경

1. **템플릿 파일 수정** (완료)
   - 파일 위치: `/supabase/templates/magic-link.html`
   - OTP 코드를 표시하도록 템플릿 수정됨

2. **설정 파일 생성** (완료)
   - 파일 위치: `/supabase/config.toml`
   - 메일 제목을 "SureCRM 인증코드"로 설정

3. **적용 방법**
   ```bash
   supabase stop
   supabase start
   ```

#### 프로덕션 환경 (Supabase 호스팅)

1. **Supabase 대시보드에서 직접 수정**
   - [Supabase Dashboard](https://supabase.com/dashboard) 접속
   - 프로젝트 선택 → Authentication → Email Templates
   - "Magic Link" 템플릿 선택
   - 제목을 "SureCRM 인증코드"로 변경
   - 템플릿 내용을 아래와 같이 수정:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SureCRM 인증코드</title>
    <!-- 스타일은 기존 파일 참조 -->
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-size: 24px">🔐 SureCRM 인증코드</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9">회원가입/로그인 인증</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px; margin-bottom: 24px">
          안녕하세요! <br />
          SureCRM 인증을 위한 6자리 코드입니다.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px 40px; display: inline-block;">
            <h2 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">인증 코드</h2>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626; font-family: 'Courier New', monospace;">
              {{ .Token }}
            </div>
          </div>
        </div>
        
        <div class="warning">
          <strong>⚠️ 보안 안내</strong><br />
          • 이 코드는 <strong>1시간 후 만료</strong>됩니다<br />
          • 한 번 사용하면 재사용할 수 없습니다<br />
          • 본인이 요청하지 않았다면 이 이메일을 무시하세요
        </div>
      </div>
    </div>
  </body>
</html>
```

2. **Management API를 사용한 수정 (대안)**
   ```bash
   # 액세스 토큰과 프로젝트 참조 설정
   export SUPABASE_ACCESS_TOKEN="your-access-token"
   export PROJECT_REF="your-project-ref"
   
   # 메일 템플릿 업데이트
   curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "mailer_subjects_magic_link": "SureCRM 인증코드",
       "mailer_templates_magic_link_content": "<!-- 위의 HTML 내용 -->"
     }'
   ```

## 테스트 방법

1. **회원가입 플로우 테스트**
   - 신규 이메일로 회원가입 시도
   - 이메일 제목이 "SureCRM 인증코드"로 표시되는지 확인
   - 6자리 인증 코드가 이메일에 포함되어 있는지 확인
   - 인증 코드 입력 후 정상적으로 로그인되는지 확인

2. **데이터베이스 오류 확인**
   - 회원가입 완료 시 PostgreSQL 오류가 발생하지 않는지 확인
   - 사용자 프로필이 정상적으로 생성되는지 확인

## 추가 권장사항

1. **Supabase 로그 모니터링**
   - Dashboard → Logs → Auth 에서 인증 관련 로그 확인
   - 오류 발생 시 즉시 대응

2. **정기적인 테스트**
   - 프로덕션 배포 후 실제 회원가입 테스트 수행
   - 다양한 이메일 제공업체에서 메일이 정상적으로 수신되는지 확인

3. **백업 계획**
   - 문제 발생 시를 대비한 이전 템플릿 백업 유지
   - 긴급 상황 시 빠른 롤백 가능하도록 준비

## 문제 해결 완료 체크리스트

- [x] 데이터베이스 트리거 오류 수정
- [x] 로컬 환경 메일 템플릿 수정
- [x] 로컬 환경 설정 파일 생성
- [ ] 프로덕션 환경 메일 템플릿 업데이트
- [ ] 전체 회원가입 플로우 테스트
- [ ] 모니터링 설정 확인