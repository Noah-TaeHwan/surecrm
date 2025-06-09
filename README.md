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
- **Deployment**: Vercel
- **Version Control**: Git with automated versioning

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

## 📋 **다음 Feature 작업 순서**

Calendar feature 완성 후, abc 순서대로 진행:

1. ✅ **@calendar** - 완료!
2. 🔄 **@clients** - 다음 작업 대상
3. ⏳ **@dashboard**
4. ⏳ **@influencers**
5. ⏳ **@invitations**
6. ⏳ **@network**
7. ⏳ **@notifications**
8. ⏳ **@pipeline**
9. ⏳ **@reports**
10. ⏳ **@settings**
11. ⏳ **@team**

---
