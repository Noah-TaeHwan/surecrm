import { createServerClient } from '~/lib/core/supabase';

interface ActionArgs {
  request: Request;
}

const supabase = createServerClient();

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase를 통해 OTP 재전송
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // 이미 생성된 사용자
      },
    });

    if (error) {
      console.error('OTP 재전송 오류:', error);
      return Response.json(
        { success: false, error: 'OTP 재전송에 실패했습니다.' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: '인증 코드가 재전송되었습니다.',
    });
  } catch (error) {
    console.error('OTP 재전송 API 오류:', error);
    return Response.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
