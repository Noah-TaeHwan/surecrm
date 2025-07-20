# N+1 쿼리 최적화 가이드

## 현재 상황

`app/api/shared/clients.ts`의 `getClients` 함수에서 심각한 N+1 쿼리 문제 발견:
- 20개 클라이언트 조회 시 81개의 쿼리 실행
- 각 클라이언트마다 4개의 추가 쿼리 실행

## 최적화 전략

### 1단계: 테스트 환경에서 검증 (권장)

```typescript
// app/api/shared/clients.ts에 새 함수 추가
export async function getClientsOptimized(params: GetClientsParams) {
  // 최적화된 코드 (clients-optimized.ts 참조)
}
```

### 2단계: A/B 테스트

```typescript
// 라우트에서 사용
const clients = process.env.USE_OPTIMIZED_QUERY === 'true' 
  ? await getClientsOptimized(params)
  : await getClients(params);
```

### 3단계: 점진적 마이그레이션

1. 개발 환경에서 테스트
2. 스테이징 환경에서 성능 측정
3. 프로덕션에 Feature Flag로 배포
4. 모니터링 후 기존 코드 제거

## 최적화 코드

`clients-optimized.ts` 파일을 참조하세요. 주요 개선사항:

1. **단일 쿼리로 모든 데이터 조회**
   - LEFT JOIN으로 관련 테이블 연결
   - SQL 집계 함수 사용 (COUNT, SUM, array_agg)
   - 서브쿼리로 최신 분석 데이터 조회

2. **성능 개선**
   - 쿼리 수: 81개 → 2개 (데이터 + 총 개수)
   - 예상 성능 향상: 300-400%

## 주의사항

1. **데이터베이스 부하**
   - 단일 복잡한 쿼리가 여러 단순 쿼리보다 DB에 부하를 줄 수 있음
   - EXPLAIN ANALYZE로 쿼리 계획 확인 필요

2. **결과 검증**
   - 기존 함수와 새 함수의 결과가 동일한지 확인
   - 집계 데이터의 정확성 검증

3. **인덱스 확인**
   - clients.referred_by_id
   - insurance_info.client_id
   - app_client_contact_history.client_id
   - app_client_analytics.client_id

## 배포 체크리스트

- [ ] 로컬 환경 테스트
- [ ] 단위 테스트 작성
- [ ] 성능 벤치마크
- [ ] 스테이징 환경 검증
- [ ] 모니터링 설정
- [ ] 롤백 계획 수립