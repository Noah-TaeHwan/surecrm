# SureCRM 통합 관리자 포털 기획서

> **문서 목적**: SureCRM의 확장성, 운영 효율성, 보안을 극대화하기 위한 통합 관리자 포털의 기능과 아키텍처를 정의합니다.
> **핵심 방향**: 기존 `app/features/admin`을 폐기하고, 서비스 운영의 컨트롤 타워 역할을 할 새로운 관리자 시스템을 구축합니다.

---

## 1. 개요 (Overview)

### 1.1. 목표 (Goals)

- **중앙화된 관리**: 사용자, 콘텐츠, 서비스 지표 등 모든 운영 데이터를 단일 인터페이스에서 관리합니다.
- **운영 효율성 증대**: 개발자가 아닌 팀원(마케터, 운영자)도 쉽게 사용할 수 있는 직관적인 UI/UX를 제공하여 콘텐츠 생산 및 사용자 관리 업무를 간소화합니다.
- **데이터 기반 의사결정 지원**: 서비스의 핵심 지표를 시각적으로 제공하여 데이터에 기반한 비즈니스 전략 수립을 돕습니다.
- **강화된 보안**: 역할 기반 접근 제어(RBAC)를 통해 민감한 데이터와 기능에 대한 접근을 엄격히 통제합니다.

### 1.2. 핵심 원칙 (Core Principles)

- **확장성 (Scalability)**: 향후 추가될 새로운 관리 기능(결제, 상품, 설정 등)을 쉽게 통합할 수 있는 모듈식 구조로 설계합니다.
- **사용성 (Usability)**: `shadcn/ui` 디자인 시스템을 적극 활용하여 일관되고 직관적인 사용자 경험을 제공합니다.
- **안정성 (Reliability)**: Remix의 `loader`와 `action`을 적극 활용하여 서버 중심의 데이터 처리와 강력한 에러 핸들링을 구현합니다.

---

## 2. 사용자 역할 및 권한 (Role-Based Access Control)

### 2.1. 역할 정의 (Role Definitions)

- **Admin (관리자)**: 모든 기능에 접근할 수 있는 최고 권한. 사용자 역할 변경, 주요 설정 수정 등 시스템 전반을 관리.
- **Editor (에디터)**: 콘텐츠 생성 및 관리에 특화된 권한. 블로그 게시물 작성/수정/삭제, 공지사항 관리 등의 작업을 수행.
- **User (일반 사용자)**: 관리자 포털에 접근 권한이 없음.

### 2.2. 권한 매트릭스 (Permission Matrix)

| 기능 (Feature)                      | Admin | Editor |
| ----------------------------------- | :---: | :----: |
| **대시보드 (`/admin`)**             |  ✅   |   ✅   |
| **회원 관리 (`/admin/users`)**      |  ✅   |   ❌   |
| - 사용자 목록 조회                  |  ✅   |   ❌   |
| - 사용자 역할 변경                  |  ✅   |   ❌   |
| **블로그 관리 (`/admin/posts`)**    |  ✅   |   ✅   |
| - 게시물 목록 조회                  |  ✅   |   ✅   |
| - 게시물 생성/수정/삭제             |  ✅   |   ✅   |
| **서비스 설정 (`/admin/settings`)** |  ✅   |   ❌   |

---

## 3. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

### 3.1. 라우팅 (Routing)

Remix의 파일 기반 라우팅 시스템을 활용하여 다음과 같이 구조화합니다.

- **인증 게이트웨이**: `app/routes/admin.tsx`
  - `/admin` 경로의 모든 하위 라우트를 감싸는 레이아웃 및 보안 검사 지점.
  - `loader`에서 사용자 역할을 확인하고, 권한이 없으면 리다이렉트.
- **라우트 구조**:
  - `app/routes/admin/index.tsx` -> **대시보드**
  - `app/routes/admin/users/index.tsx` -> **회원 관리 목록**
  - `app/routes/admin/posts/index.tsx` -> **블로그 게시물 목록**
  - `app/routes/admin/posts/new.tsx` -> **새 게시물 작성**
  - `app/routes/admin/posts/$postId.edit.tsx` -> **게시물 수정**
  - `app/routes/admin/settings/index.tsx` -> **서비스 설정**

### 3.2. 데이터베이스 (Supabase)

- **`profiles` 테이블**:
  - `role` (TEXT 타입) 컬럼을 추가하여 사용자 역할을 저장 (`admin`, `editor`, `user`).
- **`posts` 테이블**: 블로그 게시물 데이터 저장.
  ```sql
  CREATE TABLE public.posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT,
      excerpt TEXT,
      cover_image_url TEXT,
      author_id UUID REFERENCES public.profiles(id),
      status TEXT DEFAULT 'draft' -- 'draft', 'published'
  );
  -- RLS 정책은 관리자/에디터만 CUD 작업을, 모든 사용자는 published된 글만 읽을 수 있도록 설정합니다.
  ```

