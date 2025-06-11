# 🕒 SureCRM 추천 CRON 작업 목록

## 🎯 **비즈니스 핵심 CRON (우선순위 높음)**

### **1. 📈 일일 KPI 집계 (매일 자정)**

```sql
SELECT cron.schedule(
  'surecrm-daily-kpi-aggregation',
  '0 0 * * *',
  $$
  -- 전날 데이터 집계
  INSERT INTO daily_kpi_snapshots (
    user_id, date, total_clients, active_clients,
    new_contracts, commission_earned, meetings_held,
    referrals_received, pipeline_conversion_rate
  )
  SELECT
    c.agent_id,
    CURRENT_DATE - INTERVAL '1 day',
    COUNT(DISTINCT c.id),
    COUNT(DISTINCT CASE WHEN c.is_active = true THEN c.id END),
    COUNT(DISTINCT CASE WHEN ic.status = 'active' AND DATE(ic.created_at) = CURRENT_DATE - INTERVAL '1 day' THEN ic.id END),
    COALESCE(SUM(CASE WHEN DATE(ic.created_at) = CURRENT_DATE - INTERVAL '1 day' THEN ic.commission_amount END), 0),
    COUNT(DISTINCT CASE WHEN m.status = 'completed' AND DATE(m.scheduled_at) = CURRENT_DATE - INTERVAL '1 day' THEN m.id END),
    COUNT(DISTINCT CASE WHEN c.referred_by_id IS NOT NULL AND DATE(c.created_at) = CURRENT_DATE - INTERVAL '1 day' THEN c.id END),
    ROUND(
      CASE
        WHEN COUNT(DISTINCT c.id) > 0
        THEN (COUNT(DISTINCT CASE WHEN ic.status = 'active' THEN ic.id END)::FLOAT / COUNT(DISTINCT c.id)) * 100
        ELSE 0
      END, 2
    )
  FROM clients c
  LEFT JOIN insurance_contracts ic ON c.id = ic.client_id
  LEFT JOIN meetings m ON c.id = m.client_id
  WHERE c.agent_id IS NOT NULL
  GROUP BY c.agent_id;
  $$
);
```

### **2. 🔄 파이프라인 자동 이동 (매일 오전 6시)**

```sql
SELECT cron.schedule(
  'surecrm-pipeline-auto-progression',
  '0 6 * * *',
  $$
  -- 계약 체결된 고객을 완료 단계로 자동 이동
  UPDATE clients
  SET current_stage_id = (
    SELECT id FROM pipeline_stages
    WHERE name = '계약완료' AND agent_id = clients.agent_id
    LIMIT 1
  ),
  updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT c.id
    FROM clients c
    JOIN insurance_contracts ic ON c.id = ic.client_id
    WHERE ic.status = 'active'
    AND c.current_stage_id != (
      SELECT id FROM pipeline_stages
      WHERE name = '계약완료' AND agent_id = c.agent_id
      LIMIT 1
    )
  );

  -- 30일 이상 비활성 고객을 휴면 단계로 이동
  UPDATE clients
  SET current_stage_id = (
    SELECT id FROM pipeline_stages
    WHERE name = '휴면' AND agent_id = clients.agent_id
    LIMIT 1
  ),
  updated_at = NOW()
  WHERE updated_at < NOW() - INTERVAL '30 days'
  AND is_active = true;
  $$
);
```

### **3. 💰 월별 수수료 정산 (매월 1일 오전 8시)**

```sql
SELECT cron.schedule(
  'surecrm-monthly-commission-settlement',
  '0 8 1 * *',
  $$
  -- 전월 수수료 정산 데이터 생성
  INSERT INTO monthly_commission_reports (
    agent_id, year, month, total_contracts,
    total_commission, average_commission_per_contract,
    top_product_category, referral_bonus
  )
  SELECT
    c.agent_id,
    EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month')),
    EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month')),
    COUNT(DISTINCT ic.id),
    SUM(ic.commission_amount),
    ROUND(AVG(ic.commission_amount), 0),
    MODE() WITHIN GROUP (ORDER BY ic.product_category),
    SUM(CASE WHEN c.referred_by_id IS NOT NULL THEN ic.commission_amount * 0.05 ELSE 0 END)
  FROM clients c
  JOIN insurance_contracts ic ON c.id = ic.client_id
  WHERE ic.status = 'active'
  AND EXTRACT(YEAR FROM ic.created_at) = EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))
  AND EXTRACT(MONTH FROM ic.created_at) = EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))
  GROUP BY c.agent_id;
  $$
);
```

## 🛠️ **데이터 관리 CRON (중간 우선순위)**

### **4. 🧹 임시 데이터 정리 (매시간)**

```sql
SELECT cron.schedule(
  'surecrm-hourly-cleanup',
  '0 * * * *',
  $$
  -- 만료된 세션 로그 정리
  DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '7 days';

  -- 임시 알림 데이터 정리
  DELETE FROM temp_notifications WHERE created_at < NOW() - INTERVAL '24 hours';

  -- 만료된 초대 링크 정리
  UPDATE invitations SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';

  -- 오래된 미팅 녹음 파일 정리 (30일 이상)
  UPDATE meetings SET recording_url = NULL
  WHERE scheduled_at < NOW() - INTERVAL '30 days' AND recording_url IS NOT NULL;
  $$
);
```

### **5. 📊 주간 성과 리포트 (매주 월요일 오전 8시)**

