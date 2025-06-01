import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupInitialUser() {
  console.log('🚀 초기 사용자 설정 시작...\n');

  try {
    // 1. Auth 사용자 조회
    console.log('👤 Auth 사용자 확인 중...');
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Auth 사용자 조회 실패: ${authError.message}`);
    }

    if (authUsers.users.length === 0) {
      console.log('❌ Auth 사용자가 없습니다. 먼저 회원가입을 하세요.');
      return;
    }

    const authUser = authUsers.users[0]; // noah.taehwan@gmail.com
    console.log(`✅ Auth 사용자 확인: ${authUser.email}`);

    // 2. 기존 프로필 확인
    console.log('\n👤 프로필 확인 중...');
    const { data: existingProfile } = await supabase
      .from('app_user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingProfile) {
      console.log('✅ 프로필이 이미 존재합니다.');
    } else {
      // 3. 프로필 생성
      console.log('🔨 프로필 생성 중...');
      const { data: newProfile, error: profileError } = await supabase
        .from('app_user_profiles')
        .insert({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || '관리자',
          phone: authUser.user_metadata?.phone || null,
          company: authUser.user_metadata?.company || null,
          role: 'system_admin',
          invitations_left: 10, // 시스템 관리자는 10개
          theme: 'dark',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`프로필 생성 실패: ${profileError.message}`);
      }

      console.log('✅ 프로필이 성공적으로 생성되었습니다.');
    }

    // 4. 초대장 확인 및 생성
    console.log('\n🎫 초대장 확인 중...');
    const { data: existingInvitations } = await supabase
      .from('app_user_invitations')
      .select('*')
      .eq('inviter_id', authUser.id);

    if (existingInvitations && existingInvitations.length > 0) {
      console.log(`✅ 기존 초대장 ${existingInvitations.length}개 발견`);

      const pendingInvitations = existingInvitations.filter(
        (inv) => inv.status === 'pending'
      );
      if (pendingInvitations.length > 0) {
        console.log('\n🎯 사용 가능한 초대장:');
        pendingInvitations.forEach((inv, index) => {
          console.log(`   ${index + 1}. ${inv.code}`);
        });
      }
    } else {
      // 5. 초대장 생성
      console.log('🔨 초대장 생성 중...');
      const invitations = [];

      for (let i = 0; i < 5; i++) {
        const code = `INV-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;
        invitations.push({
          id: uuidv4(),
          code,
          inviter_id: authUser.id,
          invitee_email: null,
          message: '클럽하우스 초창기 모델 기반 SureCRM 초대장입니다.',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }

      const { data: newInvitations, error: invitationError } = await supabase
        .from('app_user_invitations')
        .insert(invitations)
        .select();

      if (invitationError) {
        throw new Error(`초대장 생성 실패: ${invitationError.message}`);
      }

      console.log(
        `✅ 초대장 ${newInvitations.length}개가 성공적으로 생성되었습니다.`
      );

      console.log('\n🎯 새로 생성된 초대장:');
      newInvitations.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.code}`);
      });
    }

    // 6. 완료 안내
    console.log('\n🎉 초기 사용자 설정 완료!');
    console.log('\n💡 테스트 방법:');
    console.log('   1. 클래식 로그인 테스트:');
    console.log(`      - 이메일: ${authUser.email}`);
    console.log('      - 비밀번호: (기존 비밀번호 사용)');
    console.log('      - URL: http://localhost:5173/auth/login');
    console.log('');
    console.log('   2. 새 사용자 회원가입 테스트:');
    console.log('      - URL: http://localhost:5173/invite-only');
    console.log('      - 위의 초대장 코드 사용');
    console.log('      - 새 이메일로 회원가입');
  } catch (error) {
    console.error('\n❌ 설정 중 오류:', error);
    process.exit(1);
  }
}

setupInitialUser();
