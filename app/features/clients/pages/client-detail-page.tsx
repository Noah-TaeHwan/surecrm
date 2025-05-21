import type { Route } from '.react-router/types/app/features/clients/pages/+types/client-detail-page';
import { Button } from '~/common/components/ui/button';

export function loader({ request, params }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  const client = {
    id: params.id,
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    company: 'ABC 회사',
    status: 'active',
    stage: '첫 상담',
    referredBy: '박철수',
    createdAt: '2023-03-15T09:30:00.000Z',
    updatedAt: '2023-04-02T14:15:00.000Z',
  };

  return { client };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '고객 상세 - SureCRM' },
    { name: 'description', content: '고객 상세 정보' },
  ];
}

export default function ClientDetailPage({ loaderData }: Route.ComponentProps) {
  const { client } = loaderData;

  return (
    <div>
      <h1>고객 상세 페이지</h1>
      <p>고객 ID: {client?.id}</p>
      <p>이름: {client?.name}</p>
    </div>
  );
}
