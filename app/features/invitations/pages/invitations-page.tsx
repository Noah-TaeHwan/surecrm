import type { Route } from '.react-router/types/app/features/invitations/pages/+types/invitations-page';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function action({ request }: Route.ActionArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '초대장 관리 - SureCRM' },
    { name: 'description', content: '초대장을 발급하고 관리합니다' },
  ];
}

export default function InvitationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>초대장 관리</h1>
    </div>
  );
}
