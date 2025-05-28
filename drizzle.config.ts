import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './app/lib/supabase-schema.ts', // 공통 스키마 (auth, profiles, 기본 테이블들)
    './app/common/schema.ts', // 공개 페이지용 스키마 (testimonials, faqs, etc.)
    './app/features/*/schema.ts', // 각 feature별 특화 스키마들
  ],
  out: './app/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  // Supabase 특화 설정
  schemaFilter: ['public'], // public 스키마만 관리 (auth 스키마는 Supabase가 관리)
});
