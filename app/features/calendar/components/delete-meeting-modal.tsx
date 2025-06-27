import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { type Meeting } from '../types/types';

interface DeleteMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMeetingModal({
  meeting,
  isOpen,
  onClose,
  onConfirm,
}: DeleteMeetingModalProps) {
  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            미팅을 삭제하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-2">
            <div className="font-medium text-foreground">{meeting.title}</div>
            <div className="text-sm text-muted-foreground">
              {meeting.date} {meeting.time} • {meeting.client.name}
            </div>
            {meeting.location && (
              <div className="text-sm text-muted-foreground">
                📍 {meeting.location}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {/* 구글 캘린더 연동 안내 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-sm dark:text-blue-400">ℹ️</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium">구글 캘린더에서도 삭제됩니다</div>
                <div className="text-blue-600 dark:text-blue-300">
                  연동된 구글 캘린더 이벤트도 함께 삭제됩니다.
                </div>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  주의사항
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>이 작업은 되돌릴 수 없습니다.</li>
                    <li>미팅 기록과 체크리스트가 함께 삭제됩니다.</li>
                    <li>구글 캘린더 이벤트도 동시에 삭제됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              <Cross2Icon className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              삭제하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
