/**
 * 📅 캘린더 확인 모달 컴포넌트들
 * 일정 삭제, 수정, 구글 캘린더 연동 등을 위한 다국어 지원 확인 모달
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  AlertTriangleIcon,
  TrashIcon,
  SaveIcon,
  RefreshCwIcon,
  XCircleIcon,
  CheckCircleIcon,
  Globe,
  WifiOffIcon,
} from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { Meeting } from '../types/types';

// 🗑️ 미팅 삭제 확인 모달
interface DeleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  meeting: Meeting | null;
  isLoading?: boolean;
}

export function DeleteMeetingModal({
  isOpen,
  onClose,
  onConfirm,
  meeting,
  isLoading = false,
}: DeleteMeetingModalProps) {
  const { t } = useHydrationSafeTranslation('calendar');

  if (!meeting) return null;

  const hasGoogleSync = meeting.syncInfo?.externalEventId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t('modals.deleteMeeting.title', '미팅을 삭제하시겠습니까?')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {t(
              'modals.deleteMeeting.description',
              '이 작업은 되돌릴 수 없습니다.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* 미팅 정보 */}
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
          {hasGoogleSync && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 text-sm dark:text-blue-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium">
                    {t(
                      'modals.deleteMeeting.googleCalendar.title',
                      '구글 캘린더에서도 삭제됩니다'
                    )}
                  </div>
                  <div className="text-blue-600 dark:text-blue-300">
                    {t(
                      'modals.deleteMeeting.googleCalendar.description',
                      '연동된 구글 캘린더 이벤트도 함께 삭제됩니다.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 주의사항 */}
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <TrashIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('modals.deleteMeeting.warning.title', '주의사항')}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {t(
                        'modals.deleteMeeting.warning.irreversible',
                        '이 작업은 되돌릴 수 없습니다.'
                      )}
                    </li>
                    <li>
                      {t(
                        'modals.deleteMeeting.warning.recordsDeleted',
                        '미팅 기록과 체크리스트가 함께 삭제됩니다.'
                      )}
                    </li>
                    {hasGoogleSync && (
                      <li>
                        {t(
                          'modals.deleteMeeting.warning.googleCalendarSync',
                          '구글 캘린더 이벤트도 동시에 삭제됩니다.'
                        )}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('modals.deleteMeeting.actions.cancel', '취소')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                삭제 중...
              </div>
            ) : (
              <>
                <TrashIcon className="h-4 w-4 mr-2" />
                {t('modals.deleteMeeting.actions.delete', '삭제')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 💾 저장 확인 모달
interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  hasChanges: boolean;
  hasGoogleSync?: boolean;
  isLoading?: boolean;
}

export function SaveConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  hasChanges,
  hasGoogleSync = false,
  isLoading = false,
}: SaveConfirmationModalProps) {
  const { t } = useHydrationSafeTranslation('calendar');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <SaveIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t(
              'modals.editMeeting.confirmSave.title',
              '변경사항을 저장하시겠습니까?'
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {t(
              'modals.editMeeting.confirmSave.description',
              '수정된 내용이 SureCRM과 구글 캘린더에 모두 반영됩니다.'
            )}
          </DialogDescription>
        </DialogHeader>

        {hasGoogleSync && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-sm text-green-800 dark:text-green-200 font-medium">
                {t(
                  'modals.editMeeting.confirmSave.googleSync',
                  '구글 캘린더와 자동 동기화됩니다.'
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('modals.editMeeting.confirmSave.cancel', '취소')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !hasChanges}
            className="min-w-20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                저장 중...
              </div>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                {t('modals.editMeeting.confirmSave.save', '저장')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 🚫 취소 확인 모달
interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onContinue: () => void;
  hasChanges: boolean;
}

export function CancelConfirmationModal({
  isOpen,
  onClose,
  onDiscard,
  onContinue,
  hasChanges,
}: CancelConfirmationModalProps) {
  const { t } = useHydrationSafeTranslation('calendar');

  if (!hasChanges) {
    // 변경사항이 없으면 바로 닫기
    onDiscard();
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <XCircleIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t(
              'modals.editMeeting.confirmCancel.title',
              '수정을 취소하시겠습니까?'
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {t(
              'modals.editMeeting.confirmCancel.description',
              '변경된 내용이 저장되지 않습니다.'
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onContinue}>
            {t('modals.editMeeting.confirmCancel.continue', '계속 수정')}
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            <XCircleIcon className="h-4 w-4 mr-2" />
            {t('modals.editMeeting.confirmCancel.discard', '변경사항 취소')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 🔄 구글 동기화 확인 모달
interface GoogleSyncConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'sync' | 'disconnect' | 'conflict';
  isLoading?: boolean;
  meeting?: Meeting | null;
}

export function GoogleSyncConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  isLoading = false,
  meeting,
}: GoogleSyncConfirmationModalProps) {
  const { t } = useHydrationSafeTranslation('calendar');

  const getModalContent = () => {
    switch (type) {
      case 'sync':
        return {
          icon: RefreshCwIcon,
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          title: t(
            'modals.googleSync.confirmSync.title',
            '구글 캘린더와 동기화하시겠습니까?'
          ),
          description: t(
            'modals.googleSync.confirmSync.description',
            '이 일정이 구글 캘린더에 추가됩니다.'
          ),
          confirmText: t('modals.googleSync.confirmSync.sync', '동기화'),
          cancelText: t('modals.googleSync.confirmSync.cancel', '취소'),
        };
      case 'disconnect':
        return {
          icon: WifiOffIcon,
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          title: t(
            'modals.googleSync.confirmDisconnect.title',
            '구글 캘린더 연동을 해제하시겠습니까?'
          ),
          description: t(
            'modals.googleSync.confirmDisconnect.description',
            '구글 캘린더에서 이 이벤트가 삭제됩니다.'
          ),
          confirmText: t(
            'modals.googleSync.confirmDisconnect.disconnect',
            '연동 해제'
          ),
          cancelText: t('modals.googleSync.confirmDisconnect.cancel', '취소'),
        };
      case 'conflict':
        return {
          icon: AlertTriangleIcon,
          iconColor: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          title: t(
            'modals.googleSync.conflictResolution.title',
            '동기화 충돌이 발생했습니다'
          ),
          description: t(
            'modals.googleSync.conflictResolution.description',
            '어떤 버전을 우선할지 선택해주세요.'
          ),
          confirmText: t(
            'modals.googleSync.conflictResolution.localPriority',
            'SureCRM 우선'
          ),
          cancelText: t('modals.googleSync.conflictResolution.cancel', '취소'),
        };
      default:
        return {
          icon: RefreshCwIcon,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          title: '확인',
          description: '작업을 진행하시겠습니까?',
          confirmText: '확인',
          cancelText: '취소',
        };
    }
  };

  const content = getModalContent();
  const Icon = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${content.bgColor}`}
          >
            <Icon className={`h-8 w-8 ${content.iconColor}`} />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* 미팅 정보 (있는 경우) */}
        {meeting && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-2">
              <div className="font-medium text-foreground">{meeting.title}</div>
              <div className="text-sm text-muted-foreground">
                {meeting.date} {meeting.time}
              </div>
            </div>
          </div>
        )}

        {/* 충돌 해결 특별 버튼들 */}
        {type === 'conflict' ? (
          <DialogFooter className="mt-6 gap-2 flex-col space-y-2">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  // SureCRM 우선으로 처리
                  onConfirm();
                }}
                disabled={isLoading}
                className="flex-1"
              >
                {t(
                  'modals.googleSync.conflictResolution.localPriority',
                  'SureCRM 우선'
                )}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // 구글 우선으로 처리 (별도 핸들러 필요)
                  onConfirm();
                }}
                disabled={isLoading}
                className="flex-1"
              >
                {t(
                  'modals.googleSync.conflictResolution.googlePriority',
                  '구글 캘린더 우선'
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              {content.cancelText}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {content.cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant={type === 'disconnect' ? 'destructive' : 'default'}
              className="min-w-20"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  처리 중...
                </div>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  {content.confirmText}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
