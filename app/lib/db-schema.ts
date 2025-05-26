// 통합 데이터베이스 스키마
// Drizzle 설정에서 사용할 중앙 스키마 파일

// 공통 스키마만 export (중복 방지)
export * from './supabase-schema';

// 각 features의 특화 테이블들을 import하여 통합 스키마 객체 생성
import {
  // 공통 테이블들
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,
} from './supabase-schema';

// Features별 특화 테이블들은 필요시 개별 import
// import { meetingTemplates } from '~/features/calendar/schema';
// import { clientTags } from '~/features/clients/schema';

// 기본 스키마 객체 (Drizzle 설정용)
export const schema = {
  // 공통 테이블들
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,

  // Features별 특화 테이블들은 필요시 추가
  // meetingTemplates,
  // clientTags,
};

// 타입 정의
export type Schema = typeof schema;

// Features별 스키마는 각각 개별적으로 import하여 사용
// import * as calendarSchema from '~/features/calendar/schema';
// import * as clientsSchema from '~/features/clients/schema';
