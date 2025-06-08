import { createServerClient, createAdminClient } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * 파일 업로드 관련 상수
 */
export const STORAGE_CONFIG = {
  CONTRACT_ATTACHMENTS_BUCKET: 'contract-attachments',
  CLIENT_DOCUMENTS_BUCKET: 'client-documents',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
};

/**
 * 파일 유효성 검사
 */
function validateFile(file: File): { isValid: boolean; errors: string[] } {
  console.log('📁 파일 유효성 검사 시작:', {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  const errors: string[] = [];

  // 파일 크기 검사
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    errors.push(
      `파일 크기가 너무 큽니다. 최대 ${
        STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024
      }MB까지 허용됩니다.`
    );
  }

  // MIME 타입 검사
  if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(
      `지원되지 않는 파일 형식입니다. 허용되는 형식: ${STORAGE_CONFIG.ALLOWED_MIME_TYPES.join(
        ', '
      )}`
    );
  }

  const isValid = errors.length === 0;
  console.log(`${isValid ? '✅' : '❌'} 파일 유효성 검사 결과:`, {
    isValid,
    errors,
  });

  return { isValid, errors };
}

/**
 * 보험계약 첨부파일 업로드
 */
export async function uploadContractAttachment(
  file: File,
  contractId: string,
  agentId: string,
  documentType: string
): Promise<{
  success: boolean;
  data?: {
    filePath: string;
    publicUrl: string;
  };
  error?: string;
}> {
  try {
    console.log('📎 보험계약 첨부파일 업로드 시작:', {
      contractId,
      agentId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // 파일 유효성 검사
    const validation = validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    console.log('🔑 Admin 클라이언트 생성 시도...');
    const supabase = createAdminClient(); // 관리자 권한으로 업로드
    console.log('✅ Admin 클라이언트 생성 완료');

    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `contracts/${contractId}/${fileName}`;

    console.log('📁 Supabase Storage 업로드 준비:', {
      bucket: STORAGE_CONFIG.CONTRACT_ATTACHMENTS_BUCKET,
      filePath,
      fileSize: file.size,
    });

    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_CONFIG.CONTRACT_ATTACHMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Supabase Storage 업로드 실패:', {
        error: uploadError,
        message: uploadError.message,
      });
      return {
        success: false,
        error: `파일 업로드 실패: ${uploadError.message}`,
      };
    }

    console.log('✅ Supabase Storage 업로드 성공:', {
      path: uploadData.path,
      fullPath: uploadData.fullPath,
    });

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.CONTRACT_ATTACHMENTS_BUCKET)
      .getPublicUrl(filePath);

    console.log('🔗 Public URL 생성:', {
      publicUrl: urlData.publicUrl,
    });

    return {
      success: true,
      data: {
        filePath: uploadData.path,
        publicUrl: urlData.publicUrl,
      },
    };
  } catch (error) {
    console.error('❌ 파일 업로드 중 예외 발생:', {
      error,
      message: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 문서 업로드
 */
export async function uploadClientDocument(
  file: File,
  clientId: string,
  agentId: string,
  documentType: string
): Promise<{
  success: boolean;
  data?: {
    filePath: string;
    publicUrl: string;
  };
  error?: string;
}> {
  try {
    console.log('📄 클라이언트 문서 업로드 시작:', {
      clientId,
      agentId,
      documentType,
    });

    // 파일 유효성 검사
    const validation = validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    const supabase = createAdminClient();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `clients/${clientId}/${fileName}`;

    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_CONFIG.CLIENT_DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ 클라이언트 문서 업로드 실패:', uploadError);
      return {
        success: false,
        error: `파일 업로드 실패: ${uploadError.message}`,
      };
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.CLIENT_DOCUMENTS_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        filePath: uploadData.path,
        publicUrl: urlData.publicUrl,
      },
    };
  } catch (error) {
    console.error('❌ 클라이언트 문서 업로드 중 예외 발생:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(
  bucketName: string,
  filePath: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('🗑️ 파일 삭제 중...', { bucketName, filePath });

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('❌ 파일 삭제 실패:', error);
      return {
        success: false,
        error: `파일 삭제 실패: ${error.message}`,
      };
    }

    console.log('✅ 파일 삭제 성공');
    return { success: true };
  } catch (error) {
    console.error('❌ 파일 삭제 중 예외 발생:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 파일 다운로드 URL 생성
 */
export async function getFileDownloadUrl(
  bucketName: string,
  filePath: string,
  expiresIn = 60 * 60 // 1시간
): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return {
        success: false,
        error: `다운로드 URL 생성 실패: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data.signedUrl,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
