# 📋 테이블 Prefix 네이밍 컨벤션 적용 완료

## 🎯 적용된 네이밍 규칙

### 📁 3가지 주요 Prefix

1. **`app_`**: 일반 앱 기능들 (사용자가 사용하는 주요 기능)
2. **`public_`**: 공통/공개 기능들 (여러 기능에서 공유하는 데이터)
3. **`admin_`**: 관리자 전용 기능들 (백오피스/운영자 기능)

### 🏗️ 네이밍 패턴

- **테이블**: `{prefix}_{기능명}_{테이블명}`
- **Enum**: `{prefix}_{기능명}_{enum명}_enum`

---

## 🔄 변경된 테이블명 매핑

### 📱 App Core 테이블들

| 기존 테이블명        | 새 테이블명            | 설명           |
| -------------------- | ---------------------- | -------------- |
| `app_profiles`       | `app_user_profiles`    | 사용자 프로필  |
| `app_teams`          | `app_user_teams`       | 사용자 팀      |
| `app_clients`        | `app_client_profiles`  | 고객 프로필    |
| `app_insurance_info` | `app_client_insurance` | 고객 보험 정보 |
| `app_referrals`      | `app_client_referrals` | 고객 소개 관계 |
| `app_meetings`       | `app_client_meetings`  | 고객 미팅      |
| `app_invitations`    | `app_user_invitations` | 사용자 초대    |
| `app_documents`      | `app_client_documents` | 고객 문서      |

### 🌐 Public 테이블들

| 기존 테이블명          | 새 테이블명                 | 설명          |
| ---------------------- | --------------------------- | ------------- |
| `public_contents`      | `public_site_contents`      | 사이트 콘텐츠 |
| `public_faqs`          | `public_site_faqs`          | FAQ           |
| `public_announcements` | `public_site_announcements` | 공지사항      |
| `public_testimonials`  | `public_site_testimonials`  | 사용자 후기   |
| `public_page_views`    | `public_site_analytics`     | 페이지 분석   |

### 🔒 Admin 테이블들

| 기존 테이블명       | 새 테이블명                | 설명             |
| ------------------- | -------------------------- | ---------------- |
| `admin_audit_logs`  | `admin_system_audit_logs`  | 관리자 감사 로그 |
| `admin_settings`    | `admin_system_settings`    | 관리자 설정      |
| `admin_stats_cache` | `admin_system_stats_cache` | 관리자 통계 캐시 |

### 📅 Calendar 테이블들

| 기존 테이블명                 | 새 테이블명                       | 설명            |
| ----------------------------- | --------------------------------- | --------------- |
| `calendar_meeting_templates`  | `app_calendar_meeting_templates`  | 미팅 템플릿     |
| `calendar_meeting_checklists` | `app_calendar_meeting_checklists` | 미팅 체크리스트 |
| `calendar_meeting_reminders`  | `app_calendar_meeting_reminders`  | 미팅 알림       |
| `calendar_meeting_attendees`  | `app_calendar_meeting_attendees`  | 미팅 참석자     |
| `calendar_meeting_notes`      | `app_calendar_meeting_notes`      | 미팅 노트       |
| `calendar_settings`           | `app_calendar_settings`           | 캘린더 설정     |
| `calendar_recurring_meetings` | `app_calendar_recurring_meetings` | 반복 미팅       |

---

## 🔧 변경된 Enum 매핑

### 📱 App Enum들

| 기존 Enum명         | 새 Enum명                    |
| ------------------- | ---------------------------- |
| `user_role`         | `app_user_role_enum`         |
| `importance`        | `app_importance_enum`        |
| `gender`            | `app_gender_enum`            |
| `insurance_type`    | `app_insurance_type_enum`    |
| `meeting_type`      | `app_meeting_type_enum`      |
| `meeting_status`    | `app_meeting_status_enum`    |
| `referral_status`   | `app_referral_status_enum`   |
| `document_type`     | `app_document_type_enum`     |
| `invitation_status` | `app_invitation_status_enum` |
| `theme`             | `app_theme_enum`             |

