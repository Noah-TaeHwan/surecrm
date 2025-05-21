import type { Route } from '.react-router/types/app/features/clients/pages/+types/client-edit-page';
import { Button } from '~/common/components/ui/button';

export function loader({ request, params }: Route.LoaderArgs) {
  // 신규 생성인 경우 빈 객체 반환
  if (!params.id) {
    return { client: null };
  }

  // 기존 클라이언트 수정인 경우
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
  const isNew = !params.id;
  return [
    { title: `${isNew ? '고객 등록' : '고객 수정'} - SureCRM` },
    {
      name: 'description',
      content: `고객 정보를 ${isNew ? '등록' : '수정'}합니다`,
    },
  ];
}

export default function ClientEditPage({ loaderData }: Route.ComponentProps) {
  const { client } = loaderData;
  const isNew = !client;

  return (
    <div>
      <h1>{isNew ? '고객 등록' : '고객 수정'}</h1>
      {!isNew && (
        <>
          <p>고객 ID: {client.id}</p>
          <p>이름: {client.name}</p>
        </>
      )}
    </div>
  );
}
