import type { Route } from '.react-router/types/app/features/reports/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '보고서 - SureCRM' },
    {
      name: 'description',
      content: '소개 네트워크 및 영업 성과 보고서를 확인합니다',
    },
  ];
}

export default function ReportsPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>보고서</h1>
    </div>
  );
}
