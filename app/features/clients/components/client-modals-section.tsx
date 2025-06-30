import { useNavigate } from 'react-router';
import { Button } from '~/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { NewOpportunityModal } from './new-opportunity-modal';
import { DeleteConfirmationModal } from '~/common/components/ui/delete-confirmation-modal';
import { OpportunitySuccessModal } from './opportunity-success-modal';
import { ClientErrorModal } from './client-error-modal';
import { ClientSuccessModal } from './client-success-modal';
import { CompanionModal } from './companion-modal';
import { ConsultationNoteModal } from './consultation-note-modal';
import { ClientTagModal } from './client-tag-modal';

interface ClientModalsSectionProps {
  // 새 영업 기회 모달
  showOpportunityModal: boolean;
  setShowOpportunityModal: (show: boolean) => void;
  onCreateOpportunity: (data: {
    insuranceType: string;
    notes: string;
  }) => Promise<void>;
  clientName: string;
  isCreatingOpportunity: boolean;

  // 삭제 확인 모달
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;

  // 저장 성공 모달
  showSaveSuccessModal: boolean;
  setShowSaveSuccessModal: (show: boolean) => void;

  // 삭제 성공 모달
  showDeleteSuccessModal: boolean;
  setShowDeleteSuccessModal: (show: boolean) => void;

  // 새 영업 기회 성공 모달
  showOpportunitySuccessModal: boolean;
  setShowOpportunitySuccessModal: (show: boolean) => void;
  opportunitySuccessData: {
    clientName: string;
    insuranceType: string;
    stageName: string;
  };

  // 에러 모달
  showErrorModal: boolean;
  setShowErrorModal: (show: boolean) => void;
  errorModalContent: {
    title: string;
    message: string;
  };

  // 성공 모달
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  successMessage: string;

  // 상담동반자 모달
  showAddCompanionModal: boolean;
  setShowAddCompanionModal: (show: boolean) => void;
  editingCompanion: any;
  setEditingCompanion: (companion: any) => void;
  onSaveCompanion: () => void;

  // 상담동반자 삭제 모달
  showDeleteCompanionModal: boolean;
  setShowDeleteCompanionModal: (show: boolean) => void;
  companionToDelete: { id: string; name: string } | null;
  onConfirmDeleteCompanion: () => void;

  // 상담내용 모달
  showAddNoteModal: boolean;
  setShowAddNoteModal: (show: boolean) => void;
  editingNote: any;
  setEditingNote: (note: any) => void;
  onSaveNote: () => void;

  // 태그 모달
  showTagModal: boolean;
  setShowTagModal: (show: boolean) => void;
  availableTags: any[];
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  isLoadingTags: boolean;
  onSaveTags: () => void;
  onCreateTag: () => void;
  tagForm: any;
  setTagForm: (form: any) => void;
  showCreateTagModal: boolean;
  setShowCreateTagModal: (show: boolean) => void;
  showTagSuccessModal: boolean;
  setShowTagSuccessModal: (show: boolean) => void;
  tagSuccessMessage: string;
}

