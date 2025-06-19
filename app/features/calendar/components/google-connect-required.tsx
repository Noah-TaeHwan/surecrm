import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  CalendarIcon,
  Link1Icon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

interface GoogleConnectRequiredProps {
  onConnect: () => void;
}

export function GoogleConnectRequired({
  onConnect,
}: GoogleConnectRequiredProps) {
  return (
    <div className="flex items-center justify-center min-h-[600px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">구글 캘린더 연동 필요</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-4">
            일정 관리 기능을 사용하려면 구글 캘린더 연동이 필요합니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 연동 필요성 설명 */}
          <Alert className="border-primary/20">
            <CheckCircledIcon className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground">
                  SureCRM 일정 관리는 구글 캘린더와 완전 동기화됩니다
                </p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• 새 일정 등록 → 구글 캘린더에 자동 저장</li>
                  <li>• 구글 캘린더 일정 → SureCRM에 자동 표시</li>
                  <li>• 양방향 실시간 동기화</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* 연동 버튼 */}
          <Button
            onClick={onConnect}
            className="w-full h-12 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Link1Icon className="w-4 h-4 mr-2" />
            구글 캘린더 연동하기
          </Button>

          {/* 안전성 안내 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              안전한 OAuth 2.0 인증을 통해 연동됩니다
            </p>
            <p className="text-xs text-muted-foreground">
              언제든지 연동을 해제할 수 있습니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
