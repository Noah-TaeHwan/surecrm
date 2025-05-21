import type { Route } from '.react-router/types/app/features/calendar/pages/+types/route';
import { Button } from '~/common/components/ui/button';

export function loader({ request }: Route.LoaderArgs) {
  return {};
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '일정 관리 - SureCRM' },
    { name: 'description', content: '고객 미팅과 일정을 관리합니다' },
  ];
}

export default function CalendarPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>일정 관리</h1>
    </div>
  );
}
