import { useState, useEffect } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '~/common/layouts/auth-layout';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

interface LoaderArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    email?: string;
    message?: string;
  };
}

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') || '';
  const message = url.searchParams.get('message') || '';

  return {
    email,
    message,
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Email Verification | SureCRM' },
    { name: 'description', content: 'Complete your email verification' },
  ];
};

export default function EmailVerificationPage({ loaderData }: ComponentProps) {
  const { t } = useTranslation('auth');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!loaderData.email) return;

    setIsResending(true);
    setResendError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loaderData.email }),
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
      } else {
        setResendError(result.error || t('error.resendFailed'));
      }
    } catch (error) {
      setResendError(t('error.resendError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
            {t('emailVerification.title')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            {t('emailVerification.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loaderData.message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{loaderData.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            {loaderData.email && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('emailVerification.instructions')}
              </p>
            )}

            {loaderData.email && (
              <p className="font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                {loaderData.email}
              </p>
            )}

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>{t('emailVerification.checkEmail')}</p>
              <p>{t('emailVerification.checkSpam')}</p>
            </div>
          </div>

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('emailVerification.resendSuccessMessage')}
              </AlertDescription>
            </Alert>
          )}

          {resendError && (
            <Alert variant="destructive">
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {loaderData.email && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendSuccess}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('emailVerification.resendingButton')}
                  </>
                ) : resendSuccess ? (
                  t('emailVerification.resendSuccess')
                ) : (
                  t('emailVerification.resendButton')
                )}
              </Button>
            )}

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('emailVerification.wrongEmail')}{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
              >
                {t('emailVerification.signupAgain')}
              </Link>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('signup.hasAccount')}{' '}
              <Link
                to="/auth/login"
                className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
              >
                {t('login.title')}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
