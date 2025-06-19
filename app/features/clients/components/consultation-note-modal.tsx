import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Label } from '~/common/components/ui/label';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import type { ConsultationNote } from '../types/client-detail';

interface ConsultationNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: ConsultationNote | null;
  onSave: () => void;
  onNoteChange: (note: ConsultationNote) => void;
}

export function ConsultationNoteModal({
  isOpen,
  onClose,
  note,
  onSave,
  onNoteChange,
}: ConsultationNoteModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0',
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {note?.id ? '상담내용 수정' : '상담내용 추가'}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            고객과의 상담 내용과 계약사항을 기록하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="consultationDate"
                  className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                >
                  <span>상담 날짜</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="consultationDate"
                  type="date"
                  value={note?.consultationDate || ''}
                  onChange={e =>
                    onNoteChange({
                      ...note!,
                      consultationDate: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="title"
                  className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                >
                  <span>제목</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="상담 제목 (예: 보험 상담, 계약 체결)"
                  value={note?.title || ''}
                  onChange={e =>
                    onNoteChange({
                      ...note!,
                      title: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                />
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="content"
                className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
              >
                <span>상담 내용</span>
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="상담 내용을 자세히 기록하세요..."
                value={note?.content || ''}
                onChange={e =>
                  onNoteChange({
                    ...note!,
                    content: e.target.value,
                  })
                }
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="contractInfo"
                className="text-xs sm:text-sm font-medium"
              >
                계약 정보
              </Label>
              <Textarea
                id="contractInfo"
                rows={3}
                placeholder="계약 관련 정보 (보험 종류, 보험료, 보장 내용 등)"
                value={note?.contractInfo || ''}
                onChange={e =>
                  onNoteChange({
                    ...note!,
                    contractInfo: e.target.value,
                  })
                }
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="followUpDate"
                  className="text-xs sm:text-sm font-medium"
                >
                  후속 일정
                </Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={note?.followUpDate || ''}
                  onChange={e =>
                    onNoteChange({
                      ...note!,
                      followUpDate: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="followUpNotes"
                  className="text-xs sm:text-sm font-medium"
                >
                  후속 메모
                </Label>
                <Input
                  id="followUpNotes"
                  type="text"
                  placeholder="후속 조치 사항"
                  value={note?.followUpNotes || ''}
                  onChange={e =>
                    onNoteChange({
                      ...note!,
                      followUpNotes: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 - 고정 */}
        <DialogFooter className="flex-shrink-0 flex gap-2 px-4 sm:px-6 py-4 border-t border-border/30">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={onSave}>{note?.id ? '수정' : '추가'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
