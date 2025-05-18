import { Button } from '../../common/components/ui/button';

export interface Route {
  ComponentProps: {
    loaderData?: any;
    actionData?: any;
  };
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
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

export function action({ request }: Route['ActionArgs']) {
  return {};
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '팀 관리 - SureCRM',
    description: '팀원을 관리하고 팀 설정을 변경합니다',
  };
}

export default function TeamPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>팀 관리</h1>
    </div>
  );
}
