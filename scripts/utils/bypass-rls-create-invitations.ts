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

async function createInvitationsViaSQL() {
  console.log('🎫 SQL을 통한 초대코드 생성 시작...');

  try {
    // 1. SQL을 직접 실행하여 초대코드 생성
    console.log('📝 SQL 실행 중...');

    const sqlQuery = `
      INSERT INTO public.invitations (
        id, 
        code, 
        inviter_id, 
        status, 
        expires_at, 
        created_at
      ) VALUES 
        (
          gen_random_uuid(),
          'SURECRM-2024',
          gen_random_uuid(),
          'pending',
          '2025-12-31T23:59:59+00:00',
          NOW()
        ),
        (
          gen_random_uuid(),
          'WELCOME-123',
          gen_random_uuid(),
          'pending',
          '2025-12-31T23:59:59+00:00',
          NOW()
        ),
        (
          gen_random_uuid(),
          'BETA-TEST',
          gen_random_uuid(),
          'pending',
          '2025-12-31T23:59:59+00:00',
          NOW()
        ),
        (
          gen_random_uuid(),
          'QUICK-START',
          gen_random_uuid(),
          'pending',
          '2025-12-31T23:59:59+00:00',
          NOW()
        ),
        (
          gen_random_uuid(),
          'ADMIN-INVITE',
          gen_random_uuid(),
          'pending',
          '2025-12-31T23:59:59+00:00',
          NOW()
        )
      ON CONFLICT (code) DO NOTHING;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });

    if (error) {
      console.log('❌ SQL 실행 실패:', error);
      console.log('');
      console.log('💡 대안: Supabase 대시보드에서 직접 실행하세요');
      console.log('1. Supabase 대시보드 → SQL Editor 이동');
      console.log('2. scripts/sql-create-invitations.sql 파일의 내용을 복사');
      console.log('3. SQL Editor에 붙여넣기 후 실행');
      console.log('');
      console.log('또는 간단한 방법:');
      console.log(
        `INSERT INTO public.invitations (id, code, inviter_id, status, expires_at, created_at) VALUES ('${uuidv4()}', 'SURECRM-2024', '${uuidv4()}', 'pending', '2025-12-31T23:59:59+00:00', NOW());`
      );
    } else {
      console.log('✅ SQL 실행 성공:', data);
    }

    // 2. 생성된 초대코드들 확인
    console.log('\n📋 생성된 초대코드 확인 중...');
    const { data: invitations, error: selectError } = await supabase
      .from('invitations')
      .select('*')
      .eq('status', 'pending');

    if (selectError) {
      console.log('❌ 초대코드 조회 오류:', selectError);
    } else if (invitations && invitations.length > 0) {
      console.log('✅ 사용 가능한 초대코드들:');
      invitations.forEach((inv) => {
        console.log(`   - ${inv.code}`);
      });
    } else {
      console.log('❌ 사용 가능한 초대코드가 없습니다.');
    }

    console.log('\n🎉 작업 완료!');
    console.log('');
    console.log('💡 다음 단계:');
    console.log('1. 서버 실행: npm run dev');
    console.log('2. 브라우저에서 http://localhost:5173/invite-only 접속');
    console.log('3. 위의 초대코드 중 하나를 입력하여 회원가입');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

createInvitationsViaSQL().then(() => {
  console.log('\n🏁 스크립트 실행 완료');
  process.exit(0);
});
