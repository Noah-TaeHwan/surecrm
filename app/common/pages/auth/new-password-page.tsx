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
import { Lock, CheckCircle } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: NewPasswordFormData) => {
    setIsSubmitting(true);
    console.log('새 비밀번호 설정:', data);
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
          {/* 에러 메시지 표시 */}
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
              <AlertTitle>설정 완료</AlertTitle>
              <AlertDescription>
                비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동하세요.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              method="post"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="새 비밀번호를 입력하세요"
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
                        placeholder="비밀번호를 다시 입력하세요"
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
                  disabled={isSubmitting || actionData?.success}
                >
                  {isSubmitting ? '설정 중...' : '비밀번호 설정'}
                </Button>
              </div>
            </form>
          </Form>

          {actionData?.success && (
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/auth/login">로그인 페이지로 이동</Link>
              </Button>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground space-y-2">
            <p className="font-medium">비밀번호 요구사항:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>최소 6자 이상</li>
              <li>대문자 1개 이상 포함</li>
              <li>소문자 1개 이상 포함</li>
              <li>숫자 1개 이상 포함</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
} 