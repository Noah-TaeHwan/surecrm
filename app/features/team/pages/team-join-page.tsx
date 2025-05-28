import type { Route } from './+types/team-join-page';
import { Button } from '~/common/components/ui/button';

export function loader({ request, params }: Route.LoaderArgs) {
  return {};
}

export function action({ request, params }: Route.ActionArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '팀 합류 - SureCRM' },
    { name: 'description', content: '초대 코드를 통해 팀에 합류합니다' },
  ];
}

export default function TeamJoinPage({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>팀 합류</h1>
      <p>초대 코드: {params?.code}</p>
    </div>
  );
}
