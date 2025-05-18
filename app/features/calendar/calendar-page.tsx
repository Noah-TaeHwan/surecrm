import { Button } from '../../common/components/ui/button';

export interface Route {
  ComponentProps: {
    loaderData?: any;
  };
  LoaderArgs: {
    request: Request;
  };
  MetaFunction: () => {
    title: string;
    description?: string;
  };
}

export function loader({ request }: Route['LoaderArgs']) {
  return {};
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '일정 관리 - SureCRM',
    description: '고객 미팅과 일정을 관리합니다',
  };
}

export default function CalendarPage({ loaderData }: Route['ComponentProps']) {
  return (
    <div>
      <h1>일정 관리</h1>
    </div>
  );
}
