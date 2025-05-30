// 통합 데이터베이스 스키마
// Drizzle 설정에서 사용할 중앙 스키마 파일

// 새로운 통합 스키마 구조 사용
export * from './schema';

// 기본 스키마 객체는 schema/index.ts에서 export됨
export { schema } from './schema';

// 타입 정의
export type { Schema } from './schema';
