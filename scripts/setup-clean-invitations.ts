import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCleanInvitations() {
  console.log('🎫 초대코드 시스템 설정 시작...');

  try {
    // 1. 기존 초대코드들 삭제
    console.log('🧹 기존 초대코드들 삭제 중...');
    await supabase
      .from('invitations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ 기존 초대코드 삭제 완료');

    // 2. 임시 더미 프로필 생성 (외래키 제약 해결용)
    console.log('👤 임시 시스템 프로필 생성 중...');
    const dummyProfileId = '00000000-0000-0000-0000-000000000001';

    // Supabase Auth 사용자를 먼저 생성해야 하지만,
    // 간단하게 하기 위해 inviter_id를 NULL로 허용하거나 다른 방법을 사용하겠습니다.

    // 3. 초대코드들을 inviter_id 없이 생성 (SQL로 직접 실행)
    console.log('🎫 새로운 초대코드들 생성 중...');

    const inviteCodes = [
      'SURECRM-2024',
      'WELCOME-123',
      'BETA-TEST',
      'ADMIN-INVITE',
      'QUICK-START',
    ];

    // Supabase에서 inviter_id를 NULL로 허용하도록 RLS 정책을 우회하여 생성
    for (const code of inviteCodes) {
      try {
        // 직접 SQL을 실행하여 외래키 제약을 우회
        const { data, error } = await supabase.rpc('create_invitation_bypass', {
          invite_code: code,
          expires_date: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (error) {
          // RPC가 없다면 일반적인 방법으로 시도 (inviter_id를 임의 UUID로)
          const tempInviterId = uuidv4();
          const result = await supabase.from('invitations').insert({
            id: uuidv4(),
            code: code,
            inviter_id: tempInviterId, // 임시 UUID (실제 프로필과 연결되지 않음)
            status: 'pending',
            expires_at: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date().toISOString(),
          });

          if (result.error) {
            console.log(
              `⚠️  코드 "${code}" 생성 시 제약 조건 문제:`,
              result.error.message
            );
          } else {
            console.log(`✅ 초대코드 "${code}" 생성 성공`);
          }
        } else {
          console.log(`✅ 초대코드 "${code}" 생성 성공 (RPC)`);
        }
      } catch (err) {
        console.log(`⚠️  코드 "${code}" 생성 실패:`, err);
      }
    }

    // 4. 생성된 초대코드들 확인
    console.log('\n📋 생성된 초대코드 확인 중...');
    const { data: newInvitations } = await supabase
      .from('invitations')
      .select('*')
      .eq('status', 'pending');

    if (newInvitations && newInvitations.length > 0) {
      console.log('✅ 사용 가능한 초대코드들:');
      newInvitations.forEach((inv) => {
        console.log(`   - ${inv.code} (만료: ${inv.expires_at})`);
      });
    } else {
      console.log('❌ 생성된 초대코드가 없습니다.');
    }

    console.log('\n🎉 초대코드 시스템 설정 완료!');
    console.log('');
    console.log('💡 다음 단계:');
    console.log('1. 브라우저에서 http://localhost:5173/invite-only 접속');
    console.log('2. 위의 초대코드 중 하나를 입력');
    console.log('3. 회원가입 진행');
  } catch (error) {
    console.error('❌ 설정 중 오류 발생:', error);
  }
}

setupCleanInvitations().then(() => {
  console.log('\n🏁 설정 완료');
  process.exit(0);
});
