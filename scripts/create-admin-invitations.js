import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 랜덤 초대 코드 생성 함수
function generateInvitationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const generateSegment = () => {
    return Array.from({ length: 3 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  return `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

async function createAdminInvitations() {
  try {
    console.log('🔍 어드민 계정 찾는 중...');

    // 어드민 계정 찾기
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'system_admin')
      .single();

    if (profileError || !adminProfile) {
      console.error('❌ 어드민 계정을 찾을 수 없습니다:', profileError);
      return;
    }

    console.log(
      '✅ 어드민 계정 찾음:',
      adminProfile.full_name,
      `(${adminProfile.id})`
    );

    // 기존 초대장 확인
    const { data: existingInvitations, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('inviter_id', adminProfile.id);

    if (invitationError) {
      console.error('❌ 기존 초대장 조회 실패:', invitationError);
      return;
    }

    console.log(`📋 기존 초대장 개수: ${existingInvitations?.length || 0}장`);

    if (existingInvitations && existingInvitations.length >= 2) {
      console.log('✅ 이미 충분한 초대장이 있습니다.');
      console.log('기존 초대장 목록:');
      existingInvitations.forEach((inv, index) => {
        console.log(`  ${index + 1}. ${inv.code} (${inv.status})`);
      });
      return;
    }

    // 필요한 초대장 개수 계산
    const neededInvitations = 2 - (existingInvitations?.length || 0);
    console.log(`🎫 ${neededInvitations}장의 초대장을 생성합니다...`);

    // 초대장 생성
    const invitationsToCreate = [];
    for (let i = 0; i < neededInvitations; i++) {
      let code;
      let isUnique = false;

      // 중복되지 않는 코드 생성
      while (!isUnique) {
        code = generateInvitationCode();
        const { data: existing } = await supabase
          .from('invitations')
          .select('id')
          .eq('code', code)
          .single();

        if (!existing) {
          isUnique = true;
        }
      }

      invitationsToCreate.push({
        code,
        inviter_id: adminProfile.id,
        message: '보험설계사를 위한 SureCRM에 초대합니다!',
        status: 'pending',
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30일 후
        created_at: new Date().toISOString(),
      });
    }

    // 초대장 일괄 생성
    const { data: newInvitations, error: createError } = await supabase
      .from('invitations')
      .insert(invitationsToCreate)
      .select();

    if (createError) {
      console.error('❌ 초대장 생성 실패:', createError);
      return;
    }

    console.log('✅ 초대장 생성 완료!');
    newInvitations.forEach((inv, index) => {
      console.log(`  ${index + 1}. ${inv.code}`);
    });

    // 프로필의 invitations_left 업데이트
    const totalInvitations =
      (existingInvitations?.length || 0) + neededInvitations;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ invitations_left: totalInvitations })
      .eq('id', adminProfile.id);

    if (updateError) {
      console.error('⚠️ 프로필 업데이트 실패:', updateError);
    } else {
      console.log(
        `✅ 어드민 계정의 invitations_left를 ${totalInvitations}로 업데이트했습니다.`
      );
    }
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
createAdminInvitations();
