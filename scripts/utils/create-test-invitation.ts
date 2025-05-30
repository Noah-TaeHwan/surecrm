import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

console.log('환경 변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('SUPABASE_URL과 SUPABASE_ANON_KEY 환경 변수를 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestInvitation() {
  console.log('🎫 테스트 초대코드 생성 시작...');

  try {
    // 1. 기존 초대코드 확인
    console.log('📋 기존 초대코드 확인 중...');

    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (invitationsError) {
      console.log('❌ invitations 테이블 조회 오류:', invitationsError);
      return;
    }

    if (invitations && invitations.length > 0) {
      console.log('✅ 사용 가능한 기존 초대코드를 발견했습니다!');
      invitations.forEach((inv) => {
        console.log(`   코드: ${inv.code}`);
        console.log(`   만료일: ${inv.expires_at}`);
        console.log(`   상태: ${inv.status}`);
      });
      console.log('\n💡 기존 초대코드를 사용하세요.');
      return;
    }

    console.log('❌ 사용 가능한 초대코드가 없습니다.');
    console.log('');
    console.log(
      '🔧 Service Role 키 문제로 인해 새로운 초대코드를 자동 생성할 수 없습니다.'
    );
    console.log('');
    console.log('📝 해결 방법:');
    console.log(
      '1. Supabase 대시보드 → Settings → API에서 Service Role 키 확인'
    );
    console.log('2. .env 파일의 SUPABASE_SERVICE_ROLE_KEY 업데이트');
    console.log('3. 또는 Supabase SQL Editor에서 수동으로 초대코드 생성:');
    console.log('');
    console.log('   INSERT INTO public.invitations (');
    console.log('     id, code, inviter_id, status, expires_at, created_at');
    console.log('   ) VALUES (');
    console.log(`     '${uuidv4()}',`);
    console.log(`     'MANUAL-TEST-${Date.now().toString().slice(-6)}',`);
    console.log(`     '${uuidv4()}',  -- 임시 inviter_id`);
    console.log("     'pending',");
    console.log(`     '2025-12-31T23:59:59+00:00',`);
    console.log(`     NOW()`);
    console.log('   );');
    console.log('');
    console.log('4. 생성된 초대코드를 /invite-only 페이지에서 사용');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

createTestInvitation().then(() => {
  console.log('\n🏁 스크립트 실행 완료');
  process.exit(0);
});
