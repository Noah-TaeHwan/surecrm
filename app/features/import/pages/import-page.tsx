import type { Route } from '.react-router/types/app/features/import/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function action({ request }: Route.ActionArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '데이터 임포트 - SureCRM' },
    {
      name: 'description',
      content: '고객 데이터를 CSV, 엑셀 등에서 가져옵니다',
    },
  ];
}

export default function ImportPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>데이터 임포트</h1>
    </div>
  );
}
