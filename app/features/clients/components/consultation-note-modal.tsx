import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            {note?.id ? '상담내용 수정' : '상담내용 추가'}
          </DialogTitle>
          <DialogDescription>
            고객과의 상담 내용과 계약사항을 기록하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                상담 날짜 *
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg text-sm"
                value={note?.consultationDate || ''}
                onChange={(e) =>
                  onNoteChange({
                    ...note!,
                    consultationDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                제목 *
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg text-sm"
                placeholder="상담 제목 (예: 보험 상담, 계약 체결)"
                value={note?.title || ''}
                onChange={(e) =>
                  onNoteChange({
                    ...note!,
                    title: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              상담 내용 *
            </label>
            <textarea
              className="w-full p-3 border rounded-lg text-sm"
              rows={6}
              placeholder="상담 내용을 자세히 기록하세요..."
              value={note?.content || ''}
              onChange={(e) =>
                onNoteChange({
                  ...note!,
                  content: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              계약 정보
            </label>
            <textarea
              className="w-full p-3 border rounded-lg text-sm"
              rows={3}
              placeholder="계약 관련 정보 (보험 종류, 보험료, 보장 내용 등)"
              value={note?.contractInfo || ''}
              onChange={(e) =>
                onNoteChange({
                  ...note!,
                  contractInfo: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                후속 일정
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg text-sm"
                value={note?.followUpDate || ''}
                onChange={(e) =>
                  onNoteChange({
                    ...note!,
                    followUpDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                후속 메모
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg text-sm"
                placeholder="후속 조치 사항"
                value={note?.followUpNotes || ''}
                onChange={(e) =>
                  onNoteChange({
                    ...note!,
                    followUpNotes: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={onSave}>{note?.id ? '수정' : '추가'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
