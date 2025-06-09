# 🚀 SureCRM 극한 Google Analytics 활용 가이드

## 📊 개요

SureCRM은 보험설계사의 모든 업무 프로세스를 **Google Analytics 4 (GA4)**로 극한까지 추적하여 데이터 기반 의사결정을 지원합니다.

## 🎯 추적되는 핵심 이벤트들

### 📈 대시보드 & KPI 이벤트

- **dashboardView**: KPI 데이터와 함께 대시보드 조회 추적
- **kpiGoalSet**: 목표 설정 및 달성률 추적
- **goalAchievement**: 목표 달성 시점과 소요 시간 추적
- **milestoneReach**: 중요 마일스톤 달성 추적

### 👥 고객 관리 (CRM Core) 이벤트

- **clientCreate**: 고객 생성 (중요도, 소개자 여부, 통신사 등)
- **clientView**: 고객 상세보기 (생성 후 경과일, 미팅 수, 계약 수)
- **clientEdit**: 고객 정보 수정 (변경 유형별 분류)
- **clientStageChange**: 영업 단계 변경 (진행/후퇴 여부, 단계별 체류 기간)
- **clientImportanceChange**: 고객 중요도 변경 (업그레이드/다운그레이드)

### 🚀 영업 파이프라인 이벤트

- **pipelineView**: 파이프라인 조회 (총 기회, 가치, 전환율)
- **opportunityCreate**: 영업 기회 생성 (보험 유형, 예상 가치, 고객 중요도)
- **opportunityConvert**: 영업 기회 성사 (실제 가치, 영업 사이클 기간)

### 📋 보험계약 관리 이벤트

- **contractCreate**: 계약 생성 (보험 유형, 보험사, 납입료, 수수료)
- **contractUpdate**: 계약 수정 (수정 유형별 분류)
- **contractStatusChange**: 계약 상태 변경 (성공/실패 여부)
- **attachmentUpload**: 첨부파일 업로드 (문서 유형, 파일 크기)

### 🌐 네트워크 & 소개 관리 이벤트

- **networkView**: 네트워크 그래프 조회 (연결 수, 깊이, 전환율)
- **referralCreate**: 소개 관계 생성 (소개자/피소개자 중요도)
- **vipClientInteraction**: VIP 고객 상호작용 추적

### 📅 일정 & 미팅 관리 이벤트

- **meetingSchedule**: 미팅 일정 생성 (유형, 고객 중요도, 반복 여부)
- **meetingComplete**: 미팅 완료 (소요 시간, 결과)
- **calendarSync**: 캘린더 동기화 (동기화된 이벤트 수)

### 👥 팀 관리 이벤트

- **teamInvite**: 팀원 초대 (현재 팀 크기)
- **teamJoin**: 팀 가입 (새 팀 크기)
- **teamDataShare**: 팀 데이터 공유 (공유 유형, 데이터 수)

### 📊 보고서 & 분석 이벤트

- **reportGenerate**: 보고서 생성 (유형, 기간, 레코드 수)
- **reportExport**: 보고서 내보내기 (형식, 레코드 수)
- **reportSchedule**: 보고서 예약 (빈도)

### 🔔 알림 시스템 이벤트

- **notificationReceive**: 알림 수신 (유형, 긴급도)
- **notificationAction**: 알림 액션 (클릭, 해제, 스누즈 등)

### 🔧 설정 & 개인화 이벤트

- **settingsUpdate**: 설정 변경 (설정 유형, 이전/이후 값)
- **themeChange**: 테마 변경
- **featureDiscovery**: 새 기능 발견 (발견 방법)

### 🔐 인증 & 보안 이벤트

- **userLogin**: 로그인 (방법, 세션 지속 시간)
- **userSignup**: 회원가입 (초대 코드, 추천인)
- **userLogout**: 로그아웃 (세션 지속 시간)
- **sensitiveDataAccess**: 민감 데이터 접근 (데이터 유형, 접근 유형)

### 💡 사용성 & 기능 활용 이벤트

- **helpDocumentView**: 도움말 문서 조회
- **errorEncounter**: 오류 발생 추적 (오류 유형, 사용자 액션)

## 🎨 커스텀 차원 (Custom Dimensions)

GA4에서 다음 커스텀 차원들을 설정했습니다:

1. **user_role**: 사용자 역할 (agent, team_admin, system_admin)
2. **team_size**: 팀 크기
3. **insurance_company**: 소속 보험회사
4. **client_count**: 담당 고객 수
5. **pipeline_stage**: 영업 단계

## 📈 실시간 모니터링

### Analytics 테스트 페이지

- **URL**: `/analytics-test`
- **기능**: 실시간 GA 이벤트 모니터링 및 테스트
- **활용**: 개발 중 이벤트 추적 확인

### 테스트 방법

