import { useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
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

// 인터페이스 정의
interface LoaderData {
  isAuthenticated: boolean;
}

interface ActionData {
  success: boolean;
  error: string | null;
}

interface LoaderArgs {
  request: Request;
  params: Record<string, string>;
}

interface ActionArgs {
  request: Request;
  params: Record<string, string>;
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
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 로더 함수 - 이미 로그인되어 있으면 대시보드로 리다이렉트
export function loader({ request }: LoaderArgs): LoaderData {
  // 실제로는 여기서 인증 상태를 확인하고 필요시 리다이렉트합니다
  // 지금은 더미 데이터만 반환
  return {
    isAuthenticated: false,
  };
}

// 액션 함수 - 로그인 폼 제출 처리
export function action({ request }: ActionArgs): ActionData {
  // 실제로는 여기서 폼 데이터를 처리하고 인증을 수행합니다
  // 지금은 더미 데이터만 반환
  return {
    success: true,
    error: null,
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
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 폼 제출 핸들러
  const onSubmit = (data: LoginFormData) => {
    setFormError(null);
    setIsSubmitting(true);

    // 더미 로직 - 실제로는 이 부분이 필요 없습니다
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('로그인 시도:', data);
    }, 1000);
  };

  return (
    <AuthLayout>
      <Card className="w-full border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            로그인
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            계정에 로그인하여 SureCRM을 이용하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                      <FormLabel>비밀번호</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        비밀번호 찾기
                      </Link>
                    </div>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pt-4">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span>계정이 없으신가요? </span>
            <Link
              to="/invite-only"
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            >
              초대 코드 입력하기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
