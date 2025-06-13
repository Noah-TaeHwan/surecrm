import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useFetcher, useSubmit } from 'react-router';
import type { Client } from '~/lib/schema';
import type {
  EditFormData,
  MedicalHistory,
  CheckupPurposes,
  InterestCategories,
  ConsultationCompanion,
  ConsultationNote,
  TagForm,
  OpportunityData,
  OpportunitySuccessData,
  ErrorModalContent,
} from '../types/client-detail';
import {
  validateClientForm,
  createEditFormDataFromClient,
  getInitialMedicalHistory,
  getInitialCheckupPurposes,
  getInitialInterestCategories,
} from './client-detail-utils';

interface UseClientDetailProps {
  client: Client | null;
  clientOverview: any;
  currentUser: any;
}

export function useClientDetail({
  client,
  clientOverview,
  currentUser,
}: UseClientDetailProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const submit = useSubmit();

  // 기본 상태
  const [activeTab, setActiveTab] = useState('notes');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);

  // 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showOpportunitySuccessModal, setShowOpportunitySuccessModal] =
    useState(false);
  const [showTagSuccessModal, setShowTagSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 성공 모달 데이터
  const [opportunitySuccessData, setOpportunitySuccessData] =
    useState<OpportunitySuccessData>({
      clientName: '',
      insuranceType: '',
      stageName: '',
    });
  const [tagSuccessMessage, setTagSuccessMessage] = useState('');
  const [errorModalContent, setErrorModalContent] = useState<ErrorModalContent>(
    {
      title: '',
      message: '',
    }
  );

  // 폼 상태
  const [editFormData, setEditFormData] = useState<EditFormData>(
    createEditFormDataFromClient(client)
  );
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>(
    getInitialMedicalHistory()
  );
  const [checkupPurposes, setCheckupPurposes] = useState<CheckupPurposes>(
    getInitialCheckupPurposes()
  );
  const [interestCategories, setInterestCategories] =
    useState<InterestCategories>(getInitialInterestCategories());

  // 태그 관련 상태
  const [clientTags, setClientTags] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagForm, setTagForm] = useState<TagForm>({
    id: '',
    name: '',
    color: '#3b82f6',
    description: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // 상담 관련 상태
  const [consultationCompanions, setConsultationCompanions] = useState<
    ConsultationCompanion[]
  >([]);
  const [consultationNotes, setConsultationNotes] = useState<
    ConsultationNote[]
  >([]);
  const [showAddCompanionModal, setShowAddCompanionModal] = useState(false);
  const [editingCompanion, setEditingCompanion] =
    useState<ConsultationCompanion | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ConsultationNote | null>(null);

  // 클라이언트 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (client) {
      setEditFormData(createEditFormDataFromClient(client));
    }
  }, [client]);

  // 클라이언트 개요 데이터 초기화
  useEffect(() => {
    if (clientOverview) {
      if (clientOverview.medicalHistory) {
        setMedicalHistory({
          hasRecentDiagnosis:
            clientOverview.medicalHistory.hasRecentDiagnosis || false,
          hasRecentSuspicion:
            clientOverview.medicalHistory.hasRecentSuspicion || false,
          hasRecentMedication:
            clientOverview.medicalHistory.hasRecentMedication || false,
          hasRecentTreatment:
            clientOverview.medicalHistory.hasRecentTreatment || false,
          hasRecentHospitalization:
            clientOverview.medicalHistory.hasRecentHospitalization || false,
          hasRecentSurgery:
            clientOverview.medicalHistory.hasRecentSurgery || false,
          recentMedicalDetails:
            clientOverview.medicalHistory.recentMedicalDetails || '',
          hasAdditionalExam:
            clientOverview.medicalHistory.hasAdditionalExam || false,
          additionalExamDetails:
            clientOverview.medicalHistory.additionalExamDetails || '',
          hasMajorHospitalization:
            clientOverview.medicalHistory.hasMajorHospitalization || false,
          hasMajorSurgery:
            clientOverview.medicalHistory.hasMajorSurgery || false,
          hasLongTermTreatment:
            clientOverview.medicalHistory.hasLongTermTreatment || false,
          hasLongTermMedication:
            clientOverview.medicalHistory.hasLongTermMedication || false,
          majorMedicalDetails:
            clientOverview.medicalHistory.majorMedicalDetails || '',
        });
      }

      if (clientOverview.checkupPurposes) {
        setCheckupPurposes({
          ...getInitialCheckupPurposes(),
          ...clientOverview.checkupPurposes,
        });
      }

      if (clientOverview.interestCategories) {
        setInterestCategories({
          ...getInitialInterestCategories(),
          ...clientOverview.interestCategories,
        });
      }

      if (clientOverview.consultationCompanions) {
        setConsultationCompanions(clientOverview.consultationCompanions);
      }

      if (clientOverview.consultationNotes) {
        setConsultationNotes(clientOverview.consultationNotes);
      }
    }
  }, [clientOverview]);

  // 에러 표시 함수
  const showError = useCallback((title: string, message: string) => {
    setErrorModalContent({ title, message });
    setShowErrorModal(true);
  }, []);

  // 편집 시작
  const handleEditStart = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 편집 취소
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditFormData(createEditFormDataFromClient(client));
  }, [client]);

  // 편집 폼 데이터 변경
  const handleEditFormChange = useCallback((data: Partial<EditFormData>) => {
    setEditFormData(prev => ({ ...prev, ...data }));
  }, []);

  // 주민등록번호 변경
  const handleSsnChange = useCallback(
    async (ssnFront: string, ssnBack: string) => {
      setEditFormData(prev => ({
        ...prev,
        ssnFront,
        ssnBack,
        ssn: ssnFront && ssnBack ? `${ssnFront}-${ssnBack}` : '',
        ssnError: undefined,
      }));

      if (ssnFront.length === 6 && ssnBack.length >= 1) {
        try {
          const response = await fetch('/api/clients/validate-ssn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssnFront, ssnBack }),
          });

          const result = await response.json();

          if (!response.ok) {
            setEditFormData(prev => ({ ...prev, ssnError: result.error }));
          } else {
            setEditFormData(prev => ({
              ...prev,
              birthDate: result.birthDate,
              gender: result.gender,
              ssnError: undefined,
            }));
          }
        } catch (error) {
          console.error('SSN 검증 실패:', error);
        }
      }
    },
    []
  );

  // 편집 저장
  const handleEditSave = useCallback(async () => {
    const errors = validateClientForm(editFormData);
    if (errors.length > 0) {
      showError('입력 오류', errors.join('\n'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('action', 'update');
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      submit(formData, { method: 'POST' });
      setIsEditing(false);
      setShowSaveSuccessModal(true);
    } catch (error) {
      console.error('저장 실패:', error);
      showError('저장 실패', '고객 정보 저장 중 오류가 발생했습니다.');
    }
  }, [editFormData, submit, showError]);

  // 삭제 처리
  const handleDeleteClient = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteClient = useCallback(async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('action', 'delete');
      submit(formData, { method: 'POST' });
      setShowDeleteModal(false);
      setShowDeleteSuccessModal(true);
      setTimeout(() => navigate('/clients'), 2000);
    } catch (error) {
      console.error('삭제 실패:', error);
      showError('삭제 실패', '고객 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }, [submit, navigate, showError]);

  // 영업 기회 생성
  const handleCreateOpportunity = useCallback(
    async (data: OpportunityData) => {
      setIsCreatingOpportunity(true);
      try {
        const formData = new FormData();
        formData.append('action', 'create-opportunity');
        formData.append('insuranceType', data.insuranceType);
        formData.append('notes', data.notes);

        submit(formData, { method: 'POST' });

        setOpportunitySuccessData({
          clientName: client?.fullName || '',
          insuranceType: data.insuranceType,
          stageName: '첫 상담',
        });
        setShowOpportunityModal(false);
        setShowOpportunitySuccessModal(true);
      } catch (error) {
        console.error('영업 기회 생성 실패:', error);
        showError(
          '영업 기회 생성 실패',
          '영업 기회 생성 중 오류가 발생했습니다.'
        );
      } finally {
        setIsCreatingOpportunity(false);
      }
    },
    [client, submit, showError]
  );

  // 태그 로드
  const loadClientTags = useCallback(async () => {
    if (!client?.id || !currentUser?.id) return;

    setIsLoadingTags(true);
    try {
      const response = await fetch(
        `/api/clients/${client.id}/tags?agentId=${currentUser.id}`
      );
      const result = await response.json();

      if (response.ok) {
        setClientTags(result.clientTags || []);
        setAvailableTags(result.availableTags || []);
      }
    } catch (error) {
      console.error('태그 로드 실패:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [client?.id, currentUser?.id]);

  // 태그 관리
  const handleSaveTags = useCallback(async () => {
    if (!client?.id || !currentUser?.id) return;

    try {
      const response = await fetch(`/api/clients/${client.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentUser.id,
          tagIds: selectedTagIds,
        }),
      });

      if (response.ok) {
        await loadClientTags();
        setTagSuccessMessage('태그가 성공적으로 저장되었습니다.');
        setShowTagSuccessModal(true);
        setShowTagModal(false);
      } else {
        const error = await response.json();
        showError(
          '태그 저장 실패',
          error.message || '태그 저장 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('태그 저장 실패:', error);
      showError('태그 저장 실패', '네트워크 오류가 발생했습니다.');
    }
  }, [client?.id, currentUser?.id, selectedTagIds, loadClientTags, showError]);

  // 모달 닫기 핸들러들
  const handleCloseSuccessModal = useCallback(() => {
    setShowSaveSuccessModal(false);
    setShowDeleteSuccessModal(false);
    setShowOpportunitySuccessModal(false);
    setShowTagSuccessModal(false);
  }, []);

  const handleCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleCloseOpportunityModal = useCallback(() => {
    setShowOpportunityModal(false);
  }, []);

  const handleShowOpportunityModal = useCallback(() => {
    setShowOpportunityModal(true);
  }, []);

  return {
    // 상태
    activeTab,
    setActiveTab,
    isEditing,
    isDeleting,
    isCreatingOpportunity,

    // 폼 데이터
    editFormData,
    medicalHistory,
    setMedicalHistory,
    checkupPurposes,
    setCheckupPurposes,
    interestCategories,
    setInterestCategories,
    consultationCompanions,
    setConsultationCompanions,
    consultationNotes,
    setConsultationNotes,

    // 태그 상태
    clientTags,
    availableTags,
    showTagModal,
    setShowTagModal,
    tagForm,
    setTagForm,
    selectedTagIds,
    setSelectedTagIds,
    isLoadingTags,

    // 모달 상태
    showDeleteModal,
    showOpportunityModal,
    showSaveSuccessModal,
    showDeleteSuccessModal,
    showOpportunitySuccessModal,
    showTagSuccessModal,
    showErrorModal,
    opportunitySuccessData,
    tagSuccessMessage,
    errorModalContent,

    // 핸들러
    handleEditStart,
    handleEditCancel,
    handleEditFormChange,
    handleSsnChange,
    handleEditSave,
    handleDeleteClient,
    confirmDeleteClient,
    handleCreateOpportunity,
    handleSaveTags,
    loadClientTags,
    handleCloseSuccessModal,
    handleCloseErrorModal,
    handleCloseDeleteModal,
    handleCloseOpportunityModal,
    handleShowOpportunityModal,
    showError,
  };
}
