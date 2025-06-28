// React Router v7 타입 import 제거 - 직접 타입 정의 사용
import { MainLayout } from '~/common/layouts/main-layout';

// 타입 정의
interface LoaderArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: any;
}
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { CheckCircle, ArrowRight, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: '구독 완료 - SureCRM' },
    {
      name: 'description',
      content: 'SureCRM Pro 구독이 성공적으로 완료되었습니다',
    },
  ];
}

export function loader({ request }: LoaderArgs) {
  // URL에서 쿼리 파라미터 추출
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  const customerId = url.searchParams.get('customer_id');

  return {
    sessionId,
    customerId,
  };
}

export default function BillingSuccessPage({ loaderData }: ComponentProps) {
  const { sessionId } = loaderData;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              구독이 완료되었습니다!
            </CardTitle>
            <CardDescription>
              Pro Plan에 오신 것을 환영합니다. 이제 모든 프리미엄 기능을
              사용하실 수 있습니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 다음 단계 안내 */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                다음 단계
              </h3>
              <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>구독 확인 이메일을 발송했습니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>30일 무료 체험 기간이 시작되었습니다</span>
                </div>
              </div>
            </div>

            {/* 주요 기능 빠른 시작 */}
            <div className="text-left">
              <h3 className="font-semibold mb-3">빠른 시작 가이드</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <span>첫 번째 고객을 추가해보세요</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <span>영업 파이프라인을 설정하세요</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span>대시보드에서 실시간 현황을 확인하세요</span>
                </div>
              </div>
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link to="/dashboard">
                  대시보드로 이동
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/clients">고객 관리 시작</Link>
              </Button>
            </div>

            {/* 추가 정보 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>구독 관리는 계정 설정에서 할 수 있습니다.</p>
              <p>문의사항이 있으시면 noah@surecrm.pro로 연락주세요.</p>
              {sessionId && <p className="font-mono">세션 ID: {sessionId}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
