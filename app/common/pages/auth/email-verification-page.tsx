import { useState, useEffect } from 'react';
import { Link, type MetaFunction } from 'react-router';
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
    { title: '이메일 인증 | SureCRM' },
    { name: 'description', content: '이메일 인증을 완료해주세요' },
  ];
};

export default function EmailVerificationPage({ loaderData }: ComponentProps) {
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
        setResendError(result.error || '이메일 재전송에 실패했습니다.');
      }
    } catch (error) {
      setResendError('이메일 재전송 중 오류가 발생했습니다.');
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
            이메일 인증
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            회원가입을 완료하기 위해 이메일 인증이 필요합니다
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
                다음 이메일 주소로 인증 링크를 전송했습니다:
              </p>
            )}

            {loaderData.email && (
              <p className="font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                {loaderData.email}
              </p>
            )}

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>이메일함을 확인하고 인증 링크를 클릭해주세요.</p>
              <p>스팸함도 확인해보시기 바랍니다.</p>
            </div>
          </div>

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                인증 이메일을 다시 전송했습니다. 이메일함을 확인해주세요.
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
                    재전송 중...
                  </>
                ) : resendSuccess ? (
                  '이메일이 재전송되었습니다'
                ) : (
                  '인증 이메일 다시 보내기'
                )}
              </Button>
            )}

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              이메일 주소가 잘못되었나요?{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
              >
                다시 가입하기
              </Link>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
              >
                로그인
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
