import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Award } from 'lucide-react';
import type { OpportunitySuccessData } from '../types/client-detail';

interface OpportunitySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OpportunitySuccessData;
  onConfirm: () => void;
}

export function OpportunitySuccessModal({
  isOpen,
  onClose,
  data,
  onConfirm,
}: OpportunitySuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Award className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl text-emerald-700 dark:text-emerald-400">
              🎉 영업 기회 생성 완료!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-lg p-4 dark:bg-emerald-950/30 dark:border-emerald-800/50">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">고객:</span>
                      <span className="font-semibold text-foreground">
                        {data.clientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">상품:</span>
                      <span className="font-semibold text-foreground">
                        {data.insuranceType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">단계:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {data.stageName}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 영업 파이프라인 페이지에서 확인할 수 있습니다.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
