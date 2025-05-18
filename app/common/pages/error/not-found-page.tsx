import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

export interface Route {
  MetaFunction: () => {
    title: string;
    description?: string;
  };
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '페이지를 찾을 수 없습니다 - SureCRM',
    description: '요청하신 페이지를 찾을 수 없습니다',
  };
}

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-7xl font-bold text-primary mb-2">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-8">
        이 페이지는 좋은 고객 소개처럼 찾기 어렵네요. 주소를 다시 확인하시거나
        아래 버튼을 통해 메인 페이지로 이동해주세요.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default">
          <Link to="/" className="px-6">
            홈으로 돌아가기
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/clients" className="px-6">
            고객 목록으로 이동
          </Link>
        </Button>
      </div>
    </div>
  );
}
