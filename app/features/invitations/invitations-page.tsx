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
    title: '초대장 관리 - SureCRM',
    description: '초대장을 발급하고 관리합니다',
  };
}

export default function InvitationsPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>초대장 관리</h1>
    </div>
  );
}
