---
description: 
globs: 
alwaysApply: true
---
Always respond in Korean.

Remix React Router TypeScript Supabase
You are an expert in TypeScript, Node.js, React Router, React, Remix, Shadcn UI, Radix UI, Tailwind and Supabase.

Key Principles

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.

Key Conventions

- Don't import anything from Radix UI. Always import UI componentsfrom Shadcn UI.
- Don't import anything from Remix. Any @remix-run import should be imported from "react-router".
- When creating a new page always export a loader, action, and meta function.
- Route types should be imported like this: `import type { Route } from "./+types/...";`
- `useLoaderData` does not exist anymore. Instead, components receive Router.ComponentProps type param that contains loaderData.
- `useActionData` does not exist anymore. Instead, components receive Router.ComponentProps type param that contains actionData.
- Never use `useLoaderData` or `useActionData` in page components.
- `loader` function takes a Route.LoaderArgs type param.
- `action` function takes a Route.ActionArgs type param.
- `meta` function takes a Route.MetaFunction type param.
- `meta` returns MetaFunction type.
- `json` does not exists anymore. Return plain objects i.e `export function loader({ request }: Route.LoaderArgs) { return { } }`
- Use `data` when returning a response with a status code, otherwise return plain objects.

## 🚨 중요: 페이지 진입 불가 문제 해결 가이드

### 문제 유형: "페이지 진입 안됨" 에러

**증상:**
- 특정 페이지(예: 영업 파이프라인) 접근 시 500 에러 또는 빈 화면
- 개발자 도구에서 컴파일 에러 또는 런타임 에러 발생
- TypeScript 에러가 빌드를 차단하는 경우

**주요 원인들:**

#### 1. 스키마 Import 경로 불일치
```typescript
// ❌ 잘못된 예
import { clients } from '~/lib/schema';  // 경로가 틀림

// ✅ 올바른 예  
import { clients } from '~/lib/schema/core';  // 정확한 경로
```

#### 2. DB 스키마와 타입 인터페이스 필드명 불일치
```typescript
// ❌ 문제: DB에는 fullName이지만 타입에서는 name 요구
return {
  name: item.client.fullName,  // 이런 변환 필요
  // ... 다른 필드들
};
```

#### 3. Date/Timestamp 타입 불일치
```typescript
// 테이블별 birthDate 타입이 다름:
// clientDetails: date 타입 → 문자열로 저장
// appClientFamilyMembers: timestamp 타입 → Date 객체로 저장

// ✅ 올바른 처리
if (data.birthDate !== undefined) {
  // clientDetails 테이블인 경우
  updateData.birthDate = data.birthDate;  // 문자열 그대로
  
  // appClientFamilyMembers 테이블인 경우  
  updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;  // Date 객체로 변환
}
```

#### 4. Migration 스키마 정의 누락
```typescript
// supabase/migrations/schema.ts에서 테이블 정의 누락
export const users = pgTable('users', {
  id: uuid().primaryKey().notNull(),
  email: text(),
  // ... 필요한 필드들
});

// usersInAuth alias 추가
export const usersInAuth = users;
```

### 🔧 문제 해결 체크리스트

1. **TypeScript 에러 먼저 확인**
   ```bash
   npx tsc --noEmit --skipLibCheck
   ```

2. **스키마 Import 경로 확인**
   - `~/lib/schema/core`에서 모든 테이블 정의 import
   - 절대 경로 일관성 유지

3. **필드명 매핑 확인**
   - DB 스키마 필드명과 인터페이스 타입 필드명 비교
   - 필요시 변환 로직 추가 (예: fullName → name)

4. **Date 타입 처리 확인**
   - 각 테이블의 날짜 필드 타입 확인 (date vs timestamp)
   - 적절한 변환 함수 사용

5. **Loader 함수 안전장치 추가**
   ```typescript
   export async function loader({ request }: Route.LoaderArgs) {
     try {
       // 메인 로직
       return { data: result };
     } catch (error) {
       console.error('❌ Loader 에러:', error);
       // 안전한 fallback 반환
       return { 
         data: null, 
         error: error instanceof Error ? error.message : '알 수 없는 오류' 
       };
     }
   }
   ```

