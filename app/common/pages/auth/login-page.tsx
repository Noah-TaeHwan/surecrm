import { useState } from 'react';
import { Link, type MetaFunction, redirect } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { checkAuthStatus, authenticateUser } from '~/lib/auth/core';
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

// Zod 스키마 정의 (클래식 이메일/비밀번호 방식)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: '이메일을 입력해주세요' })
    .email({ message: '유효한 이메일 주소를 입력해주세요' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
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

// 액션 함수 - 클래식 이메일/비밀번호 로그인 처리
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: '이메일과 비밀번호를 입력해주세요.',
    };
  }

  // 이메일/비밀번호 형식 검증
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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleDiagnose = async () => {
    if (!email) {
      alert('진단하려면 이메일을 먼저 입력하세요');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      
      const response = await fetch('/api/auth/diagnose', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('진단 결과:', result);
      alert(`진단 완료! 콘솔을 확인하세요.\n\n상태: ${result.diagnosis?.diagnosis || 'UNKNOWN'}`);
    } catch (error) {
      console.error('진단 오류:', error);
      alert('진단 중 오류가 발생했습니다.');
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ 비밀번호 재설정 이메일을 ${email}로 발송했습니다!\n\n이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정하세요.`);
      } else {
        alert(`❌ 오류: ${result.error || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      alert('❌ 비밀번호 재설정 중 오류가 발생했습니다.');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-4 sm:pb-6 flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">
            로그인
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center px-2 sm:px-0">
            이메일과 비밀번호로 SureCRM에 로그인하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 회원가입 성공 메시지 */}
          {loaderData.message === 'signup-success' && (
            <Alert className="mb-3 sm:mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription className="text-sm">
                회원가입이 완료되었습니다! 이제 로그인하세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 이메일 인증 완료 메시지 */}
          {loaderData.message === 'email-verified' && (
            <Alert className="mb-3 sm:mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <AlertDescription className="text-sm">
                이메일 인증이 완료되었습니다! 이제 로그인하세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 로그아웃 메시지 */}
          {loaderData.message === 'logged-out' && (
            <Alert className="mb-3 sm:mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-sm">
                성공적으로 로그아웃되었습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 계정 비활성화 메시지 */}
          {loaderData.message === 'account-disabled' && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                계정이 비활성화되었습니다. 관리자에게 문의하세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 에러 메시지 */}
          {actionData?.error && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form method="post" className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">이메일 주소</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                        autoComplete="email"
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                        {...field}
                        onChange={(e) => {
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
                    <FormLabel className="text-sm sm:text-base">비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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
                            {showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    로그인
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
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 개발 환경에서만 보이는 진단 도구 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                🔧 개발자 도구
              </h3>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleDiagnose}
                  className="w-full text-xs"
                >
                  🔍 로그인 문제 진단 (DEV)
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePasswordReset(email)}
                  disabled={!email}
                  className="w-full text-xs"
                >
                  🔑 비밀번호 재설정 이메일 발송 (DEV)
                </Button>
                
                {/* 토큰 테스트 기능 추가 */}
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚡ 빠른 토큰 테스트:
                  </p>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // 이전 이메일에서 받은 토큰으로 디버그 모드 테스트
                        const testUrl = 'http://localhost:5173/auth/confirm?token_hash=e584d613465cc6706392517f242370bfe718229fee59deaca84d7421&type=recovery&debug=true';
                        window.open(testUrl, '_blank');
                      }}
                      className="w-full text-xs"
                    >
                      🧪 이전 토큰으로 디버그 테스트 (DEV)
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!email) {
                          alert('이메일을 먼저 입력해주세요!');
                          return;
                        }
                        
                        try {
                          // 새 토큰 생성
                          const response = await fetch('/api/auth/reset-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          
                          const result = await response.json();
                          
                          if (result.success) {
                            alert(`✅ 새 토큰이 ${email}로 발송되었습니다!\n\n이메일을 확인하고 링크에 &debug=true를 추가해서 접속하세요.\n\n예: ...&type=recovery&debug=true`);
                          } else {
                            alert(`❌ 오류: ${result.error}`);
                          }
                        } catch (error) {
                          console.error('토큰 생성 오류:', error);
                          alert('❌ 새 토큰 생성 중 오류가 발생했습니다.');
                        }
                      }}
                      className="w-full text-xs"
                    >
                      🔄 새 토큰 생성 + 디버그 안내 (DEV)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-2">
          <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
            계정이 없으신가요?{' '}
            <Link
              to="/invite-only"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 underline-offset-4 hover:underline"
            >
              초대 코드로 가입하기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
