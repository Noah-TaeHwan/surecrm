import { useState } from 'react';
import { Link, type MetaFunction, redirect } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AuthLayout } from '~/common/layouts/auth-layout';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
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
import { checkAuthStatus, authenticateUser } from '~/lib/auth/core';
import type { Route } from './+types/login-page';

// 인터페이스 정의
interface LoaderData {
  isAuthenticated: boolean;
  message?: string;
}

interface ActionData {
  success: boolean;
  error: string | null;
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

// Zod 스키마 정의
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: '이메일을 입력해주세요' })
    .email({ message: '유효한 이메일 주소를 입력해주세요' }),
  password: z
    .string()
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

// 액션 함수 - 로그인 폼 제출 처리
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: '이메일과 비밀번호를 모두 입력해주세요.',
    };
  }

  const result = await authenticateUser({ email, password });

  if (result.success && result.user) {
    // 로그인 성공 시 세션 생성하고 대시보드로 리다이렉트
    const { createUserSession } = await import('~/lib/auth/session');
    return createUserSession(result.user.id, '/dashboard');
  }

  return {
    success: false,
    error: result.error || '로그인에 실패했습니다.',
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '로그인 | SureCRM' },
    { name: 'description', content: 'SureCRM에 로그인하세요' },
  ];
};

// 로그인 페이지 컴포넌트
export default function LoginPage({ loaderData, actionData }: ComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <CardHeader className="space-y-1 pb-2 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            로그인
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            계정에 로그인하여 SureCRM을 이용하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 회원가입 성공 메시지 */}
          {loaderData.message === 'signup-success' && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription>
                회원가입이 완료되었습니다! 이제 로그인하세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 이메일 인증 완료 메시지 */}
          {loaderData.message === 'email-verified' && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription>
                이메일 인증이 완료되었습니다! 이제 로그인하세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 로그아웃 메시지 */}
          {loaderData.message === 'logged-out' && (
            <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <AlertDescription>
                성공적으로 로그아웃되었습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 계정 비활성화 메시지 */}
          {loaderData.message === 'account-disabled' && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                계정이 비활성화되었습니다. 관리자에게 문의하세요.
              </AlertDescription>
            </Alert>
          )}

          {actionData?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form method="post" className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>비밀번호</FormLabel>
                      <Link
                        to="/auth/forgot-password"
                        className="text-sm text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
                      >
                        비밀번호를 잊으셨나요?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-sm text-center text-slate-600 dark:text-slate-400">
            계정이 없으신가요?{' '}
            <Link
              to="/invite-only"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            >
              초대 코드로 가입하기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
