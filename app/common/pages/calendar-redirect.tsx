import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';

export function meta() {
  return [
    { title: 'SureCRM - 일정 관리 준비 중' },
    {
      name: 'description',
      content: '일정 관리 기능은 MVP 출시 이후 제공 예정입니다.',
    },
  ];
}

export function loader() {
  return {};
}

export function action() {
  return {};
}

export default function CalendarRedirectPage() {
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">일정 관리 준비 중</CardTitle>
          <CardDescription>
            일정 관리 기능은 MVP 출시 이후 제공 예정입니다.
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
