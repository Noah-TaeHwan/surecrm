import { useState, useEffect } from 'react';
import { Link, type MetaFunction, useSearchParams } from 'react-router';
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
import { Lock, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// 새 비밀번호 스키마
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
      }),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

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
    { title: '새 비밀번호 설정 | SureCRM' },
    { name: 'description', content: '새로운 비밀번호를 설정하세요' },
  ];
};

// 새 비밀번호 설정 페이지 컴포넌트
export default function NewPasswordPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    console.log('📋 서버 세션 상태:', loaderData?.hasSession ? '✅ 있음' : '❌ 없음');
    console.log('👤 사용자 정보:', loaderData?.user?.email || '없음');
    
    // 서버에서 전달된 디버그 정보 표시
    if (loaderData?.debugInfo) {
      console.log('🔍 [DEBUG] 서버 디버그 정보:', loaderData.debugInfo);
    }
    
    // action에서 redirectUrl이 전달된 경우 리다이렉트
    if (actionData?.redirectUrl) {
      console.log('🔄 [REDIRECT] Action에서 리다이렉트 요청:', actionData.redirectUrl);
      window.location.href = actionData.redirectUrl;
    }
  }, [loaderData, actionData]);

  const onSubmit = async (formData: NewPasswordFormData) => {
    // React Hook Form으로 유효성 검사만 하고
    // 실제 제출은 네이티브 form의 action으로 처리
    console.log('✅ 클라이언트 유효성 검사 통과 - 서버 액션 호출');
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            새 비밀번호 설정
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            계정의 새로운 비밀번호를 설정해주세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 액션 에러 메시지 표시 */}
          {actionData?.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          {/* 성공 메시지 표시 */}
          {actionData?.success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>
                비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            {/* 네이티브 form으로 서버 액션 직접 호출 */}
            <form method="POST" className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="새 비밀번호를 입력하세요"
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
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="비밀번호를 다시 입력하세요"
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
                  {isSubmitting ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </div>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-4">
                <Link
                  to="/auth/login"
                  className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
                >
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
} 