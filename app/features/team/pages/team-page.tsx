import type { Route } from '.react-router/types/app/features/team/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function action({ request }: Route.ActionArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '팀 관리 - SureCRM' },
    { name: 'description', content: '팀원을 관리하고 팀 설정을 변경합니다' },
  ];
}

export default function TeamPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>팀 관리</h1>
    </div>
  );
}