```sql
SELECT cron.schedule(
  'surecrm-weekly-performance-report',
  '0 8 * * 1',
  $$
  -- 주간 성과 요약 생성
  INSERT INTO weekly_performance_reports (
    agent_id, week_start_date, total_meetings,
    successful_meetings, new_clients, contracts_signed,
    week_over_week_growth, goal_achievement_rate
  )
  SELECT
    p.id as agent_id,
    (CURRENT_DATE - INTERVAL '1 week')::date,
    COUNT(DISTINCT m.id) FILTER (WHERE m.scheduled_at >= CURRENT_DATE - INTERVAL '1 week'),
    COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'completed' AND m.scheduled_at >= CURRENT_DATE - INTERVAL '1 week'),
    COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '1 week'),
    COUNT(DISTINCT ic.id) FILTER (WHERE ic.created_at >= CURRENT_DATE - INTERVAL '1 week'),
    0, -- TODO: 전주 대비 성장률 계산
    0  -- TODO: 목표 달성률 계산
  FROM profiles p
  LEFT JOIN meetings m ON p.id = m.agent_id
  LEFT JOIN clients c ON p.id = c.agent_id
  LEFT JOIN insurance_contracts ic ON c.id = ic.client_id
  WHERE p.role = 'agent'
  GROUP BY p.id;
  $$
);
```

## 🔔 **알림 & 모니터링 CRON (중간 우선순위)**

### **6. ⚠️ 시스템 헬스체크 (매 5분)**

```sql
SELECT cron.schedule(
  'surecrm-health-check',
  '*/5 * * * *',
  $$
  -- 시스템 상태 체크
  INSERT INTO system_health_logs (
    timestamp, active_users, database_connections,
    avg_response_time, error_rate
  )
  SELECT
    NOW(),
    (SELECT COUNT(*) FROM profiles WHERE last_login_at > NOW() - INTERVAL '30 minutes'),
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
    0, -- TODO: 응답시간 측정
    0  -- TODO: 에러율 측정
  ;
  $$
);
```

### **7. 📱 긴급 알림 체크 (매 15분)**

```sql
SELECT cron.schedule(
  'surecrm-urgent-notifications',
  '*/15 * * * *',
  $$
  -- 계약 만료 임박 알림 (7일 전)
  INSERT INTO notifications (user_id, type, priority, title, message, metadata)
  SELECT
    c.agent_id,
    'contract_expiry_warning',
    'high',
    '계약 만료 임박: ' || c.full_name,
    c.full_name || '님의 ' || ic.product_name || ' 계약이 7일 후 만료됩니다.',
    jsonb_build_object(
      'client_id', c.id,
      'contract_id', ic.id,
      'expiry_date', ic.end_date,
      'days_remaining', 7
    )
  FROM clients c
  JOIN insurance_contracts ic ON c.id = ic.client_id
  WHERE ic.end_date BETWEEN NOW() + INTERVAL '7 days' AND NOW() + INTERVAL '8 days'
  AND ic.status = 'active'
  AND c.is_active = true;
  $$
);
```

## 📈 **분석 & 최적화 CRON (낮은 우선순위)**

### **8. 🎯 고객 스코어링 업데이트 (매일 오전 2시)**

```sql
SELECT cron.schedule(
  'surecrm-customer-scoring',
  '0 2 * * *',
  $$
  -- 고객 중요도 스코어 재계산
  UPDATE clients SET
    importance_score = (
      -- 기본 점수: 계약 금액 기준
      COALESCE((SELECT SUM(ic.premium_amount) FROM insurance_contracts ic WHERE ic.client_id = clients.id), 0) * 0.3 +
      -- 추천 보너스: 추천한 고객 수 * 10점
      COALESCE((SELECT COUNT(*) FROM clients c2 WHERE c2.referred_by_id = clients.id), 0) * 10 +
      -- 활성도 점수: 최근 미팅 빈도
      COALESCE((SELECT COUNT(*) FROM meetings m WHERE m.client_id = clients.id AND m.scheduled_at > NOW() - INTERVAL '30 days'), 0) * 5 +
      -- 충성도 점수: 가입 기간 (월 단위)
      EXTRACT(EPOCH FROM (NOW() - clients.created_at)) / (30.44 * 24 * 60 * 60) * 2
    ),
    updated_at = NOW()
  WHERE is_active = true;
  $$
);
```

### **9. 🔄 캐시 갱신 (매일 오전 1시)**

```sql
SELECT cron.schedule(
  'surecrm-cache-refresh',
  '0 1 * * *',
  $$
  -- 대시보드 캐시 데이터 갱신
  REFRESH MATERIALIZED VIEW dashboard_summary_cache;
  REFRESH MATERIALIZED VIEW pipeline_analytics_cache;
  REFRESH MATERIALIZED VIEW referral_network_cache;

  -- 통계 테이블 갱신
  TRUNCATE TABLE temp_dashboard_stats;
  INSERT INTO temp_dashboard_stats
  SELECT * FROM calculate_dashboard_stats();
  $$
);
```

## 🎯 **추천 구현 순서**

### **Phase 1 (즉시 구현 권장)**

1. ✅ 일일 알림 시스템 (이미 완료)
2. 📈 일일 KPI 집계
3. 🧹 임시 데이터 정리

### **Phase 2 (1-2주 내 구현)**

4. 🔄 파이프라인 자동 이동
5. ⚠️ 긴급 알림 체크
6. 📊 주간 성과 리포트

### **Phase 3 (한 달 내 구현)**

7. 💰 월별 수수료 정산
8. 🎯 고객 스코어링 업데이트
9. 🔄 캐시 갱신

### **Phase 4 (추후 고도화)**

10. ⚠️ 시스템 헬스체크

## 💡 **구현 팁**

- **테스트 환경**에서 먼저 실행해보세요
- **로그 테이블**을 만들어 실행 결과를 추적하세요
- **에러 알림**을 설정하여 실패 시 즉시 대응하세요
- **성능 모니터링**으로 DB 부하를 확인하세요
