import { useEffect, useState } from 'react';
import { type MetaFunction, redirect } from 'react-router';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { AuthLayout } from '~/common/layouts/auth-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Button } from '~/common/components/ui/button';
import { XCircle, Loader2, Mail } from 'lucide-react';
import { verifyMagicLink, checkAuthStatus } from '~/lib/auth/core.server';

interface LoaderData {
  token?: string;
  type?: string;
  email?: string;
  error?: string;
}

interface ActionData {
  success: boolean;
  error?: string;
  user?: any;
}

interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: LoaderData;
  actionData?: ActionData | null;
}

export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);

  // URL 파라미터에서 매직링크 정보 추출
  const token = url.searchParams.get('token') || '';
  const type = url.searchParams.get('type') || '';
  const email = url.searchParams.get('email') || '';

  // 필수 파라미터 검증
  if (!token || !type || !email) {
    return {
      error: 'Invalid login link. Please try signing in again.',
    };
  }

  // 이미 로그인되어 있는지 확인
  const isAuthenticated = await checkAuthStatus(request);
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  return {
    token,
    type,
    email,
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const token = formData.get('token') as string;
  const type = formData.get('type') as string;
  const email = formData.get('email') as string;

  if (!token || !type || !email) {
    return {
      success: false,
      error: 'Required information is missing.',
    };
  }

  // 매직링크 검증
  const result = await verifyMagicLink(token, type, email);

  if (result.success && result.user) {
    // 로그인 성공 시 세션 생성하고 대시보드로 리다이렉트
    const { createUserSession } = await import('~/lib/auth/session');
    throw await createUserSession(result.user.id, '/dashboard');
  }

  return {
    success: false,
    error: result.error || 'Failed to verify login link.',
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Magic Link Verification | SureCRM' },
    { name: 'description', content: 'Verifying your login link' },
  ];
};

export default function MagicLinkVerifyPage({
  loaderData,
  actionData,
}: ComponentProps) {
  const { t } = useHydrationSafeTranslation('auth');
  const [isVerifying, setIsVerifying] = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);

  // 페이지 로드 시 자동으로 매직링크 검증 시도
  useEffect(() => {
    if (
      loaderData.token &&
      loaderData.type &&
      loaderData.email &&
      !autoVerified &&
      !actionData
    ) {
      setIsVerifying(true);
      setAutoVerified(true);

      // 자동으로 폼 제출
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';

      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token';
      tokenInput.value = loaderData.token;
      form.appendChild(tokenInput);

      const typeInput = document.createElement('input');
      typeInput.type = 'hidden';
      typeInput.name = 'type';
      typeInput.value = loaderData.type;
      form.appendChild(typeInput);

      const emailInput = document.createElement('input');
      emailInput.type = 'hidden';
      emailInput.name = 'email';
      emailInput.value = loaderData.email;
      form.appendChild(emailInput);

      document.body.appendChild(form);
      form.submit();
    }
  }, [loaderData, autoVerified, actionData]);

  // 로더에서 에러가 있는 경우
  if (loaderData.error) {
    return (
      <AuthLayout>
        <Card className="w-full bg-transparent border-none shadow-none">
          <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
              {t('magicLink.invalidTitle')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
              {t('magicLink.invalidSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{loaderData.error}</AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                onClick={() => (window.location.href = '/auth/login')}
                className="w-full"
              >
                {t('magicLink.retryLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // 검증 중인 경우
  if (isVerifying && !actionData) {
    return (
      <AuthLayout>
        <Card className="w-full bg-transparent border-none shadow-none">
          <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
              {t('magicLink.verifyingTitle')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
              {t('magicLink.verifyingSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('magicLink.waiting')}
              </div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // 검증 실패한 경우
  if (actionData && !actionData.success) {
    return (
      <AuthLayout>
        <Card className="w-full bg-transparent border-none shadow-none">
          <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
              {t('magicLink.failedTitle')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
              {t('magicLink.failedSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('magicLink.failureReasons')}
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• {t('magicLink.expiredLink')}</li>
                <li>• {t('magicLink.usedLink')}</li>
                <li>• {t('magicLink.invalidFormat')}</li>
                <li>• {t('magicLink.disabledAccount')}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = '/auth/login')}
                className="w-full"
              >
                {t('magicLink.newLinkRequest')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // 기본 대기 상태 (이론적으로는 도달하지 않아야 함)
  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
            {t('magicLink.preparingTitle')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            {t('magicLink.preparingSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <div className="space-y-4">
            <Button
              onClick={() => (window.location.href = '/auth/login')}
              variant="outline"
              className="w-full"
            >
              {t('magicLink.backToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
