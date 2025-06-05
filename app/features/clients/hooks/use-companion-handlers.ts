import { useCallback } from 'react';

interface UseCompanionHandlersProps {
  clientId?: string;
  consultationCompanions: any[];
  setConsultationCompanions: (companions: any[]) => void;
  setShowAddCompanionModal: (show: boolean) => void;
  setEditingCompanion: (companion: any) => void;
  setShowSuccessModal: (show: boolean) => void;
  setSuccessMessage: (message: string) => void;
  showError: (title: string, message: string) => void;
  submit: any;
}

export function useCompanionHandlers({
  clientId,
  consultationCompanions,
  setConsultationCompanions,
  setShowAddCompanionModal,
  setEditingCompanion,
  setShowSuccessModal,
  setSuccessMessage,
  showError,
  submit,
}: UseCompanionHandlersProps) {
  const handleAddCompanion = useCallback(() => {
    setEditingCompanion({
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    });
    setShowAddCompanionModal(true);
  }, [setEditingCompanion, setShowAddCompanionModal]);

  const handleEditCompanion = useCallback(
    (companion: any) => {
      setEditingCompanion({
        id: companion.id,
        name: companion.name || '',
        phone: companion.phone || '',
        relationship: companion.relationship || '',
        isPrimary: companion.isPrimary || false,
      });
      setShowAddCompanionModal(true);
    },
    [setEditingCompanion, setShowAddCompanionModal]
  );

  const handleSaveCompanion = useCallback(async () => {
    try {
      const response = await fetch('/api/clients/consultation-companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          companionData: {},
        }),
      });

      if (response.ok) {
        setShowAddCompanionModal(false);
        setEditingCompanion(null);
        setSuccessMessage('상담동반자가 성공적으로 저장되었습니다.');
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        showError(
          '상담동반자 저장 실패',
          error.message || '상담동반자 저장 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('상담동반자 저장 실패:', error);
      showError('상담동반자 저장 실패', '네트워크 오류가 발생했습니다.');
    }
  }, [
    clientId,
    setShowAddCompanionModal,
    setEditingCompanion,
    setSuccessMessage,
    setShowSuccessModal,
    showError,
  ]);

  const handleDeleteCompanion = useCallback(
    async (companionId: string) => {
      if (!confirm('정말로 이 상담동반자를 삭제하시겠습니까?')) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append('intent', 'deleteConsultationCompanion');
        formData.append('companionId', companionId);

        submit(formData, { method: 'post' });

        setConsultationCompanions(
          consultationCompanions.filter(
            (companion: any) => companion.id !== companionId
          )
        );
        setSuccessMessage('상담동반자가 성공적으로 삭제되었습니다.');
        setShowSuccessModal(true);
      } catch (error) {
        console.error('상담동반자 삭제 실패:', error);
        showError('삭제 실패', '상담동반자 삭제 중 오류가 발생했습니다.');
      }
    },
    [
      submit,
      consultationCompanions,
      setConsultationCompanions,
      setSuccessMessage,
      setShowSuccessModal,
      showError,
    ]
  );

  return {
    handleAddCompanion,
    handleEditCompanion,
    handleSaveCompanion,
    handleDeleteCompanion,
  };
}
