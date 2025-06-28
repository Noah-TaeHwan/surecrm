import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.DATABASE_DIRECT_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create postgres client
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
});

async function fixFinalTable() {
  try {
    console.log('🔧 마지막 테이블의 RLS를 활성화합니다...');

    // Enable RLS on the remaining table
    await sql.unsafe(
      'ALTER TABLE public.admin_system_audit_logs ENABLE ROW LEVEL SECURITY;'
    );
    console.log('✅ admin_system_audit_logs 테이블에 RLS 활성화됨');

    // Add policy for the table if needed
    try {
      await sql.unsafe(`
        CREATE POLICY "System admins can manage audit logs" ON public.admin_system_audit_logs
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.app_user_profiles 
            WHERE id = auth.uid() AND role = 'system_admin'
          )
        );
      `);
      console.log('✅ admin_system_audit_logs 테이블에 정책 추가됨');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  정책이 이미 존재합니다.');
      } else {
        console.log('⚠️  정책 추가 중 문제:', error.message);
      }
    }

    console.log('🎉 모든 RLS 이슈가 해결되었습니다!');
  } catch (error) {
    console.error('❌ 마지막 테이블 처리 중 오류:', error);
  } finally {
    await sql.end();
  }
}

fixFinalTable();
