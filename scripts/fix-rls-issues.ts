import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.DATABASE_DIRECT_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_DIRECT_URL is not set');
}

// Create postgres client
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
});

async function fixRLSIssues() {
  try {
    console.log('🔧 RLS 이슈 해결을 시작합니다...');

    // Read the migration SQL file
    const migrationPath = join(
      process.cwd(),
      'supabase/migrations/20250103000000_fix_rls_issues.sql'
    );
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 ${statements.length}개의 SQL 구문을 실행합니다...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        console.log(`⚡ 구문 ${i + 1}/${statements.length} 실행 중...`);

        // Handle DO blocks differently
        if (statement.trim().startsWith('DO $$')) {
          const fullDoBlock = statement + ';';
          await sql.unsafe(fullDoBlock);
        } else {
          await sql.unsafe(statement + ';');
        }

        console.log(`✅ 구문 ${i + 1} 완료`);
      } catch (error: any) {
        // Log warning for expected errors (like policy already exists)
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.message.includes('does not exist')
        ) {
          console.log(`⚠️  구문 ${i + 1} 경고: ${error.message}`);
        } else {
          console.error(`❌ 구문 ${i + 1} 실행 실패:`, error.message);
          console.error(`SQL: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('🎉 RLS 이슈 해결이 완료되었습니다!');

    // Verify RLS is enabled on key tables
    console.log('\n🔍 주요 테이블의 RLS 상태를 확인합니다...');

    const checkRLSQuery = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled,
        hasrls
      FROM pg_tables 
      LEFT JOIN pg_class c ON c.relname = tablename
      WHERE schemaname = 'public' 
        AND tablename LIKE 'app_%' 
      ORDER BY tablename
      LIMIT 10;
    `;

    const rlsStatus = await sql.unsafe(checkRLSQuery);
    console.log('RLS 상태:');
    console.table(rlsStatus);
  } catch (error) {
    console.error('❌ RLS 이슈 해결 중 오류 발생:', error);
  } finally {
    await sql.end();
  }
}

// Run the fix
fixRLSIssues();
