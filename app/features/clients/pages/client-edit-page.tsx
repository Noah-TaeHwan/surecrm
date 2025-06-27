import { useState } from 'react';
import { useNavigate } from 'react-router';
// Route 타입은 라우트 파일에서 자동 생성됨
import { MainLayout } from '~/common/layouts/main-layout';

import { ClientEditHeader } from '../components/client-edit-header';
import { ClientEditForm } from '../components/client-edit-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

import type { Route as ClientEditRoute } from '../../../routes/+types/clients.$clientId.edit';

export async function loader({ request, params }: ClientEditRoute.LoaderArgs) {
  const { clientId } = params;

  console.log('🔍 고객 편집 페이지 loader 시작:', { clientId });

  if (!clientId) {
    console.error('❌ 클라이언트 ID가 없음');
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🔥 구독 상태 확인 (API 호출로 변경)
    const origin = new URL(request.url).origin;
    const authResponse = await fetch(`${origin}/api/auth/me`, {
      headers: {
        Cookie: request.headers.get('Cookie') || '',
      },
    });

    if (!authResponse.ok) {
      throw new Response('인증이 필요합니다.', { status: 401 });
    }

    const { user } = await authResponse.json();
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // 🎯 실제 API 호출로 고객 상세 정보 조회
    console.log('📞 API 호출 시작:', { clientId, agentId });

    const detailResponse = await fetch(
      `${origin}/api/clients/detail?clientId=${clientId}`,
      {
        headers: {
          Cookie: request.headers.get('Cookie') || '',
        },
      }
    );

    if (!detailResponse.ok) {
      throw new Response('고객 정보를 찾을 수 없습니다.', { status: 404 });
    }

    const clientDetail = await detailResponse.json();

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

export async function action({ request, params }: ClientEditRoute.ActionArgs) {
  const { clientId } = params;

  if (!clientId) {
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;

    // 🔥 인증 확인 (API 호출로 변경)
    const authResponse = await fetch(`${origin}/api/auth/me`, {
      headers: {
        Cookie: request.headers.get('Cookie') || '',
      },
    });

    if (!authResponse.ok) {
      throw new Response('인증이 필요합니다.', { status: 401 });
    }

    const { user } = await authResponse.json();
    const agentId = user.id;

    const formData = await request.formData();
    const updateData = Object.fromEntries(formData);

    console.log('📝 고객 정보 업데이트 시작:', { clientId, updateData });

    // 🎯 실제 API 호출로 고객 정보 업데이트
    const updateResponse = await fetch(`${origin}/api/clients/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('Cookie') || '',
      },
      body: JSON.stringify({
        clientId,
        updateData,
        agentId,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('고객 정보 업데이트에 실패했습니다.');
    }

    const result = await updateResponse.json();

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

export function meta({ data }: any) {
  const clientName = data?.client?.fullName || '고객';
  return [
    { title: `${clientName} 편집 - SureCRM` },
    { name: 'description', content: `${clientName}의 정보를 편집합니다.` },
  ];
}

export default function ClientEditPage({ loaderData, actionData }: any) {
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
        {/* 🎯 헤더 섹션 */}
        <ClientEditHeader
          clientName={client.fullName}
          onCancel={handleCancel}
          error={actionData?.error}
        />

        {/* 🎯 편집 폼 */}
        <ClientEditForm
          form={form}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
}
