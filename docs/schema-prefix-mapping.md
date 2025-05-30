# 🏗️ 스키마 Prefix 매핑 가이드

## 📋 **테이블 이름 변경 매핑**

### 🚀 **App 비즈니스 테이블들 (`app_` prefix)**

| 기존 테이블명     | 새 테이블명           | 용도            |
| ----------------- | --------------------- | --------------- |
| `profiles`        | `app_profiles`        | 사용자 프로필   |
| `teams`           | `app_teams`           | 팀 관리         |
| `clients`         | `app_clients`         | 고객 정보       |
| `client_details`  | `app_client_details`  | 고객 상세 정보  |
| `insurance_info`  | `app_insurance_info`  | 보험 정보       |
| `referrals`       | `app_referrals`       | 소개 관계       |
| `meetings`        | `app_meetings`        | 미팅 관리       |
| `invitations`     | `app_invitations`     | 초대장 관리     |
| `documents`       | `app_documents`       | 문서 관리       |
| `pipeline_stages` | `app_pipeline_stages` | 파이프라인 단계 |

### 🌐 **Public 페이지 테이블들 (`public_` prefix)**

| 기존 테이블명     | 새 테이블명            | 용도                    |
| ----------------- | ---------------------- | ----------------------- |
| `public_contents` | `public_contents`      | 공개 콘텐츠 (변경 없음) |
| `faqs`            | `public_faqs`          | FAQ                     |
| `announcements`   | `public_announcements` | 공지사항                |
| `testimonials`    | `public_testimonials`  | 고객 후기               |
| `site_settings`   | `public_site_settings` | 사이트 설정             |
| `page_views`      | `public_page_views`    | 페이지 조회수           |

### 🔒 **Admin 백오피스 테이블들 (`admin_` prefix)**

| 테이블명            | 용도              | 상태         |
| ------------------- | ----------------- | ------------ |
| `admin_audit_logs`  | Admin 감사 로그   | ✅ 신규 생성 |
| `admin_settings`    | Admin 시스템 설정 | ✅ 신규 생성 |
| `admin_stats_cache` | Admin 통계 캐시   | ✅ 신규 생성 |

## 🛡️ **RLS 정책 적용 현황**

### App 테이블들

- **접근 원칙**: 사용자는 자신의 데이터만 접근 가능
- **Admin 접근**: `system_admin` 역할은 모든 데이터 접근 가능
- **팀 공유**: 팀 기반 데이터는 팀 멤버끼리 공유

### Public 테이블들

- **읽기 접근**: 모든 사용자가 `is_published=true` 데이터 읽기 가능
- **관리 접근**: `system_admin`만 CRUD 가능

### Admin 테이블들

- **완전 제한**: `system_admin` 역할만 모든 작업 가능
- **감사 로깅**: 모든 접근 시도 기록

## 📂 **파일 변경 사항**

### 스키마 파일들

- ✅ `app/lib/schema/core.ts` - App 테이블명 업데이트
- ✅ `app/lib/schema/public.ts` - Public 테이블명 업데이트
- ✅ `app/lib/schema/index.ts` - 통합 스키마 및 트리거 업데이트

### 마이그레이션 파일들

- ✅ `supabase/migrations/20241219000001_add_admin_tables.sql` - Admin 테이블 생성
- ✅ `supabase/migrations/20241219000002_rename_tables_with_prefixes.sql` - 테이블명 변경

### Admin 페이지들

- ✅ `app/features/admin/pages/*.tsx` - 메인 스키마 import로 변경
- ✅ `app/features/admin/lib/utils.ts` - 메인 스키마 사용

## 🚀 **마이그레이션 실행 방법**

```bash
# 1. Admin 테이블 생성
supabase db push

# 2. 테이블명 변경 적용
# (위의 마이그레이션 파일들이 순차적으로 실행됨)

# 3. 스키마 확인
supabase db diff
```

## ✅ **검증 체크리스트**

- [x] App 테이블들 `app_` prefix 적용
- [x] Public 테이블들 `public_` prefix 적용
- [x] Admin 테이블들 `admin_` prefix 적용 (신규)
- [x] RLS 정책 업데이트
- [x] 인덱스 재생성
- [x] 트리거 함수 업데이트
- [x] Auth 연동 트리거 업데이트
- [x] Admin 페이지 import 경로 수정

## 🎯 **관리 효과**

1. **명확한 분류**: 테이블 용도를 prefix로 즉시 파악 가능
2. **보안 강화**: Admin/Public/App 영역 명확히 분리
3. **유지보수 개선**: 테이블 그룹별 관리 및 백업 전략 수립 용이
4. **확장성**: 새로운 기능 영역 추가 시 prefix 규칙 적용 가능
