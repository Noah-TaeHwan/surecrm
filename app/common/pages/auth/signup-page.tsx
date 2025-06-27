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
import { checkAuthStatus } from '~/lib/auth/core.server';
import { signUpUser } from '~/lib/auth/registration';

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
  .refine(data => data.password === data.confirmPassword, {
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
    confirmPassword: formData.get('confirmPassword') as string,
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || undefined,
    company: (formData.get('company') as string) || undefined,
  };

  // 필수 필드 검증
  if (
    !signUpData.invitationCode ||
    !signUpData.email ||
    !signUpData.password ||
    !signUpData.confirmPassword ||
    !signUpData.fullName
  ) {
    return {
      success: false,
      error: '필수 정보를 모두 입력해주세요.',
    };
  }

  // 비밀번호 일치 검증
  if (signUpData.password !== signUpData.confirmPassword) {
    return {
      success: false,
      error: '비밀번호가 일치하지 않습니다.',
    };
  }

  // Zod 스키마로 전체 검증
  try {
    signUpSchema.parse(signUpData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    return {
      success: false,
      error: '입력 데이터가 유효하지 않습니다.',
    };
  }

  const result = await signUpUser({
    invitationCode: signUpData.invitationCode,
    email: signUpData.email,
    password: signUpData.password,
    fullName: signUpData.fullName,
    phone: signUpData.phone,
    company: signUpData.company,
  });

  if (result.success && result.user) {
    // OTP 인증이 필요한 경우 (isActive가 false인 경우)
    if (!result.user.isActive) {
      // OTP 인증 페이지로 리다이렉트 (signUpData도 함께 전달)
      throw redirect(
        `/auth/otp-verification?email=${encodeURIComponent(
          signUpData.email
        )}&invitation_code=${encodeURIComponent(
          signUpData.invitationCode
        )}&full_name=${encodeURIComponent(
          signUpData.fullName
        )}&phone=${encodeURIComponent(
          signUpData.phone || ''
        )}&company=${encodeURIComponent(
          signUpData.company || ''
        )}&message=${encodeURIComponent(
          '회원가입 요청이 완료되었습니다. 이메일로 받은 인증 코드를 입력해주세요.'
        )}`
      );
    }

    // OTP 인증이 완료된 경우 (드물지만 OTP가 비활성화된 경우)
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
        const response = await fetch('/api/auth/validate-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const validation = await response.json();

        // API 응답 구조에 맞게 수정: validation.data.valid 확인
        const isValid = validation.success && validation.data?.valid;
        setInvitationValid(isValid);

        if (!isValid) {
          const errorMessage =
            validation.data?.error ||
            validation.error ||
            '유효하지 않은 초대 코드입니다';
          form.setError('invitationCode', {
            type: 'manual',
            message: errorMessage,
          });
        } else {
          form.clearErrors('invitationCode');
        }
      } catch (error) {
        console.error('초대 코드 검증 오류:', error);
        setInvitationValid(false);
        form.setError('invitationCode', {
          type: 'manual',
          message: '초대 코드 검증 중 오류가 발생했습니다',
        });
      }
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);

    // 초대 코드 검증
    if (!invitationValid) {
      form.setError('invitationCode', {
        message: '유효하지 않은 초대 코드입니다.',
      });
      setIsSubmitting(false);
      return;
    }

    // React Router의 submit을 사용하여 action 함수 호출
    const formData = new FormData();
    formData.append('invitationCode', data.invitationCode);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('fullName', data.fullName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.company) formData.append('company', data.company);

    // React Router의 submit 함수 사용
    const submitForm = document.createElement('form');
    submitForm.method = 'POST';
    submitForm.style.display = 'none';

    // FormData의 모든 항목을 hidden input으로 추가
    for (const [key, value] of formData.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      submitForm.appendChild(input);
    }

    document.body.appendChild(submitForm);
    submitForm.submit();
  };

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 flex flex-col items-center">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
            회원가입
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2 sm:px-0">
            초대 코드로 SureCRM에 가입하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {actionData?.error && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                {actionData.error}
                {actionData.error.includes('이미 등록된 이메일') && (
                  <div className="mt-2">
                    <Link
                      to="/auth/login"
                      className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
                    >
                      로그인 페이지로 이동하기
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4"
            >
              {form.formState.errors.root && (
                <Alert variant="destructive" className="mb-3 sm:mb-4">
                  <AlertDescription className="text-sm">
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      초대 코드 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="INV-XXXXXX-XXXXXX"
                        disabled={isSubmitting}
                        onBlur={handleInvitationCodeBlur}
                        className={`h-10 sm:h-11 lg:h-12 text-sm sm:text-base ${
                          invitationValid === true
                            ? 'border-green-500'
                            : invitationValid === false
                              ? 'border-red-500'
                              : ''
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                    {invitationValid === true && (
                      <p className="text-xs sm:text-sm text-green-600">
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
                    <FormLabel className="text-sm sm:text-base">
                      이름 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="홍길동"
                        disabled={isSubmitting}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      이메일 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      전화번호
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="010-1234-5678"
                        disabled={isSubmitting}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      회사명
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="회사명을 입력하세요"
                        disabled={isSubmitting}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
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
                      비밀번호 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      비밀번호 확인 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
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
                disabled={isSubmitting || invitationValid !== true}
              >
                {isSubmitting ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-2">
          <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 underline-offset-4 hover:underline"
            >
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
