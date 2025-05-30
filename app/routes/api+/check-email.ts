import { data } from 'react-router';
import { createAdminClient } from '~/lib/supabase.server';

interface ActionArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return data({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return data({
        available: false,
        error: '올바른 이메일 형식이 아닙니다.',
      });
    }

    // Supabase Admin 클라이언트 사용
    const supabase = createAdminClient();

    // Service Role 키를 사용하여 사용자 목록 조회
    const { data: authUsers, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('사용자 목록 조회 오류:', listError);
      return data(
        { error: '이메일 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 이미 존재하는 이메일인지 확인
    const existingUser = authUsers.users?.find((user) => user.email === email);

    if (existingUser) {
      return data({
        available: false,
        error: '이미 등록된 이메일 주소입니다.',
      });
    }

    return data({ available: true, message: '사용 가능한 이메일입니다.' });
  } catch (error) {
    console.error('이메일 확인 API 오류:', error);
    return data(
      { error: '이메일 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
