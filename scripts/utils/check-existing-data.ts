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

async function checkExistingData() {
  console.log('📊 현재 데이터베이스 상태 확인...\n');

  try {
    // 1. Auth 사용자 확인
    console.log('👤 Auth 사용자 목록:');
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Auth 사용자 조회 실패:', authError);
    } else {
      if (authUsers.users && authUsers.users.length > 0) {
        authUsers.users.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.email} (ID: ${user.id.slice(0, 8)}...)`
          );
          console.log(`      생성일: ${user.created_at}`);
          console.log(
            `      확인됨: ${user.email_confirmed_at ? '예' : '아니오'}`
          );
        });
      } else {
        console.log('   ❌ Auth 사용자가 없습니다.');
      }
    }

    // 2. 프로필 사용자 확인
    console.log('\n👤 프로필 사용자 목록:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ 프로필 조회 실패:', profilesError);
    } else {
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, index) => {
          console.log(
            `   ${index + 1}. ${profile.full_name} (${profile.role})`
          );
          console.log(`      ID: ${profile.id.slice(0, 8)}...`);
          console.log(`      활성: ${profile.is_active ? '예' : '아니오'}`);
          console.log(`      초대권: ${profile.invitations_left}개`);
        });
      } else {
        console.log('   ❌ 프로필 사용자가 없습니다.');
      }
    }

    // 3. 초대 코드 확인
    console.log('\n🎫 초대 코드 목록:');
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (invitationsError) {
      console.error('❌ 초대 코드 조회 실패:', invitationsError);
    } else {
      if (invitations && invitations.length > 0) {
        invitations.forEach((invitation, index) => {
          console.log(`   ${index + 1}. ${invitation.code}`);
          console.log(`      상태: ${invitation.status}`);
          console.log(`      만료일: ${invitation.expires_at || '무제한'}`);
          console.log(`      발급자: ${invitation.inviter_id?.slice(0, 8)}...`);
        });
      } else {
        console.log('   ❌ 초대 코드가 없습니다.');
      }
    }

    // 4. 사용 가능한 초대 코드 확인
    console.log('\n✅ 사용 가능한 초대 코드:');
    const { data: validInvitations, error: validError } = await supabase
      .from('invitations')
      .select('code, expires_at')
      .eq('status', 'pending')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (validError) {
      console.error('❌ 유효한 초대 코드 조회 실패:', validError);
    } else {
      if (validInvitations && validInvitations.length > 0) {
        validInvitations.forEach((invitation, index) => {
          console.log(`   ${index + 1}. ${invitation.code}`);
        });

        console.log('\n🎯 테스트 방법:');
        console.log('1. 브라우저에서 http://localhost:5173/invite-only 접속');
        console.log(
          `2. 위의 초대 코드 중 하나를 입력 (예: ${validInvitations[0].code})`
        );
        console.log('3. 새로운 이메일로 회원가입 시도');
        console.log('4. 이메일 인증 (개발 환경에서는 콘솔 확인)');
        console.log('5. 로그인 테스트');
      } else {
        console.log('   ❌ 사용 가능한 초대 코드가 없습니다.');
        console.log('\n💡 해결 방법: 초대 코드를 수동으로 생성하세요.');
        console.log('   Supabase SQL Editor에서 다음 쿼리 실행:');
        console.log('');
        console.log(
          '   INSERT INTO public.invitations (code, status, expires_at)'
        );
        console.log(
          "   VALUES ('MANUAL-TEST-001', 'pending', '2025-12-31T23:59:59+00:00');"
        );
      }
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkExistingData().then(() => {
  console.log('\n✅ 데이터 확인 완료');
});
