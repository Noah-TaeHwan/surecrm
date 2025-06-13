import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { RELATIONSHIP_OPTIONS } from '../lib/client-detail-utils';
import type { ConsultationCompanion } from '../types/client-detail';

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: ConsultationCompanion | null;
  onSave: () => void;
  onCompanionChange: (companion: ConsultationCompanion) => void;
}

export function CompanionModal({
  isOpen,
  onClose,
  companion,
  onSave,
  onCompanionChange,
}: CompanionModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            {companion?.id ? '동반자 수정' : '동반자 추가'}
          </DialogTitle>
          <DialogDescription>
            상담에 함께 참석할 동반자 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              성함 *
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg text-sm"
              placeholder="동반자 성함"
              value={companion?.name || ''}
              onChange={e =>
                onCompanionChange({
                  ...companion!,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              관계 *
            </label>
            <Select
              value={companion?.relationship || ''}
              onValueChange={value =>
                onCompanionChange({
                  ...companion!,
                  relationship: value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="관계 선택" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              연락처
            </label>
            <input
              type="tel"
              className="w-full p-3 border rounded-lg text-sm"
              placeholder="010-0000-0000"
              value={companion?.phone || ''}
              onChange={e =>
                onCompanionChange({
                  ...companion!,
                  phone: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded"
                checked={companion?.isPrimary || false}
                onChange={e =>
                  onCompanionChange({
                    ...companion!,
                    isPrimary: e.target.checked,
                  })
                }
              />
              <span className="text-sm">주 동반자로 설정</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              주 동반자는 상담의 주요 참석자로 표시됩니다.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={onSave}>{companion?.id ? '수정' : '추가'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
