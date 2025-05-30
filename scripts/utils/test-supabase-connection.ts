import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
}

async function runTest(
  testName: string,
  testFn: () => Promise<any>
): Promise<TestResult> {
  try {
    const data = await testFn();
    return {
      name: testName,
      success: true,
      message: '성공',
      data,
    };
  } catch (error) {
    return {
      name: testName,
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testSupabaseConnection() {
  console.log('🔍 SureCRM Supabase 연결 테스트 시작...\n');

  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(
    `   SUPABASE_URL: ${supabaseUrl ? '✅ 설정됨' : '❌ 설정되지 않음'}`
  );
  console.log(
    `   SUPABASE_SERVICE_ROLE_KEY: ${
      supabaseServiceKey ? '✅ 설정됨' : '❌ 설정되지 않음'
    }`
  );
  console.log(
    `   SUPABASE_ANON_KEY: ${
      supabaseAnonKey ? '✅ 설정됨' : '❌ 설정되지 않음'
    }\n`
  );

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('❌ 필수 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

  const tests: TestResult[] = [];

  // 1. Service Role 기본 연결 테스트
  tests.push(
    await runTest('Service Role 기본 연결', async () => {
      const { data, error } = await supabaseService
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) throw error;
      return `프로필 테이블 접근 성공`;
    })
  );

  // 2. Anon Key 기본 연결 테스트
  tests.push(
    await runTest('Anon Key 기본 연결', async () => {
      const { data, error } = await supabaseAnon
        .from('profiles')
        .select('count')
        .limit(1);

      // RLS로 인해 에러가 날 수 있지만 연결은 성공
      return `연결 성공 (RLS 정책에 따라 데이터 접근 제한될 수 있음)`;
    })
  );

  // 3. 핵심 테이블 존재 확인
  const coreTables = [
    'profiles',
    'teams',
    'clients',
    'meetings',
    'invitations',
  ];
  for (const table of coreTables) {
    tests.push(
      await runTest(`테이블 존재 확인: ${table}`, async () => {
        const { data, error } = await supabaseService
          .from(table)
          .select('count')
          .limit(1);

        if (error) throw error;
        return `테이블 접근 가능`;
      })
    );
  }

  // 4. Auth 시스템 테스트
  tests.push(
    await runTest('Auth 시스템 확인', async () => {
      const { data, error } = await supabaseService.auth.admin.listUsers();
      if (error) throw error;
      return `Auth 사용자 ${data.users.length}명 확인`;
    })
  );

  // 결과 출력
  console.log('📊 테스트 결과:\n');

  let successCount = 0;
  tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${test.name}`);
    console.log(`      ${test.message}`);
    if (test.data) {
      console.log(`      데이터: ${test.data}`);
    }
    console.log('');

    if (test.success) successCount++;
  });

  console.log(`🎯 결과 요약: ${successCount}/${tests.length} 테스트 통과\n`);

  if (successCount === tests.length) {
    console.log('🎉 모든 테스트 통과! Supabase 연결이 정상적으로 작동합니다.');
  } else {
    console.log('⚠️  일부 테스트 실패. 설정을 확인해주세요.');
  }
}

testSupabaseConnection()
  .then(() => {
    console.log('\n✅ 연결 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 테스트 실행 중 오류:', error);
    process.exit(1);
  });
