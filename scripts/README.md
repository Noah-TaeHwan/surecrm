# 🛠️ SureCRM Scripts

SureCRM 프로젝트의 개발 및 관리를 위한 유틸리티 스크립트 모음입니다.

## 📁 폴더 구조

```
scripts/
├── README.md                          # 이 파일
└── utils/                             # TypeScript 유틸리티들
    ├── test-supabase-connection.ts    # Supabase 연결 테스트
    ├── check-existing-data.ts         # 데이터베이스 상태 확인
    └── reset-database.ts              # 데이터베이스 초기화
```

## 🚀 사용법

### 환경 설정

모든 스크립트 실행 전에 환경 변수가 설정되어 있는지 확인하세요:

```bash
# .env 파일에 다음 변수들이 설정되어야 합니다
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### TypeScript 스크립트 실행

```bash
# 스크립트 실행 (프로젝트 루트에서)
npx tsx scripts/utils/[스크립트명].ts
```

## 📋 스크립트 상세 설명

### 🔍 test-supabase-connection.ts

**목적**: Supabase 연결 상태와 핵심 테이블 접근성을 종합적으로 테스트

**사용 시기**:

- 새로운 환경 설정 후
- 연결 문제 디버깅 시
- 배포 전 연결 확인

**실행 방법**:

```bash
npx tsx scripts/utils/test-supabase-connection.ts
```

**테스트 항목**:

- ✅ 환경 변수 확인
- ✅ Service Role 키 연결
- ✅ Anon 키 연결
- ✅ 핵심 테이블 존재 확인 (profiles, teams, clients, meetings, invitations)
- ✅ Auth 시스템 접근

### 📊 check-existing-data.ts

**목적**: 현재 데이터베이스의 상태와 데이터를 상세히 확인

**사용 시기**:

- 개발 중 데이터 상태 확인
- 문제 진단 시
- 테스트 데이터 확인

**실행 방법**:

```bash
npx tsx scripts/utils/check-existing-data.ts
```

**확인 항목**:

- 📈 Auth 사용자 현황
- 📋 테이블별 데이터 개수
- 📄 최근 데이터 상세 정보
- 🎫 사용 가능한 초대 코드
- 📈 전체 데이터베이스 요약

### 🗑️ reset-database.ts

**목적**: 개발 환경의 데이터베이스를 완전히 초기화하고 기본 데이터 생성

**⚠️ 주의사항**:

- **모든 데이터가 삭제됩니다!**
- 로컬 개발 환경에서만 사용
- 프로덕션 환경에서는 실행 불가
- 이중 확인 절차 필요

**사용 시기**:

- 새로운 개발 환경 설정
- 테스트 데이터 초기화
- 깨끗한 상태에서 개발 시작

**실행 방법**:

```bash
npx tsx scripts/utils/reset-database.ts
```

**안전장치**:

- 🔒 프로덕션 URL 감지 시 실행 차단
- 📊 현재 데이터 상태 표시
- ❓ 이중 확인 프롬프트
- 🔑 "DELETE ALL DATA" 문구 입력 필요

**생성되는 데이터**:

- 🏢 기본 팀 (SureCRM 기본팀)
- 🎫 테스트 초대 코드 4개:
  - `SURECRM-DEV` (개발용 메인 코드)
  - `WELCOME-2024` (환영 코드)
  - `BETA-TEST` (베타 테스트 코드)
  - `DEMO-USER` (데모 사용자 코드)

## 📂 SQL 스크립트

SQL 관련 스크립트들은 `supabase/sql/` 폴더로 이동되었습니다:

### supabase/sql/policies/rls-policies.sql

- **목적**: 프로덕션용 완전한 RLS 정책 설정
- **범위**: 모든 테이블 (83개)에 대한 완전한 보안 정책
- **실행 위치**: Supabase SQL Editor

### supabase/sql/utils/check-invitations.sql

- **목적**: 초대장 및 프로필 상태 확인
- **용도**: 디버깅 및 상태 점검
- **실행 위치**: Supabase SQL Editor

## 🔧 개발 워크플로우

### 새 환경 설정 시

1. **연결 테스트**:

   ```bash
   npx tsx scripts/utils/test-supabase-connection.ts
   ```

2. **데이터베이스 초기화**:

   ```bash
   npx tsx scripts/utils/reset-database.ts
   ```

3. **RLS 정책 설정**:

   - `scripts/sql/setup-rls-policies.sql`을 Supabase SQL Editor에서 실행

4. **상태 확인**:
   ```bash
   npx tsx scripts/utils/check-existing-data.ts
   ```

### 일상적인 개발 중

- **데이터 상태 확인**: `check-existing-data.ts`
- **연결 문제 시**: `test-supabase-connection.ts`
- **깨끗한 시작이 필요할 때**: `reset-database.ts`

## 🛡️ 안전 수칙

1. **프로덕션 데이터 보호**:

   - `reset-database.ts`는 프로덕션에서 실행 불가
   - 항상 환경 변수 확인

2. **백업**:

   - 중요한 데이터가 있다면 리셋 전 백업
   - Supabase Dashboard에서 수동 백업 가능

3. **권한 관리**:
   - Service Role 키는 절대 공유 금지
   - .env 파일은 git에 커밋하지 않음

## 🚨 문제 해결

### RLS (Row Level Security) 오류

**증상**: 데이터 접근 권한 오류

**해결**:

1. supabase/sql/policies/rls-policies.sql을 Supabase SQL Editor에서 실행
2. 모든 테이블에 적절한 RLS 정책이 설정됨

### 초대 코드 관련 오류

**증상**: 초대 코드가 작동하지 않음

**해결**:

1. `supabase/sql/utils/check-invitations.sql`로 상태 확인
2. `npx tsx scripts/utils/check-existing-data.ts`로 데이터 확인
3. 필요시 `npx tsx scripts/utils/reset-database.ts`로 초기화

## 📞 지원

문제가 지속되면 다음을 확인하세요:

- Supabase Dashboard의 로그
- 브라우저 개발자 도구 콘솔
- 네트워크 탭의 요청/응답

---

**⚡ 빠른 시작**: `npx tsx scripts/utils/reset-database.ts` → 개발 서버 시작 → 초대 코드로 회원가입 테스트
