import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { AlertTriangle, X, Archive, Info } from 'lucide-react';

interface RemoveClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  isLoading?: boolean;
}

export function RemoveClientModal({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  isLoading = false,
}: RemoveClientModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Archive className="h-5 w-5 text-orange-600" />
            영업에서 제외
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            고객을 현재 영업 파이프라인에서 제외합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 📋 설명 섹션 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  "영업에서 제외"란?
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• 고객 정보는 그대로 유지됩니다</p>
                  <p>• 영업 파이프라인에서만 제거됩니다</p>
                  <p>• 언제든지 다시 영업을 시작할 수 있습니다</p>
                  <p>• 고객 상세 페이지에서 새 영업 기회를 생성하세요</p>
                </div>
              </div>
            </div>
          </div>

          {/* ⚠️ 주의사항 */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  이런 경우에 사용하세요
                </h4>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <p>• 고객이 현재 영업을 원하지 않는 경우</p>
                  <p>• 계약 완료 후 칸반보드를 깔끔하게 정리하고 싶은 경우</p>
                  <p>• 일시적으로 영업을 중단하는 경우</p>
                </div>
              </div>
            </div>
          </div>

          {/* 📌 상태 표시 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태 변경:</span>
            <Badge variant="outline" className="gap-1">
              <X className="h-3 w-3" />
              파이프라인에서 제외
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant="secondary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2 bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                제외 중...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                영업에서 제외
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
