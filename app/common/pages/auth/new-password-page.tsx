import { useState, useEffect } from 'react';
import { Link, type MetaFunction, useSearchParams } from 'react-router';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '~/common/components/ui/alert';
import { PasswordSuccessModal } from '~/common/components/ui/password-success-modal';
import { Lock, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// 타입 정의
interface Route {
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  ComponentProps: {
    loaderData?: any;
    actionData?: {
      success?: boolean;
      error?: string;
      redirectUrl?: string;
    };
  };
  MetaFunction: () => Array<{
    title?: string;
    description?: string;
    [key: string]: any;
  }>;
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Set New Password | SureCRM' },
    { name: 'description', content: 'Set your new password' },
  ];
};

// 새 비밀번호 설정 페이지 컴포넌트
export default function NewPasswordPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 새 비밀번호 스키마 (클라이언트 측에서는 다국어 메시지 사용)
  const newPasswordSchema = z
    .object({
      password: z
        .string()
        .min(6, t('error.weakPassword'))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
          message: t('error.passwordComplexity'),
        }),
      confirmPassword: z.string().min(1, t('error.confirmPasswordRequired')),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('error.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // 페이지 로드 시 세션 상태 디버깅
    console.log('🔐 NEW-PASSWORD 페이지 로드됨');
    console.log(
      '📋 서버 세션 상태:',
      loaderData?.hasSession ? '✅ 있음' : '❌ 없음'
    );
    console.log('👤 사용자 정보:', loaderData?.user?.email || '없음');

    // 서버에서 전달된 디버그 정보 표시
    if (loaderData?.debugInfo) {
      console.log('🔍 [DEBUG] 서버 디버그 정보:', loaderData.debugInfo);
    }

    // action에서 redirectUrl이 전달된 경우 리다이렉트
    if (actionData?.redirectUrl) {
      console.log(
        '🔄 [REDIRECT] Action에서 리다이렉트 요청:',
        actionData.redirectUrl
      );
      window.location.href = actionData.redirectUrl;
    }

    // 비밀번호 변경 성공 시 모달 표시
    if (actionData?.success) {
      console.log('🎉 [SUCCESS] 비밀번호 변경 성공 - 모달 표시');
      setShowSuccessModal(true);
    }
  }, [loaderData, actionData]);

  const onSubmit = async (formData: NewPasswordFormData) => {
    console.log('✅ 클라이언트 유효성 검사 통과 - 서버 액션 호출');
    setIsSubmitting(true);

    try {
      // fetch API로 서버 액션 호출 (페이지 새로고침 방지)
      const formBody = new FormData();
      formBody.append('password', formData.password);
      formBody.append('confirmPassword', formData.confirmPassword);

      const response = await fetch('/api/auth/new-password', {
        method: 'POST',
        body: formBody,
      });

      console.log(
        '📨 [CLIENT] 응답 상태:',
        response.status,
        response.statusText
      );

      let result;
      try {
        // Content-Type 확인
        const contentType = response.headers.get('content-type');
        console.log('📋 [CLIENT] Content-Type:', contentType);

        if (contentType?.includes('application/json')) {
          result = await response.json();
        } else {
          // JSON이 아닌 경우 텍스트로 읽기
          const text = await response.text();
          console.log(
            '📄 [CLIENT] 응답 텍스트 (처음 200자):',
            text.substring(0, 200)
          );

          // HTML 응답인 경우 에러로 처리
          if (text.includes('<!DOCTYPE')) {
            throw new Error(
              `서버가 HTML 페이지를 반환했습니다. 상태: ${response.status}`
            );
          }

          result = {
            success: false,
            error: `예상치 못한 응답 형식: ${response.status}`,
          };
        }
      } catch (parseError) {
        console.error('❌ [CLIENT] 응답 파싱 실패:', parseError);
        throw new Error(
          `응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 파싱 에러'}`
        );
      }

      console.log('📨 [CLIENT] 파싱된 결과:', result);

      if (result.success) {
        console.log('🎉 [SUCCESS] 비밀번호 변경 성공 - 모달 표시');
        setShowSuccessModal(true);
      } else {
        console.error('❌ [ERROR] 비밀번호 변경 실패:', result.error);
        // 에러는 React Hook Form에서 처리하거나 상태로 관리
        form.setError('root', {
          message: result.error || t('error.passwordUpdateFailed'),
        });
      }
    } catch (error) {
      console.error('💥 [CLIENT] 네트워크 오류:', error);
      form.setError('root', {
        message: t('error.networkError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {/* 성공 모달 */}
      <PasswordSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('newPassword.title')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {t('newPassword.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 클라이언트 에러 메시지 표시 (React Hook Form) */}
          {form.formState.errors.root && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{t('error.title')}</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* 액션 에러 메시지 표시 (서버 액션에서 온 경우) */}
          {actionData?.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{t('error.title')}</AlertTitle>
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          {/* 성공 메시지 표시 */}
          {actionData?.success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>{t('success.title')}</AlertTitle>
              <AlertDescription>
                {t('success.passwordUpdated')}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            {/* React Hook Form으로 제출 (페이지 새로고침 방지) */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword.newPasswordLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('newPassword.newPasswordPlaceholder')}
                          name="password"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('newPassword.confirmPasswordLabel')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t(
                            'newPassword.confirmPasswordPlaceholder'
                          )}
                          name="confirmPassword"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t('newPassword.updatingButton')
                    : t('newPassword.updateButton')}
                </Button>
              </div>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-4">
                <Link
                  to="/auth/login"
                  className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
                >
                  {t('forgot.backToLogin')}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