### 3.3. 상태 관리 및 UI

- **UI 라이브러리**: `shadcn/ui`와 `Tailwind CSS`를 사용하여 UI 컴포넌트와 스타일링을 통일합니다.
- **상태 관리**: 클라이언트 사이드 상태 관리는 최소화하고, Remix의 Form, `loader`, `action`을 통한 서버 데이터 흐름을 기본으로 합니다. 복잡한 UI 상태는 `useState`, `useReducer`를 사용합니다.
- **차트/에디터**:
  - **차트**: `Recharts` 또는 `Chart.js`를 사용하여 대시보드 데이터 시각화.
  - **에디터**: `react-markdown-editor-lite` 또는 `Tiptap` 기반의 커스텀 에디터를 구현하여 Markdown/WYSIWYG 콘텐츠 작성 지원.

---

## 4. 기능 명세 (Feature Specifications)

### Phase 1: 기반 구축 및 핵심 서비스 관리

#### F-1.1: 통합 대시보드 (`/admin`)

- **화면 목적**: 로그인 후 가장 먼저 마주하는 페이지로, 서비스의 전반적인 현황을 빠르게 파악할 수 있도록 돕는다.
- **표시 데이터**:
  - (Card) 총 회원 수, 신규 가입자(오늘/이번 주)
  - (Card) 총 게시물 수 (발행/초안)
  - (Chart) 주간/월간 가입자 수 추이 그래프
- **컴포넌트**: `Card`, `Chart`(Recharts), `Button` (빠른 링크용)

#### F-1.2: 회원 관리 (`/admin/users`)

- **화면 목적**: 서비스에 가입한 모든 사용자를 관리하고, 필요시 역할을 변경하거나 제재한다.
- **기능**:
  - **목록 조회**: 페이지네이션이 적용된 사용자 목록 표시.
  - **검색**: 이메일, 이름으로 특정 사용자 검색.
  - **필터**: 역할(`role`)별로 사용자 필터링.
  - **액션**: 특정 사용자의 `role`을 드롭다운 메뉴를 통해 변경 (Admin ↔ Editor).
- **컴포넌트**: `Table`, `Input` (검색), `Select` (필터/역할 변경), `Pagination`.

### Phase 2: 콘텐츠 관리

#### F-2.1: 블로그 게시물 관리 (`/admin/posts/*`)

- **화면 목적**: 마케팅 및 정보 제공을 위한 블로그 게시물을 효율적으로 생성하고 관리한다.
- **기능**:
  - **목록 조회 (`/index`)**: `Table`로 모든 게시물(초안 포함) 목록 표시. (컬럼: 제목, 상태, 작성자, 발행일)
  - **생성 (`/new`)**: Markdown 에디터를 통해 새 글 작성. 제목 입력 시 `slug` 자동 생성. 대표 이미지 업로드(Supabase Storage).
  - **수정 (`/$postId/edit`)**: 기존 게시물의 내용을 불러와 수정.
  - **삭제**: 목록 또는 수정 페이지에서 게시물 삭제. (Soft delete 권장)
  - **상태 변경**: '초안으로 저장' 또는 '발행' 상태를 선택하여 저장.
- **컴포넌트**: `Table`, `Input`, `Textarea` (Markdown Editor), `Button`, `FileUpload`.

### Phase 3: 향후 확장 계획

- **F-3.1: 분석 페이지**: GA 연동 또는 자체 로깅을 통한 심층 분석(페이지뷰, 유입경로 등) 기능.
- **F-3.2: 서비스 설정**: SEO 기본값, 소셜 링크 등 코드 수정 없이 변경 가능한 항목 관리.

---

## 5. 개발 우선순위 및 이정표 (Milestones)

1.  **Milestone 1: `admin` 아키텍처 수립**
    - [ ] `profiles` 테이블에 `role` 컬럼 추가.
    - [ ] `app/routes/admin.tsx` 레이아웃 및 인증 게이트웨이 구현.
    - [ ] 좌측 `Sidebar` 및 상단 `Header` 컴포넌트 생성.

2.  **Milestone 2: 핵심 서비스 관리 기능 구현**
    - [ ] `app/routes/admin/index.tsx` 대시보드 UI 및 `loader` 구현.
    - [ ] `app/routes/admin/users/index.tsx` 회원 관리 페이지 UI 및 `loader`/`action` 구현.

3.  **Milestone 3: 블로그 콘텐츠 관리 기능 구현**
    - [ ] `posts` 테이블 생성 (Supabase).
    - [ ] `app/routes/admin/posts/*` 경로에 블로그 CRUD 기능 전체 구현.

4.  **Milestone 4: 배포 및 고도화**
    - [ ] 관리자 기능 테스트 및 버그 수정.
    - [ ] Phase 3 확장 기능 기획.
