import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

async function createTestInvitations() {
  console.log('🎫 테스트용 간단한 초대장 생성...\n');

  // 1. 기존 사용자 ID 확인
  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers();
  if (authError || !authUsers.users.length) {
    console.error('❌ 초대자를 찾을 수 없습니다.');
    return;
  }

  const inviterId = authUsers.users[0].id;
  console.log(`✅ 초대자 ID: ${inviterId}`);

  // 2. 간단한 테스트 코드들 생성
  const testCodes = ['test', 'demo', 'asdf', 'qwer', '1234'];

  const newInvitations = [];

  for (const code of testCodes) {
    // 기존 코드 확인
    const { data: existing } = await supabase
      .from('app_user_invitations')
      .select('id')
      .eq('code', code);

    if (existing && existing.length > 0) {
      console.log(`⚠️  코드 '${code}' 이미 존재함 - 건너뜀`);
      continue;
    }

    newInvitations.push({
      id: uuidv4(),
      code,
      inviter_id: inviterId,
      invitee_email: null,
      message: `테스트용 초대장 - ${code}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }

  if (newInvitations.length === 0) {
    console.log('ℹ️  새로 생성할 코드가 없습니다.');
    return;
  }

  // 3. 데이터베이스에 삽입
  const { data: inserted, error: insertError } = await supabase
    .from('app_user_invitations')
    .insert(newInvitations)
    .select();

  if (insertError) {
    console.error('❌ 초대장 생성 실패:', insertError);
    return;
  }

  console.log(`✅ ${inserted.length}개의 테스트 초대장 생성 완료!\n`);

  // 4. 결과 출력
  console.log('🎯 사용 가능한 테스트 코드들:');
  inserted.forEach((inv, i) => {
    console.log(`   ${i + 1}. ${inv.code}`);
  });

  console.log('\n💡 테스트 방법:');
  console.log('   1. http://localhost:5173/invite-only 접속');
  console.log('   2. 위의 코드 중 하나 입력 (예: test)');
  console.log('   3. 새 이메일로 회원가입 진행');

  // 5. 기존 초대장들도 표시
  console.log('\n📋 전체 초대장 목록:');
  const { data: allInvitations } = await supabase
    .from('app_user_invitations')
    .select('code, status')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (allInvitations) {
    allInvitations.forEach((inv, i) => {
      console.log(`   ${i + 1}. ${inv.code} (${inv.status})`);
    });
  }
}

createTestInvitations().catch(console.error);
