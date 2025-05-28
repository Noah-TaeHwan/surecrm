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

B2B SaaS 보험설계사 고객관리 서비스

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

## 🛠 **기술 스택**

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **UI Components**: Shadcn UI + Radix UI
- **Forms**: React Hook Form + Zod
- **Build**: Vite

## 📦 **설치 및 실행**

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 생성
npm run db:seed
```
