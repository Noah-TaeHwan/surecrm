const { createClient } = require('@supabase/supabase-js');

// Service Role 키를 사용하여 관리자 권한으로 접근
const supabaseUrl = 'https://mzmlolwducobuknsigvz.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzEzMiwiZXhwIjoyMDYzNzczMTMyfQ.TWxIq_6UH-1D_3e68KMLK-B9ED95dBdTKjH4J61bBgA';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function fixStorageIssue() {
  console.log('🔧 Supabase Storage 문제 해결 시작\n');

  try {
    // 1. 기존 버킷 확인
    console.log('1️⃣ 기존 버킷 조회...');
    const { data: buckets, error: bucketsError } =
      await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketsError);
      return;
    }

    console.log('✅ 버킷 목록:');
    if (buckets.length === 0) {
      console.log('  (버킷이 없습니다)');
    } else {
      buckets.forEach((bucket) => {
        console.log(
          `  - ${bucket.name} (Public: ${bucket.public}, 생성일: ${bucket.created_at})`
        );
      });
    }

    // 2. contract-attachments 버킷 존재 확인 및 생성
    const contractBucket = buckets.find(
      (b) => b.name === 'contract-attachments'
    );

    if (!contractBucket) {
      console.log('\n2️⃣ contract-attachments 버킷 생성...');

      const { data: createBucket, error: createError } =
        await supabaseAdmin.storage.createBucket('contract-attachments', {
          public: false,
          allowedMimeTypes: [
            'application/pdf',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'text/plain',
          ],
          fileSizeLimit: 10485760, // 10MB
        });

      if (createError) {
        console.error('❌ contract-attachments 버킷 생성 실패:', createError);
      } else {
        console.log('✅ contract-attachments 버킷 생성 완료');
      }
    } else {
      console.log('\n✅ contract-attachments 버킷이 이미 존재합니다');
    }

    // 3. client-documents 버킷 존재 확인 및 생성
    const clientBucket = buckets.find((b) => b.name === 'client-documents');

    if (!clientBucket) {
      console.log('\n3️⃣ client-documents 버킷 생성...');

      const { data: createBucket2, error: createError2 } =
        await supabaseAdmin.storage.createBucket('client-documents', {
          public: false,
          allowedMimeTypes: [
            'application/pdf',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'text/plain',
          ],
          fileSizeLimit: 10485760, // 10MB
        });

      if (createError2) {
        console.error('❌ client-documents 버킷 생성 실패:', createError2);
      } else {
        console.log('✅ client-documents 버킷 생성 완료');
      }
    } else {
      console.log('\n✅ client-documents 버킷이 이미 존재합니다');
    }

    // 4. 최종 버킷 목록 확인
    console.log('\n4️⃣ 최종 버킷 목록 확인...');
    const { data: finalBuckets, error: finalError } =
      await supabaseAdmin.storage.listBuckets();

    if (finalError) {
      console.error('❌ 최종 버킷 목록 조회 실패:', finalError);
      return;
    }

    console.log('✅ 생성된 버킷 목록:');
    finalBuckets.forEach((bucket) => {
      console.log(`  - ${bucket.name} (Public: ${bucket.public})`);
    });

    console.log('\n🎉 Storage 설정 완료!');
    console.log('\n📝 다음 단계:');
    console.log('1. Supabase Dashboard → Storage → Policies로 이동');
    console.log('2. 각 버킷에 대해 다음 정책들을 추가:');
    console.log('   - INSERT: 인증된 사용자가 자신의 파일 업로드 허용');
    console.log('   - SELECT: 인증된 사용자가 자신의 파일 조회 허용');
    console.log('   - DELETE: 인증된 사용자가 자신의 파일 삭제 허용');
  } catch (error) {
    console.error('❌ Storage 설정 중 오류:', error);
  }
}

fixStorageIssue();
