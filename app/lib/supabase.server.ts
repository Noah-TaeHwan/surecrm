import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxMzIsImV4cCI6MjA2Mzc3MzEzMn0.hODGYkSnJUaYGQazm1wPg4AU0oIadnSbJeiNPM-Pkkk';

  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}
