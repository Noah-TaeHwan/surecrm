import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createInvitationForExistingUser() {
  console.log('🎫 기존 사용자용 초대 코드 생성...\n');

  try {
    // 1. 기존 사용자 확인
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (profilesError || !profiles || profiles.length === 0) {
      console.error('❌ 활성 사용자를 찾을 수 없습니다.');
      return false;
    }

    const inviter = profiles[0];
    console.log(
      `✅ 발급자: ${inviter.full_name} (${inviter.id.slice(0, 8)}...)`
    );

    // 2. 테스트용 초대 코드 생성
    const invitationCode = 'TEST-2025-001';

    // 기존 초대 코드 삭제
    await supabase.from('invitations').delete().eq('code', invitationCode);

    // 새 초대 코드 생성
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        code: invitationCode,
        inviter_id: inviter.id,
        status: 'pending',
        expires_at: '2025-12-31T23:59:59+00:00',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invitationError) {
      console.error('❌ 초대 코드 생성 실패:', invitationError);
      return false;
    }

    console.log('✅ 초대 코드 생성 완료:', invitationCode);

    // 3. 추가 초대 코들 생성
    const additionalCodes = ['WELCOME-2025', 'BETA-TEST-01'];

    for (const code of additionalCodes) {
      // 기존 코드 삭제
      await supabase.from('invitations').delete().eq('code', code);

      // 새 코드 생성
      const { error } = await supabase.from('invitations').insert({
        code: code,
        inviter_id: inviter.id,
        status: 'pending',
        expires_at: '2025-12-31T23:59:59+00:00',
        created_at: new Date().toISOString(),
      });

      if (!error) {
        console.log('✅ 추가 초대 코드 생성:', code);
      }
    }

    console.log('\n🎉 초대 코드 생성 완료!');
    console.log('\n📋 사용 가능한 초대 코드:');
    console.log(`   1. ${invitationCode}`);
    additionalCodes.forEach((code, index) => {
      console.log(`   ${index + 2}. ${code}`);
    });

    console.log('\n🔗 테스트 단계:');
    console.log('1. 브라우저에서 http://localhost:5173/invite-only 접속');
    console.log(`2. 초대 코드 "${invitationCode}" 입력`);
    console.log('3. 새로운 이메일로 회원가입 (예: test@example.com)');
    console.log('4. 비밀번호: TestPassword123!');
    console.log('5. 이메일 인증 (필요시)');
    console.log('6. 로그인 테스트');
    console.log('7. 대시보드 접근 확인');

    return true;
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    return false;
  }
}

createInvitationForExistingUser().then((success) => {
  if (success) {
    console.log('\n✅ 모든 작업이 완료되었습니다!');
  } else {
    console.log('\n❌ 작업이 실패했습니다.');
    process.exit(1);
  }
});
