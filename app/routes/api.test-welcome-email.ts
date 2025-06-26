import { data } from 'react-router';
import { sendTestWelcomeEmail } from '~/features/notifications/lib/email-service';

interface ActionArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  try {
    const formData = await request.formData();
    const testEmail = formData.get('email') as string;
    const userName = (formData.get('userName') as string) || '테스트 사용자';

    if (!testEmail) {
      return data(
        {
          success: false,
          error: '이메일 주소가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return data(
        {
          success: false,
          error: '올바른 이메일 형식이 아닙니다.',
        },
        { status: 400 }
      );
    }

    console.log(`🧪 테스트 웰컴 이메일 발송 요청:`, {
      testEmail,
      userName,
    });

    const result = await sendTestWelcomeEmail(testEmail, userName);

    if (result.success) {
      return data({
        success: true,
        message: `웰컴 이메일이 ${testEmail}로 발송되었습니다.`,
        messageId: result.messageId,
        emailInfo: {
          to: testEmail,
          userName,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      return data(
        {
          success: false,
          error: result.error || '이메일 발송에 실패했습니다.',
          troubleshooting: {
            환경변수_확인: 'RESEND_API_KEY가 .env에 설정되어 있는지 확인하세요',
            도메인_확인:
              'FROM_EMAIL 도메인이 Resend에서 검증되었는지 확인하세요',
            API_키_권한: 'Resend API 키에 이메일 발송 권한이 있는지 확인하세요',
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('테스트 웰컴 이메일 발송 중 오류:', error);

    return data(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
        stack:
          process.env.NODE_ENV === 'development'
            ? (error as Error)?.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}

// GET 요청을 위한 loader (API 정보 제공)
export async function loader() {
  return data({
    info: {
      description: '환영 이메일 테스트 API',
      method: 'POST',
      requiredParams: {
        email: '테스트 이메일 주소 (필수)',
        userName: '사용자 이름 (선택, 기본값: "테스트 사용자")',
      },
      examples: {
        기본_테스트: {
          email: 'test@example.com',
          userName: '홍길동',
        },
        실제_이메일: {
          email: 'your.email@gmail.com',
          userName: '김보험',
        },
      },
      환경설정: {
        RESEND_API_KEY: 'Resend API 키 (필수)',
        FROM_EMAIL: '발송자 이메일 (선택, 기본값: noah@mail.surecrm.pro)',
        NODE_ENV: '개발 환경에서는 실제 발송 대신 로그만 출력',
      },
      사용법: {
        curl_예시:
          'curl -X POST /api/test-welcome-email -d "email=test@example.com&userName=홍길동"',
        브라우저_테스트: '/welcome-page?username=홍길동&email=test@example.com',
      },
    },
  });
}
