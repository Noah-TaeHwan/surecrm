import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('환경 변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  supabaseServiceKey ? '설정됨' : '설정되지 않음'
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경 변수를 설정해주세요.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
  console.log('🗑️  데이터베이스 완전 초기화 시작...');
  console.log('✅ Service Role 키를 사용하여 모든 권한으로 실행합니다.');

  try {
    // 1. 기존 데이터 확인
    console.log('\n📋 현재 데이터 확인 중...');

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*');

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    console.log(`📊 현재 상태:`);
    console.log(`   - Teams: ${teams?.length || 0}개`);
    console.log(`   - Invitations: ${invitations?.length || 0}개`);
    console.log(`   - Profiles: ${profiles?.length || 0}개`);
    console.log(`   - Clients: ${clients?.length || 0}개`);

    // 2. 모든 테이블 데이터 삭제 (외래키 순서 고려)
    console.log('\n🧹 기존 데이터 삭제 중...');

    // 종속성이 있는 테이블부터 삭제
    await supabase
      .from('clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('invitations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase
      .from('teams')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ 기존 데이터 삭제 완료');

    // 3. 시스템 관리자 프로필 생성을 위한 더미 UUID
    const systemAdminId = '00000000-0000-0000-0000-000000000001';

    // 4. 기본 팀 생성
    console.log('\n🏢 기본 팀 생성 중...');
    const defaultTeamId = uuidv4();

    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        id: defaultTeamId,
        name: '기본 팀',
        description: '시스템 기본 팀 - 테스트용',
        admin_id: systemAdminId, // 임시 시스템 관리자 ID
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (teamError) {
      console.error('❌ 팀 생성 오류:', teamError);
      return;
    }

    console.log('✅ 기본 팀 생성 성공:', teamData);

    // 5. 여러 개의 테스트용 초대코드 생성
    console.log('\n🎫 테스트용 초대코드들 생성 중...');

    const inviteCodes = [
      {
        code: 'SURECRM-2024',
        description: '메인 테스트 코드',
      },
      {
        code: 'WELCOME-123',
        description: '환영 코드',
      },
      {
        code: 'BETA-TEST',
        description: '베타 테스트 코드',
      },
    ];

    for (const inviteCode of inviteCodes) {
      const { data: inviteData, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          id: uuidv4(),
          code: inviteCode.code,
          inviter_id: systemAdminId, // 시스템 관리자가 생성
          status: 'pending',
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1년 후 만료
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (inviteError) {
        console.error(
          `❌ 초대코드 "${inviteCode.code}" 생성 오류:`,
          inviteError
        );
      } else {
        console.log(
          `✅ 초대코드 "${inviteCode.code}" 생성 성공 (${inviteCode.description})`
        );
      }
    }

    console.log('\n🎉 데이터베이스 초기화 완료!');
    console.log('📋 생성된 리소스:');
    console.log(`   팀 ID: ${defaultTeamId}`);
    console.log(`   팀 이름: ${teamData.name}`);
    console.log('   사용 가능한 초대코드들:');
    inviteCodes.forEach((code) => {
      console.log(`     - ${code.code} (${code.description})`);
    });
    console.log('');
    console.log('💡 테스트 방법:');
    console.log(
      '1. 브라우저에서 http://localhost:5173/invite-only 페이지로 이동'
    );
    console.log('2. 위의 초대코드 중 아무거나 입력 (예: SURECRM-2024)');
    console.log('3. 회원가입 진행');
    console.log('4. 로그인 테스트');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error);
  }
}

resetDatabase().then(() => {
  console.log('\n🏁 스크립트 실행 완료');
  process.exit(0);
});
