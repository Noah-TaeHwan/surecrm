# 보안 업데이트 가이드

## 하드코딩된 시크릿 제거 완료 (2025-01-20)

다음 파일들에서 하드코딩된 시크릿을 제거했습니다:

1. `app/routes/api.google.calendar.webhook.ts`
2. `app/routes/api.notifications.scheduler.ts`
3. `app/features/calendar/lib/google-calendar-service.server.ts`

### 필수 환경 변수 설정

`.env` 파일에 다음 환경 변수들을 추가하세요:

```bash
# Google Calendar Webhook 토큰 (랜덤한 문자열 생성)
GOOGLE_WEBHOOK_VERIFY_TOKEN=your-secure-random-token-here

# 스케줄러 시크릿 키 (랜덤한 문자열 생성)
SCHEDULER_SECRET=your-secure-scheduler-secret-here
```

### 안전한 토큰 생성 방법

다음 명령어로 안전한 랜덤 토큰을 생성할 수 있습니다:

```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 배포 환경 설정

각 배포 환경(개발, 스테이징, 프로덕션)에서 다른 값을 사용하세요:

- **Vercel**: 프로젝트 설정에서 환경 변수 추가
- **기타 플랫폼**: 각 플랫폼의 환경 변수 설정 방법 참조

### 주의사항

- 이 환경 변수들이 설정되지 않으면 관련 기능이 작동하지 않습니다
- 개발 환경에서도 실제 값을 사용하는 것을 권장합니다
- 절대 이 값들을 코드에 하드코딩하거나 커밋하지 마세요