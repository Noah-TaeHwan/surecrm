import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Separator } from '~/common/components/ui/separator';
import { ClientMemoSection } from './client-memo-section';
import { ConsultationTimeline } from './consultation-timeline';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface ConsultationNote {
  id?: string;
  consultationDate: string;
  title: string;
  content: string;
  contractInfo?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

interface ConsultationNotesTabProps {
  notes: string;
  onSaveMemo: (_notes: string) => Promise<void>; // 메모 저장 함수
  consultationNotes: ConsultationNote[];
  onAddNote: () => void;
  onEditNote: (_note: ConsultationNote) => void;
  onDeleteNote: (_noteId: string) => void;
  onShowDeleteModal: (_note: ConsultationNote) => void;
}

export function ConsultationNotesTab({
  notes,
  onSaveMemo,
  consultationNotes,
  onAddNote,
  onEditNote,
  onDeleteNote: _onDeleteNote,
  onShowDeleteModal,
}: ConsultationNotesTabProps) {
  const { t } = useHydrationSafeTranslation('clients');

  return (
    <TabsContent value="notes" className="space-y-6">
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="hidden sm:inline">
              {t('consultationTab.title', '상담 내용 및 계약사항 메모')}
            </span>
            <span className="sm:hidden">
              {t('consultationTab.titleMobile', '상담 내용')}
            </span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            {t(
              'consultationTab.description',
              '날짜별로 상담 내용과 계약사항을 기록합니다.'
            )}
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 고객 메모 및 특이사항 */}
          <ClientMemoSection notes={notes} onSave={onSaveMemo} />

          <Separator />

          <ConsultationTimeline
            consultationNotes={consultationNotes}
            onAddNote={onAddNote}
            onEditNote={onEditNote}
            onDeleteNote={_onDeleteNote}
            onShowDeleteModal={onShowDeleteModal}
          />

          {/* 새 상담 기록 추가 폼 (숨김 상태) */}
          <div className="hidden p-4 bg-muted/30 rounded-lg border border-border">
            <h5 className="font-medium text-foreground mb-4">
              {t('consultationTab.addNewRecord', '새 상담 기록 작성')}
            </h5>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t(
                      'consultationModal.fields.consultationDate',
                      '상담 날짜'
                    )}{' '}
                    *
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    유형 *
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm"
                    disabled
                  >
                    <option>상담 유형 선택</option>
                    <option>초기 상담</option>
                    <option>보험 상담</option>
                    <option>계약 체결</option>
                    <option>클레임 처리</option>
                    <option>팔로업</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    중요도
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm"
                    disabled
                  >
                    <option>보통</option>
                    <option>높음</option>
                    <option>낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('consultationModal.fields.title', '제목')} *
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder={t(
                    'consultationModal.placeholders.title',
                    '상담 제목을 입력하세요'
                  )}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('consultationModal.fields.content', '상담 내용')} *
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm"
                  rows={6}
                  placeholder={t(
                    'consultationModal.placeholders.content',
                    '상담 내용을 상세히 입력하세요...'
                  )}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t(
                    'consultationModal.fields.followUpDate',
                    '다음 팔로업 날짜'
                  )}
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg text-sm"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button disabled>
                {t('consultationModal.buttons.save', '저장')}
              </Button>
              <Button variant="outline" disabled>
                {t('consultationModal.buttons.cancel', '취소')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
