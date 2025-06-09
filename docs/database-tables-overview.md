# SureCRM 데이터베이스 테이블 전체 현황

## 📊 전체 테이블 개요

SureCRM 프로젝트는 **총 70개 이상의 테이블**로 구성되어 있으며, 보험설계사의 업무 프로세스 전반을 지원하는 포괄적인 데이터베이스 구조를 가지고 있습니다.

### 🏗️ 스키마 구조

- **Core Schema**: 핵심 공유 테이블들 (사용자, 팀, 고객, 영업 파이프라인 등)
- **Feature-Specific Schema**: 기능별 전용 테이블들
- **Public Schema**: 공개 페이지 관련 테이블들
- **Admin Schema**: 백오피스 관리 테이블들

## 🗂️ 테이블 분류

### 1. 핵심 공유 테이블 (Core Tables)

#### 🔐 사용자 & 인증 관련

- `auth.users` - Supabase 인증 테이블 (참조용)
- `app_user_profiles` - 사용자 프로필
- `app_user_teams` - 팀 관리
- `app_user_invitations` - 초대 관리

#### 👥 고객 관리 (CRM Core)

- `app_client_profiles` - 고객 기본 정보
- `app_client_details` - 고객 민감 정보 (주민번호, 계좌번호 등)
- `app_client_insurance` - 고객 보험 정보
- `app_client_referrals` - 고객 추천 관계
- `app_client_meetings` - 미팅 관리
- `app_client_documents` - 문서 관리

#### 🚀 영업 파이프라인

- `app_pipeline_stages` - 영업 단계 정의
- `app_opportunity_products` - 영업 기회별 상품 정보

#### 📋 계약 관리

- `app_client_insurance_contracts` - 보험계약 정보
- `app_client_contract_attachments` - 계약 첨부파일

### 2. 백오피스 관리 테이블 (Admin Tables)

- `admin_system_audit_logs` - 시스템 감사 로그
- `admin_system_settings` - 시스템 설정
- `admin_system_stats_cache` - 통계 캐시

### 3. Calendar 기능 테이블

- `app_calendar_meeting_templates` - 미팅 템플릿
- `app_calendar_meeting_checklists` - 미팅 체크리스트
- `app_calendar_meeting_reminders` - 미팅 알림
- `app_calendar_meeting_attendees` - 미팅 참석자
- `app_calendar_meeting_notes` - 미팅 노트
- `app_calendar_settings` - 캘린더 설정
- `app_calendar_recurring_meetings` - 반복 미팅
- `app_calendar_sync_logs` - 동기화 로그

### 4. Clients 기능 확장 테이블

#### 고객 정보 확장

- `app_client_tags` - 고객 태그
- `app_client_tag_assignments` - 태그 할당
- `app_client_contact_history` - 연락 기록
- `app_client_family_members` - 가족 구성원
- `app_client_preferences` - 고객 선호도
- `app_client_milestones` - 고객 마일스톤

#### 고객 분석 & 이력

- `app_client_analytics` - 고객 분석 데이터
- `app_client_stage_history` - 영업 단계 이력
- `app_client_data_access_logs` - 데이터 접근 로그
- `app_client_data_backups` - 데이터 백업

### 5. Dashboard 기능 테이블

- `app_dashboard_performance_metrics` - 성과 지표
- `app_dashboard_goals` - 목표 설정
- `app_dashboard_activity_logs` - 활동 로그
- `app_dashboard_notifications` - 대시보드 알림
- `app_dashboard_widgets` - 위젯 설정
- `app_dashboard_quick_actions` - 빠른 액션

### 6. Influencers 기능 테이블 (키맨 관리)

- `app_influencer_profiles` - 키맨 프로필
- `app_influencer_gratitude_history` - 감사 표현 이력
- `app_influencer_network_analysis` - 네트워크 분석
- `app_influencer_activity_logs` - 활동 로그
- `app_influencer_gratitude_templates` - 감사 표현 템플릿

### 7. Invitations 기능 테이블

- `app_invitation_usage_logs` - 초대 사용 로그

### 8. Network 기능 테이블

- `app_network_nodes` - 네트워크 노드
- `app_network_edges` - 네트워크 연결
- `app_network_stats` - 네트워크 통계
- `app_network_interactions` - 네트워크 상호작용
- `app_network_opportunities` - 네트워크 기회

### 9. Notifications 기능 테이블

- `app_notification_settings` - 알림 설정
- `app_notification_templates` - 알림 템플릿
- `app_notification_queue` - 알림 큐
- `app_notification_history` - 알림 이력
- `app_notification_rules` - 알림 규칙
- `app_notification_subscriptions` - 알림 구독

### 10. Pipeline 기능 확장 테이블

- `app_pipeline_stage_history` - 파이프라인 단계 이력
- `app_pipeline_views` - 파이프라인 뷰 설정
- `app_pipeline_analytics` - 파이프라인 분석
- `app_pipeline_stage_templates` - 단계 템플릿
- `app_pipeline_goals` - 파이프라인 목표

### 11. Reports 기능 테이블

- `report_templates` - 보고서 템플릿
- `report_schedules` - 보고서 스케줄
- `report_instances` - 보고서 인스턴스
- `report_dashboards` - 보고서 대시보드
- `report_metrics` - 보고서 지표
- `report_exports` - 보고서 내보내기
- `report_subscriptions` - 보고서 구독

