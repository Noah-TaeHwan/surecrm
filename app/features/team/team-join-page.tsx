import { Button } from '../../common/components/ui/button';

export interface Route {
  ComponentProps: {
    loaderData?: any;
    actionData?: any;
    params: {
      code: string;
    };
  };
  LoaderArgs: {
    request: Request;
    params: {
      code: string;
    };
  };
  ActionArgs: {
    request: Request;
    params: {
      code: string;
    };
  };
  MetaFunction: () => {
    title: string;
    description?: string;
  };
}

export function loader({ request, params }: Route['LoaderArgs']) {
  return {};
}

export function action({ request, params }: Route['ActionArgs']) {
  return {};
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '팀 합류 - SureCRM',
    description: '초대 코드를 통해 팀에 합류합니다',
  };
}

export default function TeamJoinPage({
  loaderData,
  actionData,
  params,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>팀 합류</h1>
      <p>초대 코드: {params.code}</p>
    </div>
  );
}
