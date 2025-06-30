import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  warningMessage?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = '항목',
  warningMessage,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const { t } = useHydrationSafeTranslation('common');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <DialogTitle className="text-xl font-semibold text-foreground">
            {title ||
              `${itemType} ${t('deleteConfirmationModal.defaultTitle', '삭제')}`}
          </DialogTitle>

          <DialogDescription className="text-center text-muted-foreground">
            {description || (
              <>
                <span className="font-medium text-foreground">
                  {itemName
                    ? `"${itemName}"`
                    : `${t('labels.this', '이')} ${itemType}`}
                </span>
                {t(
                  'deleteConfirmationModal.defaultDescription',
                  '을(를) 정말 삭제하시겠습니까?'
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {warningMessage && (
          <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900/10 dark:border-orange-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {warningMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('deleteConfirmationModal.warningTitle', '주의사항')}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {t(
                      'deleteConfirmationModal.warningItems.irreversible',
                      '이 작업은 되돌릴 수 없습니다.'
                    )}
                  </li>
                  <li>
                    {t(
                      'deleteConfirmationModal.warningItems.allDataDeleted',
                      '관련된 모든 데이터가 함께 삭제됩니다.'
                    )}
                  </li>
                  <li>
                    {t(
                      'deleteConfirmationModal.warningItems.noRecovery',
                      '삭제 후 복구가 불가능합니다.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isConfirming || isLoading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            {t('deleteConfirmationModal.buttons.cancel', '취소')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isConfirming || isLoading
              ? t('deleteConfirmationModal.buttons.deleting', '삭제 중...')
              : t('deleteConfirmationModal.buttons.delete', '삭제')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
