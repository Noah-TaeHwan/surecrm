import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Service Role 키를 사용하여 모든 권한으로 접근
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestEnvironment() {
  console.log('🚀 테스트 환경 설정 시작...');

  try {
    // 1. 시스템 사용자 생성 (초대 코드 발급자)
    console.log('👤 시스템 사용자 확인/생성 중...');

    const systemUserId = '00000000-0000-0000-0000-000000000000';

    // 기존 시스템 사용자 확인
    const { data: existingSystemUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', systemUserId)
      .single();

    if (!existingSystemUser) {
      // 시스템 사용자 생성
      const { error: systemUserError } = await supabase
        .from('profiles')
        .insert({
          id: systemUserId,
          full_name: 'System Administrator',
          role: 'system_admin',
          is_active: true,
          invitations_left: 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (systemUserError) {
        console.error('❌ 시스템 사용자 생성 실패:', systemUserError);
        return false;
      }
      console.log('✅ 시스템 사용자 생성 완료');
    } else {
      console.log('✅ 시스템 사용자 이미 존재함');
    }

    // 2. 테스트용 초대 코드 생성
    console.log('📝 테스트용 초대 코드 생성 중...');

    const invitationCode = 'TEST-2025-001';

    // 기존 초대 코드 삭제
    await supabase.from('invitations').delete().eq('code', invitationCode);

    // 새 초대 코드 생성
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        code: invitationCode,
        inviter_id: systemUserId,
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

    // 3. 기존 테스트 사용자 정리 (Auth Users 테이블에서 email로 검색)
    console.log('🧹 기존 테스트 사용자 정리 중...');

    const testEmail = 'test@surecrm.com';

    // Auth 사용자 검색 및 삭제
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const testUser = authUsers.users?.find((u) => u.email === testEmail);
      if (testUser) {
        // 프로필 먼저 삭제
        await supabase.from('profiles').delete().eq('id', testUser.id);

        // Auth 사용자 삭제
        await supabase.auth.admin.deleteUser(testUser.id);
        console.log('✅ 기존 테스트 사용자 삭제 완료');
      } else {
        console.log('ℹ️ 기존 테스트 사용자 없음');
      }
    } catch (error) {
      console.log('ℹ️ 테스트 사용자 정리 중 오류 (무시):', error);
    }

    // 4. 성공 메시지
    console.log('\n🎉 테스트 환경 설정 완료!');
    console.log('\n📋 테스트 정보:');
    console.log(`   초대 코드: ${invitationCode}`);
    console.log(`   테스트 이메일: ${testEmail}`);
    console.log(`   테스트 비밀번호: TestPassword123!`);

    console.log('\n🔗 테스트 단계:');
    console.log('1. 브라우저에서 http://localhost:5173/invite-only 접속');
    console.log(`2. 초대 코드 "${invitationCode}" 입력`);
    console.log('3. 회원가입 페이지에서 테스트 정보로 가입');
    console.log('4. 이메일 인증 (필요시)');
    console.log('5. 로그인 테스트');
    console.log('6. 대시보드 접근 확인');

    return true;
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    return false;
  }
}

async function main() {
  const success = await createTestEnvironment();

  if (success) {
    console.log('\n✅ 모든 작업이 완료되었습니다!');
  } else {
    console.log('\n❌ 일부 작업이 실패했습니다.');
    process.exit(1);
  }
}

main().catch(console.error);
