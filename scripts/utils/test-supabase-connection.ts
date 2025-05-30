import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

console.log('환경 변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  supabaseServiceKey ? '설정됨' : '설정되지 않음'
);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...');

  // Service Role 키 테스트
  console.log('\n1. Service Role 키 테스트:');
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabaseService
      .from('teams')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Service Role 연결 실패:', error);
    } else {
      console.log('✅ Service Role 연결 성공!');
      console.log('📊 테이블 데이터:', data);
    }
  } catch (error) {
    console.error('❌ Service Role 연결 중 오류:', error);
  }

  // Anon 키 테스트
  console.log('\n2. Anon 키 테스트:');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabaseAnon
      .from('teams')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Anon 연결 실패:', error);
    } else {
      console.log('✅ Anon 연결 성공!');
      console.log('📊 테이블 데이터:', data);
    }
  } catch (error) {
    console.error('❌ Anon 연결 중 오류:', error);
  }
}

testConnection().then(() => {
  console.log('\n🎉 연결 테스트 완료');
  process.exit(0);
});
