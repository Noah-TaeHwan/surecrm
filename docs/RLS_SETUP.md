# 🔒 RLS (Row Level Security) 설정 가이드

Supabase에서 발생한 83개의 RLS 경고를 해결하는 방법을 설명합니다.

## 🚨 문제 상황

Supabase 콘솔에서 다음과 같은 경고가 표시됩니다:

```
83 issues need attention
Security
Table `public.xxx` is public, but RLS has not been enabled.
```

## ⚠️ 왜 중요한가?

### 보안 위험

- **데이터 노출**: RLS가 없으면 모든 사용자가 모든 데이터에 접근 가능
- **권한 없는 수정**: 다른 팀의 데이터를 수정/삭제할 수 있음
- **프라이버시 침해**: 개인정보 및 민감한 비즈니스 데이터 노출

### 개발 영향

- **개발 단계**: 당장 개발을 막지는 않지만 보안상 위험
- **프로덕션**: 절대 배포하면 안 되는 상태
- **규정 준수**: GDPR, 개인정보보호법 등 위반 가능성

## 🛠️ 해결 방법

### 1단계: SQL 스크립트 실행

1. **Supabase 대시보드** 접속
2. **SQL Editor** 메뉴 선택
3. **새 쿼리** 생성
4. `app/lib/rls-policies.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭하여 실행

### 2단계: 실행 결과 확인

스크립트 실행 후 다음 메시지가 표시되어야 합니다:

```
RLS 정책이 성공적으로 적용되었습니다!
```

### 3단계: 보안 경고 확인

1. Supabase 대시보드 새로고침
2. 보안 경고가 사라졌는지 확인
3. 모든 테이블에 RLS가 활성화되었는지 확인

## 📋 적용된 정책 개요

### 기본 원칙

- **팀 기반 접근**: 같은 팀 멤버만 데이터 접근 가능
- **개인 데이터**: 사용자는 자신의 데이터만 접근 가능
- **관리자 권한**: 팀 관리자는 추가 권한 보유

### 주요 정책

#### 1. 프로필 (Profiles)

```sql
-- 사용자는 자신의 프로필만 조회/수정 가능
FOR SELECT USING (auth.uid() = id)
FOR UPDATE USING (auth.uid() = id)
```

#### 2. 팀 (Teams)

```sql
-- 팀 멤버만 팀 정보 조회 가능
-- 팀 관리자만 팀 정보 수정 가능
FOR SELECT USING (id IN (SELECT team_id FROM profiles WHERE id = auth.uid()))
FOR UPDATE USING (admin_id = auth.uid())
```

#### 3. 클라이언트 (Clients)

```sql
-- 같은 팀 멤버만 클라이언트 데이터 접근 가능
FOR ALL USING (team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()))
```

#### 4. 개인 데이터 (Notifications, Goals 등)

```sql
-- 사용자는 자신의 데이터만 접근 가능
FOR ALL USING (user_id = auth.uid())
```

## 🔧 커스터마이징

### 새로운 테이블 추가 시

새 테이블을 생성할 때는 반드시 RLS를 활성화하세요:

```sql
-- 1. 테이블 생성
CREATE TABLE public.new_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id),
  user_id uuid REFERENCES public.profiles(id),
  -- 기타 컬럼들
);

-- 2. RLS 활성화
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. 정책 생성
CREATE POLICY "Team members only" ON public.new_table
  FOR ALL USING (
    CASE
      WHEN team_id IS NOT NULL THEN public.is_team_member(team_id)
      WHEN user_id IS NOT NULL THEN user_id = auth.uid()
      ELSE auth.role() = 'authenticated'
    END
  );
```

### 특별한 권한이 필요한 경우

```sql
-- 예: 관리자만 접근 가능한 테이블
CREATE POLICY "Admins only" ON public.admin_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'team_admin'
    )
  );
```

## 🧪 테스트 방법

### 1. 기본 접근 테스트

```sql
-- 현재 사용자 확인
SELECT auth.uid(), auth.role();

-- 접근 가능한 팀 확인
SELECT * FROM public.teams;

-- 접근 가능한 클라이언트 확인
SELECT * FROM public.clients;
```

### 2. 권한 테스트

다른 사용자로 로그인하여 다음을 확인:

- 다른 팀의 데이터에 접근할 수 없는지
- 자신의 데이터만 수정할 수 있는지
- 권한 없는 작업이 차단되는지

## 🚨 문제 해결

### 일반적인 오류

#### 1. "permission denied for table" 오류

```sql
-- 해결: 해당 테이블에 RLS 정책이 없거나 잘못 설정됨
-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

#### 2. "new row violates row-level security policy" 오류

```sql
-- 해결: INSERT 정책이 없거나 WITH CHECK 조건 확인
CREATE POLICY "Users can insert own data" ON public.your_table
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

#### 3. 함수 권한 오류

```sql
-- 해결: 함수에 SECURITY DEFINER 추가
CREATE OR REPLACE FUNCTION public.your_function()
RETURNS boolean AS $$
-- 함수 내용
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 디버깅 방법

```sql
-- 1. 현재 사용자 정보 확인
SELECT
  auth.uid() as user_id,
  auth.role() as user_role,
  p.team_id,
  p.role as profile_role
FROM public.profiles p
WHERE p.id = auth.uid();

-- 2. 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'your_table_name';

-- 3. RLS 상태 확인
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 📚 추가 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [보안 모범 사례](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

## ✅ 체크리스트

RLS 설정 완료 후 다음을 확인하세요:

- [ ] 모든 테이블에 RLS가 활성화됨
- [ ] Supabase 콘솔의 보안 경고가 사라짐
- [ ] 팀 기반 접근 제어가 작동함
- [ ] 개인 데이터 보호가 작동함
- [ ] 관리자 권한이 올바르게 설정됨
- [ ] 시드 데이터가 정상적으로 작동함
- [ ] 애플리케이션 기능이 정상 작동함

## 🎯 결론

RLS 설정은 **보안의 핵심**입니다. 이 가이드를 따라 설정하면:

1. **데이터 보안** 강화
2. **팀 기반 접근 제어** 구현
3. **규정 준수** 달성
4. **프로덕션 배포** 준비 완료

**중요**: 새로운 테이블을 추가할 때마다 반드시 RLS 정책을 함께 설정하세요!
