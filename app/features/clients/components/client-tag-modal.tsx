// useState는 현재 사용되지 않지만 향후 상태 관리를 위해 유지
import { Plus, Target, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface TagForm {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface ClientTagModalProps {
  showTagModal: boolean;
  // eslint-disable-next-line no-unused-vars
  setShowTagModal: (_show: boolean) => void;
  availableTags: Tag[];
  selectedTagIds: string[];
  // eslint-disable-next-line no-unused-vars
  setSelectedTagIds: (_ids: string[] | ((_prev: string[]) => string[])) => void;
  isLoadingTags: boolean;
  onSaveTags: () => void;
  onCreateTag: () => void;
  tagForm: TagForm;
  // eslint-disable-next-line no-unused-vars
  setTagForm: (_form: TagForm | ((_prev: TagForm) => TagForm)) => void;
  showCreateTagModal: boolean;
  // eslint-disable-next-line no-unused-vars
  setShowCreateTagModal: (_show: boolean) => void;
  showTagSuccessModal: boolean;
  // eslint-disable-next-line no-unused-vars
  setShowTagSuccessModal: (_show: boolean) => void;
  tagSuccessMessage: string;
}

export function ClientTagModal({
  showTagModal,
  setShowTagModal,
  availableTags,
  selectedTagIds,
  setSelectedTagIds,
  isLoadingTags,
  onSaveTags,
  onCreateTag,
  tagForm,
  setTagForm,
  showCreateTagModal,
  setShowCreateTagModal,
  showTagSuccessModal,
  setShowTagSuccessModal,
  tagSuccessMessage,
}: ClientTagModalProps) {
  const { t } = useHydrationSafeTranslation('clients');

  return (
    <>
      {/* 🏷️ 태그 관리 모달 */}
      <Dialog open={showTagModal} onOpenChange={setShowTagModal}>
        <DialogContent
          className="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
          aria-describedby="tag-modal-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                🏷️
              </span>
              {t('tagModal.title', '태그 관리')}
            </DialogTitle>
            <DialogDescription id="tag-modal-description">
              {t(
                'tagModal.description',
                '고객에게 적용할 태그를 선택하거나 새로운 태그를 생성하세요. 체크박스를 통해 태그를 선택하고 적용 버튼을 눌러 저장하세요.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 새 태그 생성 섹션 */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">
                  {t('tagModal.createNewTag', '새 태그 생성')}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateTagModal(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t('tagModal.create', '생성')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t(
                  'tagModal.createDescription',
                  '새로운 태그를 생성하여 고객을 분류하고 관리하세요.'
                )}
              </p>
            </div>

            {/* 사용 가능한 태그 목록 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                {t('tagModal.availableTags', '사용 가능한 태그')}
              </h4>
              {isLoadingTags ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {t('tagModal.loadingTags', '태그를 불러오는 중...')}
                  </p>
                </div>
              ) : availableTags.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {availableTags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedTagIds(prev => [...prev, tag.id]);
                          } else {
                            setSelectedTagIds(prev =>
                              prev.filter(id => id !== tag.id)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium text-sm">
                            {tag.name}
                          </span>
                        </div>
                        {tag.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'tagModal.noTagsAvailable',
                      '사용 가능한 태그가 없습니다.'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'tagModal.createNewTagSuggestion',
                      '새 태그를 생성해보세요.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowTagModal(false);
                setSelectedTagIds([]);
              }}
            >
              {t('header.cancel', '취소')}
            </Button>
            <Button onClick={onSaveTags} disabled={isLoadingTags}>
              {isLoadingTags
                ? t('tagModal.saving', '저장 중...')
                : t('tagModal.apply', '적용')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🏷️ 새 태그 생성 모달 */}
      <Dialog open={showCreateTagModal} onOpenChange={setShowCreateTagModal}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="create-tag-modal-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                🎨
              </span>
              {t('createTagModal.title', '새 태그 생성')}
            </DialogTitle>
            <DialogDescription id="create-tag-modal-description">
              {t(
                'createTagModal.description',
                '새로운 태그를 생성하여 고객을 효율적으로 분류하세요. 태그 이름과 색상을 설정할 수 있습니다.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('createTagModal.tagName', '태그 이름')} *
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg text-sm"
                placeholder={t(
                  'createTagModal.tagNamePlaceholder',
                  '예: 키맨 고객, 신규 고객, 관심 고객'
                )}
                value={tagForm.name}
                onChange={e =>
                  setTagForm(prev => ({ ...prev, name: e.target.value }))
                }
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('createTagModal.tagColor', '태그 색상')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={tagForm.color}
                  onChange={e =>
                    setTagForm(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-8 rounded border cursor-pointer"
                />
                <div className="flex gap-2">
                  {[
                    '#3b82f6',
                    '#ef4444',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#f97316',
                    '#06b6d4',
                    '#84cc16',
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setTagForm(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('createTagModal.description', '설명')} (
                {t('createTagModal.optional', '선택사항')})
              </label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none"
                placeholder={t(
                  'createTagModal.descriptionPlaceholder',
                  '태그에 대한 설명을 입력하세요'
                )}
                rows={3}
                value={tagForm.description}
                onChange={e =>
                  setTagForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={100}
              />
            </div>

            {/* 미리보기 */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('createTagModal.preview', '미리보기')}
              </label>
              <div className="p-3 border rounded-lg bg-muted/30">
                {tagForm.name ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${tagForm.color}20`,
                      borderColor: tagForm.color,
                      color: tagForm.color,
                    }}
                  >
                    {tagForm.name}
                  </Badge>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'createTagModal.previewPlaceholder',
                      '태그 이름을 입력하면 미리보기가 표시됩니다.'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateTagModal(false);
                setTagForm({
                  id: '',
                  name: '',
                  color: '#3b82f6',
                  description: '',
                });
              }}
            >
              {t('header.cancel', '취소')}
            </Button>
            <Button
              onClick={onCreateTag}
              disabled={!tagForm.name.trim() || isLoadingTags}
            >
              {isLoadingTags
                ? t('tagModal.creating', '생성 중...')
                : t('tagModal.create', '생성')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🏷️ 태그 성공 모달 */}
      <Dialog open={showTagSuccessModal} onOpenChange={setShowTagSuccessModal}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="tag-success-modal-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-green-600" aria-hidden="true">
                ✅
              </span>
              {t('successModal.title', '태그 저장 완료')}
            </DialogTitle>
            <DialogDescription id="tag-success-modal-description">
              {t(
                'successModal.description',
                '태그 변경사항이 성공적으로 저장되었습니다.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-foreground">{tagSuccessMessage}</p>
          </div>
          <DialogFooter className="flex justify-end pt-4">
            <Button
              onClick={() => setShowTagSuccessModal(false)}
              className="px-6"
            >
              {t('successModal.confirm', '확인')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
