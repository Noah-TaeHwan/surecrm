import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  CalendarIcon,
  ClockIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { MapPin } from 'lucide-react';
import { cn } from '~/lib/utils';

// 충돌 데이터 인터페이스
export interface ConflictData {
  eventId: string;
  title: string;
  conflictFields: string[];
  localVersion: {
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    description?: string;
    lastModified: Date;
  };
  googleVersion: {
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    description?: string;
    lastModified: Date;
  };
  detectedAt: Date;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolveConflict: (eventId: string, resolution: 'local' | 'google') => void;
  onResolveAll: (resolution: 'local' | 'google') => void;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  conflicts,
  onResolveConflict,
  onResolveAll,
}: ConflictResolutionModalProps) {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConflictFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      title: '제목',
      startTime: '시작 시간',
      endTime: '종료 시간',
      location: '장소',
      description: '설명',
    };
    return labels[field] || field;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            일정 동기화 충돌 감지
          </DialogTitle>
          <DialogDescription>
            다음 {conflicts.length}개 일정이 SureCRM과 구글 캘린더에서 동시에
            수정되어 충돌이 발생했습니다. 어떤 버전을 유지할지 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        {/* 전체 해결 버튼 */}
        {conflicts.length > 1 && (
          <div className="flex gap-2 p-4 bg-muted/50 rounded-lg border">
            <div className="flex-1">
              <p className="text-sm font-medium">모든 충돌 일괄 처리</p>
              <p className="text-xs text-muted-foreground">
                모든 충돌을 한 번에 같은 방식으로 해결합니다
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolveAll('local')}
              >
                모두 SureCRM 우선
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolveAll('google')}
              >
                모두 구글 우선
              </Button>
            </div>
          </div>
        )}

        {/* 개별 충돌 카드들 */}
        <div className="space-y-4">
          {conflicts.map(conflict => (
            <Card key={conflict.eventId} className="border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {conflict.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        충돌 감지: {formatDateTime(conflict.detectedAt)}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {conflict.conflictFields.map(field => (
                          <Badge
                            key={field}
                            variant="destructive"
                            className="text-xs"
                          >
                            {getConflictFieldLabel(field)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* SureCRM 버전 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-primary/10 rounded">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">SureCRM 버전</h4>
                        <p className="text-xs text-muted-foreground">
                          수정:{' '}
                          {formatDateTime(conflict.localVersion.lastModified)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {conflict.localVersion.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatTime(conflict.localVersion.startTime)} -{' '}
                          {formatTime(conflict.localVersion.endTime)}
                        </span>
                      </div>

                      {conflict.localVersion.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {conflict.localVersion.location}
                          </span>
                        </div>
                      )}

                      {conflict.localVersion.description && (
                        <div className="text-sm text-muted-foreground">
                          {conflict.localVersion.description}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        onResolveConflict(conflict.eventId, 'local')
                      }
                    >
                      <CheckCircledIcon className="h-3 w-3 mr-2" />
                      SureCRM 버전 선택
                    </Button>
                  </div>

                  {/* 구글 캘린더 버전 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          구글 캘린더 버전
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          수정:{' '}
                          {formatDateTime(conflict.googleVersion.lastModified)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {conflict.googleVersion.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatTime(conflict.googleVersion.startTime)} -{' '}
                          {formatTime(conflict.googleVersion.endTime)}
                        </span>
                      </div>

                      {conflict.googleVersion.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {conflict.googleVersion.location}
                          </span>
                        </div>
                      )}

                      {conflict.googleVersion.description && (
                        <div className="text-sm text-muted-foreground">
                          {conflict.googleVersion.description}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-200 hover:bg-blue-50"
                      onClick={() =>
                        onResolveConflict(conflict.eventId, 'google')
                      }
                    >
                      <CheckCircledIcon className="h-3 w-3 mr-2" />
                      구글 버전 선택
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 안내 메시지 */}
        <Alert className="bg-amber-50 border-amber-200">
          <InfoCircledIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-700">
            <strong>충돌 해결 안내:</strong> 선택한 버전으로 양쪽 플랫폼이 모두
            업데이트됩니다. 선택하지 않은 버전의 데이터는 영구적으로 사라질 수
            있으니 신중히 선택해주세요.
          </AlertDescription>
        </Alert>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            나중에 해결
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
