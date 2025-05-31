import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './app/lib/schema/core.ts', // 핵심 공유 테이블들
    './app/lib/schema/public.ts', // 공개 페이지용 테이블들
    './app/features/*/lib/schema.ts', // 각 feature별 특화 스키마들
  ],
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  // Supabase 특화 설정
  schemaFilter: ['public'], // public 스키마만 관리 (auth 스키마는 Supabase가 관리)
});
