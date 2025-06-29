import { useState } from 'react';
import { Link, type MetaFunction, redirect, useNavigate } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '~/common/layouts/auth-layout';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/common/components/ui/form';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Separator } from '~/common/components/ui/separator';
import { getInvitationStats } from '~/lib/data/business/invitations';
import { checkAuthStatus } from '~/lib/auth/core.server';

interface LoaderArgs {
  request: Request;
}

interface InviteStats {
  pending: number;
  used: number;
  expired: number;
  total: number;
}

// Loader 함수 - 초대 통계 데이터 가져오기
export async function loader({ request }: LoaderArgs) {
  try {
    // 인증 상태 확인 - 이미 로그인한 사용자는 대시보드로 리다이렉트
    const isAuthenticated = await checkAuthStatus(request);

    if (isAuthenticated) {
      throw redirect('/dashboard');
    }

    // 새로운 invitation-utils 함수 사용
    const inviteStats = await getInvitationStats();

    return {
      inviteStats,
    };
  } catch (error) {
    // 리다이렉트 에러는 다시 throw
    if (error instanceof Response) {
      throw error;
    }

    console.error('초대 통계 데이터 로드 실패:', error);
    return {
      inviteStats: {
        pending: 0,
        used: 0,
        expired: 0,
        total: 0,
      } as InviteStats,
    };
  }
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: 'Invite-Only Service | SureCRM' },
    { name: 'description', content: 'SureCRM is an invite-only service' },
  ];
};

interface ComponentProps {
  loaderData: { inviteStats: InviteStats };
}

export default function InviteOnlyPage({ loaderData }: ComponentProps) {
  const { t } = useTranslation('auth');
  const { inviteStats } = loaderData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Zod 스키마 정의 (클라이언트 측에서는 다국어 메시지 사용)
  const inviteCodeSchema = z.object({
    inviteCode: z
      .string()
      .min(1, { message: t('error.invitationCodeRequired') }),
  });

  type InviteCodeFormData = z.infer<typeof inviteCodeSchema>;

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<InviteCodeFormData>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  // 클라이언트 사이드 초대 코드 검증
  const handleFormSubmit = async (data: InviteCodeFormData) => {
    setIsSubmitting(true);
    setClientError(null);

    try {
      // 클라이언트 사이드에서 먼저 검증
      const response = await fetch('/api/auth/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: data.inviteCode }),
      });

      const validation = await response.json();

      // API 응답 구조에 맞게 수정: validation.data.valid 또는 validation.success && validation.data?.valid 확인
      if (!validation.success || !validation.data?.valid) {
        const errorMessage =
          validation.data?.error ||
          validation.error ||
          t('error.invalidInvitationCode');
        setClientError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 유효한 경우 직접 리다이렉트
      navigate(`/auth/signup?code=${encodeURIComponent(data.inviteCode)}`);
    } catch (error) {
      console.error('초대 코드 검증 오류:', error);
      setClientError(t('error.invitationValidationError'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 text-center">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t('inviteOnly.title')}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2 sm:px-0">
            {t('inviteOnly.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 오류 메시지 표시 (서버 또는 클라이언트) */}
          {clientError && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                {clientError}
              </AlertDescription>
            </Alert>
          )}

          <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
            <Form {...form}>
              <form
                className="space-y-3 sm:space-y-4"
                onSubmit={form.handleSubmit(handleFormSubmit)}
              >
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('inviteOnly.placeholder')}
                          disabled={isSubmitting}
                          className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t('inviteOnly.verifyingButton')
                    : t('inviteOnly.submitButton')}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center">
          <Separator className="my-3 sm:my-4" />
          <div className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>{t('inviteOnly.hasAccount')} </span>
            <Link
              to="/auth/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 underline-offset-4 hover:underline"
            >
              {t('inviteOnly.loginLink')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