### 🌐 Public Enum들

| 기존 Enum명      | 새 Enum명                    |
| ---------------- | ---------------------------- |
| `content_type`   | `public_content_type_enum`   |
| `content_status` | `public_content_status_enum` |
| `language`       | `public_language_enum`       |

### 📅 Calendar Enum들 (새로 추가)

| Enum명                              | 설명             |
| ----------------------------------- | ---------------- |
| `app_calendar_view_enum`            | 캘린더 뷰 타입   |
| `app_calendar_meeting_status_enum`  | 캘린더 미팅 상태 |
| `app_calendar_meeting_type_enum`    | 캘린더 미팅 타입 |
| `app_calendar_reminder_type_enum`   | 캘린더 알림 타입 |
| `app_calendar_recurrence_type_enum` | 캘린더 반복 타입 |

---

## 📝 수정된 파일들

### 🗂️ 스키마 파일들

- `app/lib/schema/core.ts` - Core 스키마 테이블/enum 명 수정
- `app/lib/schema/public.ts` - Public 스키마 테이블/enum 명 수정
- `app/features/calendar/lib/schema.ts` - Calendar 스키마 테이블/enum 명 수정
- `app/lib/schema/index.ts` - RLS 정책 및 트리거 SQL 업데이트

### 🗄️ 마이그레이션 파일

- `supabase/migrations/20240101000000_apply_table_naming_convention.sql` - 새로 생성

---

## 🚀 적용 방법

### 1. 로컬 개발 환경

```bash
# Supabase 마이그레이션 실행
npx supabase db reset

# 또는 특정 마이그레이션만 실행
npx supabase db push
```

### 2. 운영 환경

```bash
# 마이그레이션 배포
npx supabase db push --linked
```

---

## ✅ 적용 확인 사항

### 🔍 체크리스트

- [ ] **모든 테이블명이 새로운 prefix 규칙을 따르는가?**
- [ ] **Enum명도 `_enum` suffix를 포함하는가?**
- [ ] **RLS 정책들이 새로운 테이블명으로 업데이트되었는가?**
- [ ] **트리거 함수가 새로운 테이블명을 참조하는가?**
- [ ] **TypeScript 타입들이 올바르게 추론되는가?**

### 🧪 테스트 방법

```typescript
// 새로운 스키마 import 테스트
import { profiles, clients, meetings } from '~/lib/schema';
import type { Profile, Client, Meeting } from '~/lib/schema';

// Calendar 기능 테스트
import {
  calendarSettings,
  type CalendarSettings,
} from '~/features/calendar/lib/schema';
```

---

## 🎯 다음 단계

### 🔄 향후 리팩토링 계획

1. **다른 기능들도 동일한 패턴으로 적용**
   - Pipeline, Reports, Settings 등의 기능별 스키마
2. **관련 코드 업데이트**
   - API endpoints, queries, components 등
3. **문서화**
   - 각 기능별 스키마 문서 업데이트

### 📋 주의사항

- **일관성 유지**: 새로운 테이블 생성시 반드시 동일한 네이밍 패턴 사용
- **충돌 방지**: 서로 다른 기능의 테이블명이 겹치지 않도록 주의
- **확장성**: 향후 새로운 기능 추가시에도 동일한 패턴 적용

---

## 🎉 완료!

새로운 네이밍 컨벤션이 성공적으로 적용되었습니다. 이제 모든 테이블과 Enum이 명확하고 일관된 네이밍 규칙을 따르며, 향후 확장성과 유지보수성이 크게 향상되었습니다.

**핵심 원칙**: `{prefix}_{기능명}_{테이블명}` 패턴을 통해 테이블의 목적과 소속을 한눈에 파악할 수 있습니다!
