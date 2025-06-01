import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

async function checkInvitationStatus() {
  console.log('🔍 초대장 코드 상태 진단...\n');

  // 1. 'asdf' 코드 확인
  console.log('1️⃣ asdf 코드 상태 확인:');
  const { data: asdData, error: asdError } = await supabase
    .from('app_user_invitations')
    .select('*')
    .eq('code', 'asdf');

  if (asdError) {
    console.error('❌ 조회 오류:', asdError);
    return;
  }

  if (asdData.length === 0) {
    console.log('❌ asdf 코드를 찾을 수 없습니다!');
  } else {
    console.log('✅ asdf 코드 발견:');
    const inv = asdData[0];
    console.log(`   - ID: ${inv.id}`);
    console.log(`   - 코드: ${inv.code}`);
    console.log(`   - 상태: ${inv.status}`);
    console.log(`   - 초대자 ID: ${inv.inviter_id}`);
    console.log(`   - 사용자 ID: ${inv.used_by_id || '미사용'}`);
    console.log(`   - 만료일: ${inv.expires_at || '무제한'}`);
    console.log(`   - 생성일: ${inv.created_at}`);
    console.log(`   - 사용일: ${inv.used_at || '미사용'}`);
  }

  // 2. 모든 초대장 코드 조회
  console.log('\n2️⃣ 현재 존재하는 모든 초대장들:');
  const { data: allInvitations, error: allError } = await supabase
    .from('app_user_invitations')
    .select('code, status, created_at, inviter_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allError) {
    console.error('❌ 전체 조회 오류:', allError);
    return;
  }

  if (allInvitations && allInvitations.length > 0) {
    allInvitations.forEach((inv, i) => {
      console.log(
        `   ${i + 1}. ${inv.code} (${inv.status}) - ${new Date(
          inv.created_at
        ).toLocaleDateString()}`
      );
    });
  } else {
    console.log('❌ 초대장이 전혀 없습니다!');
  }

  // 3. 성공한 초대장 ID로 역추적
  console.log('\n3️⃣ 성공한 초대장 ID 조회:');
  const { data: successInv, error: successError } = await supabase
    .from('app_user_invitations')
    .select('*')
    .eq('id', 'a8bb61d7-76d3-42dd-a472-f636aa4b6707');

  if (successError) {
    console.error('❌ 성공 초대장 조회 오류:', successError);
    return;
  }

  if (successInv && successInv.length > 0) {
    const inv = successInv[0];
    console.log('✅ 성공한 초대장:');
    console.log(`   - 코드: ${inv.code}`);
    console.log(`   - 상태: ${inv.status}`);
    console.log(`   - 생성일: ${inv.created_at}`);
  } else {
    console.log('❌ 성공한 초대장을 찾을 수 없습니다.');
  }
}

checkInvitationStatus().catch(console.error);
