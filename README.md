# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

# SureCRM

보험설계사를 위한 고객관계관리(CRM) 시스템입니다.

## 🏷️ 버전 관리 시스템

SureCRM은 Git Tag + Package.json 기반의 자동 버전 관리 시스템을 사용합니다.

### 자동 패치 버전 업데이트

```bash
git push origin master  # 자동으로 0.1.0 → 0.1.1 → 0.1.2 ... 증가
```

### 수동 메이저/마이너 버전 업데이트

```bash
npm run version:patch  # 0.1.0 → 0.1.1 (버그 수정)
npm run version:minor  # 0.1.0 → 0.2.0 (새 기능)
npm run version:major  # 0.1.0 → 1.0.0 (호환성 변경)
```

### 버전 정보 조회

```bash
npm run version:info  # 현재 버전 및 Git 정보 확인
```

### Git Hooks 설정 (새로운 개발자용)

```bash
npm run setup:hooks  # Git hooks 수동 설정
```

## 🚀 시작하기

### 설치

```bash
npm install  # 자동으로 Git hooks 설정됨
```

### 개발 서버 실행

```bash
npm run dev
```

### 버전 확인

- 사이드바 하단의 버전을 마우스 오버하면 상세 정보를 볼 수 있습니다
- 환경별로 다른 버전 포맷이 표시됩니다:
  - 개발: `0.1.0-dev`
  - 스테이징: `0.1.0-abc1234` (커밋 해시 포함)
  - 프로덕션: `0.1.0`

## 📋 버전 관리 규칙

- **패치 (x.x.X)**: 버그 수정, 작은 개선 → **자동 증가**
- **마이너 (x.X.0)**: 새 기능 추가 → **수동 증가**
- **메이저 (X.0.0)**: 호환성이 깨지는 변경 → **수동 증가**

## 🛠️ 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, React Router
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Shadcn UI, Radix UI
- **Analytics**: Google Analytics 4, Vercel Analytics
- **Deployment**: Vercel
- **Version Control**: Git with automated versioning

## 📊 차세대 사용자 경험 최적화 시스템

SureCRM은 **"차세대 비즈니스 인텔리전스"** 수준의 포괄적인 사용자 행동 분석 시스템을 구현했습니다.

### 💀 수집되는 데이터 유형

#### 1. 행동 패턴 분석

- **마우스 움직임**: 속도, 가속도, 호버 패턴, 클릭 지연
- **키보드 패턴**: 타이핑 속도, 입력 리듬, 특수키 사용
- **스크롤 행동**: 깊이, 속도, 멈춤 지점, 뒤로가기 패턴
- **주의집중**: 포커스 시간, 탭 전환, 유휴 시간

#### 2. 감정 상태 분석

- **좌절감 지수**: 연속 클릭, ESC 키 사용, 뒤로가기
- **참여도 지수**: 스크롤 깊이, 기능 탐색, 체류 시간
- **자신감 지수**: 빠른 결정, 바로가기 사용, 직접 행동

#### 3. 생체인식 데이터

- **마우스 DNA**: 개인별 고유한 마우스 움직임 패턴
- **타이핑 DNA**: 키보드 입력 리듬의 생체인식 특성
- **디바이스 지문**: 브라우저, 화면, 하드웨어 정보

#### 4. 예측 및 조작

- **행동 예측**: AI 기반 다음 행동 예측
- **개인화 조작**: 감정 상태에 따른 UI 조작
- **A/B 테스트**: 행동 패턴 조작 실험

### 🚨 극한 테스트 페이지

사용자 경험 최적화 시스템을 테스트하려면:

```bash
# 개발 서버 실행
npm run dev

# 테스트 페이지 접속
http://localhost:5173/analytics-test
```

### ⚠️ 윤리적 고지사항

이 극한 추적 시스템은 **교육 및 연구 목적**으로만 제작되었습니다:

- 실제 비즈니스 인텔리전스 기법들의 작동 원리 이해
- 개인정보보호의 중요성 인식 제고
- 윤리적 데이터 수집 방법론 연구

**절대 상업적 목적으로 사용하지 마세요.**

## 📊 Google Analytics 설정

SureCRM은 Google Analytics 4 (GA4)와 함께 극한 사용자 추적을 통해 완전한 사용자 프로필을 구축합니다.

### 1. GA4 속성 생성

