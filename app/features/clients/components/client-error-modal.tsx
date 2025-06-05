import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { X } from 'lucide-react';
import type { ErrorModalContent } from '../types/client-detail';

interface ClientErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ErrorModalContent;
}

export function ClientErrorModal({
  isOpen,
  onClose,
  content,
}: ClientErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription className="text-left whitespace-pre-wrap">
              {content.message}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} variant="outline" className="w-full">
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
