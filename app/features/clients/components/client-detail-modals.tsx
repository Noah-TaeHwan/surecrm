import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { DeleteConfirmationModal } from '~/common/components/ui/delete-confirmation-modal';
import { NewOpportunityModal } from './new-opportunity-modal';
import type {
  OpportunityData,
  OpportunitySuccessData,
  ErrorModalContent,
} from '../types/client-detail';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';

interface ClientDetailModalsProps {
  // 기본 상태
  clientName: string;

  // 삭제 모달
  showDeleteModal: boolean;
  isDeleting: boolean;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;

  // 영업 기회 모달
  showOpportunityModal: boolean;
  isCreatingOpportunity: boolean;
  onOpportunityClose: () => void;
  onOpportunityCreate: (data: OpportunityData) => Promise<void>;

  // 성공 모달들
  showSaveSuccessModal: boolean;
  showDeleteSuccessModal: boolean;
  showOpportunitySuccessModal: boolean;
  showTagSuccessModal: boolean;
  onSuccessModalClose: () => void;

  // 성공 모달 데이터
  opportunitySuccessData: OpportunitySuccessData;
  tagSuccessMessage: string;

  // 에러 모달
  showErrorModal: boolean;
  errorModalContent: ErrorModalContent;
  onErrorModalClose: () => void;
}

export function ClientDetailModals({
  clientName,
  showDeleteModal,
  isDeleting,
  onDeleteCancel,
  onDeleteConfirm,
  showOpportunityModal,
  isCreatingOpportunity,
  onOpportunityClose,
  onOpportunityCreate,
  showSaveSuccessModal,
  showDeleteSuccessModal,
  showOpportunitySuccessModal,
  showTagSuccessModal,
  onSuccessModalClose,
  opportunitySuccessData,
  tagSuccessMessage,
  showErrorModal,
  errorModalContent,
  onErrorModalClose,
}: ClientDetailModalsProps) {
  return (
    <>
      {/* 🗑️ 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="고객 삭제"
        description={`정말로 ${clientName} 고객을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={onDeleteConfirm}
        onClose={onDeleteCancel}
        isLoading={isDeleting}
      />

      {/* 🎯 새 영업 기회 모달 */}
      <NewOpportunityModal
        isOpen={showOpportunityModal}
        onClose={onOpportunityClose}
        onConfirm={onOpportunityCreate}
        isLoading={isCreatingOpportunity}
        clientName={clientName}
      />

      {/* ✅ 저장 성공 모달 */}
      <Dialog open={showSaveSuccessModal} onOpenChange={onSuccessModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">저장 완료</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  고객 정보가 성공적으로 업데이트되었습니다.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onSuccessModalClose} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ 삭제 성공 모달 */}
      <Dialog open={showDeleteSuccessModal} onOpenChange={onSuccessModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">삭제 완료</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  고객이 성공적으로 삭제되었습니다.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onSuccessModalClose} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 영업 기회 생성 성공 모달 */}
      <Dialog
        open={showOpportunitySuccessModal}
        onOpenChange={onSuccessModalClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  영업 기회 생성 완료
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  새로운 영업 기회가 성공적으로 생성되었습니다.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">고객명</span>
                <span className="text-sm font-medium">
                  {opportunitySuccessData.clientName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">보험 종류</span>
                <span className="text-sm font-medium">
                  {opportunitySuccessData.insuranceType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">현재 단계</span>
                <span className="text-sm font-medium">
                  {opportunitySuccessData.stageName}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onSuccessModalClose} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🏷️ 태그 성공 모달 */}
      <Dialog open={showTagSuccessModal} onOpenChange={onSuccessModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">작업 완료</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {tagSuccessMessage}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onSuccessModalClose} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ❌ 에러 모달 */}
      <Dialog open={showErrorModal} onOpenChange={onErrorModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg text-red-900 dark:text-red-100">
                  {errorModalContent.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-red-700 dark:text-red-300">
                  {errorModalContent.message}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={onErrorModalClose}
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
