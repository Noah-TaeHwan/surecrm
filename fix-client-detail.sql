-- 1. NULL 값이 있는 회의 데이터 삭제
DELETE FROM app_client_meetings WHERE client_id IS NULL;

-- 2. 고객 데이터 조회 테스트
SELECT 
  id, 
  full_name, 
  agent_id, 
  current_stage_id,
  created_at
FROM app_client_profiles 
WHERE is_active = true 
LIMIT 5;

-- 3. 파이프라인 스테이지 확인
SELECT 
  id, 
  name, 
  agent_id
FROM app_pipeline_stages 
LIMIT 5;
