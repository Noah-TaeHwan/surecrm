import { redirect, data } from 'react-router';
import { z } from 'zod';
import { createServerClient } from '~/lib/core/supabase';

interface Route {
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  ComponentProps: {
    loaderData?: any;
    actionData?: any;
  };
}

// 새 비밀번호 스키마
const newPasswordSchema = z.object({
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export async function loader({ request }: Route['LoaderArgs']) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 인증된 사용자가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    throw redirect('/auth/forgot-password?error=session_expired');
  }
  
  return {};
}

export async function action({ request }: Route['ActionArgs']) {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 유효성 검사
  const validation = newPasswordSchema.safeParse({ password, confirmPassword });
  if (!validation.success) {
    return data({
      success: false,
      error: validation.error.errors[0].message,
    }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    
    // 비밀번호 업데이트
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('비밀번호 업데이트 실패:', error);
      return data({
        success: false,
        error: '비밀번호 변경에 실패했습니다: ' + error.message,
      }, { status: 400 });
    }

    // 성공적으로 비밀번호 변경 후 로그인 페이지로 리다이렉트
    throw redirect('/auth/login?message=password_updated');
  } catch (error) {
    console.error('비밀번호 변경 중 예외:', error);
    return data({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

export function meta() {
  return [
    { title: '새 비밀번호 설정 | SureCRM' },
    { name: 'description', content: '새로운 비밀번호를 설정하세요' },
  ];
}

export { default } from '~/common/pages/auth/new-password-page'; 