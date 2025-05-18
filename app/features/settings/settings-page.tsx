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
    title: '설정 - SureCRM',
    description: '계정 및 앱 환경설정을 관리합니다',
  };
}

export default function SettingsPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>설정</h1>
    </div>
  );
}
