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
  FormMessage,
} from '~/common/components/ui/form';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Separator } from '~/common/components/ui/separator';

// Zod 스키마 정의
const inviteCodeSchema = z.object({
  inviteCode: z.string().min(1, { message: '초대 코드를 입력해주세요' }),
});

type InviteCodeFormData = z.infer<typeof inviteCodeSchema>;

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '초대 전용 서비스 | SureCRM' },
    { name: 'description', content: 'SureCRM은 초대 전용 서비스입니다' },
  ];
};

export default function InviteOnlyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // react-hook-form과 zodResolver를 사용한 폼 설정
  const form = useForm<InviteCodeFormData>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const onSubmit = (data: InviteCodeFormData) => {
    setIsSubmitting(true);
    window.location.href = `/invite/${data.inviteCode}`;
  };

  return (
    <AuthLayout>
      <Card className="w-full border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            초대 전용 서비스
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            SureCRM은 현재 초대 전용으로 운영되고 있습니다
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <Card className="bg-slate-50 dark:bg-slate-800/50 border-none mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                SureCRM의 주요 특징
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    소개 네트워크 시각화: 고객 소개의 연결 관계를 한눈에 파악
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>영업 파이프라인 관리: 영업 과정을 효율적으로 추적</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>고객 관리: 보험 고객의 정보와 계약 이력 관리</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="py-4 space-y-4">
            <h3 className="font-medium text-center text-slate-900 dark:text-slate-100">
              초대 코드가 있으신가요?
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="초대 코드를 입력하세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '처리 중...' : '초대 코드로 가입하기'}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center">
          <Separator className="my-4" />
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
            >
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
