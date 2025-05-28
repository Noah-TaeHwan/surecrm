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
import { getInviteStats, type InviteStats } from '~/lib/public-data';
import type { Route } from './+types/invite-only-page';

// Zod 스키마 정의
const inviteCodeSchema = z.object({
  inviteCode: z.string().min(1, { message: '초대 코드를 입력해주세요' }),
});

type InviteCodeFormData = z.infer<typeof inviteCodeSchema>;

// Loader 함수 - 초대 통계 데이터 가져오기
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const inviteStats = await getInviteStats();
    return { inviteStats };
  } catch (error) {
    console.error('초대 통계 데이터 로드 실패:', error);
    return {
      inviteStats: {
        totalInvitations: 450,
        usedInvitations: 320,
        pendingInvitations: 130,
        conversionRate: 71,
      } as InviteStats,
    };
  }
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '초대 전용 서비스 | SureCRM' },
    { name: 'description', content: 'SureCRM은 초대 전용 서비스입니다' },
  ];
};

export default function InviteOnlyPage({ loaderData }: Route.ComponentProps) {
  const { inviteStats } = loaderData;
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
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-2 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            초대 전용 서비스
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            SureCRM은 현재 초대 전용으로 운영되고 있습니다
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 초대 통계 표시 */}
          {/* <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {inviteStats.totalInvitations}
              </div>
              <div className="text-sm text-muted-foreground">총 초대</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {inviteStats.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">가입률</div>
            </div>
          </div> */}

          {/* <Alert className="mb-4">
            <AlertDescription>
              현재 <strong>{inviteStats.usedInvitations}명</strong>이 SureCRM을
              사용 중이며, <strong>{inviteStats.pendingInvitations}개</strong>의
              초대가 대기 중입니다.
            </AlertDescription>
          </Alert> */}

          <div className="py-4 space-y-4">
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
            {' '}
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
