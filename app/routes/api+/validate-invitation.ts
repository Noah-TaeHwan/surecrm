import { validateInvitationCode } from '~/lib/auth';

interface ActionArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: '초대 코드를 입력해주세요' }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await validateInvitationCode(code);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('초대 코드 검증 API 오류:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: '초대 코드 검증 중 오류가 발생했습니다',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
