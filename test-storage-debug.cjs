const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 클라이언트 설정
const supabaseUrl =
  process.env.SUPABASE_URL || 'https://mzmlolwducobuknsigvz.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxMzIsImV4cCI6MjA2Mzc3MzEzMn0.hODGYkSnJUaYGQazm1wPg4AU0oIadnSbJeiNPM-Pkkk';

const supabase = createClient(supabaseUrl, supabaseKey);

// 테스트 파일 생성
function createTestFile() {
  const testContent =
    '이것은 테스트 첨부파일입니다.\n계약서 PDF 시뮬레이션 파일입니다.';
  const filePath = path.join(__dirname, 'test-attachment.txt');
  fs.writeFileSync(filePath, testContent, 'utf8');
  console.log('✅ 테스트 파일 생성:', filePath);
  return filePath;
}

// Supabase Storage 테스트
async function testStorageUpload() {
  console.log('🧪 Supabase Storage 실제 업로드 테스트\n');

  try {
    // 1. Supabase 연결 테스트
    console.log('1️⃣ Supabase 연결 테스트...');
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketsError);
      return;
    }

    console.log('✅ 버킷 목록 조회 성공:');
    buckets.forEach((bucket) => {
      console.log(`  - ${bucket.name} (생성일: ${bucket.created_at})`);
    });

    // 2. contract-attachments 버킷 존재 확인
    const contractBucket = buckets.find(
      (b) => b.name === 'contract-attachments'
    );
    if (!contractBucket) {
      console.log(
        '\n🔧 contract-attachments 버킷이 없습니다. 생성을 시도합니다...'
      );

      const { data: createBucket, error: createError } =
        await supabase.storage.createBucket('contract-attachments', {
          public: false,
          allowedMimeTypes: [
            'application/pdf',
            'text/csv',
            'application/vnd.ms-excel',
          ],
        });

      if (createError) {
        console.error('❌ 버킷 생성 실패:', createError);
        return;
      }

      console.log('✅ contract-attachments 버킷 생성 완료');
    } else {
      console.log('✅ contract-attachments 버킷 존재 확인');
    }

    // 3. 테스트 파일 생성 및 업로드
    console.log('\n2️⃣ 테스트 파일 업로드...');
    const testFilePath = createTestFile();
    const fileContent = fs.readFileSync(testFilePath);

    const fileName = `test-${Date.now()}.txt`;
    const storagePath = `test-client/contracts/${fileName}`;

    console.log(`📁 업로드 경로: ${storagePath}`);
    console.log(`📄 파일 크기: ${fileContent.length} bytes`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contract-attachments')
      .upload(storagePath, fileContent, {
        contentType: 'text/plain',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ 파일 업로드 실패:', uploadError);

      // 권한 관련 에러라면 추가 정보 제공
      if (
        uploadError.message.includes('permission') ||
        uploadError.message.includes('policy')
      ) {
        console.log(
          '\n🔐 권한 문제일 가능성이 높습니다. RLS 정책을 확인해보세요.'
        );
        console.log('Supabase Dashboard → Storage → Policies에서 다음을 확인:');
        console.log('1. contract-attachments 버킷의 INSERT 정책 존재 여부');
        console.log('2. 인증된 사용자에 대한 업로드 권한 부여 여부');
      }

      return;
    }

    console.log('✅ 파일 업로드 성공!');
    console.log('📄 업로드 결과:', {
      path: uploadData.path,
      id: uploadData.id,
      fullPath: uploadData.fullPath,
    });

    // 4. 업로드된 파일 목록 확인
    console.log('\n3️⃣ 버킷 내 파일 목록 확인...');
    const { data: files, error: listError } = await supabase.storage
      .from('contract-attachments')
      .list('test-client/contracts', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError) {
      console.error('❌ 파일 목록 조회 실패:', listError);
      return;
    }

    console.log('✅ 파일 목록:');
    files.forEach((file) => {
      console.log(
        `  - ${file.name} (${file.metadata?.size || 'unknown'} bytes, ${
          file.created_at
        })`
      );
    });

    // 5. 파일 다운로드 테스트
    console.log('\n4️⃣ 파일 다운로드 테스트...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('contract-attachments')
      .download(storagePath);

    if (downloadError) {
      console.error('❌ 파일 다운로드 실패:', downloadError);
      return;
    }

    const downloadedText = await downloadData.text();
    console.log(
      '✅ 다운로드 성공! 내용:',
      downloadedText.substring(0, 50) + '...'
    );

    // 6. 정리
    console.log('\n5️⃣ 테스트 파일 정리...');

    // 로컬 파일 삭제
    fs.unlinkSync(testFilePath);

    // Storage 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from('contract-attachments')
      .remove([storagePath]);

    if (deleteError) {
      console.warn('⚠️ Storage 파일 삭제 실패:', deleteError);
    } else {
      console.log('✅ Storage 파일 삭제 완료');
    }

    console.log('\n🎉 모든 테스트 완료! Supabase Storage는 정상 작동합니다.');
  } catch (error) {
    console.error('❌ 테스트 중 예외 발생:', error);
  }
}

// 테스트 실행
testStorageUpload();
