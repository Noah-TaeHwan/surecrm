import { useState, useEffect } from 'react';
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
import { checkAuthStatus, signUpUser } from '~/lib/auth';

// Zod 스키마 정의
const signUpSchema = z
  .object({
    invitationCode: z.string().min(1, { message: '초대 코드를 입력해주세요' }),
    email: z
      .string()
      .min(1, { message: '이메일을 입력해주세요' })
      .email({ message: '유효한 이메일 주소를 입력해주세요' }),
    password: z
      .string()
      .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: '비밀번호 확인을 입력해주세요' }),
    fullName: z
      .string()
      .min(2, { message: '이름은 최소 2자 이상이어야 합니다' }),
    phone: z.string().optional(),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    isAuthenticated: boolean;
    invitationCode?: string;
  };
  actionData?: { success: boolean; error?: string } | null;
}

// 로더 함수 - 이미 로그인되어 있으면 대시보드로 리다이렉트
export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await checkAuthStatus(request);

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  // URL에서 초대 코드 파라미터 추출
  const url = new URL(request.url);
  const invitationCode = url.searchParams.get('code') || '';

  return {
    isAuthenticated: false,
    invitationCode,
  };
}

// 액션 함수 - 회원가입 폼 제출 처리
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const signUpData = {
    invitationCode: formData.get('invitationCode') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || undefined,
    company: (formData.get('company') as string) || undefined,
  };

  // 필수 필드 검증
  if (
    !signUpData.invitationCode ||
    !signUpData.email ||
    !signUpData.password ||
    !signUpData.fullName
  ) {
    return {
      success: false,
      error: '필수 정보를 모두 입력해주세요.',
    };
  }

  const result = await signUpUser(signUpData);

  if (result.success && result.user) {
    // 회원가입 성공 시 로그인 페이지로 리다이렉트
    throw redirect('/auth/login?message=signup-success');
  }

  return {
    success: false,
    error: result.error || '회원가입에 실패했습니다.',
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '회원가입 | SureCRM' },
    { name: 'description', content: '초대 코드로 SureCRM에 가입하세요' },
  ];
};

// 회원가입 페이지 컴포넌트
export default function SignUpPage({ loaderData, actionData }: ComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      invitationCode: loaderData.invitationCode || '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      company: '',
    },
  });

  // 초대 코드가 URL에서 왔을 때 자동 검증
  useEffect(() => {
    if (loaderData.invitationCode) {
      handleInvitationCodeBlur();
    }
  }, [loaderData.invitationCode]);

  // 초대 코드 검증 - API 호출로 변경
  const handleInvitationCodeBlur = async () => {
    const code = form.getValues('invitationCode');
    if (code) {
      try {
        const response = await fetch('/api/validate-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const validation = await response.json();
        setInvitationValid(validation.valid);

        if (!validation.valid) {
          form.setError('invitationCode', {
            type: 'manual',
            message: validation.error || '유효하지 않은 초대 코드입니다',
          });
        } else {
          form.clearErrors('invitationCode');
        }
      } catch (error) {
        setInvitationValid(false);
        form.setError('invitationCode', {
          type: 'manual',
          message: '초대 코드 검증 중 오류가 발생했습니다',
        });
      }
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            회원가입
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            초대 코드로 SureCRM에 가입하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {actionData?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form method="post" className="space-y-4">
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>초대 코드 *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        name="invitationCode"
                        placeholder="INV-XXXXXX-XXXXXX"
                        disabled={isSubmitting}
                        defaultValue={loaderData.invitationCode}
                        onBlur={handleInvitationCodeBlur}
                        className={
                          invitationValid === true
                            ? 'border-green-500'
                            : invitationValid === false
                            ? 'border-red-500'
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {invitationValid === true && (
                      <p className="text-sm text-green-600">
                        ✓ 유효한 초대 코드입니다
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        name="fullName"
                        placeholder="홍길동"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일 *</FormLabel>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="010-1234-5678"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>회사명</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        name="company"
                        placeholder="회사명을 입력하세요"
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
                    <FormLabel>비밀번호 *</FormLabel>
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인 *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || invitationValid !== true}
              >
                {isSubmitting ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-sm text-center text-slate-600 dark:text-slate-400">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            >
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
