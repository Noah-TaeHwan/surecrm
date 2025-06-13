/**
 * 테스트 웰컴 이메일 발송 API
 * 개발자가 실제로 이메일을 받아볼 수 있는 테스트 엔드포인트
 */

import { sendTestWelcomeEmail } from '~/features/notifications/lib/email-service';

interface TestEmailRequest {
  email: string;
  userName?: string;
}

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const userName = (formData.get('userName') as string) || '테스트 사용자';

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '이메일 주소를 입력해주세요.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '올바른 이메일 형식이 아닙니다.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`🧪 테스트 이메일 발송 요청: ${email}`);

    // 웰컴 이메일 발송
    const result = await sendTestWelcomeEmail(email, userName);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `테스트 웰컴 이메일이 ${email}로 발송되었습니다!`,
          messageId: result.messageId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || '이메일 발송에 실패했습니다.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('테스트 이메일 API 오류:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
