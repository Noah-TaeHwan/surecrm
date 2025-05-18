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
    title: '핵심 소개자 - SureCRM',
    description: '가장 많은 소개를 제공한 고객을 관리합니다',
  };
}

export default function InfluencersPage({
  loaderData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>핵심 소개자</h1>
    </div>
  );
}
