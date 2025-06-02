import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from './+types/client-edit-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { ArrowLeft, Save, X, User, FileText, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requireAuth } from '~/lib/auth/middleware';
import { Separator } from '~/common/components/ui/separator';

// 📝 고객 편집 폼 스키마
const clientEditSchema = z.object({
  fullName: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름이 너무 깁니다'),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  occupation: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

type ClientEditFormData = z.infer<typeof clientEditSchema>;

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id: clientId } = params;

  console.log('🔍 고객 편집 페이지 loader 시작:', { clientId });

  if (!clientId) {
    console.error('❌ 클라이언트 ID가 없음');
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🎯 실제 로그인된 보험설계사 정보 가져오기
    const user = await requireAuth(request);
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // 🎯 실제 API 호출로 고객 상세 정보 조회
    const { getClientById } = await import('~/api/shared/clients');

    console.log('📞 API 호출 시작:', { clientId, agentId });

    const clientDetail = await getClientById(clientId, agentId);

    console.log('📞 API 호출 결과:', { clientDetail: !!clientDetail });

    if (!clientDetail) {
      console.log('⚠️ 고객을 찾을 수 없음');
      throw new Response('고객을 찾을 수 없습니다.', { status: 404 });
    }

    console.log('✅ 고객 편집 정보 로드 완료:', clientDetail.fullName);

    return {
      client: clientDetail,
      currentUserId: agentId,
    };
  } catch (error) {
    console.error('❌ 고객 편집 정보 조회 실패:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw new Response(
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.',
      { status: 500 }
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { id: clientId } = params;

  if (!clientId) {
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    const user = await requireAuth(request);
    const agentId = user.id;

    const formData = await request.formData();
    const updateData = Object.fromEntries(formData);

    console.log('📝 고객 정보 업데이트 시작:', { clientId, updateData });

    // 🎯 실제 API 호출로 고객 정보 업데이트
    const { updateClient } = await import('~/api/shared/clients');

    const result = await updateClient(clientId, updateData, agentId);

    if (result.success) {
      console.log('✅ 고객 정보 업데이트 완료');

      // 업데이트 성공 후 상세 페이지로 리다이렉트
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/clients/${clientId}`,
        },
      });
    } else {
      throw new Error(result.message || '업데이트에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 고객 정보 업데이트 실패:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const clientName = data?.client?.fullName || '고객';
  return [
    { title: `${clientName} 편집 - SureCRM` },
    { name: 'description', content: `${clientName}의 정보를 편집합니다.` },
  ];
}

export default function ClientEditPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { client } = loaderData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ClientEditFormData>({
    resolver: zodResolver(clientEditSchema),
    defaultValues: {
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      occupation: client.occupation || '',
      importance: client.importance || 'medium',
      notes: client.notes || '',
    },
  });

  const onSubmit = async (data: ClientEditFormData) => {
    setIsSubmitting(true);

    // FormData 생성하여 action으로 전송
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      // form을 통해 action 호출
      const form = document.getElementById(
        'client-edit-form'
      ) as HTMLFormElement;
      if (form) {
        form.submit();
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <MainLayout title={`${client.fullName} 편집`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🎯 현대적인 헤더 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-2xl"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {client.fullName} 정보 수정
                </h1>
                <p className="text-muted-foreground mt-1">
                  고객 정보를 업데이트하여 더 나은 서비스를 제공하세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 표시 */}
        {actionData?.error && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:bg-red-900/10"
          >
            <X className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {actionData.error}
            </AlertDescription>
          </Alert>
        )}

        {/* 🎯 모던한 편집 폼 */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
          <CardHeader className="pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">기본 정보</CardTitle>
                <CardDescription className="text-base mt-2">
                  정확한 정보로 고객 관계를 더욱 효과적으로 관리하세요
                </CardDescription>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <Form {...form}>
              <form
                id="client-edit-form"
                onSubmit={form.handleSubmit(onSubmit)}
                method="post"
                className="space-y-8"
              >
                {/* 필수 정보 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold">필수 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 이름 */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            이름 *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="고객 이름을 입력하세요"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 전화번호 */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            전화번호 *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="010-0000-0000"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* 연락처 정보 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">연락처 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 이메일 */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            이메일
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@email.com"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 직업 */}
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            직업
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="직업을 입력하세요"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 주소 */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          주소
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="상세 주소를 입력하세요"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* 관리 정보 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">관리 정보</h3>
                  </div>

                  {/* 중요도 */}
                  <FormField
                    control={form.control}
                    name="importance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          고객 중요도
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="중요도를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-red-500" />
                                VIP 고객
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                일반 고객
                              </div>
                            </SelectItem>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                일반 고객
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 메모 */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          메모 및 특이사항
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="고객에 대한 중요한 정보나 특이사항을 기록하세요..."
                            className="min-h-[120px] text-base resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          상담 내용, 선호사항, 주의사항 등을 자유롭게
                          기록하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-end gap-4 pt-8 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-8 h-12"
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2"></div>
                        저장 중...
                      </>
                    ) : (
                      '변경사항 저장'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