6. **병렬 에러 처리**
   ```typescript
   // 각 API 호출을 try-catch로 개별 보호
   let stages: any[] = [];
   try {
     stages = await getPipelineStages(agentId);
   } catch (error) {
     console.error('❌ 단계 조회 실패:', error);
     stages = [];  // 안전한 fallback
   }
   ```

### 🎯 예방 수칙

- **새 테이블 추가 시**: 반드시 스키마와 타입 정의 동시 업데이트
- **필드 변경 시**: 모든 관련 파일에서 일관성 유지
- **Date 필드**: 테이블별 타입 차이 문서화 및 주석 추가
- **Import 변경**: 절대 경로 사용으로 일관성 유지
- **에러 핸들링**: 모든 async 함수에 try-catch 및 fallback 추가

---

## 🏗️ SureCRM 프로젝트 아키텍처 가이드

### 📁 폴더 구조 원칙

#### Features 기반 모듈 구조
```
app/features/[기능명]/
├── components/     # 해당 기능 전용 컴포넌트
├── lib/           # 비즈니스 로직, API 호출, 스키마
├── pages/         # 페이지 컴포넌트 (라우트와 연결)
├── types/         # 타입 정의 (컴포넌트간 공유)
└── hooks/         # 커스텀 훅 (선택적)
```

#### 공통 모듈 구조
```
app/common/
├── components/    # 재사용 가능한 UI 컴포넌트
├── layouts/       # 페이지 레이아웃
└── lib/           # 공통 유틸리티
```

### 🗄️ 데이터베이스 아키텍처

#### 스키마 계층 구조
```typescript
// 1. 핵심 공유 스키마 (모든 기능이 사용)
app/lib/schema/core.ts
// - profiles (사용자)
// - clients (고객)  
// - meetings (미팅)
// - teams (팀)

// 2. 공개 페이지 스키마 
app/lib/schema/public.ts

// 3. 기능별 특화 스키마
app/features/[기능명]/lib/schema.ts
// - 해당 기능만 사용하는 테이블
// - prefix: app_[기능명]_
```

#### 테이블 네이밍 컨벤션 (엄격 준수)
```sql
-- ✅ 올바른 네이밍
app_user_profiles          -- 사용자 프로필
app_client_profiles        -- 고객 정보
app_calendar_meetings      -- 캘린더 미팅
app_billing_subscriptions  -- 결제 구독

-- ❌ 잘못된 네이밍  
users                      -- prefix 누락
client_info               -- 표준 형식 미준수
```

#### 필수 DB 연결 패턴
```typescript
// ✅ 올바른 DB 연결 방식
import { db } from '~/lib/core/db';                    // Drizzle ORM
import { createServerClient } from '~/lib/core/supabase'; // Supabase Auth
import { clients } from '~/lib/schema/core';            // 스키마 import

// ❌ 잘못된 방식
import { clients } from '~/lib/schema';  // 경로 불일치
```

### 🎯 인증 & 보안 원칙

#### Supabase 클라이언트 사용법
```typescript
// 🔐 서버사이드 (일반 권한)
const supabase = createServerClient();

// 🔑 관리자 작업 (Admin 권한 - 신중히 사용)
const adminClient = createAdminClient();  

// 🌐 클라이언트사이드 (브라우저)
const client = createClientSideClient();
```

#### RLS (Row Level Security) 필수 적용
- 모든 테이블에 `agentId` 기반 필터링
- 사용자별 데이터 완전 격리
- 팀 공유 데이터는 `teamId` 추가 검증

### 🚀 라우팅 & 페이지 구조

