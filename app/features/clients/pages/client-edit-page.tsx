import type { Route } from './+types/client-edit-page';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Button } from '~/common/components/ui/button';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router';

// 🔒 **보안 강화된 컴포넌트들 import**
import { ClientBasicInfoForm } from '../components/client-basic-info-form';
import { ClientSalesInfoForm } from '../components/client-sales-info-form';
import { ClientInsuranceInfoForm } from '../components/client-insurance-info-form';
import { TagManager } from '../components/tag-manager';

// 🔒 **새로운 타입 시스템 import**
import type {
  ClientDisplay,
  ClientPrivacyLevel,
  ClientFormData,
} from '../types';
import { getClientById, updateClient, logDataAccess } from '../lib/client-data';
import { requireAuth } from '~/lib/auth/helpers';
import { data } from 'react-router';

// 🔒 **보안 강화된 클라이언트 편집 스키마**
const secureClientEditSchema = z.object({
  // 기본 정보
  fullName: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름이 너무 깁니다'),
  phone: z
    .string()
    .regex(
      /^010-\d{4}-\d{4}$/,
      '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
    ),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),

  // 회사 정보
  company: z.string().max(100, '회사명이 너무 깁니다').optional(),
  position: z.string().max(50, '직책이 너무 깁니다').optional(),
  address: z.string().max(200, '주소가 너무 깁니다').optional(),
  occupation: z.string().max(100, '직업 설명이 너무 깁니다').optional(),

  // 영업 정보
  currentStageId: z.string().min(1, '영업 단계를 선택하세요'),
  importance: z.enum(['high', 'medium', 'low']),
  referredById: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000, '메모가 너무 깁니다').optional(),

  // 🔒 보안 관련 필드들
  dataProcessingConsent: z.boolean(),
  personalInfoConsent: z.boolean(),
});

type SecureClientEditFormData = z.infer<typeof secureClientEditSchema>;

export async function loader({ request, params }: Route.LoaderArgs) {
  const { clientId } = params;
  if (!clientId) {
    throw new Response('Client ID is required', { status: 400 });
  }

  const userId = await requireAuth(request);

  try {
    const client = await getClientById(clientId, userId, true);

    if (!client) {
      throw new Response('Client not found', { status: 404 });
    }

    // 로깅
    await logDataAccess({
      userId,
      action: 'CLIENT_EDIT_REQUEST',
      resourceType: 'client',
      resourceId: clientId,
      details: 'Client edit page access',
    });

    return {
      client: client as any,
    };
  } catch (error) {
    console.error('고객 편집 페이지 로딩 실패:', error);
    throw new Response('Failed to load client for editing', { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { clientId } = params;
  if (!clientId) {
    throw new Response('Client ID is required', { status: 400 });
  }

  const userId = await requireAuth(request);
  const formData = await request.formData();

  try {
    const updateData = Object.fromEntries(formData);

    // TODO: 클라이언트 업데이트 로직 구현
    await updateClient(clientId, updateData as any, userId);

    return data({
      success: true,
      message: '고객 정보가 성공적으로 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('고객 업데이트 실패:', error);
    return data(
      {
        success: false,
        error: '고객 정보 업데이트 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.client?.fullName || '고객'} 편집 - SureCRM` },
    { name: 'description', content: '고객 정보 편집' },
  ];
}

export default function ClientEditPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { client } = loaderData;
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm({
    resolver: zodResolver(secureClientEditSchema) as any,
    defaultValues: {
      fullName: client?.fullName || '',
      phone: client?.phone || '',
      email: client?.email || '',
      telecomProvider: client?.telecomProvider || '',
      company: client?.company || '',
      position: client?.position || '',
      address: client?.address || '',
      occupation: client?.occupation || '',
      currentStageId: client?.currentStageId || '',
      importance: client?.importance || 'medium',
      referredById: client?.referredById || '',
      tags: client?.tags || [],
      notes: client?.notes || '',
      dataProcessingConsent: true,
      personalInfoConsent: true,
    },
  });

  if (!client) {
    return (
      <MainLayout title="고객 편집">
        <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
          <Alert>
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>고객을 찾을 수 없습니다.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const onSubmit = (data: any) => {
    // 폼 제출 로직은 action에서 처리됨
    console.log('Form data:', data);
  };

  return (
    <MainLayout title={`${client.fullName} 편집`}>
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/clients/${client.id}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              돌아가기
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.fullName} 편집</h1>
            <p className="text-muted-foreground">
              고객 정보를 수정할 수 있습니다
            </p>
          </div>
        </div>

        {/* 성공/에러 메시지 */}
        {actionData?.success && (actionData as any).message && (
          <Alert>
            <AlertDescription>{(actionData as any).message}</AlertDescription>
          </Alert>
        )}
        {actionData &&
          !(actionData as any).success &&
          (actionData as any).error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{(actionData as any).error}</AlertDescription>
            </Alert>
          )}

        {/* 편집 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>고객 정보 편집</CardTitle>
            <CardDescription>
              고객의 개인정보 및 영업 관련 정보를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="sales">영업 정보</TabsTrigger>
                <TabsTrigger value="insurance">보험 정보</TabsTrigger>
                <TabsTrigger value="tags">태그 관리</TabsTrigger>
              </TabsList>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-6"
              >
                <TabsContent value="basic" className="space-y-4">
                  <ClientBasicInfoForm form={form as any} />
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                  <ClientSalesInfoForm
                    form={form as any}
                    referrers={[]}
                    tags={form.watch('tags') || []}
                    onTagsChange={(tags) => form.setValue('tags', tags)}
                  />
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <ClientInsuranceInfoForm
                    form={form as any}
                    watchInsuranceType={'health'}
                    isEditing={true}
                    currentPrivacyLevel={'private' as any}
                    showSensitiveData={false}
                  />
                </TabsContent>

                <TabsContent value="tags" className="space-y-4">
                  <TagManager
                    tags={form.watch('tags') || []}
                    onTagsChange={(tags) => form.setValue('tags', tags)}
                  />
                </TabsContent>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button variant="outline" asChild>
                    <Link to={`/clients/${client.id}`}>취소</Link>
                  </Button>
                  <Button type="submit">저장</Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
