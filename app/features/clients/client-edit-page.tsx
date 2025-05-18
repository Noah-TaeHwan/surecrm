import { Button } from '../../common/components/ui/button';

export interface Route {
  ComponentProps: {
    loaderData?: any;
    params: {
      id?: string;
    };
  };
  LoaderArgs: {
    request: Request;
    params: {
      id?: string;
    };
  };
  ActionArgs: {
    request: Request;
    params: {
      id?: string;
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
    title: '고객 추가/편집 - SureCRM',
    description: '고객 정보를 추가하거나 편집합니다',
  };
}

export default function ClientEditPage({
  loaderData,
  params,
}: Route['ComponentProps']) {
  const isEditing = !!params.id;

  return (
    <div>
      <h1>{isEditing ? '고객 정보 편집' : '새 고객 추가'}</h1>
      {isEditing && <p>고객 ID: {params.id}</p>}
    </div>
  );
}