### 12. Settings 기능 테이블

- `app_settings_user_profiles` - 사용자 설정 프로필
- `app_settings_integrations` - 통합 설정
- `app_settings_backups` - 백업 설정
- `app_settings_change_logs` - 변경 로그
- `app_settings_theme_preferences` - 테마 설정
- `app_settings_security_logs` - 보안 로그

### 13. Team 기능 테이블

- `app_team_members` - 팀 멤버
- `app_team_stats_cache` - 팀 통계 캐시
- `app_team_performance_metrics` - 팀 성과 지표
- `app_team_goals` - 팀 목표
- `app_team_activity_logs` - 팀 활동 로그
- `app_team_communication_channels` - 팀 커뮤니케이션 채널
- `app_team_training_records` - 교육 기록

### 14. Public 테이블 (공개 페이지)

- `public_contents` - 공개 콘텐츠
- `faqs` - 자주 묻는 질문
- `announcements` - 공지사항
- `testimonials` - 고객 후기
- `site_settings` - 사이트 설정
- `page_views` - 페이지 조회 통계

## 🛡️ RLS (Row Level Security) 정책

### 보안 정책 개요

- **모든 테이블에 RLS 활성화**: 데이터 접근 제어
- **역할 기반 접근 제어**: `agent`, `team_admin`, `system_admin`
- **팀 기반 데이터 격리**: 팀 멤버는 자신의 팀 데이터만 접근 가능
- **개인 데이터 보호**: 사용자는 자신의 데이터만 수정 가능

### 주요 보안 정책

#### 1. 사용자 역할별 권한

```sql
-- agent: 자신의 고객과 데이터만 관리
-- team_admin: 팀 내 모든 데이터 관리
-- system_admin: 전체 시스템 관리
```

#### 2. 데이터 접근 제어

```sql
-- 고객 데이터: 담당 설계사 또는 팀 멤버만 접근
-- 민감 정보: 추가 보안 검증
-- 계약 정보: 담당 설계사와 관련자만 접근
```

#### 3. 감사 및 로깅

```sql
-- 모든 중요한 작업에 대한 감사 로그
-- 데이터 접근 기록 추적
-- 보안 이벤트 모니터링
```

## 📋 테이블 네이밍 규칙

### 컨벤션

- **Core 테이블**: `app_` 접두사 사용
- **기능별 테이블**: `app_[feature]_` 접두사 사용
- **Admin 테이블**: `admin_` 접두사 사용
- **Public 테이블**: 접두사 없음 또는 명확한 이름

### 예시

```sql
-- 고객 관련: app_client_*
-- 팀 관련: app_team_*
-- 캘린더 관련: app_calendar_*
-- 알림 관련: app_notification_*
```

## 🔗 주요 관계 (Relations)

### 핵심 관계도

```
auth.users (1) → (1) app_user_profiles
app_user_profiles (N) → (1) app_user_teams
app_user_profiles (1) → (N) app_client_profiles
app_client_profiles (1) → (1) app_client_details
app_client_profiles (1) → (N) app_client_insurance_contracts
app_client_profiles (N) → (1) app_pipeline_stages
```

### 확장 관계

- **고객 중심**: 고객을 중심으로 한 방사형 관계
- **팀 기반**: 팀을 통한 데이터 공유
- **이력 추적**: 모든 중요 변경사항 기록

## 💾 인덱스 및 성능 최적화

### 주요 인덱스

```sql
-- 사용자 관련
idx_app_user_profiles_team_id
idx_app_user_profiles_role

-- 고객 관련
idx_app_client_profiles_agent_id
idx_app_client_profiles_team_id

-- 검색 최적화
idx_app_client_profiles_fulltext
```

### 성능 고려사항

- **대용량 데이터 처리**: 분할된 테이블 구조
- **쿼리 최적화**: 적절한 인덱스 배치
- **캐시 활용**: 통계 및 분석 데이터 캐싱

## 🔧 유지보수 및 확장성

### 확장 고려사항

- **모듈화된 구조**: 기능별 독립적 테이블 설계
- **버전 관리**: 스키마 변경 이력 추적
- **백업 및 복구**: 정기적 백업 및 복구 전략

### 향후 확장 계획

- **AI/ML 데이터**: 분석 및 예측을 위한 테이블 추가
- **외부 통합**: API 연동을 위한 동기화 테이블
- **모바일 지원**: 오프라인 동기화 테이블

---

## 📝 참고사항

### 파일 위치

- **스키마 정의**: `app/lib/schema/`
- **RLS 정책**: `supabase/sql/policies/`
- **마이그레이션**: `supabase/migrations/`

### 관련 문서

- [DrizzleORM 스키마 가이드](../app/lib/schema/README.md)
- [RLS 정책 가이드](../supabase/sql/policies/README.md)
- [API 문서](../docs/api/README.md)

### 업데이트 정보

- **마지막 업데이트**: 2024년 현재
- **버전**: v1.0
- **작성자**: SureCRM 개발팀

---

_이 문서는 SureCRM 프로젝트의 데이터베이스 구조를 이해하고 유지보수하는 데 도움을 제공합니다._
