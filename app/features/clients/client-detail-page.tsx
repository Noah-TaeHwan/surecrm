import { Button } from '../../common/components/ui/button';

export interface Route {
  ComponentProps: {
    loaderData?: any;
    params: {
      id: string;
    };
  };
  LoaderArgs: {
    request: Request;
    params: {
      id: string;
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

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '고객 상세 정보 - SureCRM',
    description: '고객의 상세 정보를 확인하고 관리합니다',
  };
}

export default function ClientDetailPage({
  loaderData,
  params,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>고객 상세 정보</h1>
      <p>고객 ID: {params.id}</p>
    </div>
  );
}
