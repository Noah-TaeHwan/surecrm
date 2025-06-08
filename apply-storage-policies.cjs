const { createClient } = require('@supabase/supabase-js');

// Service Role 키를 사용하여 관리자 권한으로 접근
const supabaseUrl = 'https://mzmlolwducobuknsigvz.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bWxvbHdkdWNvYnVrbnNpZ3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzEzMiwiZXhwIjoyMDYzNzczMTMyfQ.TWxIq_6UH-1D_3e68KMLK-B9ED95dBdTKjH4J61bBgA';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function applyStoragePolicies() {
  console.log('🔧 Storage 정책 적용 시작\n');

  const policies = [
    {
      name: 'Users can upload contract attachments',
      sql: `
        CREATE POLICY "Users can upload contract attachments" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'contract-attachments' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Users can view their contract attachments',
      sql: `
        CREATE POLICY "Users can view their contract attachments" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'contract-attachments' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Users can delete their contract attachments',
      sql: `
        CREATE POLICY "Users can delete their contract attachments" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'contract-attachments' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Users can upload client documents',
      sql: `
        CREATE POLICY "Users can upload client documents" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'client-documents' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Users can view their client documents',
      sql: `
        CREATE POLICY "Users can view their client documents" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'client-documents' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Users can delete their client documents',
      sql: `
        CREATE POLICY "Users can delete their client documents" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'client-documents' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Service role can access all files',
      sql: `
        CREATE POLICY "Service role can access all files" ON storage.objects
        FOR ALL USING (
          auth.role() = 'service_role'
        );
      `,
    },
  ];

  try {
    // 1. 기존 정책 확인
    console.log('1️⃣ 기존 Storage 정책 확인...');
    const { data: existingPolicies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');

    if (policiesError) {
      console.log(
        '⚠️ 기존 정책 조회 실패 (정상적일 수 있음):',
        policiesError.message
      );
    } else {
      console.log(`✅ 기존 정책 ${existingPolicies.length}개 발견`);
      existingPolicies.forEach((policy) => {
        console.log(`  - ${policy.policyname}`);
      });
    }

    // 2. RLS 활성화 확인
    console.log('\n2️⃣ RLS 활성화 확인...');
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;',
    });

    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('❌ RLS 활성화 실패:', rlsError);
    } else {
      console.log('✅ RLS 활성화 완료');
    }

    // 3. 정책 적용
    console.log('\n3️⃣ Storage 정책 적용...');

    for (const policy of policies) {
      console.log(`📝 정책 적용: ${policy.name}`);

      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: policy.sql,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ✅ 이미 존재함: ${policy.name}`);
        } else {
          console.error(`  ❌ 실패: ${policy.name}`, error.message);
        }
      } else {
        console.log(`  ✅ 성공: ${policy.name}`);
      }
    }

    console.log('\n🎉 Storage 정책 적용 완료!');
    console.log('\n📝 이제 다음을 테스트해보세요:');
    console.log('1. 로그인한 상태에서 첨부파일 업로드');
    console.log('2. 업로드된 파일이 올바른 경로에 저장되는지 확인');
    console.log('3. 파일 다운로드 및 삭제 기능 테스트');
  } catch (error) {
    console.error('❌ 정책 적용 중 오류:', error);
  }
}

applyStoragePolicies();
