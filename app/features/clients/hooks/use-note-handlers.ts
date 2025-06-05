import { useCallback } from 'react';

interface UseNoteHandlersProps {
  clientId?: string;
  consultationNotes: any[];
  setConsultationNotes: (notes: any[]) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setEditingNote: (note: any) => void;
  setShowSuccessModal: (show: boolean) => void;
  setSuccessMessage: (message: string) => void;
  showError: (title: string, message: string) => void;
  submit: any;
}

export function useNoteHandlers({
  clientId,
  consultationNotes,
  setConsultationNotes,
  setShowAddNoteModal,
  setEditingNote,
  setShowSuccessModal,
  setSuccessMessage,
  showError,
  submit,
}: UseNoteHandlersProps) {
  const handleAddNote = useCallback(() => {
    setEditingNote({
      consultationDate: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      contractInfo: '',
      followUpDate: '',
      followUpNotes: '',
    });
    setShowAddNoteModal(true);
  }, [setEditingNote, setShowAddNoteModal]);

  const handleEditNote = useCallback(
    (note: any) => {
      setEditingNote({
        id: note.id,
        consultationDate: note.consultationDate
          ? new Date(note.consultationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        title: note.title || '',
        content: note.content || '',
        contractInfo: note.contractInfo || '',
        followUpDate: note.followUpDate
          ? new Date(note.followUpDate).toISOString().split('T')[0]
          : '',
        followUpNotes: note.followUpNotes || '',
      });
      setShowAddNoteModal(true);
    },
    [setEditingNote, setShowAddNoteModal]
  );

  const handleSaveNote = useCallback(async () => {
    try {
      const response = await fetch('/api/clients/consultation-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          noteData: {},
        }),
      });

      if (response.ok) {
        setShowAddNoteModal(false);
        setEditingNote(null);
        setSuccessMessage('상담내용이 성공적으로 저장되었습니다.');
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        showError(
          '상담내용 저장 실패',
          error.message || '상담내용 저장 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('상담내용 저장 실패:', error);
      showError('상담내용 저장 실패', '네트워크 오류가 발생했습니다.');
    }
  }, [
    clientId,
    setShowAddNoteModal,
    setEditingNote,
    setSuccessMessage,
    setShowSuccessModal,
    showError,
  ]);

  return {
    handleAddNote,
    handleEditNote,
    handleSaveNote,
  };
}
