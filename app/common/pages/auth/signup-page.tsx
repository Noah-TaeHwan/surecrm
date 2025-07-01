import { useState, useEffect } from 'react';
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
import { checkAuthStatus } from '~/lib/auth/core.server';
import { signUpUser } from '~/lib/auth/registration';

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

  // Zod 스키마 정의 (서버 측에서는 영어 메시지 사용)
  const signUpSchema = z
    .object({
      invitationCode: z
        .string()
        .min(1, { message: 'Please enter an invitation code' }),
      email: z
        .string()
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Please enter a valid email address' }),
      password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
          message: 'Password must include uppercase, lowercase, and numbers',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Please confirm your password' }),
      fullName: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters' }),
      phone: z.string().optional(),
      company: z.string().optional(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

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
      error: 'Please fill in all required fields.',
    };
  }

  // 비밀번호 일치 검증
  if (signUpData.password !== signUpData.confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match.',
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
      error: 'Input data is not valid.',
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
          'Registration request completed. Please enter the verification code sent to your email.'
        )}`
      );
    }

    // OTP 인증이 완료된 경우 (드물지만 OTP가 비활성화된 경우)
    throw redirect('/auth/login?message=signup-success');
  }

  return {
    success: false,
    error: result.error || 'Registration failed.',
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: 'Sign Up | SureCRM' },
    { name: 'description', content: 'Join SureCRM with your invitation code' },
  ];
};

// 회원가입 페이지 컴포넌트
export default function SignUpPage({ loaderData, actionData }: ComponentProps) {
  const { t } = useHydrationSafeTranslation('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);

  // Zod 스키마 정의 (클라이언트 측에서는 다국어 메시지 사용)
  const signUpSchema = z
    .object({
      invitationCode: z
        .string()
        .min(1, { message: t('error.invitationRequired') }),
      email: z
        .string()
        .min(1, { message: t('error.emailRequired') })
        .email({ message: t('error.invalidEmail') }),
      password: z
        .string()
        .min(6, { message: t('error.passwordTooShort') })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
          message: t('error.passwordComplexity'),
        }),
      confirmPassword: z
        .string()
        .min(1, { message: t('error.passwordRequired') }),
      fullName: z.string().min(2, { message: t('error.nameTooShort') }),
      phone: z.string().optional(),
      company: z.string().optional(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('error.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type SignUpFormData = z.infer<typeof signUpSchema>;

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
            t('error.invalidInvitation');
          form.setError('invitationCode', {
            type: 'manual',
            message: errorMessage,
          });
        } else {
          form.clearErrors('invitationCode');
        }
      } catch (error) {
        console.error('Invitation code validation error:', error);
        setInvitationValid(false);
        form.setError('invitationCode', {
          type: 'manual',
          message: t('error.invitationValidationError'),
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
        message: t('error.invalidInvitation'),
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
            {t('signup.title')}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2 sm:px-0">
            {t('signup.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {actionData?.error && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="text-sm">
                {actionData.error}
                {actionData.error.includes('already registered') && (
                  <div className="mt-2">
                    <Link
                      to="/auth/login"
                      className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
                    >
                      {t('signup.loginLink')}
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
                      {t('signup.invitationCodeLabel')}{' '}
                      {t('signup.requiredField')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('signup.invitationCodePlaceholder')}
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
                        {t('signup.validInvitationCode')}
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
                      {t('signup.nameLabel')} {t('signup.requiredField')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('signup.namePlaceholder')}
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
                      {t('signup.emailLabel')} {t('signup.requiredField')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('signup.emailPlaceholder')}
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
                      {t('signup.phoneLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder={t('signup.phonePlaceholder')}
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
                      {t('signup.companyLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('signup.companyPlaceholder')}
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
                      {t('signup.passwordLabel')} {t('signup.requiredField')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('signup.passwordPlaceholder')}
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
                      {t('signup.confirmPasswordLabel')}{' '}
                      {t('signup.requiredField')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('signup.confirmPasswordPlaceholder')}
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
                {isSubmitting
                  ? t('signup.signingUp')
                  : t('signup.signupButton')}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-2">
          <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400">
            {t('signup.hasAccount')}{' '}
            <Link
              to="/auth/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 underline-offset-4 hover:underline"
            >
              {t('login.title')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
