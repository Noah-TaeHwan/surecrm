/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Google Analytics
  readonly VITE_GA_MEASUREMENT_ID?: string;

  // 기타 환경변수들
  readonly VITE_SITE_URL?: string;
  readonly VITE_NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
