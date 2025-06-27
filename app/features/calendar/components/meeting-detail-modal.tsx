/**
 * 📅 미팅 상세 정보 모달
 * Dialog를 사용하여 미팅 상세 정보 표시
 */

import React from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  VideoIcon,
  PhoneIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Meeting } from '../types/types';
import { useSyncExternalStore } from 'react';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  onClose: () => void;
  onToggleChecklist?: (meetingId: string, checklistId: string) => void;
}

const meetingTypeLabels: Record<string, string> = {
  first_consultation: '초회 상담',
  follow_up: '후속 상담',
  product_explanation: '상품 설명',
  contract_review: '계약 검토',
  contract_signing: '계약 체결',
  claim_support: '보험금 청구 지원',
  other: '기타',
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: '낮음', color: 'bg-gray-100 text-gray-700' },
  medium: { label: '보통', color: 'bg-blue-100 text-blue-700' },
  high: { label: '높음', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: '긴급', color: 'bg-red-100 text-red-700' },
};

// useSyncExternalStore용 빈 구독 함수
const emptySubscribe = () => () => {};

// Hydration-safe 날짜 포맷팅 컴포넌트
function HydrationSafeDateFormat({ dateString }: { dateString: string }) {
  const formattedDate = useSyncExternalStore(
    emptySubscribe,
    () => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    },
    () => {
      // 서버에서는 기본 형식 사용
      const date = new Date(dateString);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  );

  return <span>{formattedDate}</span>;
}

export function MeetingDetailModal({
  meeting,
  onClose,
  onToggleChecklist,
}: MeetingDetailModalProps) {
  const navigate = useNavigate();

  if (!meeting) return null;

  const handleEdit = () => {
    // 편집 페이지로 이동
    navigate(`/calendar/meeting/${meeting.id}/edit`);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 미팅을 삭제하시겠습니까?')) return;

    try {
      const formData = new FormData();
      formData.append('actionType', 'deleteMeeting');
      formData.append('meetingId', meeting.id);

      const response = await fetch('/calendar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('미팅이 성공적으로 삭제되었습니다.');
        onClose();
        navigate('.', { replace: true });
      } else {
        throw new Error('미팅 삭제 실패');
      }
    } catch (error) {
      console.error('미팅 삭제 중 오류:', error);
      toast.error('미팅 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + duration);

    return `${time} - ${endTime.toTimeString().slice(0, 5)} (${duration}분)`;
  };

  return (
    <Dialog open={!!meeting} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {meetingTypeLabels[meeting.type] || meeting.type}
            </Badge>
            {(meeting as any).priority && (
              <Badge
                className={priorityLabels[(meeting as any).priority]?.color}
              >
                {priorityLabels[(meeting as any).priority]?.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-300px)] mt-6">
          <div className="space-y-4">
            {/* 날짜와 시간 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <HydrationSafeDateFormat dateString={meeting.date} />
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {formatTime(meeting.time, meeting.duration)}
                </span>
              </div>
            </div>

            <Separator />

            {/* 고객 정보 */}
            {meeting.client && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">고객 정보</h4>
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      {(meeting.client as any).fullName ||
                        (meeting.client as any).name ||
                        '고객'}
                    </span>
                  </div>
                  {(meeting.client as any).phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">
                        {(meeting.client as any).phone}
                      </span>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* 미팅 방식 */}
            {(meeting as any).contactMethod && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">미팅 방식</h4>
                  <div className="flex items-center gap-3">
                    {(meeting as any).contactMethod === 'video' ? (
                      <>
                        <VideoIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">화상 미팅</span>
                      </>
                    ) : (meeting as any).contactMethod === 'phone' ? (
                      <>
                        <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">전화 미팅</span>
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">대면 미팅</span>
                      </>
                    )}
                  </div>
                  {meeting.location && (
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{meeting.location}</span>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* 설명 */}
            {meeting.description && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">미팅 메모</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {meeting.description}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* 구글 캘린더 정보 */}
            {(meeting as any).googleEventId && (
              <div className="space-y-2">
                <h4 className="font-medium">동기화 정보</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    구글 캘린더 동기화됨
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleEdit}>
            <EditIcon className="h-4 w-4 mr-2" />
            수정
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
