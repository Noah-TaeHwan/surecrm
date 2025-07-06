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
  CardFooter,
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
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { checkAuthStatus, authenticateUser } from '~/lib/auth/core.server';
import { createUserSession } from '~/lib/auth/session';
import type { Route } from './+types/login-page';

// 인터페이스 정의
interface LoaderData {
  isAuthenticated: boolean;
  message?: string;
}

interface ActionData {
  success: boolean;
  error?: string;
  message?: string;
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

// 로더 함수 - 이미 로그인되어 있으면 대시보드로 리다이렉트
export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await checkAuthStatus(request);

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  // URL에서 메시지 파라미터 추출
  const url = new URL(request.url);
  const message = url.searchParams.get('message') || '';

  return {
    isAuthenticated: false,
    message,
  };
}

// 액션 함수 - 클래식 이메일/비밀번호 로그인 처리
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: 'Please enter both email and password.',
    };
  }

  // 이메일/비밀번호 형식 검증
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: 'Please enter your email' })
      .email({ message: 'Please enter a valid email address' }),
    password: z.string().min(1, { message: 'Please enter your password' }),
  });

  const loginValidation = loginSchema.safeParse({ email, password });
  if (!loginValidation.success) {
    const firstError = loginValidation.error.errors[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  // 클래식 이메일/비밀번호 로그인 시도
  const result = await authenticateUser({ email, password });

  if (result.success && result.user) {
    // React Router 세션 설정과 함께 대시보드로 리다이렉트
    return await createUserSession(result.user.id, '/dashboard');
  }

  return {
    success: false,
    error: result.error || 'Sign in failed.',
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: 'Sign In | SureCRM' },
    { name: 'description', content: 'Sign in to SureCRM' },
  ];
};

// 로그인 페이지 컴포넌트
export default function LoginPage({ loaderData, actionData }: ComponentProps) {
  const { t } = useHydrationSafeTranslation('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  // Zod 스키마 정의 (다국어 메시지)
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('error.emailRequired') })
      .email({ message: t('error.invalidEmail') }),
    password: z.string().min(1, { message: t('error.passwordRequired') }),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-4 sm:pb-6 flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">
            {t('login.title')}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center px-2 sm:px-0">
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 회원가입 성공 메시지 */}
          {loaderData.message === 'signup-success' && (
            <Alert className="mb-3 sm:mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription className="text-sm">
                {t('messages.signupSuccess')}
              </AlertDescription>
            </Alert>
          )}

          {/* 이메일 인증 완료 메시지 */}
          {loaderData.message === 'email-verified' && (
            <Alert className="mb-3 sm:mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription className="text-sm">
                {t('messages.emailVerified')}
              </AlertDescription>
            </Alert>
          )}

          {/* 로그아웃 메시지 */}
          {loaderData.message === 'logged-out' && (
            <Alert className="mb-3 sm:mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-sm">
                {t('messages.loggedOut')}
              </AlertDescription>
            </Alert>
          )}

          {/* 계정 비활성화 메시지 */}
          {loaderData.message === 'account-disabled' && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                {t('messages.accountDisabled')}
              </AlertDescription>
            </Alert>
          )}

          {/* 에러 메시지 */}
          {actionData?.error && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                {actionData.error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              method="post"
              action="/login"
              className="space-y-4 sm:space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      {t('login.emailLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('login.emailPlaceholder')}
                        disabled={isSubmitting}
                        autoComplete="email"
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          setEmail(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      {t('login.passwordLabel')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('login.passwordPlaceholder')}
                          disabled={isSubmitting}
                          autoComplete="current-password"
                          className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword
                              ? t('login.hidePassword')
                              : t('login.showPassword')}
                          </span>
                        </Button>
                      </div>
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
                {isSubmitting ? (
                  <>
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                    {t('login.loggingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    {t('login.loginButton')}
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* 비밀번호 찾기 링크 */}
          <div className="mt-3 sm:mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline underline-offset-4"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-2">
          <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
            {t('login.noAccount')}{' '}
            <Link
              to="/invite-only"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 underline-offset-4 hover:underline"
            >
              {t('login.signupLink')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
