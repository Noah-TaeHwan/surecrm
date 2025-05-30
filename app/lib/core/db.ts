import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// .env 파일 로드 (Node.js 환경에서만)
if (typeof window === 'undefined') {
  dotenv.config();
}

// 환경변수에서 데이터베이스 URL 가져오기
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
}

// PostgreSQL 클라이언트 생성
const client = postgres(connectionString);

// Drizzle 인스턴스 생성
export const db = drizzle(client);

// 타입 추론을 위한 데이터베이스 타입
export type Database = typeof db;
