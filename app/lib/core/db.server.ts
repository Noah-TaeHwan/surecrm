import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// .env 파일 로드 (Node.js 환경에서만)
if (typeof window === 'undefined') {
  dotenv.config();
}

// 환경변수에서 데이터베이스 URL 가져오기 (안전한 처리)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('🚨 DATABASE_URL 환경변수가 설정되지 않았습니다.');

  // Vercel 배포 환경에서 환경변수 누락 시 더 구체적인 에러 메시지
  if (process.env.VERCEL) {
    console.error(
      '📦 Vercel 환경에서 DATABASE_URL이 누락되었습니다. Vercel 대시보드에서 환경변수를 확인하세요.'
    );
  }

  throw new Error(
    'DATABASE_URL 환경변수가 설정되지 않았습니다. ' +
      (process.env.VERCEL
        ? 'Vercel 대시보드에서 환경변수를 설정하세요.'
        : '.env 파일을 확인하세요.')
  );
}

// PostgreSQL 클라이언트 생성
const client = postgres(connectionString);

// Drizzle 인스턴스 생성
export const db = drizzle(client);

// 타입 추론을 위한 데이터베이스 타입
export type Database = typeof db;