export function ClientModalsSection({
  // 새 영업 기회 모달 props
  showOpportunityModal,
  setShowOpportunityModal,
  onCreateOpportunity,
  clientName,
  isCreatingOpportunity,

  // 삭제 확인 모달 props
  showDeleteModal,
  setShowDeleteModal,
  onConfirmDelete,
  isDeleting,

  // 저장 성공 모달 props
  showSaveSuccessModal,
  setShowSaveSuccessModal,

  // 삭제 성공 모달 props
  showDeleteSuccessModal,
  setShowDeleteSuccessModal,

  // 새 영업 기회 성공 모달 props
  showOpportunitySuccessModal,
  setShowOpportunitySuccessModal,
  opportunitySuccessData,

  // 에러 모달 props
  showErrorModal,
  setShowErrorModal,
  errorModalContent,

  // 성공 모달 props
  showSuccessModal,
  setShowSuccessModal,
  successMessage,

  // 상담동반자 모달 props
  showAddCompanionModal,
  setShowAddCompanionModal,
  editingCompanion,
  setEditingCompanion,
  onSaveCompanion,

  // 상담동반자 삭제 모달 props
  showDeleteCompanionModal,
  setShowDeleteCompanionModal,
  companionToDelete,
  onConfirmDeleteCompanion,

  // 상담내용 모달 props
  showAddNoteModal,
  setShowAddNoteModal,
  editingNote,
  setEditingNote,
  onSaveNote,

  // 태그 모달 props
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
}: ClientModalsSectionProps) {
  const navigate = useNavigate();
  const { t } = useHydrationSafeTranslation('clients');

  return (
    <>
      {/* 🚀 새 영업 기회 모달 */}
      <NewOpportunityModal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        onConfirm={onCreateOpportunity}
        clientName={clientName}
        isLoading={isCreatingOpportunity}
      />

      {/* 🗑️ 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
        title={t('deleteModal.title', '고객 삭제 확인')}
        description={t(
          'deleteModal.description',
          `정말로 "${clientName}" 고객을 삭제하시겠습니까?`,
          { clientName }
        )}
        itemName={clientName}
        itemType={t('labels.client', '고객')}
        warningMessage={t(
          'deleteModal.warning',
          '이 고객과 관련된 모든 데이터(보험 정보, 미팅 기록, 연락 이력 등)가 함께 삭제됩니다.'
        )}
        isLoading={isDeleting}
      />

      {/* 💾 저장 성공 모달 */}
      <Dialog
        open={showSaveSuccessModal}
        onOpenChange={setShowSaveSuccessModal}
      >
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle>{t('saveModal.title', '저장 완료')}</DialogTitle>
              <DialogDescription>
                {t(
                  'saveModal.description',
                  '고객 정보가 성공적으로 업데이트되었습니다.'
                )}
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => setShowSaveSuccessModal(false)}
              className="w-full"
            >
              {t('saveModal.confirm', '확인')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🗑️ 삭제 성공 모달 */}
      <Dialog
        open={showDeleteSuccessModal}
        onOpenChange={setShowDeleteSuccessModal}
      >
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle>
                {t('deleteSuccessModal.title', '삭제 완료')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'deleteSuccessModal.description',
                  `'${clientName}' 고객이 성공적으로 삭제되었습니다.`,
                  { clientName }
                )}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  {t(
                    'deleteSuccessModal.redirectInfo',
                    '잠시 후 고객 목록으로 이동합니다.'
                  )}
                </span>
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => {
                setShowDeleteSuccessModal(false);
                navigate('/clients');
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {t('deleteSuccessModal.goToClientsList', '고객 목록으로 이동')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🎉 새 영업 기회 성공 모달 */}
      <OpportunitySuccessModal
        isOpen={showOpportunitySuccessModal}
        onClose={() => setShowOpportunitySuccessModal(false)}
        data={opportunitySuccessData}
        onConfirm={() => {
          setShowOpportunitySuccessModal(false);
          setShowOpportunityModal(false);
          // 🎯 사용자가 확인 버튼을 누른 후에만 새로고침
          setTimeout(() => {
            window.location.reload();
          }, 500); // 모달이 닫힌 후 새로고침
        }}
      />

      {/* ❌ 에러 모달 */}
      <ClientErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        content={errorModalContent}
      />

      {/* 🆕 성공 모달 */}
      <ClientSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      {/* 🆕 상담동반자 추가/수정 모달 */}
      <CompanionModal
        isOpen={showAddCompanionModal}
        onClose={() => {
          setShowAddCompanionModal(false);
          setEditingCompanion(null);
        }}
        companion={editingCompanion}
        onSave={onSaveCompanion}
        onCompanionChange={setEditingCompanion}
      />

      {/* 🗑️ 상담동반자 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={showDeleteCompanionModal}
        onClose={() => setShowDeleteCompanionModal(false)}
        onConfirm={onConfirmDeleteCompanion}
        title={t('companionDeleteModal.title', '상담동반자 삭제 확인')}
        description={t(
          'companionDeleteModal.description',
          `정말로 "${companionToDelete?.name}" 동반자를 삭제하시겠습니까?`,
          { companionName: companionToDelete?.name }
        )}
        itemName={companionToDelete?.name || ''}
        itemType={t('companionDeleteModal.itemType', '상담동반자')}
        warningMessage={t(
          'companionDeleteModal.warning',
          '삭제된 동반자 정보는 복구할 수 없습니다.'
        )}
        isLoading={false}
      />

      {/* 🆕 상담내용 추가/수정 모달 */}
      <ConsultationNoteModal
        isOpen={showAddNoteModal}
        onClose={() => {
          setShowAddNoteModal(false);
          setEditingNote(null);
        }}
        note={editingNote}
        onSave={onSaveNote}
        onNoteChange={setEditingNote}
      />

      <ClientTagModal
        showTagModal={showTagModal}
        setShowTagModal={setShowTagModal}
        availableTags={availableTags}
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
        isLoadingTags={isLoadingTags}
        onSaveTags={onSaveTags}
        onCreateTag={onCreateTag}
        tagForm={tagForm}
        setTagForm={setTagForm}
        showCreateTagModal={showCreateTagModal}
        setShowCreateTagModal={setShowCreateTagModal}
        showTagSuccessModal={showTagSuccessModal}
        setShowTagSuccessModal={setShowTagSuccessModal}
        tagSuccessMessage={tagSuccessMessage}
      />
    </>
  );
}
