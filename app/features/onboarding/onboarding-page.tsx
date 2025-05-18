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
    title: '초기 설정 - SureCRM',
    description: '서비스 이용을 위한 초기 설정을 진행합니다',
  };
}

export default function OnboardingPage({
  loaderData,
}: Route['ComponentProps']) {
  return (
    <div>
      <h1>초기 설정</h1>
    </div>
  );
}
