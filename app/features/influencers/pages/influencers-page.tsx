import type { Route } from '.react-router/types/app/features/influencers/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '핵심 소개자 - SureCRM' },
    {
      name: 'description',
      content: '가장 많은 소개를 제공한 고객을 관리합니다',
    },
  ];
}

export default function InfluencersPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>핵심 소개자</h1>
    </div>
  );
}
