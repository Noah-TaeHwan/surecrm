import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Users } from 'lucide-react';
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
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{ maxHeight: '75vh', height: 'auto', minHeight: '0' }}
      >
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="text-sm sm:text-lg flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            {companion?.id ? '동반자 수정' : '동반자 추가'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            상담에 함께 참석할 동반자 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              성함 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
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

          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              관계 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={companion?.relationship || ''}
              onValueChange={value =>
                onCompanionChange({
                  ...companion!,
                  relationship: value,
                })
              }
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
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

          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">연락처</Label>
            <Input
              type="tel"
              className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
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

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="isPrimary"
                checked={companion?.isPrimary || false}
                onCheckedChange={checked =>
                  onCompanionChange({
                    ...companion!,
                    isPrimary: checked === true,
                  })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="isPrimary"
                  className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  주 동반자로 설정
                </Label>
                <p className="text-xs text-muted-foreground">
                  주 동반자는 상담의 주요 참석자로 표시됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex gap-2 px-4 sm:px-6 py-4 border-t border-border/30">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={onSave}>{companion?.id ? '수정' : '추가'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
