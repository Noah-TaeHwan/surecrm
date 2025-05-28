import { createClient } from '@supabase/supabase-js';

// 클라이언트 사이드에서 사용할 Supabase 클라이언트
// 환경변수는 VITE_ 접두사가 필요합니다
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mzmlolwducobuknsigvz.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxMzIsImV4cCI6MjA2Mzc3MzEzMn0.hODGYkSnJUaYGQazm1wPg4AU0oIadnSbJeiNPM-Pkkk';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
