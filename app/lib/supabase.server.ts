import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';

  // 클라이언트용 (Anon 키)
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxMzIsImV4cCI6MjA2Mzc3MzEzMn0.hODGYkSnJUaYGQazm1wPg4AU0oIadnSbJeiNPM-Pkkk';

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Admin 권한이 필요한 서버 측 작업용
export function createAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
