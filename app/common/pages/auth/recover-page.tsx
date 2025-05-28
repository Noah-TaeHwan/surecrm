import { Link, type MetaFunction } from 'react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from '~/lib/auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

// 폼 유효성 검사 스키마
const recoverSchema = z.object({
  email: z.string().email({
    message: '유효한 이메일 주소를 입력해주세요',
  }),
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

// React Router 타입 정의
export interface Route {
  ComponentProps: {
    loaderData?: any;
    actionData?: {
      success?: boolean;
      message?: string;
    };
  };
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  MetaFunction: () => Array<{
    title?: string;
    description?: string;
    [key: string]: any;
  }>;
}

export function loader({ request }: Route['LoaderArgs']) {
  // 로그인 상태 확인 및 필요시 리디렉션 로직 추가 가능
  return {};
}

export async function action({ request }: Route['ActionArgs']) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return {
      success: false,
      message: '이메일 주소를 입력해주세요.',
    };
  }

  const result = await sendPasswordResetEmail(email);

  if (result.success) {
    return {
      success: true,
      message:
        '비밀번호 재설정 안내 이메일이 발송되었습니다. 이메일을 확인해주세요.',
    };
  }

  return {
    success: false,
    message: result.error || '이메일 발송 중 오류가 발생했습니다.',
  };
}

export const meta: MetaFunction = () => {
  return [
    {
      title: '비밀번호 찾기 - SureCRM',
      description: '계정 비밀번호를 재설정합니다',
    },
  ];
};

export default function RecoverPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const form = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: RecoverFormValues) {
    // Form submission is handled by React Router's form
    console.log(values);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">비밀번호 찾기</CardTitle>
            <CardDescription>
              가입하신 이메일 주소를 입력해주세요
            </CardDescription>
          </CardHeader>

          <CardContent>
            {actionData?.message && (
              <div
                className={`p-4 rounded-md mb-4 ${
                  actionData.success
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                }`}
              >
                {actionData.message}
              </div>
            )}

            <Form {...form}>
              <form
                method="post"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  비밀번호 재설정 이메일 발송
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
