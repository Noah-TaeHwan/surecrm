import { useState } from 'react';
import { Link, type MetaFunction, redirect } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { AuthLayout } from '~/common/layouts/auth-layout';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { completeOTPVerification } from '~/lib/auth/registration';
import { createServerClient } from '~/lib/core/supabase';

interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    email?: string;
    invitationCode?: string;
    fullName?: string;
    phone?: string;
    company?: string;
    message?: string;
  };
  actionData?: {
    success: boolean;
    error?: string;
    message?: string;
  } | null;
}

const supabase = createServerClient();

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') || '';
  const invitationCode = url.searchParams.get('invitation_code') || '';
  const fullName = url.searchParams.get('full_name') || '';
  const phone = url.searchParams.get('phone') || '';
  const company = url.searchParams.get('company') || '';
  const message = url.searchParams.get('message') || '';

  // 필수 정보가 없으면 회원가입 페이지로 리다이렉트
  if (!email || !invitationCode || !fullName) {
    throw redirect('/auth/signup');
  }

  return {
    email,
    invitationCode,
    fullName,
    phone,
    company,
    message,
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;

  // OTP 검증 스키마 (서버 측에서는 영어 메시지 사용)
  const otpSchema = z.object({
    otp: z
      .string()
      .min(6, { message: 'Verification code must be 6 digits' })
      .max(6, { message: 'Verification code must be 6 digits' })
      .regex(/^[0-9]+$/, {
        message: 'Verification code must contain only numbers',
      }),
  });

  if (actionType === 'verify') {
    // OTP 검증
    const otp = formData.get('otp') as string;
    const email = formData.get('email') as string;
    const invitationCode = formData.get('invitationCode') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;

    if (!otp || !email || !invitationCode || !fullName) {
      return {
        success: false,
        error: 'Required information is missing.',
      };
    }

    // signUpData 재구성
    const signUpData = {
      email,
      fullName,
      phone: phone || undefined,
      company: company || undefined,
      invitationCode,
      password: '', // OTP 방식에서는 비밀번호 불필요
    };

    const result = await completeOTPVerification(email, otp, signUpData);

    if (result.success) {
      // OTP 인증 성공 시 세션 생성하고 대시보드로 리다이렉트
      const { createUserSession } = await import('~/lib/auth/session');
      return createUserSession(result.user!.id, '/dashboard');
    }

    return {
      success: false,
      error: result.error || 'OTP verification failed.',
    };
  } else if (actionType === 'resend') {
    // OTP 재전송
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        error: 'Email address is missing.',
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // 이미 생성된 사용자
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to resend OTP.',
      };
    }

    return {
      success: true,
      message: 'Verification code has been resent.',
    };
  }

  return {
    success: false,
    error: 'Invalid request.',
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: 'OTP Verification | SureCRM' },
    {
      name: 'description',
      content: 'Enter the verification code sent to your email',
    },
  ];
};

export default function OTPVerificationPage({
  loaderData,
  actionData,
}: ComponentProps) {
  const { t } = useHydrationSafeTranslation('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // OTP 검증 스키마 (클라이언트 측에서는 다국어 메시지 사용)
  const otpSchema = z.object({
    otp: z
      .string()
      .min(6, { message: t('error.invalidOtp') })
      .max(6, { message: t('error.invalidOtp') })
      .regex(/^[0-9]+$/, { message: t('error.invalidOtp') }),
  });

  type OTPFormData = z.infer<typeof otpSchema>;

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleResendOTP = async () => {
    setIsResending(true);

    const formData = new FormData();
    formData.append('actionType', 'resend');
    formData.append('email', loaderData.email || '');

    try {
      const response = await fetch('', {
        method: 'POST',
        body: formData,
      });

      // 페이지 새로고침을 통해 액션 결과 반영
      window.location.reload();
    } catch (error) {
      console.error('OTP resend error:', error);
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
            {t('otp.title')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            {t('otp.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loaderData.message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{loaderData.message}</AlertDescription>
            </Alert>
          )}

          {actionData?.success && actionData.message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{actionData.message}</AlertDescription>
            </Alert>
          )}

          {actionData?.error && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            {loaderData.email && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('otp.instructions')}
              </p>
            )}

            {loaderData.email && (
              <p className="font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                {loaderData.email}
              </p>
            )}

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>{t('otp.codeExpiry')}</p>
            </div>
          </div>

          <Form {...form}>
            <form
              method="post"
              action="/auth/otp-verification"
              className="space-y-6"
            >
              <input type="hidden" name="actionType" value="verify" />
              <input type="hidden" name="email" value={loaderData.email} />
              <input
                type="hidden"
                name="invitationCode"
                value={loaderData.invitationCode}
              />
              <input
                type="hidden"
                name="fullName"
                value={loaderData.fullName}
              />
              <input type="hidden" name="phone" value={loaderData.phone} />
              <input type="hidden" name="company" value={loaderData.company} />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">
                      {t('otp.codeLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t('otp.codePlaceholder')}
                        disabled={isSubmitting}
                        className="text-center text-2xl tracking-widest font-mono"
                        maxLength={6}
                        autoComplete="one-time-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t('otp.verifyingButton')
                  : t('otp.verifyButton')}
              </Button>
            </form>
          </Form>

          <div className="space-y-4">
            <Button
              onClick={handleResendOTP}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('otp.resendingCode')}
                </>
              ) : (
                t('otp.resendCode')
              )}
            </Button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              {t('otp.noCodeReceived')}{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
              >
                {t('otp.backToSignup')}
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
