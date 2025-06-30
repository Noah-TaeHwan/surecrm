import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import { FileText, Plus, Edit2, Save, X } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface ClientMemoSectionProps {
  notes: string;
  onSave: (notes: string) => Promise<void>; // 메모 저장 함수
}

export function ClientMemoSection({ notes, onSave }: ClientMemoSectionProps) {
  const { t } = useHydrationSafeTranslation('clients');

  // 메모 편집을 위한 독립적인 상태
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [editingNotes, setEditingNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  // 편집 시작
  const handleEditStart = () => {
    setEditingNotes(notes);
    setIsEditingMemo(true);
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditingNotes(notes);
    setIsEditingMemo(false);
  };

  // 메모 저장
  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(editingNotes);
      setIsEditingMemo(false);
    } catch (error) {
      console.error('메모 저장 실패:', error);
      // 에러 처리는 상위 컴포넌트에서 처리됨
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-3">
        <h4 className="font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">
            {t('memoSection.title', '고객 메모 및 특이사항')}
          </span>
          <span className="sm:hidden">
            {t('memoSection.title', '고객 메모')}
          </span>
        </h4>

        {/* 편집/저장/취소 버튼 */}
        {!isEditingMemo && notes && (
          <Button
            onClick={handleEditStart}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            <span className="sm:hidden">
              {t('consultationTab.editButton', '편집')}
            </span>
            <span className="hidden sm:inline">
              {t('consultationTab.editButton', '편집')}
            </span>
          </Button>
        )}

        {isEditingMemo && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleSave}
              size="sm"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving
                ? t('memoSection.savingButton', '저장 중...')
                : t('memoSection.saveButton', '저장')}
            </Button>
            <Button
              onClick={handleEditCancel}
              size="sm"
              variant="outline"
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-1" />
              {t('consultationModal.buttons.cancel', '취소')}
            </Button>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/40">
        {isEditingMemo ? (
          <Textarea
            value={editingNotes}
            onChange={e => setEditingNotes(e.target.value)}
            placeholder={t(
              'memoSection.placeholder',
              '고객에 대한 중요한 메모나 특이사항을 기록하세요...'
            )}
            className="min-h-[100px] sm:min-h-[120px] resize-none border-none p-0 bg-transparent text-sm"
            disabled={isSaving}
          />
        ) : notes ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{notes}</p>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              {t('memoSection.emptyState', '메모가 없습니다')}
            </p>
            <Button
              size="sm"
              onClick={handleEditStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('memoSection.addButton', '메모 추가')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
