import type { Route } from '.react-router/types/app/features/settings/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function action({ request }: Route.ActionArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '설정 - SureCRM' },
    { name: 'description', content: '계정 및 앱 환경설정을 관리합니다' },
  ];
}

export default function SettingsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>설정</h1>
    </div>
  );
}
