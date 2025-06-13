import { redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';

// Handle password reset callback from Supabase
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/auth/login';

  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to new password form or success page
      throw redirect('/auth/new-password');
    }
  }

  // If error or no code, redirect to forgot password with error
  throw redirect('/auth/forgot-password?error=invalid_link');
}

export function meta() {
  return [
    { title: '비밀번호 재설정 | SureCRM' },
    { name: 'description', content: '비밀번호를 재설정하세요' },
  ];
}

export default function ResetPassword() {
  return <div>Redirecting...</div>;
}
