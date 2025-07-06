/**
 * 📅 미팅 상세 정보 모달
 * Dialog를 사용하여 미팅 상세 정보 표시 + 구글 캘린더 연동 관리
 */

import React, { useState } from 'react';
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
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  PhoneIcon,
} from 'lucide-react';

import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { AddMeetingModal } from './add-meeting-modal';
import { DeleteMeetingModal } from './confirmation-modals';
import type { Meeting } from '../types/types';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  onClose: () => void;

  onToggleChecklist: (_meetingId: string, _itemId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clients: any[];
}

export function MeetingDetailModal({
  meeting,
  onClose,
  onToggleChecklist: _onToggleChecklist,
  clients: _clients,
}: MeetingDetailModalProps) {
  const { t } = useHydrationSafeTranslation('calendar');

  // 모달 상태 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 로딩 상태
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);

  if (!meeting) return null;

  // 📝 수정 모달 열기
  const handleEditMeeting = () => {
    setIsEditModalOpen(true);
  };

  // 🗑️ 삭제 처리
  const handleDeleteMeeting = async () => {
    try {
      setIsDeletingMeeting(true);

      const formData = new FormData();
      formData.append('actionType', 'deleteMeeting');
      formData.append('meetingId', meeting.id);

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onClose();
        // 성공 시 페이지 새로고침 또는 리디렉션
        window.location.reload();
      } else {
        alert(
          result.message ||
            t(
              'modals.deleteMeeting.errorMessage',
              '미팅 삭제 중 오류가 발생했습니다.'
            )
        );
      }
    } catch (error) {
      console.error('미팅 삭제 오류:', error);
      alert(
        t(
          'modals.deleteMeeting.errorMessage',
          '미팅 삭제 중 오류가 발생했습니다.'
        )
      );
    } finally {
      setIsDeletingMeeting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // 📞 연락처 정보 렌더링
  const renderContactInfo = () => {
    const { client } = meeting;
    if (!client.phone) return null;

    return (
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
          📞 {t('modals.meetingDetail.sections.contactInfo', '연락처 정보')}
        </h4>
        <div className="space-y-2">
          {client.phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 sm:p-4">
              <PhoneIcon className="h-4 w-4" />
              <a
                href={`tel:${client.phone}`}
                className="hover:text-foreground transition-colors"
              >
                {client.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={!!meeting} onOpenChange={onClose}>
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
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">{meeting.title}</span>
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
              <span>
                {meeting.date} {meeting.time}
              </span>
              {meeting.duration && (
                <>
                  <span>•</span>
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>
                    {meeting.duration}
                    {t('modals.meetingDetail.durationUnit', '분')}
                  </span>
                </>
              )}
            </div>
          </DialogHeader>

          {/* 콘텐츠 - 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
            <div className="space-y-3 sm:space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  👤 {t('modals.meetingDetail.sections.basicInfo', '기본 정보')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm font-medium">
                        {t('modals.meetingDetail.fields.client', '고객')}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-foreground">
                      {meeting.client.name}
                    </div>
                  </div>

                  {meeting.location && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">
                          {t('modals.meetingDetail.fields.location', '장소')}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-foreground">
                        {meeting.location}
                      </div>
                    </div>
                  )}

                  {meeting.type && (
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm font-medium">
                        {t(
                          'modals.meetingDetail.fields.meetingType',
                          '미팅 타입'
                        )}
                      </span>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {t(`meeting.types.${meeting.type}`, meeting.type)}
                      </Badge>
                    </div>
                  )}

                  {meeting.priority && (
                    <div className="space-y-2">
                      <span className="text-xs sm:text-sm font-medium">
                        {t('modals.meetingDetail.fields.priority', '중요도')}
                      </span>
                      <Badge
                        variant={
                          meeting.priority === 'urgent'
                            ? 'destructive'
                            : 'outline'
                        }
                        className="w-fit text-xs"
                      >
                        {meeting.priority}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {meeting.description && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    📝{' '}
                    {t(
                      'modals.meetingDetail.sections.description',
                      '미팅 설명'
                    )}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-3 sm:p-4">
                    {meeting.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* 연락처 정보 */}
              {renderContactInfo()}

              {/* 체크리스트 */}
              {meeting.checklist && meeting.checklist.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                      ✅{' '}
                      {t(
                        'modals.meetingDetail.sections.checklist',
                        '체크리스트'
                      )}
                    </h4>
                    <div className="space-y-2 bg-muted/30 rounded-lg p-3 sm:p-4">
                      {meeting.checklist.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() =>
                              _onToggleChecklist(meeting.id, item.id)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span
                            className={`text-xs sm:text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 푸터 - 고정 */}
          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-3 p-2 sm:p-6 border-t border-border/30">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
              >
                {t('actions.close', '닫기')}
              </Button>
              <Button
                variant="outline"
                onClick={handleEditMeeting}
                className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
              >
                <EditIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {t('actions.editMeeting', '수정')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeletingMeeting}
                className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
              >
                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {t('actions.deleteMeeting', '삭제')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <AddMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clients={_clients}
        editMode={true}
        editMeetingData={meeting}
      />

      {/* 삭제 확인 모달 */}
      <DeleteMeetingModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMeeting}
        meeting={meeting}
        isLoading={isDeletingMeeting}
      />
    </>
  );
}
