import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// .env 파일 로드 (Node.js 환경에서만)
if (typeof window === 'undefined') {
  dotenv.config();
}

// 환경변수에서 데이터베이스 URL 가져오기 (안전한 처리)
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('🚨 DATABASE_URL 환경변수가 설정되지 않았습니다.');

  // 사용 가능한 환경변수들 로깅 (디버깅용)
  console.error('📋 사용 가능한 DB 관련 환경변수:');
  console.error(
    '- DATABASE_URL:',
    process.env.DATABASE_URL ? '설정됨' : '누락'
  );
  console.error(
    '- DATABASE_DIRECT_URL:',
    process.env.DATABASE_DIRECT_URL ? '설정됨' : '누락'
  );
  console.error(
    '- DATABASE_SESSION_URL:',
    process.env.DATABASE_SESSION_URL ? '설정됨' : '누락'
  );

  // Vercel 배포 환경에서 환경변수 누락 시 더 구체적인 에러 메시지
  if (process.env.VERCEL) {
    console.error('📦 Vercel 환경에서 DATABASE_URL이 누락되었습니다.');
    console.error('🔧 해결 방법:');
    console.error(
      '1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables'
    );
    console.error('2. DATABASE_URL 환경변수 추가');
    console.error('3. 다시 배포');
  }

  // 대체 URL 시도
  const fallbackUrl =
    process.env.DATABASE_DIRECT_URL || process.env.DATABASE_SESSION_URL;
  if (fallbackUrl) {
    console.warn(
      '⚠️ DATABASE_URL 대신 대체 URL 사용:',
      fallbackUrl.substring(0, 30) + '...'
    );
    connectionString = fallbackUrl;
  } else {
    throw new Error(
      'DATABASE_URL 환경변수가 설정되지 않았습니다. ' +
        (process.env.VERCEL
          ? 'Vercel 대시보드에서 환경변수를 설정하세요.'
          : '.env 파일을 확인하세요.')
    );
  }
}

// PostgreSQL 클라이언트 생성
const client = postgres(connectionString);

// Drizzle 인스턴스 생성
export const db = drizzle(client);

// 타입 추론을 위한 데이터베이스 타입
export type Database = typeof db;
