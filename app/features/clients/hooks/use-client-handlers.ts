import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { ClientValidationSchema } from '../lib/client-detail-utils';

interface UseClientHandlersProps {
  client: any;
  editFormData: any;
  setEditFormData: (data: any) => void;
  setIsEditing: (editing: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowSaveSuccessModal: (show: boolean) => void;
  setShowDeleteSuccessModal: (show: boolean) => void;
  setShowOpportunitySuccessModal: (show: boolean) => void;
  setOpportunitySuccessData: (data: any) => void;
  setShowErrorModal: (show: boolean) => void;
  setErrorModalContent: (content: any) => void;
  submit: any;
}

export function useClientHandlers({
  client,
  editFormData,
  setEditFormData,
  setIsEditing,
  setShowDeleteModal,
  setShowSaveSuccessModal,
  setShowDeleteSuccessModal,
  setShowOpportunitySuccessModal,
  setOpportunitySuccessData,
  setShowErrorModal,
  setErrorModalContent,
  submit,
}: UseClientHandlersProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClient = useCallback(async () => {
    setShowDeleteModal(true);
  }, [setShowDeleteModal]);

  const confirmDeleteClient = useCallback(async () => {
    if (!client?.id) return;

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('intent', 'deleteClient');

      submit(formData, { method: 'post' });

      setShowDeleteModal(false);
      setShowDeleteSuccessModal(true);

      setTimeout(() => {
        navigate('/dashboard/clients');
      }, 2000);
    } catch (error) {
      console.error('❌ 고객 삭제 실패:', error);
      setShowErrorModal(true);
      setErrorModalContent({
        title: '고객 삭제 실패',
        message: '고객 삭제 중 오류가 발생했습니다.',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [
    client?.id,
    submit,
    setShowDeleteModal,
    setShowDeleteSuccessModal,
    setShowErrorModal,
    setErrorModalContent,
    navigate,
  ]);

  const handleEditStart = useCallback(() => {
    if (!client) return;

    setEditFormData({
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      telecomProvider: client.telecomProvider || 'none',
      address: client.address || '',
      occupation: client.occupation || '',
      height: client.height || '',
      weight: client.weight || '',
      hasDrivingLicense: client.hasDrivingLicense || false,
      importance: client.importance || 'medium',
      notes: client.notes || '',
      ssn: '',
      ssnFront: '',
      ssnBack: '',
      birthDate: '',
      gender: '',
      ssnError: undefined,
    });
    setIsEditing(true);
  }, [client, setEditFormData, setIsEditing]);

  const handleSsnChange = useCallback(
    async (ssnFront: string, ssnBack: string) => {
      if (
        ssnFront &&
        ssnBack &&
        ssnFront.length === 6 &&
        ssnBack.length === 7
      ) {
        const fullSSN = `${ssnFront}-${ssnBack}`;

        try {
          const { parseKoreanId } = await import('~/lib/utils/korean-id-utils');
          const parseResult = parseKoreanId(fullSSN);

          if (
            parseResult.isValid &&
            parseResult.birthDate &&
            parseResult.gender
          ) {
            setEditFormData((prev: any) => ({
              ...prev,
              ssnFront,
              ssnBack,
              birthDate: parseResult.birthDate!.toISOString().split('T')[0],
              gender: parseResult.gender,
              ssnError: undefined,
            }));
          } else {
            setEditFormData((prev: any) => ({
              ...prev,
              ssnFront,
              ssnBack,
              birthDate: '',
              gender: '',
              ssnError:
                parseResult.errorMessage || '유효하지 않은 주민등록번호입니다.',
            }));
          }
        } catch (error) {
          console.error('주민등록번호 파싱 오류:', error);
          setEditFormData((prev: any) => ({
            ...prev,
            ssnFront,
            ssnBack,
            ssnError: '주민등록번호 처리 중 오류가 발생했습니다.',
          }));
        }
      } else {
        setEditFormData((prev: any) => ({
          ...prev,
          ssnFront,
          ssnBack,
          birthDate: '',
          gender: '',
          ssnError:
            ssnFront || ssnBack
              ? '주민등록번호를 정확히 입력해주세요.'
              : undefined,
        }));
      }
    },
    [setEditFormData]
  );

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditFormData({
      fullName: '',
      phone: '',
      email: '',
      telecomProvider: 'none',
      address: '',
      occupation: '',
      height: '',
      weight: '',
      hasDrivingLicense: false,
      importance: 'medium' as const,
      notes: '',
      ssn: '',
      ssnFront: '',
      ssnBack: '',
      birthDate: '',
      gender: '',
      ssnError: undefined,
    });
  }, [setIsEditing, setEditFormData]);

  const showError = useCallback(
    (title: string, message: string) => {
      setErrorModalContent({ title, message });
      setShowErrorModal(true);
    },
    [setErrorModalContent, setShowErrorModal]
  );

  const handleEditSave = useCallback(async () => {
    try {
      const validationResult = ClientValidationSchema.safeParse(editFormData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('\n');
        showError('입력 오류', `다음 항목을 확인해주세요:\n${errors}`);
        return;
      }

      const formData = new FormData();
      formData.append('intent', 'updateClient');

      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      submit(formData, { method: 'post' });

      setIsEditing(false);
      setShowSaveSuccessModal(true);
    } catch (error) {
      console.error('❌ 고객 정보 저장 실패:', error);
      showError('저장 실패', '고객 정보 저장 중 오류가 발생했습니다.');
    }
  }, [editFormData, submit, setIsEditing, setShowSaveSuccessModal, showError]);

  const handleCreateOpportunity = useCallback(
    async (data: { insuranceType: string; notes: string }) => {
      if (!client?.id) return;

      try {
        const response = await fetch('/api/pipeline/stages', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('파이프라인 단계 조회 실패');
        }

        const stages = await response.json();
        const firstStage = stages[0];

        if (!firstStage) {
          throw new Error('사용 가능한 파이프라인 단계가 없습니다.');
        }

        const formData = new FormData();
        formData.append('intent', 'updateClientStage');
        formData.append('targetStageId', firstStage.id);
        formData.append('notes', data.notes);

        submit(formData, { method: 'post' });

        setOpportunitySuccessData({
          clientName: client.fullName || '고객',
          insuranceType: data.insuranceType,
          stageName: firstStage.name,
        });
        setShowOpportunitySuccessModal(true);
      } catch (error) {
        console.error('❌ 영업 기회 생성 실패:', error);
        showError(
          '영업 기회 생성 실패',
          '영업 기회 생성 중 오류가 발생했습니다.'
        );
      }
    },
    [
      client,
      submit,
      setOpportunitySuccessData,
      setShowOpportunitySuccessModal,
      showError,
    ]
  );

  return {
    isDeleting,
    handleDeleteClient,
    confirmDeleteClient,
    handleEditStart,
    handleSsnChange,
    handleEditCancel,
    showError,
    handleEditSave,
    handleCreateOpportunity,
  };
}
