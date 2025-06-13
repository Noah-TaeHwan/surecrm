/**
 * 웰컴 이메일 미리보기 API
 * React Email 템플릿을 HTML로 렌더링하여 확인
 */

import { renderWelcomeEmailPreview } from '~/features/notifications/lib/email-service';

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const userName = url.searchParams.get('userName') || '홍길동';
    const userEmail = url.searchParams.get('userEmail') || 'test@example.com';

    // 웰컴 이메일 HTML 생성
    const emailHtml = await renderWelcomeEmailPreview(userName, userEmail);

    // HTML 응답 반환
    return new Response(emailHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('웰컴 이메일 미리보기 오류:', error);

    return new Response(
      `
      <html>
        <body>
          <h1>이메일 미리보기 오류</h1>
          <p>웰컴 이메일 템플릿을 렌더링하는 중 오류가 발생했습니다.</p>
          <pre>${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }</pre>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}
