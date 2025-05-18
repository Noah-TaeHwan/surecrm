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
    title: '데이터 임포트 - SureCRM',
    description: '고객 데이터를 CSV, 엑셀 등에서 가져옵니다',
  };
}

export default function ImportPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>데이터 임포트</h1>
    </div>
  );
}
