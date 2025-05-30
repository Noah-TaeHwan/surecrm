import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

interface DataSummary {
  tableName: string;
  count: number;
  recentItems?: any[];
  error?: string;
}

async function getTableData(
  tableName: string,
  selectFields = '*',
  limit = 5
): Promise<DataSummary> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select(selectFields, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { tableName, count: 0, error: error.message };
    }

    return {
      tableName,
      count: count || 0,
      recentItems: data || [],
    };
  } catch (error) {
    return {
      tableName,
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkDatabaseStatus() {
  console.log('📊 SureCRM 데이터베이스 상태 확인...\n');

  // 1. Auth 사용자 확인
  console.log('👤 Auth 사용자 현황:');
  try {
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('   ❌ Auth 사용자 조회 실패:', authError.message);
    } else {
      console.log(`   📈 총 사용자: ${authUsers.users.length}명`);

      if (authUsers.users.length > 0) {
        console.log('   📋 최근 사용자:');
        authUsers.users.slice(0, 3).forEach((user, index) => {
          const email = user.email || '이메일 없음';
          const confirmed = user.email_confirmed_at ? '✅' : '❌';
          const createdAt = new Date(user.created_at).toLocaleDateString(
            'ko-KR'
          );
          console.log(
            `      ${index + 1}. ${email} ${confirmed} (${createdAt})`
          );
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Auth 시스템 접근 실패:', error);
  }

  console.log('');

  // 2. 핵심 테이블 데이터 확인
  const tables = [
    { name: 'profiles', fields: 'id, full_name, role, is_active, created_at' },
    { name: 'teams', fields: 'id, name, is_active, created_at' },
    { name: 'clients', fields: 'id, full_name, importance, created_at' },
    { name: 'meetings', fields: 'id, title, start_time, status, created_at' },
    { name: 'invitations', fields: 'id, code, status, expires_at, created_at' },
    { name: 'referrals', fields: 'id, referral_date, status, created_at' },
  ];

  console.log('📋 테이블별 데이터 현황:');

  const summaries: DataSummary[] = [];
  for (const table of tables) {
    const summary = await getTableData(table.name, table.fields);
    summaries.push(summary);

    const status = summary.error ? '❌' : '✅';
    const countText = summary.error ? summary.error : `${summary.count}개`;
    console.log(`   ${status} ${table.name}: ${countText}`);
  }

  console.log('');

  // 3. 상세 정보 출력
  for (const summary of summaries) {
    if (summary.error || summary.count === 0) continue;

    console.log(
      `📄 ${summary.tableName} 상세 (최근 ${Math.min(summary.count, 3)}개):`
    );

    summary.recentItems?.slice(0, 3).forEach((item, index) => {
      switch (summary.tableName) {
        case 'profiles':
          console.log(
            `   ${index + 1}. ${item.full_name} (${item.role}) - ${
              item.is_active ? '활성' : '비활성'
            }`
          );
          break;
        case 'teams':
          console.log(
            `   ${index + 1}. ${item.name} - ${
              item.is_active ? '활성' : '비활성'
            }`
          );
          break;
        case 'clients':
          console.log(
            `   ${index + 1}. ${item.full_name} (${item.importance})`
          );
          break;
        case 'meetings':
          const meetingDate = new Date(item.start_time).toLocaleDateString(
            'ko-KR'
          );
          console.log(
            `   ${index + 1}. ${item.title} - ${item.status} (${meetingDate})`
          );
          break;
        case 'invitations':
          const expiryDate = item.expires_at
            ? new Date(item.expires_at).toLocaleDateString('ko-KR')
            : '무제한';
          console.log(
            `   ${index + 1}. ${item.code} - ${
              item.status
            } (만료: ${expiryDate})`
          );
          break;
        case 'referrals':
          const referralDate = new Date(item.referral_date).toLocaleDateString(
            'ko-KR'
          );
          console.log(`   ${index + 1}. ${item.status} (${referralDate})`);
          break;
        default:
          console.log(`   ${index + 1}. ${JSON.stringify(item)}`);
      }
    });
    console.log('');
  }

  // 4. 사용 가능한 초대 코드 확인
  const invitationSummary = summaries.find(
    (s) => s.tableName === 'invitations'
  );
  if (
    invitationSummary &&
    !invitationSummary.error &&
    invitationSummary.count > 0
  ) {
    console.log('🎫 사용 가능한 초대 코드:');

    try {
      const { data: validInvitations } = await supabase
        .from('invitations')
        .select('code, expires_at')
        .eq('status', 'pending')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (validInvitations && validInvitations.length > 0) {
        validInvitations.slice(0, 5).forEach((invitation, index) => {
          const expiry = invitation.expires_at
            ? new Date(invitation.expires_at).toLocaleDateString('ko-KR')
            : '무제한';
          console.log(`   ${index + 1}. ${invitation.code} (만료: ${expiry})`);
        });

        console.log('\n💡 테스트 방법:');
        console.log('   1. http://localhost:5173/invite-only 접속');
        console.log(`   2. 초대 코드 입력: ${validInvitations[0].code}`);
        console.log('   3. 새 이메일로 회원가입');
        console.log('   4. 이메일 인증 후 로그인');
      } else {
        console.log('   ❌ 사용 가능한 초대 코드가 없습니다.');
        console.log('\n💡 초대 코드 생성 방법:');
        console.log('   npm run script:reset-database');
        console.log('   또는 Supabase SQL Editor에서 수동 생성');
      }
    } catch (error) {
      console.log('   ❌ 초대 코드 조회 실패:', error);
    }
  }

  // 5. 요약 통계
  console.log('\n📈 데이터베이스 요약:');
  const totalRecords = summaries.reduce(
    (sum, s) => sum + (s.error ? 0 : s.count),
    0
  );
  const healthyTables = summaries.filter((s) => !s.error).length;
  const totalTables = summaries.length;

  console.log(`   📊 총 레코드: ${totalRecords}개`);
  console.log(`   🏥 테이블 상태: ${healthyTables}/${totalTables} 정상`);

  if (healthyTables === totalTables && totalRecords > 0) {
    console.log('   🎉 데이터베이스가 정상적으로 작동하고 있습니다!');
  } else if (totalRecords === 0) {
    console.log(
      '   📝 데이터베이스가 비어있습니다. 초기 데이터를 생성해주세요.'
    );
  } else {
    console.log('   ⚠️  일부 테이블에 문제가 있을 수 있습니다.');
  }
}

checkDatabaseStatus()
  .then(() => {
    console.log('\n✅ 데이터베이스 상태 확인 완료');
  })
  .catch((error) => {
    console.error('\n❌ 상태 확인 중 오류:', error);
    process.exit(1);
  });
