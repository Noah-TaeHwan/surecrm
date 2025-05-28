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
import { Separator } from '~/common/components/ui/separator';
import { validateInviteCode } from '~/lib/public-data';
import type { Route } from './+types/invite-page';

// 인터페이스 정의
interface LoaderData {
  inviteCode: string;
  invitedBy: {
    name: string;
    email: string;
  };
  isValid: boolean;
  message?: string;
}

interface LoaderArgs {
  request: Request;
  params: {
    code: string;
  };
}

// Zod 스키마 정의
const signupSchema = z
  .object({
    name: z.string().min(1, { message: '이름을 입력해주세요' }),
    email: z
      .string()
      .min(1, { message: '이메일을 입력해주세요' })
      .email({ message: '유효한 이메일 주소를 입력해주세요' }),
    password: z
      .string()
      .min(1, { message: '비밀번호를 입력해주세요' })
      .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' }),
    confirmPassword: z
      .string()
      .min(1, { message: '비밀번호를 다시 입력해주세요' }),
    company: z.string().min(1, { message: '소속 보험사를 입력해주세요' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// 로더 함수 - 초대 코드 검증
export async function loader({ params }: Route.LoaderArgs) {
  const inviteCode = params.code;

  if (!inviteCode) {
    return {
      inviteCode: '',
      invitedBy: {
        name: '알 수 없음',
        email: '',
      },
      isValid: false,
      message: '초대 코드가 제공되지 않았습니다.',
    };
  }

  // 실제 데이터베이스에서 초대 코드 검증
  const validationResult = await validateInviteCode(inviteCode);

  return {
    inviteCode,
    invitedBy: validationResult.invitedBy || {
      name: '알 수 없음',
      email: '',
    },
    isValid: validationResult.isValid,
    message: validationResult.message,
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '초대 수락 | SureCRM' },
    { name: 'description', content: 'SureCRM 초대를 수락하고 회원가입하세요' },
  ];
};

// 초대 수락 페이지 컴포넌트
export default function InvitePage({ loaderData }: Route.ComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
    },
  });

  const onSubmit = (data: SignupFormData) => {
    setIsSubmitting(true);

    // 더미 로직 - 실제로는 여기서 API 호출을 통해 회원가입을 처리합니다
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('회원가입 시도:', {
        ...data,
        inviteCode: loaderData.inviteCode,
      });
      alert('회원가입이 완료되었습니다!');
      window.location.href = '/dashboard';
    }, 1500);
  };

  // 유효하지 않은 초대 코드인 경우
  if (!loaderData.isValid) {
    return (
      <AuthLayout>
        <Card className="w-full bg-transparent border-none shadow-none">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTitle>유효하지 않은 초대 코드</AlertTitle>
              <AlertDescription>
                {loaderData.message ||
                  '제공된 초대 코드가 유효하지 않거나 만료되었습니다.'}
              </AlertDescription>
            </Alert>

            <div className="flex justify-center mt-6">
              <Button variant="outline" asChild>
                <Link to="/invite-only">초대장 안내 페이지로 이동</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-2">
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            <AlertDescription className="flex justify-center items-center">
              <strong>{loaderData.invitedBy.name}</strong>님이 SureCRM에
              초대했습니다.
            </AlertDescription>
          </Alert>

          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
            회원가입
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            아래 정보를 입력하여 SureCRM 계정을 생성하세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
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
                    <FormLabel>이메일</FormLabel>
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
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
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
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
                    <FormLabel>소속 보험사</FormLabel>
                    <FormControl>
                      <Input placeholder="OO생명" {...field} />
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
                  {isSubmitting ? '가입 중...' : '가입하기'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span>이미 계정이 있으신가요? </span>
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            >
              로그인하기
            </Link>
          </div>
          <div>
            <Link
              to="/terms"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
            >
              이용약관 및 개인정보처리방침
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
