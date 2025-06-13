import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as readline from 'readline';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🚨 SureCRM 데이터베이스 리셋 도구');
console.log('⚠️  이 스크립트는 모든 데이터를 삭제합니다!\n');

console.log('📋 환경 변수 확인:');
console.log(
  `   SUPABASE_URL: ${supabaseUrl ? '✅ 설정됨' : '❌ 설정되지 않음'}`
);
console.log(
  `   SUPABASE_SERVICE_ROLE_KEY: ${
    supabaseServiceKey ? '✅ 설정됨' : '❌ 설정되지 않음'
  }\n`
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 필수 환경 변수가 설정되지 않았습니다.');
  console.error('   SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

// 프로덕션 환경 체크
if (supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
  console.error('🚫 프로덕션 환경에서는 이 스크립트를 실행할 수 없습니다!');
  console.error('   로컬 개발 환경에서만 사용하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

async function confirmReset(): Promise<boolean> {
  console.log('🔍 현재 데이터베이스 상태를 확인합니다...\n');

  try {
    // 현재 데이터 확인
    const tables = ['profiles', 'teams', 'clients', 'meetings', 'invitations'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      counts[table] = error ? 0 : count || 0;
    }

    console.log('📊 현재 데이터 현황:');
    let totalRecords = 0;
    for (const [table, count] of Object.entries(counts)) {
      console.log(`   ${table}: ${count}개`);
      totalRecords += count;
    }
    console.log(`   총 레코드: ${totalRecords}개\n`);

    if (totalRecords === 0) {
      console.log('✅ 데이터베이스가 이미 비어있습니다.');
      const proceed = await askQuestion(
        '그래도 초기 데이터를 생성하시겠습니까? (y/N): '
      );
      return proceed.toLowerCase() === 'y' || proceed.toLowerCase() === 'yes';
    }

    console.log('⚠️  위의 모든 데이터가 삭제됩니다!');
    console.log('🔄 삭제 후 기본 팀과 테스트 초대 코드가 생성됩니다.\n');

    const confirm1 = await askQuestion(
      '정말로 모든 데이터를 삭제하시겠습니까? (y/N): '
    );
    if (confirm1.toLowerCase() !== 'y' && confirm1.toLowerCase() !== 'yes') {
      return false;
    }

    const confirm2 = await askQuestion(
      '마지막 확인: "DELETE ALL DATA"를 정확히 입력하세요: '
    );
    if (confirm2 !== 'DELETE ALL DATA') {
      console.log('❌ 확인 문구가 일치하지 않습니다. 작업을 취소합니다.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error);
    return false;
  }
}

async function resetDatabase() {
  console.log('\n🗑️  데이터베이스 리셋 시작...');

  try {
    // 1. 모든 테이블 데이터 삭제 (외래키 순서 고려)
    console.log('🧹 기존 데이터 삭제 중...');

    const deleteOperations = [
      'clients',
      'meetings',
      'referrals',
      'invitations',
      'profiles',
      'teams',
    ];

    for (const table of deleteOperations) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`   ⚠️  ${table} 삭제 중 오류 (무시됨):`, error.message);
      } else {
        console.log(`   ✅ ${table} 데이터 삭제 완료`);
      }
    }

    // 2. 기본 팀 생성
    console.log('\n🏢 기본 팀 생성 중...');
    const defaultTeamId = uuidv4();
    const systemAdminId = uuidv4();

    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        id: defaultTeamId,
        name: 'SureCRM 기본팀',
        description: '개발 및 테스트용 기본 팀',
        admin_id: systemAdminId,
        is_active: true,
      })
      .select()
      .single();

    if (teamError) {
      console.error('❌ 팀 생성 실패:', teamError);
      return;
    }

    console.log(
      `   ✅ 기본 팀 생성: ${teamData.name} (ID: ${teamData.id.slice(0, 8)}...)`
    );

    // 3. 테스트용 초대 코드 생성
    console.log('\n🎫 테스트용 초대 코드 생성 중...');

    const inviteCodes = [
      { code: 'SURECRM-DEV', description: '개발용 메인 코드' },
      { code: 'WELCOME-2024', description: '환영 코드' },
      { code: 'BETA-TEST', description: '베타 테스트 코드' },
      { code: 'DEMO-USER', description: '데모 사용자 코드' },
    ];

    const createdCodes: string[] = [];

    for (const inviteCode of inviteCodes) {
      const { data: inviteData, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          code: inviteCode.code,
          inviter_id: systemAdminId,
          message: `SureCRM ${inviteCode.description}에 초대합니다!`,
          status: 'pending',
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1년 후
        })
        .select()
        .single();

      if (inviteError) {
        console.log(
          `   ⚠️  "${inviteCode.code}" 생성 실패:`,
          inviteError.message
        );
      } else {
        console.log(
          `   ✅ "${inviteCode.code}" 생성 성공 (${inviteCode.description})`
        );
        createdCodes.push(inviteCode.code);
      }
    }

    // 4. 완료 메시지
    console.log('\n🎉 데이터베이스 리셋 완료!');
    console.log('\n📋 생성된 리소스:');
    console.log(`   🏢 팀: ${teamData.name}`);
    console.log(`   🎫 초대 코드: ${createdCodes.length}개`);

    if (createdCodes.length > 0) {
      console.log('\n🔑 사용 가능한 초대 코드:');
      createdCodes.forEach((code, index) => {
        console.log(`   ${index + 1}. ${code}`);
      });

      console.log('\n💡 테스트 방법:');
      console.log('   1. npm run dev (개발 서버 시작)');
      console.log('   2. http://localhost:5173/invite-only 접속');
      console.log(`   3. 초대 코드 입력: ${createdCodes[0]}`);
      console.log('   4. 새 이메일로 회원가입');
      console.log('   5. 이메일 인증 후 로그인 테스트');
    }

    console.log('\n✨ 이제 깨끗한 환경에서 개발을 시작할 수 있습니다!');
  } catch (error) {
    console.error('\n❌ 데이터베이스 리셋 중 오류:', error);
  }
}

async function main() {
  try {
    const shouldProceed = await confirmReset();

    if (!shouldProceed) {
      console.log('\n✅ 작업이 취소되었습니다.');
      rl.close();
      return;
    }

    await resetDatabase();
  } catch (error) {
    console.error('\n❌ 스크립트 실행 중 오류:', error);
  } finally {
    rl.close();
  }
}

main()
  .then(() => {
    console.log('\n🏁 스크립트 실행 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 치명적 오류:', error);
    rl.close();
    process.exit(1);
  });
