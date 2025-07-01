import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from '~/common/pages/+types/mvp-redirect';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';

// 📍 서버에서 즉시 리디렉션 - 검색 엔진이 이 페이지를 색인하지 않도록
export async function loader({ request }: Route.LoaderArgs) {
  const { temporaryRedirect } = await import('~/lib/utils/redirect-helper');

  // 즉시 대시보드로 리디렉션 (검색 엔진이 이 페이지를 보지 않음)
  throw temporaryRedirect('/dashboard');
}

export function meta() {
  return [
    { title: 'SureCRM - 준비 중인 기능' },
    { name: 'description', content: 'MVP 출시 이후 제공 예정인 기능입니다.' },
    { name: 'robots', content: 'noindex, nofollow' }, // 검색 엔진 색인 방지
  ];
}

// loader는 이미 위에 정의됨 - 리디렉션 로직 포함

export function action() {
  return {};
}

export default function MvpRedirectPage() {
  const navigate = useNavigate();

  // 3초 후 자동 리다이렉트
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Construction className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">준비 중인 기능</CardTitle>
          <CardDescription>
            이 기능은 MVP 출시 이후 제공 예정입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>더 나은 서비스를 위해 단계적으로 기능을 출시하고 있습니다.</p>
            <p className="mt-2">곧 대시보드로 이동합니다... (3초)</p>
          </div>
          <Button
            onClick={handleGoToDashboard}
            className="w-full"
            variant="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            대시보드로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
