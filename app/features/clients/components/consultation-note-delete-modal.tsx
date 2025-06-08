import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConsultationNoteDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  noteDate: string;
  isDeleting?: boolean;
}

export function ConsultationNoteDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  noteDate,
  isDeleting = false,
}: ConsultationNoteDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg">상담 기록 삭제</DialogTitle>
            <DialogDescription className="text-left space-y-2">
              <p>다음 상담 기록을 삭제하시겠습니까?</p>
              <div className="bg-muted p-3 rounded-lg border">
                <p className="font-medium text-foreground">{noteTitle}</p>
                <p className="text-sm text-muted-foreground">📅 {noteDate}</p>
              </div>
              <p className="text-destructive text-sm">
                ⚠️ 삭제된 상담 기록은 복구할 수 없습니다.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
