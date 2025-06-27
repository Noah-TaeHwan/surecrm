/**
 * 🔄 충돌 해결 모달
 * 구글 캘린더와의 동기화 충돌을 해결하는 컴포넌트
 */

import React, { useSyncExternalStore } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { Separator } from '~/common/components/ui/separator';
import { CheckCircleIcon } from 'lucide-react';

export interface ConflictData {
  eventId: string;
  title: string;
  googleVersion: any;
  localVersion: any;
  conflictFields: Array<{
    field: string;
    googleValue: any;
    localValue: any;
    priority: 'high' | 'medium' | 'low';
  }>;
  detectedAt: Date;
  autoResolvable: boolean;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolveConflict: (eventId: string, resolution: 'local' | 'google') => void;
  onResolveAll: (resolution: 'local' | 'google') => void;
}

// useSyncExternalStore용 빈 구독 함수
const emptySubscribe = () => () => {};

// Hydration-safe 날짜 포맷팅 컴포넌트
function HydrationSafeDateValue({ value }: { value: any }) {
  const formattedDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date(value).toLocaleDateString('ko-KR'),
    () => {
      // 서버에서는 기본 형식 사용
      const date = new Date(value);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  );

  return <span>{formattedDate}</span>;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  conflicts,
  onResolveConflict,
  onResolveAll,
}: ConflictResolutionModalProps) {
  const handleResolveAll = (resolution: 'local' | 'google') => {
    if (
      confirm(
        `정말로 모든 충돌을 ${resolution === 'local' ? '로컬' : '구글'} 버전으로 해결하시겠습니까?`
      )
    ) {
      onResolveAll(resolution);
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      title: '제목',
      date: '날짜',
      time: '시간',
      duration: '소요 시간',
      location: '장소',
      description: '설명',
    };
    return labels[field] || field;
  };

  const formatValue = (field: string, value: any) => {
    if (!value) return '(없음)';
    if (field === 'date') {
      return <HydrationSafeDateValue value={value} />;
    }
    if (field === 'duration') {
      return `${value}분`;
    }
    return value.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>동기화 충돌 해결</DialogTitle>
          <DialogDescription>
            구글 캘린더와 로컬 데이터 간의 차이점을 검토하고 해결하세요.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-300px)] mt-6">
          <div className="space-y-4">
            {conflicts.length === 0 ? (
              <Alert>
                <CheckCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  해결할 충돌이 없습니다. 모든 일정이 동기화되었습니다.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {conflicts.map((conflict, index) => (
                  <div key={conflict.eventId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{conflict.title}</h4>
                    <div className="space-y-2">
                      {conflict.conflictFields.map(field => (
                        <div
                          key={field.field}
                          className="grid grid-cols-3 gap-2 text-sm"
                        >
                          <div className="font-medium">
                            {getFieldLabel(field.field)}:
                          </div>
                          <div className="text-muted-foreground">
                            로컬: {formatValue(field.field, field.localValue)}
                          </div>
                          <div className="text-muted-foreground">
                            구글: {formatValue(field.field, field.googleValue)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onResolveConflict(conflict.eventId, 'local')
                        }
                      >
                        로컬 버전 사용
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onResolveConflict(conflict.eventId, 'google')
                        }
                      >
                        구글 버전 사용
                      </Button>
                    </div>
                    {index < conflicts.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {conflicts.length > 0 && (
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => handleResolveAll('local')}>
              모두 로컬 버전으로
            </Button>
            <Button
              variant="outline"
              onClick={() => handleResolveAll('google')}
            >
              모두 구글 버전으로
            </Button>
            <Button onClick={onClose}>닫기</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
