// MVP: 구독 관리 기능 - 추후 결제 시스템 연동 후 활성화 예정
// 현재는 사이드바 메뉴에서 비활성화되어 있으며, 직접 URL 접근 시에만 확인 가능

// import type { Route } from './+types/billing.subscribe';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { SimpleSubscriptionPage } from '~/features/billing/components/simple-subscription-page';

// 임시 타입 정의 (React Router v7 타입 생성 전까지)
namespace Route {
  export interface MetaArgs {
    data: any;
    params: any;
  }
  export interface LoaderArgs {
    request: Request;
  }
  export interface ActionArgs {
    request: Request;
  }
  export interface ComponentProps {
    loaderData: any;
    actionData?: any;
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '구독 관리 - SureCRM' },
    {
      name: 'description',
      content: 'SureCRM Pro 구독을 시작하고 완전한 CRM 기능을 이용하세요.',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // 임시 하드코딩된 데이터 (추후 실제 데이터로 교체)
  return { success: true };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'upgrade') {
    // 구독 처리 로직 (추후 TossPayments API 연동)
    console.log('구독 요청 처리:', Object.fromEntries(formData));

    // 임시 성공 응답
    return {
      success: true,
      message: '🎉 SureCRM Pro 구독이 성공적으로 시작되었습니다!',
      subscriptionId: `sub_${Date.now()}`,
    };
  }

  return { success: false, message: '알 수 없는 요청입니다.' };
}

export default function BillingSubscribePage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);

    try {
      // 여기서 실제 구독 처리 로직 구현
      console.log('구독 시작:', planId);

      // 임시 지연 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 성공 후 대시보드로 이동 또는 성공 페이지 표시
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('구독 오류:', error);
      alert('구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout title="구독 관리">
      <SimpleSubscriptionPage onUpgrade={handleUpgrade} isLoading={isLoading} />
    </MainLayout>
  );
}
