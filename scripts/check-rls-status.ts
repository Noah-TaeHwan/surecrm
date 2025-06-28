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

async function checkRLSStatus() {
  try {
    console.log('🔍 RLS 상태를 확인합니다...\n');

    // Check RLS status for all public tables
    const rlsStatusQuery = `
      SELECT 
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        CASE 
          WHEN c.relrowsecurity THEN '✅ 활성화됨'
          ELSE '❌ 비활성화됨'
        END as status
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
        AND c.relkind = 'r'
        AND c.relname NOT LIKE 'pg_%'
        AND c.relname NOT LIKE '_prisma_%'
      ORDER BY c.relname;
    `;

    const rlsStatus = await sql.unsafe(rlsStatusQuery);

    console.log('📊 전체 테이블 RLS 상태:');
    console.table(rlsStatus);

    // Count enabled vs disabled
    const enabled = rlsStatus.filter(row => row.rls_enabled);
    const disabled = rlsStatus.filter(row => !row.rls_enabled);

    console.log(`\n📈 RLS 상태 요약:`);
    console.log(`✅ RLS 활성화된 테이블: ${enabled.length}개`);
    console.log(`❌ RLS 비활성화된 테이블: ${disabled.length}개`);
    console.log(`📊 전체 테이블: ${rlsStatus.length}개`);

    if (disabled.length > 0) {
      console.log('\n⚠️  RLS가 비활성화된 테이블들:');
      disabled.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Check policies for key tables
    const policyQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
        AND tablename IN ('app_user_profiles', 'app_client_profiles', 'app_client_details')
      ORDER BY tablename, policyname;
    `;

    console.log('\n🔐 주요 테이블의 RLS 정책:');
    const policies = await sql.unsafe(policyQuery);

    if (policies.length > 0) {
      console.table(policies);
    } else {
      console.log('❌ 주요 테이블에 정책이 없습니다.');
    }

    // Final assessment
    const rlsEnabledPercentage = Math.round(
      (enabled.length / rlsStatus.length) * 100
    );

    console.log(`\n🎯 RLS 활성화율: ${rlsEnabledPercentage}%`);

    if (rlsEnabledPercentage === 100) {
      console.log('🎉 모든 테이블에 RLS가 활성화되었습니다!');
    } else if (rlsEnabledPercentage >= 80) {
      console.log('✅ 대부분의 테이블에 RLS가 활성화되었습니다.');
    } else {
      console.log('⚠️  더 많은 테이블에 RLS 활성화가 필요합니다.');
    }
  } catch (error) {
    console.error('❌ RLS 상태 확인 중 오류 발생:', error);
  } finally {
    await sql.end();
  }
}

// Run the check
checkRLSStatus();
