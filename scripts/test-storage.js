// 🧪 Storage 연결 테스트 스크립트
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 환경변수 로드
const supabaseUrl =
  process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testStorageConnection() {
  console.log('🔍 Storage 연결 테스트 시작...\n');

  try {
    // 1. 버킷 목록 조회
    console.log('📁 버킷 목록 조회...');
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ 버킷 조회 실패:', bucketsError);
      return false;
    }

    console.log('✅ 버킷 목록:', buckets?.map(b => b.name) || []);

    const requiredBuckets = ['contract-attachments', 'client-documents'];
    const existingBuckets = buckets?.map(b => b.name) || [];
    const missingBuckets = requiredBuckets.filter(
      bucket => !existingBuckets.includes(bucket)
    );

    if (missingBuckets.length > 0) {
      console.log('⚠️ 누락된 버킷:', missingBuckets);
      console.log('💡 다음 SQL을 Supabase에서 실행하세요:');
      console.log(`
-- 누락된 버킷 생성
${missingBuckets
  .map(
    bucket => `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '${bucket}',
  '${bucket}',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;`
  )
  .join('')}
      `);
      return false;
    }

    // 2. 테스트 파일 업로드
    console.log('\n📤 테스트 파일 업로드...');
    const testContent = `SureCRM Storage 테스트
생성시간: ${new Date().toISOString()}
테스트 ID: ${Math.random().toString(36).substr(2, 9)}`;

    const fileName = `test-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contract-attachments')
      .upload(fileName, Buffer.from(testContent), {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error('❌ 업로드 실패:', uploadError);
      return false;
    }

    console.log('✅ 업로드 성공:', uploadData.path);

    // 3. 파일 목록 조회
    const { data: files, error: listError } = await supabase.storage
      .from('contract-attachments')
      .list('');

    if (listError) {
      console.error('❌ 파일 목록 조회 실패:', listError);
    } else {
      console.log('📂 파일 목록:', files?.map(f => f.name) || []);
    }

    // 4. 테스트 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from('contract-attachments')
      .remove([fileName]);

    if (deleteError) {
      console.warn('⚠️ 테스트 파일 삭제 실패:', deleteError);
    } else {
      console.log('🗑️ 테스트 파일 삭제 완료');
    }

    console.log('\n🎉 Storage 테스트 완료 - 모든 기능 정상 작동!');
    return true;
  } catch (error) {
    console.error('❌ Storage 테스트 중 오류:', error);
    return false;
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 RLS 정책 테스트...');

  try {
    // RLS 정책 확인을 위한 쿼리
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'storage')
      .eq('table_name', 'objects');

    if (error) {
      console.log('⚠️ RLS 정책 직접 확인 불가 (권한 제한)');
      console.log('💡 Supabase 대시보드 → Storage → Policies에서 확인 필요');
    } else {
      console.log('✅ RLS 테이블 접근 가능');
    }
  } catch (error) {
    console.log('⚠️ RLS 정책 테스트 스킵 (권한 제한)');
  }
}

// 메인 함수
async function main() {
  console.log('🏥 SureCRM Storage 헬스체크\n');
  console.log('Environment:');
  console.log('- Supabase URL:', supabaseUrl);
  console.log('- Service Key:', supabaseServiceKey ? '✅ 설정됨' : '❌ 없음');
  console.log('');

  const storageOk = await testStorageConnection();
  await testRLSPolicies();

  console.log('\n📊 최종 결과:');
  console.log('- Storage 연결:', storageOk ? '✅ 정상' : '❌ 문제');
  console.log('- 버킷 생성:', storageOk ? '✅ 완료' : '❌ 미완료');
  console.log('- 파일 업로드:', storageOk ? '✅ 가능' : '❌ 불가능');

  if (!storageOk) {
    console.log('\n🔧 해결 방법:');
    console.log('1. Supabase 대시보드 → Storage → Create bucket');
    console.log('2. contract-attachments, client-documents 버킷 생성');
    console.log('3. 위에 표시된 SQL 실행');
  }

  process.exit(storageOk ? 0 : 1);
}

main().catch(console.error);
