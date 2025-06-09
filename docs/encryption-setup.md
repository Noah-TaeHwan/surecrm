# 🔒 주민등록번호 암호화 설정 가이드

## 개요

이 문서는 SureCRM에서 주민등록번호를 안전하게 암호화하여 저장하고 관리하는 방법을 설명합니다.

## 보안 정책

### 📋 기본 원칙

- **절대 평문 저장 금지**: 주민등록번호는 절대 평문으로 저장하지 않습니다
- **AES-256-GCM 암호화**: 군용 수준의 암호화 알고리즘 사용
- **접근 로그 기록**: 모든 민감정보 접근을 로그로 기록
- **권한 기반 접근**: 필요한 권한이 있는 사용자만 복호화 가능

### 🛡️ 암호화 방식

- **알고리즘**: AES-256-GCM (Galois/Counter Mode)
- **키 길이**: 256비트 (32바이트)
- **인증 태그**: 포함하여 무결성 보장
- **초기화 벡터(IV)**: 매번 랜덤 생성

## 환경변수 설정

### 1. `.env` 파일에 다음 변수 추가

```bash
# 주민등록번호 암호화 키 (32자 이상 강력한 패스워드)
ENCRYPTION_KEY="your-super-strong-encryption-key-here-32chars-min"

# 주민등록번호 해시 솔트 (검색용)
HASH_SALT="your-hash-salt-for-korean-id-search"
```

### 2. 프로덕션 환경 설정

**Vercel 배포 시:**

```bash
vercel env add ENCRYPTION_KEY
vercel env add HASH_SALT
```

**Docker 환경 시:**

```yaml
environment:
  - ENCRYPTION_KEY=your-encryption-key
  - HASH_SALT=your-hash-salt
```

### 3. 키 생성 방법

**강력한 암호화 키 생성:**

```bash
# Node.js에서 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL로 키 생성
openssl rand -hex 32
```

## 데이터베이스 마이그레이션

### 1. 마이그레이션 실행

```bash
# Supabase CLI로 마이그레이션 실행
supabase db push

# 또는 SQL 직접 실행
psql -h your-db-host -U postgres -d your-db < supabase/migrations/20241209_add_encrypted_ssn_fields.sql
```

### 2. 테이블 변경사항 확인

```sql
-- app_client_contracts 테이블에 추가된 필드 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'app_client_contracts'
AND column_name LIKE '%ssn%';
```

## 사용 방법

### 1. 프론트엔드에서 유효성 검사

```typescript
import { validateKoreanId, parseKoreanId } from '~/lib/utils/korean-id-utils';

// 주민등록번호 입력 시 실시간 검증
const handleSsnChange = (value: string) => {
  if (value && !validateKoreanId(value)) {
    const parseResult = parseKoreanId(value);
    setError(parseResult.errorMessage || '유효하지 않은 주민등록번호입니다');
  }
};
```

### 2. 서버에서 암호화 저장

```typescript
import { encryptKoreanId, validateKoreanId } from '~/lib/utils/korean-id-utils';

// 보험계약 등록 시
const contractorSsn = formData.get('contractorSsn') as string;
if (contractorSsn?.trim()) {
  // 유효성 검사
  if (!validateKoreanId(contractorSsn)) {
    return json({ success: false, error: '유효하지 않은 주민등록번호입니다.' });
  }

  // 암호화
  const encryptedSsn = await encryptKoreanId(contractorSsn);
  contractData.contractor_ssn_encrypted = encryptedSsn;
}
```

### 3. 복호화 및 표시 (권한 있는 사용자만)

```typescript
import { decryptKoreanId, maskKoreanId } from '~/lib/utils/korean-id-utils';

// 관리자나 권한있는 사용자만 복호화 가능
const displaySsn = async (encryptedSsn: string, userRole: string) => {
  if (userRole === 'admin' || userRole === 'agent') {
    // 접근 로그 기록
    await logSensitiveDataAccess(
      'app_client_contracts',
      contractId,
      'contractor_ssn',
      'decrypt'
    );

    // 복호화
    const decryptedSsn = await decryptKoreanId(encryptedSsn);
    return decryptedSsn || maskKoreanId(encryptedSsn);
  }

  // 권한 없는 사용자는 마스킹된 버전만
  return maskKoreanId(encryptedSsn);
};
```

## 민감정보 접근 로그

### 자동 로그 기록

모든 주민등록번호 접근(조회, 복호화, 내보내기)은 자동으로 로그에 기록됩니다:

```sql
-- 민감정보 접근 로그 확인
SELECT
  sal.created_at,
  p.full_name as user_name,
  sal.table_name,
  sal.field_name,
  sal.access_type,
  sal.ip_address
FROM sensitive_data_access_logs sal
JOIN app_user_profiles p ON sal.user_id = p.id
WHERE sal.field_name LIKE '%ssn%'
ORDER BY sal.created_at DESC;
```

### 수동 로그 기록

```typescript
// 민감정보 접근 시 수동 로그 기록
await supabase.rpc('log_sensitive_data_access', {
  p_table_name: 'app_client_contracts',
  p_record_id: contractId,
  p_field_name: 'contractor_ssn_encrypted',
  p_access_type: 'view',
});
```

## 보안 고려사항

### ⚠️ 주의사항

1. **암호화 키 관리**

   - 암호화 키는 절대 소스코드에 포함하지 마세요
   - 정기적으로 키 로테이션을 고려하세요
   - 백업 시 암호화 키도 안전하게 백업하세요

2. **접근 권한 관리**

   - 주민등록번호 복호화는 최소한의 권한만 부여
   - 정기적으로 접근 로그를 검토하세요
   - 의심스러운 접근 패턴을 모니터링하세요

3. **규정 준수**
   - 개인정보보호법 준수
   - 금융위원회 보험업감독규정 준수
   - 데이터 보존 기간 준수

### 🔍 모니터링 및 알림

```sql
-- 비정상적인 접근 패턴 탐지
SELECT
  user_id,
  COUNT(*) as access_count,
  ARRAY_AGG(DISTINCT ip_address) as ip_addresses
FROM sensitive_data_access_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
  AND access_type = 'decrypt'
GROUP BY user_id
HAVING COUNT(*) > 10; -- 1시간에 10회 이상 복호화 접근
```

## 문제 해결

### 1. 암호화 실패 시

```bash
# 환경변수 확인
echo $ENCRYPTION_KEY
echo $HASH_SALT

# Node.js에서 crypto 모듈 사용 가능 여부 확인
node -e "console.log(require('crypto').constants)"
```

### 2. 복호화 실패 시

- 암호화 키가 변경되었는지 확인
- 데이터베이스의 암호화된 데이터 형식이 올바른지 확인
- 서버 환경에서만 복호화 함수를 호출했는지 확인

### 3. 성능 최적화

- 대량의 데이터 처리 시 배치 복호화 고려
- 자주 접근하는 데이터는 메모리 캐싱 고려 (단, 보안 위험 고려)
- 인덱스는 암호화된 필드가 아닌 해시 필드에 생성

## 관련 파일

- `app/lib/utils/korean-id-utils.ts` - 암호화/복호화 유틸리티
- `supabase/migrations/20241209_add_encrypted_ssn_fields.sql` - 데이터베이스 스키마
- `app/lib/schema/core.ts` - Drizzle ORM 스키마 정의
- `app/features/clients/components/insurance-contracts-tab.tsx` - UI 컴포넌트