#### 라우트 파일 필수 구조
```typescript
// app/routes/[페이지명].tsx
import type { Route } from "./+types/[페이지명]";

export async function loader({ request }: Route.LoaderArgs) {
  // 1. 인증 확인
  const user = await requireAuth(request);
  
  // 2. 데이터 조회 (try-catch 필수)
  try {
    const data = await getData(user.id);
    return { data };
  } catch (error) {
    console.error('데이터 로딩 실패:', error);
    return { data: null, error: '데이터를 불러올 수 없습니다.' };
  }
}

export async function action({ request }: Route.ActionArgs) {
  // 폼 처리 로직
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: '페이지 제목 - SureCRM' },
    { name: 'description', content: '페이지 설명' }
  ];
}

export default function PageComponent({ loaderData }: Route.ComponentProps) {
  // 컴포넌트 로직
}
```

### 💻 MVP 기능 관리 원칙

#### 기능 비활성화 방식
```typescript
// 1. 사이드바 메뉴 주석처리
// app/common/components/navigation/sidebar.tsx
// {
//   label: '일정 관리',
//   href: '/calendar',
//   icon: <Calendar className="h-5 w-5" />,
// },

// 2. 라우트 파일 미생성 또는 리다이렉트
// app/routes/calendar.tsx → 생성하지 않음
// app/common/pages/calendar-redirect.tsx → 안내 페이지

// 3. 기능 코드는 완전 구현 상태 유지
// app/features/calendar/ → 모든 코드 완성
```

#### 기능 활성화 시 체크리스트
- [ ] 사이드바 메뉴 주석 해제
- [ ] 라우트 파일 생성 (`app/routes/[기능명].tsx`)
- [ ] 타입 import 경로 활성화
- [ ] 필요한 마이그레이션 실행
- [ ] 권한 정책 확인

### ⚡ 성능 & 에러 처리

#### 필수 에러 처리 패턴
```typescript
// 🛡️ Loader 함수 안전장치
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await requireAuth(request);
    
    // 병렬 데이터 조회 시 개별 try-catch
    const [clients, stages] = await Promise.allSettled([
      getClients(user.id),
      getStages(user.id)
    ]);
    
    return {
      clients: clients.status === 'fulfilled' ? clients.value : [],
      stages: stages.status === 'fulfilled' ? stages.value : [],
    };
  } catch (error) {
    console.error('❌ 페이지 로딩 실패:', error);
    return { 
      clients: [], 
      stages: [],
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}
```

#### 타입 안전성 확보
```typescript
// ✅ 자동 타입 추론 활용
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

// ✅ 안전한 데이터 변환
const clientData: Client = {
  id: row.id,
  fullName: row.fullName,  // DB 필드명 그대로
  agentId: row.agentId,
  // ...
};

// ✅ 컴포넌트 인터페이스 분리
interface ClientCardProps {
  client: {
    id: string;
    name: string;    // 컴포넌트용 필드명
    phone?: string;
  };
}
```

### 🎨 UI/UX 일관성 원칙

#### ShadCN/UI 우선 사용
```typescript
// ✅ 올바른 import
import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';

// ❌ 절대 금지
import { Button } from '@radix-ui/react-button';  // Radix 직접 import 금지
```

#### 반응형 레이아웃 패턴
```tsx
// 🖥️ 데스크톱 우선, 모바일 대응
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-3">
    {/* 메인 컨텐츠 */}
  </div>
  <div className="lg:col-span-1">
    {/* 사이드바 */}
  </div>
</div>
```

### 🔧 개발 워크플로우

#### 스키마 변경 시 필수 순서
1. `app/lib/schema/core.ts` 수정
2. `npm run db:generate` (마이그레이션 생성)
3. `npm run db:push` (DB 스키마 적용)
4. 관련 타입 파일 업데이트
5. 비즈니스 로직 코드 수정

#### 새 기능 개발 시 체크리스트
- [ ] `app/features/[기능명]/` 폴더 구조 생성
- [ ] 스키마 정의 (`lib/schema.ts`)
- [ ] 비즈니스 로직 (`lib/`)
- [ ] 컴포넌트 (`components/`)
- [ ] 페이지 (`pages/`)
- [ ] 라우트 파일 (`app/routes/`)
- [ ] 네비게이션 메뉴 추가
- [ ] 권한 정책 설정

**THINK DEEP**
Always respond in Korean.