```typescript
// 대시보드 조회 이벤트 테스트
InsuranceAgentEvents.dashboardView({
  totalClients: 42,
  monthlyNewClients: 5,
  conversionRate: 23.5,
  totalPremium: 1250000,
});

// 고객 상세보기 이벤트 테스트
InsuranceAgentEvents.clientView('test-client-id', {
  importance: 'high',
  currentStage: '제안중',
  daysSinceCreated: 15,
  meetingCount: 3,
  contractCount: 1,
});
```

## 📊 주요 분석 활용 시나리오

### 1. 영업 성과 분석

```sql
-- GA4 BigQuery Export 쿼리 예시
SELECT
  event_name,
  COUNT(*) as event_count,
  AVG(CAST(event_params.value.int_value AS NUMERIC)) as avg_value
FROM `your-project.analytics_XXXXX.events_*`
WHERE event_name IN ('create_opportunity', 'convert_opportunity')
AND _TABLE_SUFFIX BETWEEN '20240101' AND '20241231'
GROUP BY event_name
```

### 2. 고객 여정 분석

- **첫 상담** → **니즈 분석** → **제안** → **계약 체결** 단계별 전환율
- 각 단계별 평균 체류 기간
- 고객 중요도별 전환율 차이

### 3. 기능 사용률 분석

- 가장 많이 사용되는 기능 Top 10
- 신규 사용자 온보딩 과정에서의 이탈 지점
- 고급 기능 발견률 및 활용률

### 4. 팀 성과 비교

- 팀별 고객 관리 효율성
- 개인별 영업 사이클 분석
- 소개 네트워크 활용 패턴

## 🎯 GA4 대시보드 설정 가이드

### 1. 실시간 보고서 설정

1. GA4 → 보고서 → 실시간
2. 맞춤 측정기준 추가:
   - 이벤트 이름
   - user_role
   - insurance_company

### 2. 탐색 분석 설정

```
경로 탐색:
시작점: page_view (path: /dashboard)
1단계: view_client
2단계: create_opportunity
3단계: convert_opportunity
```

### 3. 주요 KPI 측정항목

- **고객 전환율**: `convert_opportunity` / `create_opportunity`
- **평균 영업 사이클**: `sales_cycle_days` 평균값
- **월별 신규 고객**: `create_client` 이벤트 수
- **계약 성공률**: `contract_status_change` (성공) / 전체 계약

## 🔧 커스텀 이벤트 추가 방법

### 1. 새 이벤트 정의

```typescript
// app/lib/utils/analytics.ts에 추가
newFeatureUsage: (featureName: string, usageContext: string) => trackEvent({
  action: 'use_new_feature',
  category: 'Feature Usage',
  label: featureName,
  custom_parameters: {
    feature_name: featureName,
    usage_context: usageContext,
    user_type: 'insurance_agent',
  }
}),
```

### 2. 컴포넌트에서 사용

```typescript
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

// 버튼 클릭 시
const handleNewFeatureClick = () => {
  InsuranceAgentEvents.newFeatureUsage(
    'ai_recommendation',
    'client_detail_page'
  );
  // 실제 기능 실행
};
```

## 📈 성과 측정 지표

### 일일 추적 지표

- **DAU** (일일 활성 사용자 수)
- **세션 지속 시간**
- **페이지뷰 수**
- **이벤트 발생 빈도**

### 주간 추적 지표

- **WAU** (주간 활성 사용자 수)
- **기능별 사용률**
- **고객 관리 효율성**
- **팀 협업 지표**

### 월간 추적 지표

- **MAU** (월간 활성 사용자 수)
- **사용자 유지율**
- **기능 발견률**
- **비즈니스 임팩트 지표**

## 🚨 프라이버시 & 규정 준수

### 개인정보 보호

- **IP 익명화**: 자동 활성화
- **개인식별정보 제외**: 고객명, 주민번호 등 민감정보 미포함
- **동의 기반**: 사용자 동의 하에만 추적

### GDPR 준수

- **데이터 최소화**: 필요한 데이터만 수집
- **보관 기간**: GA4 기본 14개월 (설정 가능)
- **삭제 권리**: 사용자 요청 시 데이터 삭제

## 🔗 관련 링크

- **GA4 대시보드**: [Google Analytics](https://analytics.google.com/)
- **실시간 테스트**: `/analytics-test`
- **API 문서**: `/docs/api`
- **개발자 가이드**: `/docs/development`

---

## 💡 활용 팁

### 1. 데이터 드리븐 의사결정

GA 데이터를 기반으로 다음을 개선하세요:

- 사용률이 낮은 기능의 UX 개선
- 전환율이 낮은 영업 단계 분석
- 고객 중요도별 맞춤 전략 수립

### 2. A/B 테스트 활용

- 새 기능 출시 시 사용자 그룹 분할 테스트
- UI/UX 변경사항의 효과 측정
- 마케팅 메시지 효과성 분석

### 3. 예측 분석

- 고객 이탈 예측 모델 구축
- 계약 성사 확률 예측
- 최적 영업 타이밍 분석

**🎯 SureCRM의 GA 활용으로 데이터 기반 보험 영업을 실현하세요!**
