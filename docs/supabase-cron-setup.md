# 🕒 Supabase pg_cron 설정 가이드

## 1. **pg_cron 확장 활성화**

1. Supabase 대시보드 → **Database** → **Extensions** (또는 **Integrations**)
2. **pg_cron** 찾기 → **Enable** 클릭
3. 스키마 선택: **pg_catalog** (필수)
4. **Enable extension** 버튼 클릭

## 2. **CRON 작업 등록**

### **방법 1: SQL Editor에서 직접 등록**

```sql
-- 1. 매일 오전 9시에 알림 API 호출
SELECT cron.schedule(
  'daily-notifications',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-domain.com/api/notifications/scheduler',
    headers := '{"Authorization": "Bearer your-cron-secret", "Content-Type": "application/json"}',
    body := '{}'
  );
  $$
);

-- 2. 매시간 만료된 세션 정리
SELECT cron.schedule(
  'cleanup-sessions',
  '0 * * * *',
  'DELETE FROM auth.sessions WHERE expires_at < NOW();'
);

-- 3. 매일 자정에 일일 통계 갱신
SELECT cron.schedule(
  'daily-stats',
  '0 0 * * *',
  'REFRESH MATERIALIZED VIEW daily_statistics;'
);
```

### **방법 2: Supabase Edge Functions 호출**

```sql
-- Edge Function 호출 (권장)
SELECT cron.schedule(
  'daily-notifications-edge',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/daily-notifications',
    headers := '{"Authorization": "Bearer your-anon-key"}',
    body := '{}'
  );
  $$
);
```

## 3. **CRON 작업 관리**

### **등록된 작업 확인**

```sql
SELECT * FROM cron.job;
```

### **작업 실행 로그 확인**

```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### **작업 삭제**

```sql
SELECT cron.unschedule('daily-notifications');
```

### **작업 수정**

```sql
-- 기존 작업 삭제 후 새로 등록
SELECT cron.unschedule('daily-notifications');
SELECT cron.schedule('daily-notifications', '0 8 * * *', 'SELECT your_function();');
```

## 4. **SureCRM 서비스에 최적화된 설정**

### **권장 CRON 작업들**

```sql
-- 1. 매일 오전 9시: 일일 알림 시스템 실행
SELECT cron.schedule(
  'surecrm-daily-notifications',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://surecrm.pro/api/notifications/scheduler',
    headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '", "Content-Type": "application/json"}',
    body := '{}'
  );
  $$
);

-- 2. 매시간: 임시 데이터 정리
SELECT cron.schedule(
  'surecrm-cleanup',
  '0 * * * *',
  $$
  DELETE FROM temp_notifications WHERE created_at < NOW() - INTERVAL '24 hours';
  DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '7 days';
  $$
);

-- 3. 매일 자정: 일일 통계 갱신
SELECT cron.schedule(
  'surecrm-daily-stats',
  '0 0 * * *',
  $$
  INSERT INTO daily_stats (date, total_clients, new_contracts, commission_total)
  SELECT
    CURRENT_DATE - INTERVAL '1 day',
    COUNT(DISTINCT c.id),
    COUNT(DISTINCT CASE WHEN c.status = 'contracted' THEN c.id END),
    SUM(c.commission_amount)
  FROM clients c
  WHERE DATE(c.updated_at) = CURRENT_DATE - INTERVAL '1 day';
  $$
);

-- 4. 매주 월요일 오전 8시: 주간 리포트 생성
SELECT cron.schedule(
  'surecrm-weekly-report',
  '0 8 * * 1',
  'SELECT generate_weekly_report();'
);
```

## 5. **환경변수 설정**

Supabase에서 보안을 위해 환경변수 사용:

```sql
-- 환경변수 설정 (한 번만 실행)
ALTER DATABASE postgres SET app.cron_secret = 'your-cron-secret-key';

-- 사용 예시
SELECT current_setting('app.cron_secret');
```

## 6. **모니터링 & 디버깅**

### **실행 상태 확인**

```sql
SELECT
  j.jobname,
  j.schedule,
  j.active,
  r.start_time,
  r.end_time,
  r.return_message,
  r.status
FROM cron.job j
LEFT JOIN cron.job_run_details r ON j.jobid = r.jobid
ORDER BY r.start_time DESC;
```

### **실패한 작업 확인**

```sql
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

## 7. **장점 & 주의사항**

### **✅ 장점**

- 서버리스 환경에서도 안정적 실행
- Supabase 내장 기능으로 별도 인프라 불필요
- 데이터베이스와 직접 연동으로 성능 우수

### **⚠️ 주의사항**

- HTTP 요청 시 타임아웃 설정 (기본 30초)
- 에러 핸들링 필수
- 보안을 위해 환경변수 사용 권장

## 8. **체크포인트 완료 확인**

1. ✅ **pg_cron 확장 활성화**: Extensions에서 확인
2. ✅ **CRON 작업 등록**: `SELECT * FROM cron.job;`로 확인
3. ✅ **핸들러 함수**: 기존 Node.js 스크립트 + API 엔드포인트
4. ✅ **모니터링**: `cron.job_run_details` 테이블로 확인

이제 **"Enable extension"** 버튼만 클릭하시면 체크포인트 완료입니다! 🎉
