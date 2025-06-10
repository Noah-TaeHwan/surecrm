import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Label } from '~/common/components/ui/label';
import { Upload } from 'lucide-react';
import { AddClientModal } from './add-client-modal';

// AddClientModal 타입과 일치하도록 수정
interface ClientFormData {
  fullName: string;
  phone?: string; // 전화번호를 선택사항으로 변경
  email?: string;
  telecomProvider?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  referredById?: string;
  tags?: string;
  notes?: string;
}

interface ClientProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  notes?: string;
}

interface ClientsPageModalsProps {
  // Add Client Modal
  showAddClientModal: boolean;
  setShowAddClientModal: (show: boolean) => void;
  onClientSubmit: (data: ClientFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  potentialReferrers: Array<{ id: string; name: string }>;

  // Import Modal
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;

  // Edit Client Modal
  showEditClientModal: boolean;
  setShowEditClientModal: (show: boolean) => void;

  // Delete Confirm Modal
  showDeleteConfirmModal: boolean;
  setShowDeleteConfirmModal: (show: boolean) => void;
  selectedClient: ClientProfile | null;
  onConfirmDelete: () => void;
}

export function ClientsPageModals({
  // Add Client Modal
  showAddClientModal,
  setShowAddClientModal,
  onClientSubmit,
  isSubmitting,
  submitError,
  potentialReferrers,

  // Import Modal
  showImportModal,
  setShowImportModal,

  // Edit Client Modal
  showEditClientModal,
  setShowEditClientModal,

  // Delete Confirm Modal
  showDeleteConfirmModal,
  setShowDeleteConfirmModal,
  selectedClient,
  onConfirmDelete,
}: ClientsPageModalsProps) {
  return (
    <>
      {/* 🎯 고객 추가 모달 */}
      <AddClientModal
        open={showAddClientModal}
        onOpenChange={setShowAddClientModal}
        onSubmit={onClientSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        referrers={potentialReferrers}
      />

      {/* 🎯 엑셀 가져오기 모달 */}
      {showImportModal && (
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>엑셀 가져오기</DialogTitle>
              <DialogDescription>
                Phase 3에서 실제 파일 업로드 기능을 구현할 예정입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  CSV 또는 Excel 파일을 드래그하거나 클릭하여 업로드
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportModal(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    alert(
                      'Phase 3에서 실제 파일 업로드 기능을 구현할 예정입니다.'
                    );
                    setShowImportModal(false);
                  }}
                >
                  업로드
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 🎯 고객 수정 모달 */}
      {showEditClientModal && (
        <Dialog
          open={showEditClientModal}
          onOpenChange={setShowEditClientModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>고객 정보 수정</DialogTitle>
              <DialogDescription>
                Phase 3에서 실제 수정 기능을 구현할 예정입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>이름</Label>
                <Input placeholder="고객 이름" />
              </div>
              <div>
                <Label>전화번호</Label>
                <Input placeholder="010-1234-5678" />
              </div>
              <div>
                <Label>이메일</Label>
                <Input placeholder="example@email.com" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditClientModal(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    alert('Phase 3에서 실제 수정 기능을 구현할 예정입니다.');
                    setShowEditClientModal(false);
                  }}
                >
                  수정
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 🎯 고객 삭제 확인 모달 */}
      {showDeleteConfirmModal && (
        <Dialog
          open={showDeleteConfirmModal}
          onOpenChange={setShowDeleteConfirmModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>고객 삭제 확인</DialogTitle>
              <DialogDescription>
                {selectedClient?.fullName} 고객을 정말로 삭제하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                취소
              </Button>
              <Button variant="destructive" onClick={onConfirmDelete}>
                삭제
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
