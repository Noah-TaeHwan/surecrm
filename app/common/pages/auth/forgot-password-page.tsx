import { useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '~/common/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from '~/lib/auth/password';

// 타입 정의
interface LoaderData {
  error?: string | null;
}

interface ActionData {
  success: boolean;
  error?: string;
  message?: string;
}

interface Route {
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  ComponentProps: {
    loaderData: LoaderData;
    actionData?: ActionData;
  };
}

// Zod 스키마 정의
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: '이메일을 입력해주세요' })
    .email({ message: '유효한 이메일 주소를 입력해주세요' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// 로더 함수
export async function loader({ request }: Route['LoaderArgs']) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');

  // URL 파라미터에서 에러 메시지 처리
  let errorMessage = '';
  switch (error) {
    case 'invalid_link':
      errorMessage = '비밀번호 재설정 링크가 유효하지 않습니다. 새로운 링크를 요청해주세요.';
      break;
    case 'invalid_token':
      errorMessage = '비밀번호 재설정 토큰이 만료되었거나 유효하지 않습니다.';
      break;
    case 'verification_failed':
      errorMessage = '토큰 검증 중 오류가 발생했습니다. 다시 시도해주세요.';
      break;
    case 'session_expired':
      errorMessage = '세션이 만료되었습니다. 비밀번호 재설정을 다시 시도해주세요.';
      break;
  }

  return {
    error: errorMessage || null,
  };
}

// 액션 함수 - 비밀번호 재설정 이메일 발송
export async function action({ request }: Route['ActionArgs']) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return {
      success: false,
      error: '이메일을 입력해주세요.',
    };
  }

  try {
    // 실제 비밀번호 재설정 이메일 발송
    const result = await sendPasswordResetEmail(email);

    if (result.success) {
      return {
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      };
    } else {
      return {
        success: false,
        error: result.error || '이메일 발송에 실패했습니다.',
      };
    }
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '비밀번호 찾기 | SureCRM' },
    { name: 'description', content: 'SureCRM 계정의 비밀번호를 재설정하세요' },
  ];
};

// 비밀번호 찾기 페이지 컴포넌트
export default function ForgotPasswordPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      // 폼 데이터를 FormData로 변환하여 서버 액션에 제출
      const formData = new FormData();
      formData.append('email', data.email);

      // 서버 액션 호출
      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        try {
          const result = await response.json();
          if (result.success) {
            setEmailSent(true);
          }
        } catch (jsonError) {
          // JSON 파싱 실패 시 텍스트로 시도
          const text = await response.text();
          console.warn('JSON 파싱 실패, 텍스트 응답:', text);
          
          // 성공적인 응답이라고 가정하고 이메일 발송 완료 처리
          if (response.status === 200) {
            setEmailSent(true);
          }
        }
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 상태 확인
  const isSuccess = actionData?.success || emailSent;

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" asChild className="p-2">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isSuccess ? '이메일 발송 완료' : '비밀번호 찾기'}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {isSuccess
              ? '비밀번호 재설정 링크를 확인하세요'
              : '가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 에러 메시지 표시 (URL 파라미터 또는 액션에서) */}
          {(loaderData?.error || actionData?.error) && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>
                {loaderData?.error || actionData?.error}
              </AlertDescription>
            </Alert>
          )}

          {/* 성공 메시지 표시 */}
          {isSuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>발송 완료</AlertTitle>
              <AlertDescription>
                {actionData?.message ||
                  '비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.'}
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일 주소</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
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
                    {isSubmitting ? '발송 중...' : '재설정 링크 발송'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {isSuccess && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요</p>
                <p>• 링크는 24시간 동안 유효합니다</p>
                <p>• 문제가 지속되면 고객지원팀에 문의해주세요</p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  form.reset();
                }}
              >
                다른 이메일로 재발송
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span>계정이 기억나셨나요? </span>
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            >
              로그인하기
            </Link>
          </div>
          <div className="mt-2">
            <Link
              to="/invite-only"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
            >
              계정이 없으신가요? 초대 코드로 가입하기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
