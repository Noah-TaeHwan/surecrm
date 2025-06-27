# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement(HMR)
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

보험설계사를 위한 현대적인 고객관계관리(CRM) 시스템

## ✨ 주요 기능

- 📊 **대시보드**: 실시간 KPI 및 성과 지표 관리
- 👥 **고객 관리**: 고객 정보, 미팅, 계약 통합 관리
- 🚀 **영업 파이프라인**: 고객 단계별 영업 프로세스 관리
- 📅 **일정 관리**: Google Calendar 연동 미팅 스케줄링
- 📋 **보험 계약 관리**: 계약서 및 첨부 파일 관리
- 🌐 **네트워크 관리**: 고객 소개 네트워크 시각화
- 📊 **리포트**: 영업 성과 및 분석 보고서
- 👨‍💼 **팀 관리**: 팀원 초대 및 협업 시스템
- 🔔 **알림 시스템**: 자동 알림 및 일정 관리

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: React Router v7, Node.js
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **UI Components**: Shadcn UI, Radix UI
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel

## 🚀 빠른 시작

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 클라이언트 환경 변수
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics (선택사항)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
```

### 3. 데이터베이스 설정

```bash
# 마이그레이션 실행
npm run db:migrate

# 시드 데이터 생성
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## 📁 프로젝트 구조

```
surecrm/
├── app/
│   ├── common/                   # 공통 컴포넌트 및 유틸리티
│   ├── features/                 # 기능별 모듈
│   │   ├── dashboard/            # 대시보드
│   │   ├── clients/              # 고객 관리
│   │   ├── pipeline/             # 영업 파이프라인
│   │   ├── calendar/             # 일정 관리
│   │   ├── team/                 # 팀 관리
│   │   ├── reports/              # 리포트
│   │   └── settings/             # 설정
│   ├── lib/                      # 라이브러리 및 설정
│   └── routes/                   # 라우트 정의
├── supabase/                     # 데이터베이스 스키마 및 마이그레이션
└── scripts/                      # 개발 스크립트
```

## 🗄️ 데이터베이스 관리

```bash
# 스키마 변경 후 마이그레이션 생성
npm run db:generate

# 마이그레이션 실행
npm run db:migrate

# 시드 데이터 생성
npm run db:seed

# 데이터베이스 초기화
npm run db:reset:clean
```

## 🔧 버전 관리

SureCRM은 자동 버전 관리 시스템을 사용합니다:

```bash
# 자동 패치 버전 증가 (git push 시)
git push origin master

# 수동 버전 업데이트
npm run version:patch  # 0.1.0 → 0.1.1
npm run version:minor  # 0.1.0 → 0.2.0
npm run version:major  # 0.1.0 → 1.0.0

# 버전 정보 확인
npm run version:info
```

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
```

### 타입 체크

```bash
npm run typecheck
```

### 배포 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] Supabase RLS 정책 활성화
- [ ] 프로덕션 도메인 CORS 설정
- [ ] 이메일 템플릿 커스터마이징
- [ ] 성능 최적화 확인

## 📚 문서

- [React Router v7](https://reactrouter.com/)
- [Supabase](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Shadcn UI](https://ui.shadcn.com/)

## 🤝 기여하기

1. 이 저장소를 Fork하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

Built with ❤️ for Insurance Agents
