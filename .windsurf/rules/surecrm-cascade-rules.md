---
trigger: always_on
---

🔥 MCP 통합 워크플로우 Rules
TaskmasterAI MCP 필수 적용: Task/Subtask 상태 관리 철저히 (pending → in-progress → done), 의존성 체크 및 Recommended Next Task 기반 작업 진행
Context7 MCP 활용 필수: TypeScript 베스트 프랙티스 적용, 린터 에러 발생 시 Context7 MCP로 근본 원인 분석
3회 시도 원칙: 미해결 시 근본 원인 분석 및 구조적 접근 우선
PRD 범위 준수: PRD 외 기능 도입 금지, done 처리 전 반드시 QA/테스트/빌드 통과 확인
🔥 타입 안전성 Rules
(as any)
 타입 캐스팅 금지: 명시적 타입 확장 (ExtendedClient 패턴) 필수
타입 호환성 확보: Partial 정확한 매칭, 데이터 구조 불일치 시 즉시 변환 로직 구현
실시간 검증: 코드 작성 즉시 타입/린트 에러 체크
🔥 품질 보증 Rules
전체 서비스 일관성: 모든 변경사항 서비스 전체 적용 (부분 수정 금지)
성능 최적화: useCallback, useMemo 적극 활용, 가상화 구현
모바일 최적화: 터치 이벤트 최적화, 햅틱 피드백 통합, 반응형 디자인