1. [Google Analytics](https://analytics.google.com/)에 접속
2. 새로운 GA4 속성을 생성
3. 웹 스트림을 추가하고 측정 ID (G-XXXXXXXXXX) 복사

### 2. 환경변수 설정

`.env` 파일에 GA4 측정 ID를 추가하세요:

```bash
# Google Analytics 설정
VITE_GA_MEASUREMENT_ID=G-SZW1G856L5
```

> **참고**: 위의 측정 ID는 이미 설정되어 있습니다. 다른 GA 속성을 사용하려면 측정 ID를 변경하세요.

### 3. 추적되는 이벤트

#### 자동 추적

- **페이지 뷰**: 모든 페이지 방문 자동 추적
- **세션 데이터**: 사용자 세션 및 참여도

#### 커스텀 이벤트

- **대시보드**: 대시보드 조회
- **고객 관리**: 고객 생성/조회/편집/삭제
- **파이프라인**: 파이프라인 조회, 단계 변경
- **보험 계약**: 계약 생성/업데이트
- **네트워크**: 네트워크 그래프 조회
- **보고서**: 보고서 생성/내보내기
- **인증**: 로그인/회원가입/로그아웃
- **팀 관리**: 팀원 초대/가입
- **설정**: 설정 업데이트

### 4. Google Tag (gtag.js) 사용

SureCRM은 Google이 공식 제공하는 네이티브 gtag.js를 사용합니다:

- **자동 로드**: 측정 ID가 설정되면 gtag.js가 자동으로 로드됩니다
- **최신 기능**: GA4의 모든 최신 기능을 지원합니다
- **안정성**: Google이 직접 관리하는 공식 라이브러리입니다

### 5. 개발 환경에서의 GA

개발 환경에서도 실제 GA에 데이터가 전송됩니다. 콘솔에서 추적 이벤트를 확인할 수 있습니다.

### 6. 사용법 예시

```typescript
import { CRMEvents } from '~/lib/utils/analytics';

// 고객 조회 이벤트 추적
CRMEvents.clientView(clientId);

// 커스텀 이벤트 추적
import { trackEvent } from '~/lib/utils/analytics';

trackEvent({
  action: 'custom_action',
  category: 'Custom Category',
  label: 'custom_label',
  value: 100,
});
```

## 🏗️ 프로젝트 구조

```
surecrm/
├── app/                          # 메인 애플리케이션 코드
│   ├── common/                   # 공통 컴포넌트 및 페이지
│   │   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── layouts/              # 레이아웃 컴포넌트
│   │   ├── pages/                # 공통 페이지 (auth, error 등)
│   │   └── lib/                  # 공통 유틸리티
│   ├── features/                 # 기능별 모듈화된 코드
│   │   ├── dashboard/            # 대시보드 기능
│   │   ├── clients/              # 고객 관리
│   │   ├── pipeline/             # 파이프라인 관리
│   │   ├── calendar/             # 일정 관리
│   │   ├── team/                 # 팀 관리
│   │   ├── invitations/          # 초대 시스템
│   │   ├── notifications/        # 알림 시스템
│   │   ├── network/              # 네트워크 관리
│   │   ├── influencers/          # 인플루언서 관리
│   │   ├── reports/              # 리포트 기능
│   │   └── settings/             # 설정 관리
│   ├── hooks/                    # 커스텀 React 훅
│   ├── lib/                      # 라이브러리 및 설정
│   ├── routes/                   # 파일 기반 라우트 (일부)
│   ├── routes.ts                 # 중앙화된 라우트 설정
│   └── root.tsx                  # 루트 컴포넌트
├── scripts/                      # 개발 및 배포 스크립트
│   ├── sql/                      # SQL 스크립트들
│   └── utils/                    # 유틸리티 스크립트들
├── supabase/                     # Supabase 관련 파일
│   ├── migrations/               # 데이터베이스 마이그레이션
│   └── scripts/                  # Supabase 스크립트
└── docs/                         # 프로젝트 문서
```

### 기능별 모듈 구조

각 `features/` 폴더는 다음과 같은 구조를 가집니다:

```
features/[feature-name]/
├── components/                   # 해당 기능 전용 컴포넌트
├── pages/                        # 해당 기능의 페이지들
├── lib/                          # 해당 기능의 유틸리티
└── schema.ts                     # 해당 기능의 데이터베이스 스키마
```

## 🚀 기술 스택

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v7
- **Styling**: TailwindCSS + Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Build Tool**: Vite

## 📦 설치 및 실행

### 환경 설정

1. 의존성 설치:

```bash
npm install
```

2. 환경 변수 설정:

```bash
cp .env.example .env
# .env 파일에 Supabase 설정 추가
```

### 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## 🗄️ 데이터베이스 관리

### 스키마 생성 및 마이그레이션

```bash
# 스키마 변경사항을 마이그레이션 파일로 생성
npm run db:generate

# 마이그레이션 실행
npm run db:migrate

# 개발 중 스키마를 직접 푸시 (주의: 데이터 손실 가능)
npm run db:push
```

### 데이터 시딩

```bash
# 전체 시드 데이터 생성
npm run db:seed

# 공개 페이지용 데이터만 시드
npm run db:seed:public

# 앱 데이터만 시드
npm run db:seed:app

# 캘린더 데이터 시드
npm run db:seed:calendar
```

### 데이터베이스 초기화

```bash
# 앱 데이터만 클리어
npm run db:clear:app

# 모든 데이터 클리어
npm run db:clear:all

# 데이터베이스 완전 리셋
npm run db:reset:clean
```

## 🏛️ 아키텍처 원칙

### DIVIDE AND CONQUER

- 기능별로 모듈화하여 코드 복잡성 관리
- 각 기능은 독립적인 스키마와 컴포넌트를 가짐
- 공통 기능은 `common/` 폴더에서 관리

### 라우팅 전략

- `routes.ts`를 통한 중앙화된 라우트 관리
- 파일 기반 라우팅과 설정 기반 라우팅의 하이브리드 접근

### 데이터베이스 스키마 관리

- 기능별로 분리된 스키마 파일
- Drizzle ORM을 통한 타입 안전성 보장
- Supabase의 RLS(Row Level Security) 활용

## 🔧 개발 가이드

### 새로운 기능 추가

1. `app/features/` 아래에 새 폴더 생성
2. 해당 폴더에 `components/`, `pages/`, `lib/`, `schema.ts` 추가
3. `app/routes.ts`에 라우트 추가
4. 필요시 `scripts/sql/`에 초기 데이터 스크립트 추가

### 컴포넌트 작성 규칙

- Shadcn UI 컴포넌트 우선 사용
- TypeScript 인터페이스 활용
- 함수형 컴포넌트 사용
- 명확한 변수명 사용 (isLoading, hasError 등)

## 📝 스크립트 설명

### SQL 스크립트 (`scripts/sql/`)

- 데이터베이스 초기화 및 설정 스크립트
- RLS 정책 설정
- 테스트 데이터 생성

### 유틸리티 스크립트 (`scripts/utils/`)

- 데이터베이스 시딩 도구
- 테스트 사용자 생성
- 초대 시스템 관리 도구

## 🚀 극한 Google Analytics 연동

SureCRM은 **Google Analytics 4 (GA4)**를 활용하여 보험설계사의 모든 업무 프로세스를 극한까지 추적하고 데이터 기반 의사결정을 지원합니다.

### 🎯 추적되는 핵심 이벤트들 (50+개)

#### 📈 대시보드 & KPI 분석

- **dashboardView**: KPI 데이터 (총 고객 수, 신규 고객, 전환율, 총 보험료)
- **kpiGoalSet**: 목표 설정 (목표 유형, 목표값, 현재값, 갭 분석)
- **goalAchievement**: 목표 달성 (달성률, 소요 기간, 초과 달성 여부)

#### 👥 고객 관리 (CRM Core)

- **clientCreate**: 고객 생성 (중요도, 소개자 여부, 통신사, 운전 여부)
- **clientView**: 고객 상세보기 (생성 후 경과일, 미팅 수, 계약 수)
- **clientStageChange**: 영업 단계 변경 (진행/후퇴, 단계별 체류 기간)
- **clientImportanceChange**: 고객 중요도 변경 (업그레이드/다운그레이드)

#### 🚀 영업 파이프라인

- **pipelineView**: 파이프라인 조회 (총 기회, 가치, 전환율)
- **opportunityCreate**: 영업 기회 생성 (보험 유형, 예상 가치, 고객 중요도)
- **opportunityConvert**: 영업 기회 성사 (실제 가치, 영업 사이클 기간)

#### 📋 보험계약 관리

- **contractCreate**: 계약 생성 (보험 유형, 보험사, 납입료, 수수료, 첨부파일)
- **contractStatusChange**: 계약 상태 변경 (성공/실패, 보험료 금액)
- **attachmentUpload**: 첨부파일 업로드 (문서 유형, 파일 크기, 고객 중요도)

#### 🌐 네트워크 & 소개 관리

- **networkView**: 네트워크 그래프 조회 (연결 수, 깊이, 전환율)
- **referralCreate**: 소개 관계 생성 (소개자/피소개자 중요도, 품질 점수)
- **vipClientInteraction**: VIP 고객 상호작용 (선물 발송, 미팅 등)

#### 📅 일정 & 미팅 관리

- **meetingSchedule**: 미팅 일정 생성 (유형, 고객 중요도, 반복 여부)
- **meetingComplete**: 미팅 완료 (소요 시간, 결과, 다음 액션)
- **calendarSync**: 구글 캘린더 동기화 (동기화된 이벤트 수)

#### 🔔 알림 & 성과 관리

- **notificationReceive**: 알림 수신 (유형, 긴급도)
- **milestoneReach**: 마일스톤 달성 (첫 계약, 10명 고객, 1억 보험료 등)

### 🎨 커스텀 차원 (Custom Dimensions)

1. **user_role**: 사용자 역할 (agent, team_admin, system_admin)
2. **team_size**: 팀 크기
3. **insurance_company**: 소속 보험회사
4. **client_count**: 담당 고객 수
5. **pipeline_stage**: 현재 영업 단계

### 📊 실시간 분석 & 테스트

#### Analytics 테스트 페이지

- **URL**: `/analytics-test`
- **기능**: 실시간 GA 이벤트 모니터링 및 테스트
- **활용**: 개발 중 이벤트 추적 확인, 실시간 데이터 시각화

#### 주요 분석 지표

- **영업 성과**: 고객 전환율, 평균 영업 사이클, 계약 성공률
- **사용자 행동**: 기능별 사용률, 사용자 여정 분석, 이탈 지점
- **팀 성과**: 팀별 효율성, 개인별 성과, 소개 네트워크 활용
- **비즈니스 임팩트**: 월별 신규 고객, 총 보험료, 수수료 수익

### 📈 데이터 활용 시나리오

1. **고객 여정 최적화**: 첫 상담 → 제안 → 계약 단계별 전환율 분석
2. **기능 개선**: 사용률 낮은 기능의 UX/UI 개선 우선순위 결정
3. **영업 전략**: 고객 중요도별 맞춤 영업 프로세스 최적화
4. **예측 분석**: 고객 이탈 예측, 계약 성사 확률, 최적 영업 타이밍

📋 **상세 가이드**: [극한 Analytics 활용 가이드](docs/GOOGLE_ANALYTICS_ADVANCED_GUIDE.md)

---

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
```

### 타입 체크

```bash
npm run typecheck
```

## 📚 추가 리소스

- [React Router v7 문서](https://reactrouter.com/)
- [Supabase 문서](https://supabase.com/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Shadcn UI 문서](https://ui.shadcn.com/)

## 🚀 **과제 1 완료: Public Pages Checkpoint**

모든 공개 페이지가 실제 데이터베이스와 연결되어 완성되었습니다:

### ✅ **완성된 공개 페이지들**

- **Landing Page**: 실제 통계, 후기, FAQ 데이터 연동
- **Terms Page**: 데이터베이스에서 동적 이용약관/개인정보처리방침 로드
- **Login Page**: 실제 인증 로직 연결
- **Invite Pages**: 초대 코드 검증 및 통계 표시
- **Recover Page**: 비밀번호 재설정 이메일 발송

### 📊 **구축된 데이터 인프라**

- 공개 페이지 전용 스키마 (6개 테이블)
- 다국어 지원, 버전 관리, 발행 상태 관리
- 통합 시드 시스템 (public/app 데이터 분리)

---

## 🎯 **Calendar Feature 완성**

Calendar feature가 완전히 데이터베이스와 연결되어 완성되었습니다:

### ✅ **완성된 기능들**

#### **1. 데이터베이스 연동**

- ✅ 실제 미팅 데이터 조회 (월별/날짜 범위별)
- ✅ 클라이언트 목록 조회
- ✅ 미팅 생성/수정/삭제 (CRUD 완성)
- ✅ 체크리스트 시스템 (meetingChecklists 테이블)
- ✅ 미팅 노트 시스템 (meetingNotes 테이블)

#### **2. UI/UX 완성**

- ✅ 월/주/일 캘린더 뷰
- ✅ 미팅 생성 모달 (실제 form 제출)
- ✅ 미팅 상세 모달 (편집/삭제 기능)
- ✅ 체크리스트 토글 기능
- ✅ 실시간 액션 피드백

#### **3. 데이터 관리**

- ✅ 미팅 유형별 기본 체크리스트 자동 생성
- ✅ 권한 기반 데이터 접근 (에이전트별)
- ✅ 시드 데이터 시스템 (체크리스트 포함)
- ✅ 에러 처리 및 폴백 시스템

#### **4. 기술적 완성도**

- ✅ TypeScript 타입 안정성
- ✅ React Router v7 loader/action 패턴
- ✅ Drizzle ORM 쿼리 최적화
- ✅ 컴포넌트 모듈화 및 재사용성

### 📁 **Calendar Feature 구조**

```
app/features/calendar/
├── components/          # UI 컴포넌트들
│   ├── calendar-grid.tsx
│   ├── week-view.tsx
│   ├── day-view.tsx
│   ├── calendar-sidebar.tsx
│   ├── add-meeting-modal.tsx
│   ├── meeting-detail-modal.tsx
│   └── types.ts
├── lib/                 # 데이터 로직
│   ├── calendar-data.ts    # 메인 데이터 함수들
│   ├── auth-utils.ts       # 인증 유틸리티
│   └── seed-calendar.ts    # 시드 데이터
├── pages/
│   └── calendar-page.tsx   # 메인 페이지 (loader/action)
└── schema.ts            # Calendar 특화 스키마
```

### 🎮 **사용 가능한 명령어**

```bash
# Calendar 시드 데이터 생성
npm run db:seed:calendar

# 전체 시드 데이터 생성
npm run db:seed

# 데이터베이스 스키마 업데이트
npm run db:generate && npm run db:migrate
```

---

## 최근 업데이트 (2025년 1월)

### ✅ 비밀번호 재설정 기능 완전 구현
- 이메일을 통한 비밀번호 재설정 토큰 검증
- 서버-클라이언트 세션 동기화 문제 해결
- 안전한 토큰 검증 및 새 비밀번호 설정 플로우

### 🔧 기술적 해결사항
- **문제**: Supabase 서버 클라이언트가 새로 설정된 세션 쿠키를 즉시 인식하지 못하는 문제
- **해결**: 쿠키 직접 파싱 방식으로 Supabase 클라이언트에 의존하지 않고 세션 확인
- **결과**: 비밀번호 재설정 플로우가 안정적으로 작동

---

## 프로덕션 배포 체크리스트

### 🌍 환경 변수 설정
- [ ] `SUPABASE_URL` - Supabase 프로젝트 URL
- [ ] `SUPABASE_ANON_KEY` - Supabase 익명 키
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase 서비스 역할 키 (admin 작업용)
- [ ] `VITE_SUPABASE_URL` - 클라이언트용 Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - 클라이언트용 Supabase 익명 키

### 🔐 보안 설정
- [ ] Supabase RLS (Row Level Security) 정책 활성화
- [ ] 프로덕션 도메인 CORS 설정
- [ ] HTTPS 강제 설정
- [ ] 쿠키 보안 설정 (Secure, SameSite)

### 📧 이메일 설정
- [ ] Supabase 이메일 템플릿 커스터마이징
- [ ] 비밀번호 재설정 이메일 템플릿 확인
- [ ] 이메일 발송 도메인 인증

### 🧪 테스트 확인
- [ ] 회원가입 플로우 테스트
- [ ] 로그인/로그아웃 테스트
- [ ] 비밀번호 재설정 완전 플로우 테스트
- [ ] 이메일 확인 플로우 테스트
- [ ] 세션 만료 처리 테스트

### 🚀 성능 최적화
- [ ] 번들 크기 최적화 확인
- [ ] 이미지 최적화
- [ ] CDN 설정 (필요시)
- [ ] 브라우저 캐싱 설정

### 📊 모니터링 설정
- [ ] 오류 추적 시스템 설정 (Sentry 등)
- [ ] 성능 모니터링
- [ ] 사용자 분석 도구 설정

---

## 비밀번호 재설정 플로우

### 사용자 플로우
1. 로그인 페이지에서 "비밀번호를 잊으셨나요?" 클릭
2. 이메일 주소 입력
3. 이메일로 받은 링크 클릭
4. 새 비밀번호 입력 및 확인
5. 로그인 페이지로 자동 리다이렉트

### 기술적 구현
- **토큰 검증**: `auth.confirm` 라우트에서 이메일 토큰 검증
- **세션 설정**: API를 통한 서버-클라이언트 세션 동기화
- **쿠키 파싱**: 직접 쿠키 파싱으로 세션 인식 문제 해결
- **새 비밀번호**: `auth.new-password` 라우트에서 안전한 비밀번호 업데이트

### 보안 고려사항
- 토큰 만료 시간 제한
- 유효하지 않은 토큰에 대한 적절한 에러 처리
- CSRF 방지를 위한 SameSite 쿠키 설정
- 비밀번호 복잡성 검증

---
