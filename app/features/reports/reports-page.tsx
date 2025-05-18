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
    title: '보고서 - SureCRM',
    description: '소개 네트워크 및 영업 성과 보고서를 확인합니다',
  };
}

export default function ReportsPage({ loaderData }: Route['ComponentProps']) {
  return (
    <div>
      <h1>보고서</h1>
    </div>
  );
}
