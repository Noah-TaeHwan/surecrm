import { requireAuth } from '~/lib/auth/middleware.server';
import { createAdminClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db.server';
import { contractAttachments } from '~/lib/schema/core';
import { eq, and } from 'drizzle-orm';

export async function loader({ request }: { request: Request }) {
  try {
    console.log('📥 [Download API] 첨부파일 다운로드 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);

    // URL에서 attachmentId 추출
    const url = new URL(request.url);
    const attachmentId = url.searchParams.get('id');

    if (!attachmentId) {
      return new Response('첨부파일 ID가 필요합니다.', { status: 400 });
    }

    console.log('📎 첨부파일 다운로드:', { attachmentId, userId: user.id });

    // 첨부파일 정보 조회 (권한 검증 포함)
    const [attachment] = await db
      .select({
        id: contractAttachments.id,
        fileName: contractAttachments.fileName,
        fileDisplayName: contractAttachments.fileDisplayName,
        filePath: contractAttachments.filePath,
        mimeType: contractAttachments.mimeType,
        fileSize: contractAttachments.fileSize,
        agentId: contractAttachments.agentId,
        contractId: contractAttachments.contractId,
      })
      .from(contractAttachments)
      .where(
        and(
          eq(contractAttachments.id, attachmentId),
          eq(contractAttachments.agentId, user.id), // 권한 검증
          eq(contractAttachments.isActive, true)
        )
      )
      .limit(1);

    if (!attachment) {
      console.error('❌ 첨부파일을 찾을 수 없거나 접근 권한이 없습니다.');
      return new Response('첨부파일을 찾을 수 없습니다.', { status: 404 });
    }

    console.log('✅ 첨부파일 정보 조회 완료:', {
      fileName: attachment.fileName,
      filePath: attachment.filePath,
      fileSize: attachment.fileSize,
    });

    // Supabase Storage에서 파일 다운로드
    const supabase = createAdminClient();

    // Signed URL 생성 (1시간 유효)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from('contract-attachments')
        .createSignedUrl(attachment.filePath, 3600); // 1시간

    if (signedUrlError || !signedUrlData) {
      console.error('❌ Signed URL 생성 실패:', signedUrlError);
      return new Response('파일 다운로드 URL 생성에 실패했습니다.', {
        status: 500,
      });
    }

    console.log('🔗 Signed URL 생성 완료:', signedUrlData.signedUrl);

    // 파일 스트리밍 다운로드
    const fileResponse = await fetch(signedUrlData.signedUrl);

    if (!fileResponse.ok) {
      console.error('❌ 파일 다운로드 실패:', fileResponse.status);
      return new Response('파일 다운로드에 실패했습니다.', { status: 500 });
    }

    const fileBlob = await fileResponse.blob();

    console.log('✅ 파일 다운로드 성공:', {
      fileName: attachment.fileName,
      fileSize: fileBlob.size,
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set(
      'Content-Type',
      attachment.mimeType || 'application/octet-stream'
    );
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(attachment.fileDisplayName)}"`
    );
    headers.set('Content-Length', fileBlob.size.toString());
    headers.set('Cache-Control', 'no-cache');

    return new Response(fileBlob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('❌ 첨부파일 다운로드 중 오류:', error);
    return new Response('서버 오류가 발생했습니다.', { status: 500 });
  }
}
