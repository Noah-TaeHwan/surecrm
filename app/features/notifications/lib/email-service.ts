import { render } from '@react-email/render';
// 기존 템플릿 대신 새로운 고급 템플릿 사용
import WelcomeUser from '../../../../react-email-starter/emails/welcome-user';
import { Resend } from 'resend';

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  dashboardUrl?: string;
  loginUrl?: string;
}

// Resend 클라이언트 초기화 (안전한 방식)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * 웰컴 이메일 HTML 생성 (고급 템플릿 사용)
 */
export async function generateWelcomeEmailHtml({
  userName,
  userEmail,
  dashboardUrl = 'https://surecrm.pro/dashboard',
  loginUrl = 'https://surecrm.pro/login',
}: WelcomeEmailData): Promise<string> {
  const emailHtml = await render(
    WelcomeUser({
      username: userName,
      loginUrl,
      dashboardUrl,
    })
  );

  return emailHtml;
}

/**
 * 실제 웰컴 이메일 발송 (Resend 사용) - 고급 템플릿 적용
 */
export async function sendWelcomeEmail({
  userName,
  userEmail,
  dashboardUrl = 'https://surecrm.pro/dashboard',
  loginUrl = 'https://surecrm.pro/login',
}: WelcomeEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  try {
    // 이메일 HTML 생성 (고급 템플릿 사용)
    const emailHtml = await generateWelcomeEmailHtml({
      userName,
      userEmail,
      dashboardUrl,
      loginUrl,
    });

    // 개발 환경에서는 로그만 출력
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log(`
📧 ========== 웰컴 이메일 발송 (개발 모드) ==========
📤 수신자: ${userEmail}
👤 사용자: ${userName}
🔗 대시보드: ${dashboardUrl}
🔐 로그인: ${loginUrl}
📝 제목: 🎉 SureCRM에 오신 것을 환영합니다!

💡 실제 이메일을 받아보려면:
1. Resend 계정 생성: https://resend.com
2. API 키를 .env에 추가: RESEND_API_KEY=re_xxx
3. FROM_EMAIL을 .env에 추가: FROM_EMAIL=noah@mail.surecrm.pro

✅ 고급 템플릿 이메일 발송 시뮬레이션 완료
================================================
      `);

      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // 운영 환경에서는 실제 이메일 발송
    if (!process.env.RESEND_API_KEY || !resend) {
      throw new Error('RESEND_API_KEY가 설정되지 않았습니다.');
    }

    const fromEmail = process.env.FROM_EMAIL || 'noah@mail.surecrm.pro';

    const subject = `🎉 SureCRM에 오신 것을 환영합니다!`;

    const { data, error } = await resend.emails.send({
      from: `SureCRM <${fromEmail}>`,
      to: [userEmail],
      subject,
      html: emailHtml,
      headers: {
        'X-Entity-Ref-ID': `welcome-${Date.now()}`,
      },
      tags: [
        {
          name: 'category',
          value: 'welcome',
        },
        {
          name: 'user_type',
          value: 'insurance_agent',
        },
      ],
    });

    if (error) {
      throw new Error(`Resend 에러: ${error.message}`);
    }

    console.log(
      `✅ 고급 웰컴 이메일 발송 완료: ${userEmail} (ID: ${data?.id})`
    );

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('❌ 웰컴 이메일 발송 실패:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '이메일 발송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 테스트 이메일 발송 (개발자가 직접 받아보기) - 고급 템플릿
 */
export async function sendTestWelcomeEmail(
  testEmail: string,
  userName = '테스트 사용자'
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  console.log(`🧪 테스트 웰컴 이메일 발송 시작: ${testEmail}`);

  const result = await sendWelcomeEmail({
    userName,
    userEmail: testEmail,
    dashboardUrl: 'https://surecrm.pro/dashboard',
    loginUrl: 'https://surecrm.pro/login',
  });

  if (result.success) {
    console.log(`🎉 테스트 이메일 발송 성공! 이메일함을 확인해주세요.`);
  }

  return result;
}

/**
 * 회원가입 완료 시 웰컴 이메일 자동 발송 (고급 템플릿)
 */
export async function triggerWelcomeEmailOnSignup(
  userEmail: string,
  userName?: string
): Promise<void> {
  try {
    const result = await sendWelcomeEmail({
      userName: userName || '고객님',
      userEmail,
    });

    if (!result.success) {
      console.error('웰컴 이메일 발송 실패:', result.error);
    } else {
      console.log(`✅ 회원가입 웰컴 이메일 자동 발송 완료: ${userEmail}`);
    }
  } catch (error) {
    console.error('웰컴 이메일 트리거 오류:', error);
  }
}

/**
 * 이메일 템플릿 미리보기 (개발/테스트용) - 고급 템플릿
 */
export async function renderWelcomeEmailPreview(
  userName = '홍길동',
  userEmail = 'test@example.com'
): Promise<string> {
  return await generateWelcomeEmailHtml({
    userName,
    userEmail,
    dashboardUrl: 'https://surecrm.pro/dashboard',
    loginUrl: 'https://surecrm.pro/login',
  });
}
