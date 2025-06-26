import { Resend } from 'resend';
import type { Route } from './+types/welcome-page';
import WelcomeUser from '../../../react-email-starter/emails/welcome-user';

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    // URL 파라미터에서 사용자 정보 가져오기
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'Noah';
    const testEmail = url.searchParams.get('email') || 'noah.taehwan@gmail.com';

    const subject = `🎉 SureCRM에 오신 것을 환영합니다!`;

    const { data, error } = await client.emails.send({
      from: 'SureCRM <noah@mail.surecrm.pro>',
      to: [testEmail],
      subject,
      react: WelcomeUser({
        username,
        loginUrl: 'https://surecrm.pro/login',
        dashboardUrl: 'https://surecrm.pro/dashboard',
      }),
      tags: [
        {
          name: 'category',
          value: 'welcome_test',
        },
      ],
    });

    if (error) {
      return Response.json({
        success: false,
        error: error.message,
        info: '이메일 발송에 실패했습니다. RESEND_API_KEY가 설정되어 있는지 확인해주세요.',
      });
    }

    return Response.json({
      success: true,
      data,
      info: {
        message: `웰컴 이메일이 ${testEmail}로 발송되었습니다.`,
        messageId: data?.id,
        username,
        testInstructions: {
          다른_사용자명: '?username=홍길동 파라미터 추가',
          다른_이메일: '?email=test@example.com 파라미터 추가',
          예시: '/welcome-page?username=김보험&email=test@company.co.kr',
        },
      },
    });
  } catch (error) {
    console.error('웰컴 이메일 테스트 오류:', error);
    return Response.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      info: 'RESEND_API_KEY 환경변수가 올바르게 설정되어 있는지 확인해주세요.',
    });
  }
};
