import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

export function meta() {
  return [
    {
      title: '페이지를 찾을 수 없습니다 - SureCRM',
      description: '요청하신 페이지를 찾을 수 없습니다',
    },
  ];
}

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-7xl font-bold text-primary mb-2">404</div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        주소를 다시 확인하시거나
        <br />
        아래 버튼을 통해 메인 페이지로 이동해주세요.
      </p>
      <div className="flex flex-col gap-2">
        <Button asChild variant="default">
          <Link to="/" className="px-6">
            홈으로 돌아가기
          </Link>
        </Button>
      </div>
    </div>
  );
}
