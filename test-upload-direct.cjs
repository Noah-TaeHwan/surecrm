const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Service Role 키를 사용하여 관리자 권한으로 접근
const supabaseUrl = 'https://mzmlolwducobuknsigvz.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzEzMiwiZXhwIjoyMDYzNzczMTMyfQ.TWxIq_6UH-1D_3e68KMLK-B9ED95dBdTKjH4J61bBgA';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 테스트 파일 생성
function createTestFile() {
  const testContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(테스트 계약서 첨부파일입니다) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
290
%%EOF
  `;

  const filePath = path.join(__dirname, 'test-contract-attachment.pdf');
  fs.writeFileSync(filePath, testContent.trim(), 'utf8');
  console.log('✅ 테스트 PDF 파일 생성:', filePath);
  return filePath;
}

async function testDirectUpload() {
  console.log('🧪 Service Role 키로 직접 파일 업로드 테스트\n');

  try {
    // 1. 테스트 파일 생성
    const testFilePath = createTestFile();
    const fileContent = fs.readFileSync(testFilePath);

    console.log('📄 파일 정보:', {
      path: testFilePath,
      size: fileContent.length,
      type: 'application/pdf',
    });

    // 2. 업로드 경로 설정
    const contractId = 'test-contract-123';
    const agentId = 'test-agent-456';
    const fileName = `test-${Date.now()}.pdf`;
    const storagePath = `contracts/${contractId}/${fileName}`;

    console.log('\n📁 업로드 시작:', {
      bucket: 'contract-attachments',
      path: storagePath,
      size: fileContent.length,
    });

    // 3. Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('contract-attachments')
      .upload(storagePath, fileContent, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ 업로드 실패:', uploadError);

      // 권한 관련 에러 분석
      if (
        uploadError.message.includes('permission') ||
        uploadError.message.includes('policy')
      ) {
        console.log('\n🔐 권한 문제 해결 방법:');
        console.log(
          '1. Supabase Dashboard → Storage → contract-attachments → Policies'
        );
        console.log('2. 다음 정책 추가:');
        console.log("   - INSERT: auth.role() = 'service_role'");
        console.log("   - SELECT: auth.role() = 'service_role'");
        console.log("   - DELETE: auth.role() = 'service_role'");
      }

      return;
    }

    console.log('✅ 업로드 성공!', {
      id: uploadData.id,
      path: uploadData.path,
      fullPath: uploadData.fullPath,
    });

    // 4. Public URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('contract-attachments')
      .getPublicUrl(storagePath);

    console.log('🔗 Public URL:', urlData.publicUrl);

    // 5. 파일 목록 확인
    console.log('\n📋 버킷 내 파일 목록 확인...');
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('contract-attachments')
      .list(`contracts/${contractId}`, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError) {
      console.error('❌ 파일 목록 조회 실패:', listError);
    } else {
      console.log('✅ 파일 목록:');
      files.forEach((file) => {
        console.log(
          `  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`
        );
      });
    }

    // 6. 다운로드 테스트
    console.log('\n⬇️ 다운로드 테스트...');
    const { data: downloadData, error: downloadError } =
      await supabaseAdmin.storage
        .from('contract-attachments')
        .download(storagePath);

    if (downloadError) {
      console.error('❌ 다운로드 실패:', downloadError);
    } else {
      const downloadedSize = (await downloadData.arrayBuffer()).byteLength;
      console.log('✅ 다운로드 성공:', {
        originalSize: fileContent.length,
        downloadedSize,
        match: fileContent.length === downloadedSize,
      });
    }

    // 7. 정리
    console.log('\n🧹 정리...');

    // 로컬 파일 삭제
    fs.unlinkSync(testFilePath);
    console.log('✅ 로컬 파일 삭제 완료');

    // Storage 파일 삭제
    const { error: deleteError } = await supabaseAdmin.storage
      .from('contract-attachments')
      .remove([storagePath]);

    if (deleteError) {
      console.warn('⚠️ Storage 파일 삭제 실패:', deleteError);
    } else {
      console.log('✅ Storage 파일 삭제 완료');
    }

    console.log('\n🎉 모든 테스트 완료! Storage 업로드가 정상 작동합니다.');
  } catch (error) {
    console.error('❌ 테스트 중 예외 발생:', error);
  }
}

testDirectUpload();
