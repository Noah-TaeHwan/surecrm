import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Check } from 'lucide-react';

interface ClientSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ClientSuccessModal({
  isOpen,
  onClose,
  message,
}: ClientSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            저장 완료
          </DialogTitle>
          <DialogDescription>
            변경사항이 성공적으로 저장되었습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-foreground">{message}</p>
        </div>
        <DialogFooter className="flex justify-end pt-4">
          <Button onClick={onClose} className="px-6">
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
