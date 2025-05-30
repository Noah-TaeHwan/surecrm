import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Node.js 환경에서 직접 환경변수 사용
function createClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxMzIsImV4cCI6MjA2Mzc3MzEzMn0.hODGYkSnJUaYGQazm1wPg4AU0oIadnSbJeiNPM-Pkkk';

  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

/**
 * 랜덤 초대 코드 생성
 * 형식: ABC-DEF-GHI (3글자-3글자-3글자, 대문자와 숫자 조합)
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 3; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
}

/**
 * 초대 코드 중복 확인 및 유니크한 코드 생성
 */
async function generateUniqueInvitationCode(): Promise<string> {
  const supabase = createClient();
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateInvitationCode();

    const { data, error } = await supabase
      .from('invitations')
      .select('id')
      .eq('code', code)
      .single();

    if (error && error.code === 'PGRST116') {
      // 데이터가 없음 = 유니크한 코드
      isUnique = true;
      return code;
    }

    attempts++;
  }

  // 최대 시도 횟수 초과 시 UUID 기반 코드 생성
  return `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function updateInvitationCodes() {
  const supabase = createClient();

  console.log('🔄 기존 초대 코드를 랜덤 코드로 업데이트 중...');

  try {
    // 기존 하드코딩된 초대 코드들 조회
    const { data: existingInvitations, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .in('code', ['ADMIN-INVITE-001', 'ADMIN-INVITE-002']);

    if (fetchError) {
      console.error('❌ 기존 초대장 조회 실패:', fetchError);
      return;
    }

    if (!existingInvitations || existingInvitations.length === 0) {
      console.log('ℹ️  업데이트할 하드코딩된 초대 코드가 없습니다.');
      return;
    }

    console.log(
      `📋 ${existingInvitations.length}개의 초대 코드를 업데이트합니다.`
    );

    // 각 초대장의 코드를 랜덤 코드로 업데이트
    for (const invitation of existingInvitations) {
      const newCode = await generateUniqueInvitationCode();

      const { error: updateError } = await supabase
        .from('invitations')
        .update({ code: newCode })
        .eq('id', invitation.id);

      if (updateError) {
        console.error(
          `❌ 초대장 ${invitation.code} 업데이트 실패:`,
          updateError
        );
      } else {
        console.log(`✅ ${invitation.code} → ${newCode}`);
      }
    }

    console.log('🎉 모든 초대 코드 업데이트 완료!');

    // 업데이트된 초대장 목록 출력
    const { data: updatedInvitations } = await supabase
      .from('invitations')
      .select('code, status, expires_at')
      .eq('inviter_id', '80b0993a-4194-4165-be5a-aec24b88cd80')
      .order('created_at', { ascending: false });

    if (updatedInvitations) {
      console.log('\n📝 어드민 계정의 현재 초대장 목록:');
      updatedInvitations.forEach((inv, index) => {
        console.log(
          `${index + 1}. ${inv.code} (${inv.status}) - 만료: ${new Date(
            inv.expires_at
          ).toLocaleDateString()}`
        );
      });
    }
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
updateInvitationCodes();
