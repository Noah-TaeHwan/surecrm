/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect, useCallback } from 'react';
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  Link,
  useLoaderData,
  useFetcher,
  useSubmit,
  useSearchParams,
  useNavigate,
} from 'react-router';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';
import { MainLayout } from '~/common/layouts/main-layout';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Separator } from '~/common/components/ui/separator';
import { DeleteConfirmationModal } from '~/common/components/ui/delete-confirmation-modal';
import { NewOpportunityModal } from '../components/new-opportunity-modal';
import { EnhancedClientOverview } from '../components/enhanced-client-overview';
import { ResponsiveClientDetail } from '../components/responsive-client-detail';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  MapPin,
  User,
  Network,
  FileText,
  TrendingUp,
  Shield,
  Settings,
  MessageCircle,
  Trash2,
  Upload,
  Eye,
  Clock,
  Award,
  Target,
  Calendar,
  Plus,
  CheckCircle,
  Star,
  Save,
  X,
  Check,
} from 'lucide-react';
import type {
  Client,
  ClientOverview,
  AppClientContactHistory,
  AppClientAnalytics,
} from '~/features/clients/lib/schema';
import type {
  ClientDetailProfile,
  ClientDetailLoaderData,
} from '../types/client-detail';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { z } from 'zod';
import {
  getClientCardStyle,
  getImportanceBadge as getImportanceBadgeUtil,
  getInsuranceTypeName,
  IMPORTANCE_OPTIONS,
  TELECOM_PROVIDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  calculateAge,
  calculateBMI,
  getBMIStatus,
  validateForm,
  ClientValidationSchema,
} from '../lib/client-detail-utils';
import { ClientErrorModal } from '../components/client-error-modal';
import { ClientSuccessModal } from '../components/client-success-modal';
import { CompanionModal } from '../components/companion-modal';
import { ClientMemoSection } from '../components/client-memo-section';
import { ConsultationNoteModal } from '../components/consultation-note-modal';
import { ConsultationTimeline } from '../components/consultation-timeline';
import { OpportunitySuccessModal } from '../components/opportunity-success-modal';
import { ClientTagModal } from '../components/client-tag-modal';
import { MedicalHistoryTab } from '../components/medical-history-tab';
import { ClientSidebar } from '../components/client-sidebar';
import { CheckupPurposesTab } from '../components/checkup-purposes-tab';
import { InterestCategoriesTab } from '../components/interest-categories-tab';
import { CompanionsTab } from '../components/companions-tab';
import { ConsultationNotesTab } from '../components/consultation-notes-tab';
import { ClientPageHeader } from '../components/client-page-header';
import { ClientModalsSection } from '../components/client-modals-section';
import { ConsultationNoteDeleteModal } from '../components/consultation-note-delete-modal';
import { InsuranceContractsTab } from '../components/insurance-contracts-tab';
import { useClientHandlers } from '../hooks/use-client-handlers';
import { useCompanionHandlers } from '../hooks/use-companion-handlers';
import { useNoteHandlers } from '../hooks/use-note-handlers';
import { useTagHandlers } from '../hooks/use-tag-handlers';
import { CheckboxGroup } from '../components/checkbox-group';
import {
  TextareaField,
  BoxedTextareaField,
} from '../components/textarea-field';
import { InterestCardGrid } from '../components/interest-card-grid';
import {
  SaveButton,
  createSaveHandler,
} from '../components/save-button-handler';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// ✅ 타입 정의들 분리 완료 - import로 대체

// ✅ Zod 스키마 분리 완료 - import로 대체

// ✅ React Router v7 - useLoaderData 훅 사용으로 타입 import 불필요

// 🌍 다국어 Meta 함수
export function meta({ data }: any) {
  // 다국어 지원을 위한 기본 메타 정보 (서버에서 번역된 값으로 설정)
  const clientName = data?.client?.name || '고객';
  const meta = data?.meta;

  if (meta) {
    return [
      { title: meta.title },
      { name: 'description', content: meta.description },
    ];
  }

  // 기본 fallback
  return [
    { title: `${clientName} - 고객 상세 - SureCRM` },
    {
      name: 'description',
      content: `${clientName} 고객의 상세 정보를 관리합니다`,
    },
  ];
}

export default function ClientDetailPage() {
  // 🌐 다국어 번역 훅
  const { t, i18n } = useHydrationSafeTranslation('clients');

  // ✅ React Router v7에서는 useLoaderData() 훅을 사용
  const data = useLoaderData() as any;

  const client = data?.client || null;
  const clientOverview = data?.clientOverview || null; // 🆕 통합 고객 데이터
  const availableStages = data?.availableStages || [];
  const insuranceContracts = data?.insuranceContracts || []; // 🏢 보험 계약 데이터
  const availableReferrers = data?.availableReferrers || []; // 🆕 소개자 후보 목록
  const isEmpty = data?.isEmpty || false;
  const error = data?.error || null;
  const currentUser = data?.currentUser || null;

  // Analytics 추적 - 극한 고객 분석
  useEffect(() => {
    if (client?.id) {
      const clientAnalyticsData = {
        importance: client.importance,
        currentStage: client.currentStage || client.stageName,
        daysSinceCreated: client.createdAt
          ? Math.floor(
              (Date.now() - new Date(client.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        meetingCount: client.meetingCount || 0,
        contractCount: insuranceContracts?.length || 0,
      };
      InsuranceAgentEvents.clientView(client.id, clientAnalyticsData);
    }
  }, [client, insuranceContracts]);

  // 🏢 URL 파라미터에서 탭 및 계약 생성 플래그 확인 (SSR 안전)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const shouldCreateContract = searchParams.get('createContract') === 'true';

  const [activeTab, setActiveTab] = useState(urlTab || 'notes');

  // 🏢 계약 생성 모달이 열렸다면 URL 파라미터 정리
  useEffect(() => {
    if (shouldCreateContract) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('createContract');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [shouldCreateContract, searchParams, setSearchParams]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showOpportunitySuccessModal, setShowOpportunitySuccessModal] =
    useState(false); // 🎯 새 영업 기회 성공 모달
  const [opportunitySuccessData, setOpportunitySuccessData] = useState({
    // 🎯 성공 데이터
    clientName: '',
    insuranceType: '',
    stageName: '',
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({
    title: '',
    message: '',
  });

  // 🆕 새로운 탭들의 폼 상태
  const [medicalHistory, setMedicalHistory] = useState({
    // 3개월 이내
    hasRecentDiagnosis: false,
    hasRecentSuspicion: false,
    hasRecentMedication: false,
    hasRecentTreatment: false,
    hasRecentHospitalization: false,
    hasRecentSurgery: false,
    recentMedicalDetails: '',
    // 1년 이내 재검사
    hasAdditionalExam: false,
    additionalExamDetails: '',
    // 5년 이내
    hasMajorHospitalization: false,
    hasMajorSurgery: false,
    hasLongTermTreatment: false,
    hasLongTermMedication: false,
    majorMedicalDetails: '',
  });

  // 🏷️ 태그 관련 상태
  const [clientTags, setClientTags] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagForm, setTagForm] = useState({
    id: '',
    name: '',
    color: '#3b82f6',
    description: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showTagSuccessModal, setShowTagSuccessModal] = useState(false);
  const [tagSuccessMessage, setTagSuccessMessage] = useState('');

  const [checkupPurposes, setCheckupPurposes] = useState({
    // 걱정사항
    isInsurancePremiumConcern: false,
    isCoverageConcern: false,
    isMedicalHistoryConcern: false,
    // 필요사항
    needsDeathBenefit: false,
    needsImplantPlan: false,
    needsCaregiverInsurance: false,
    needsDementiaInsurance: false,
    // 저축 현황
    currentSavingsLocation: '',
    additionalConcerns: '',
  });

  const [interestCategories, setInterestCategories] = useState({
    interestedInAutoInsurance: false,
    interestedInDementia: false,
    interestedInDental: false,
    interestedInDriverInsurance: false,
    interestedInHealthCheckup: false,
    interestedInMedicalExpenses: false,
    interestedInFireInsurance: false,
    interestedInCaregiver: false,
    interestedInCancer: false,
    interestedInSavings: false,
    interestedInLiability: false,
    interestedInLegalAdvice: false,
    interestedInTax: false,
    interestedInInvestment: false,
    interestedInPetInsurance: false,
    interestedInAccidentInsurance: false,
    interestedInTrafficAccident: false,
    interestNotes: '',
  });

  const [consultationCompanions, setConsultationCompanions] = useState<
    Array<{
      id?: string;
      name: string;
      phone: string;
      relationship: string;
      isPrimary: boolean;
    }>
  >([]);

  const [consultationNotes, setConsultationNotes] = useState<
    Array<{
      id?: string;
      consultationDate: string;
      title: string;
      content: string;
      contractInfo?: string;
      followUpDate?: string;
      followUpNotes?: string;
    }>
  >([]);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    telecomProvider: 'none',
    address: '',
    occupation: '',
    height: '',
    weight: '',
    hasDrivingLicense: false,
    importance: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
    ssn: '',
    ssnFront: '',
    ssnBack: '',
    birthDate: '',
    gender: '' as 'male' | 'female' | '',
    referredById: undefined as string | undefined, // 🆕 소개자 ID 필드
    ssnError: undefined as string | undefined, // 🎯 선택적 필드로 주민등록번호 에러 메시지
  });

  const navigate = useNavigate();
  const fetcher = useFetcher();
  const submit = useSubmit();

  // 🆕 상담동반자 관리 상태
  const [showAddCompanionModal, setShowAddCompanionModal] = useState(false);
  const [editingCompanion, setEditingCompanion] = useState<{
    id?: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  } | null>(null);

  // 🗑️ 상담동반자 삭제 확인 모달 상태
  const [showDeleteCompanionModal, setShowDeleteCompanionModal] =
    useState(false);
  const [companionToDelete, setCompanionToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 🆕 상담내용 관리 상태
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id?: string;
    consultationDate: string;
    title: string;
    content: string;
    contractInfo?: string;
    followUpDate?: string;
    followUpNotes?: string;
  } | null>(null);

  // 🗑️ 상담내용 삭제 확인 모달 상태
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{
    id: string;
    title: string;
    consultationDate: string;
  } | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // 🆕 성공 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 🔄 데이터 초기화 - clientOverview 데이터로 폼 상태 설정
  useEffect(() => {
    if (clientOverview) {
      // 병력사항 초기화
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

      // 점검목적 초기화
      if (clientOverview.checkupPurposes) {
        setCheckupPurposes({
          isInsurancePremiumConcern:
            clientOverview.checkupPurposes.isInsurancePremiumConcern || false,
          isCoverageConcern:
            clientOverview.checkupPurposes.isCoverageConcern || false,
          isMedicalHistoryConcern:
            clientOverview.checkupPurposes.isMedicalHistoryConcern || false,
          needsDeathBenefit:
            clientOverview.checkupPurposes.needsDeathBenefit || false,
          needsImplantPlan:
            clientOverview.checkupPurposes.needsImplantPlan || false,
          needsCaregiverInsurance:
            clientOverview.checkupPurposes.needsCaregiverInsurance || false,
          needsDementiaInsurance:
            clientOverview.checkupPurposes.needsDementiaInsurance || false,
          currentSavingsLocation:
            clientOverview.checkupPurposes.currentSavingsLocation || '',
          additionalConcerns:
            clientOverview.checkupPurposes.additionalConcerns || '',
        });
      }

      // 관심사항 초기화
      if (clientOverview.interestCategories) {
        setInterestCategories({
          interestedInAutoInsurance:
            clientOverview.interestCategories.interestedInAutoInsurance ||
            false,
          interestedInDementia:
            clientOverview.interestCategories.interestedInDementia || false,
          interestedInDental:
            clientOverview.interestCategories.interestedInDental || false,
          interestedInDriverInsurance:
            clientOverview.interestCategories.interestedInDriverInsurance ||
            false,
          interestedInHealthCheckup:
            clientOverview.interestCategories.interestedInHealthCheckup ||
            false,
          interestedInMedicalExpenses:
            clientOverview.interestCategories.interestedInMedicalExpenses ||
            false,
          interestedInFireInsurance:
            clientOverview.interestCategories.interestedInFireInsurance ||
            false,
          interestedInCaregiver:
            clientOverview.interestCategories.interestedInCaregiver || false,
          interestedInCancer:
            clientOverview.interestCategories.interestedInCancer || false,
          interestedInSavings:
            clientOverview.interestCategories.interestedInSavings || false,
          interestedInLiability:
            clientOverview.interestCategories.interestedInLiability || false,
          interestedInLegalAdvice:
            clientOverview.interestCategories.interestedInLegalAdvice || false,
          interestedInTax:
            clientOverview.interestCategories.interestedInTax || false,
          interestedInInvestment:
            clientOverview.interestCategories.interestedInInvestment || false,
          interestedInPetInsurance:
            clientOverview.interestCategories.interestedInPetInsurance || false,
          interestedInAccidentInsurance:
            clientOverview.interestCategories.interestedInAccidentInsurance ||
            false,
          interestedInTrafficAccident:
            clientOverview.interestCategories.interestedInTrafficAccident ||
            false,
          interestNotes: clientOverview.interestCategories.interestNotes || '',
        });
      }

      // 상담동반자 초기화
      if (clientOverview.consultationCompanions) {
        setConsultationCompanions(
          clientOverview.consultationCompanions.map((companion: any) => ({
            id: companion.id,
            name: companion.name,
            phone: companion.phone,
            relationship: companion.relationship,
            isPrimary: companion.isPrimary,
          }))
        );
      }

      // 상담내용 초기화
      if (clientOverview.consultationNotes) {
        setConsultationNotes(
          clientOverview.consultationNotes.map((note: any) => ({
            id: note.id,
            consultationDate: note.consultationDate,
            title: note.title,
            content: note.content,
            contractInfo: note.contractDetails
              ? typeof note.contractDetails === 'string'
                ? note.contractDetails
                : JSON.stringify(note.contractDetails)
              : '',
            followUpDate: note.followUpDate,
            followUpNotes: note.followUpNotes,
          }))
        );
      }
    }
  }, [clientOverview]);

  // 🏷️ 태그 관련 함수들 (Hook들을 early return 위로 이동)
  const loadClientTags = useCallback(async () => {
    if (!client?.id || !currentUser?.id) return;

    try {
      setIsLoadingTags(true);
      const response = await fetch(
        `/api/clients/client-tags?clientId=${client.id}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const tags = await response.json();
        setClientTags(tags);
      }
    } catch (error) {
      console.error('태그 로딩 실패:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [client?.id, currentUser?.id]);

  const loadAvailableTags = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch('/api/clients/tags', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error(
        t('errors.tagLoadFailed', '사용 가능한 태그 로딩 실패:'),
        error
      );
    }
  }, [currentUser?.id, t]);

  // 🏷️ 페이지 로드 시 태그 데이터 로딩
  useEffect(() => {
    if (client?.id && currentUser?.id) {
      loadClientTags();
    }
  }, [client?.id, currentUser?.id, loadClientTags]);

  // 🎨 중요도별 은은한 색상 스타일 (왼쪽 보더 제거)
  // ✅ 유틸리티 함수 분리 완료 - import로 대체

  const cardStyle = getClientCardStyle(client?.importance || 'medium');

  // 🎯 빈 상태 처리
  if (isEmpty || !client) {
    return (
      <MainLayout title="고객 상세">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-6xl">🔍</div>
          {error ? (
            <>
              <h2 className="text-2xl font-semibold">오류가 발생했습니다</h2>
              <p className="text-muted-foreground text-center max-w-md">
                {error}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">
                고객을 찾을 수 없습니다
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                요청하신 고객 정보가 존재하지 않거나 접근 권한이 없습니다.
              </p>
            </>
          )}
          <Link to="/clients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              고객 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleDeleteClient = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteClient = async () => {
    setIsDeleting(true);
    try {
      console.log('📞 고객 삭제 API 호출 시작:', {
        clientId: client.id,
        agentId: client.agentId,
      });

      console.log('🔍 클라이언트 정보 확인:', {
        client: {
          id: client.id,
          fullName: client.fullName,
          agentId: client.agentId,
          isActive: client.isActive,
        },
      });

      // FormData 생성
      const formData = new FormData();
      formData.append('intent', 'deleteClient');

      // Action 호출
      submit(formData, { method: 'post' });

      console.log('✅ 고객 삭제 완료');
      setShowDeleteSuccessModal(true);

      // 모달이 닫힌 후 고객 목록으로 이동
      setTimeout(() => {
        navigate('/clients');
      }, 2500); // 모달 표시 시간을 위해 약간의 지연
    } catch (error) {
      console.error('❌ 고객 삭제 실패:', error);
      console.error(
        '❌ 에러 스택:',
        error instanceof Error ? error.stack : 'No stack trace'
      );

      showError(
        '고객 삭제 실패',
        `고객 삭제에 실패했습니다.\n\n${
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.'
        }`
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ✅ 분리된 유틸리티 함수로 교체
  const getImportanceBadge = (importance: string) => {
    const { style, text } = getImportanceBadgeUtil(importance);
    return <Badge className={style}>{text}</Badge>;
  };

  // 수정 모드 진입
  const handleEditStart = () => {
    const telecomProviderValue = client?.telecomProvider;

    // 🔒 SSN 복호화 처리 (보안 패치)
    let existingSsn = '';
    if (client?.extendedDetails?.ssn) {
      // extendedDetails.ssn은 이미 loader에서 복호화된 상태
      existingSsn = client.extendedDetails.ssn;
    }

    const ssnParts = existingSsn.includes('-')
      ? existingSsn.split('-')
      : ['', ''];

    setEditFormData({
      fullName: client?.fullName || '',
      phone: client?.phone || '',
      email: client?.email || '',
      telecomProvider: telecomProviderValue || 'none',
      address: client?.address || '',
      occupation: client?.occupation || '',
      height: client?.extendedDetails?.height || '',
      weight: client?.extendedDetails?.weight || '',
      hasDrivingLicense: client?.hasDrivingLicense || false,
      importance: client?.importance || 'medium',
      notes: client?.notes || '',
      ssn: existingSsn,
      ssnFront: existingSsn ? existingSsn.split('-')[0] || '' : '',
      ssnBack: existingSsn ? existingSsn.split('-')[1] || '' : '',
      birthDate:
        client?.extendedDetails?.birthDate &&
        !isNaN(new Date(client.extendedDetails.birthDate).getTime())
          ? new Date(client.extendedDetails.birthDate)
              .toISOString()
              .split('T')[0]
          : '',
      gender: client?.extendedDetails?.gender || '',
      referredById: client?.referredBy?.id || undefined, // 🆕 소개자 ID 추가
      ssnError: undefined, // 🎯 에러 메시지 초기화
    });
    setIsEditing(true);
  };

  // 🎯 주민등록번호 자동 처리 함수
  const handleSsnChange = async (ssnFront: string, ssnBack: string) => {
    const fullSsn = ssnFront && ssnBack ? `${ssnFront}-${ssnBack}` : '';

    // 🔍 실시간 유효성 검사
    if (fullSsn.length === 14) {
      try {
        const { parseKoreanId } = await import('~/lib/utils/korean-id-utils');
        const parseResult = parseKoreanId(fullSsn);

        if (
          parseResult.isValid &&
          parseResult.birthDate &&
          parseResult.gender
        ) {
          // 자동으로 생년월일과 성별 업데이트
          setEditFormData(prev => ({
            ...prev,
            ssn: fullSsn,
            ssnFront,
            ssnBack,
            birthDate: parseResult.birthDate!.toISOString().split('T')[0],
            gender: parseResult.gender!,
          }));
        } else {
          // 🎯 유효하지 않은 경우 - 서버 측 파싱 결과만 사용
          setEditFormData(prev => ({
            ...prev,
            ssn: fullSsn,
            ssnFront,
            ssnBack,
            ssnError:
              parseResult.errorMessage || '주민등록번호를 확인해주세요.',
          }));
        }
      } catch (error) {
        setEditFormData(prev => ({
          ...prev,
          ssn: fullSsn,
          ssnFront,
          ssnBack,
          ssnError: '주민등록번호 형식을 확인해주세요.',
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        ssn: fullSsn,
        ssnFront,
        ssnBack,
        ssnError: undefined, // 입력 중일 때는 에러 메시지 제거
      }));
    }
  };

  // ✅ 유틸리티 함수 분리 완료 - import로 대체

  // ✅ 유틸리티 함수 분리 완료 - import로 대체

  // 현재 BMI 계산 (읽기 모드용 - 성별 고려)
  const currentBMI =
    client?.height && client?.weight
      ? calculateBMI(
          client.height.toString(),
          client.weight.toString(),
          client?.extendedDetails?.gender
        )
      : null;

  // 수정 중 BMI 계산 (수정 모드용 - 성별 고려)
  const editingBMI =
    editFormData.height && editFormData.weight
      ? calculateBMI(
          editFormData.height,
          editFormData.weight,
          editFormData.gender
        )
      : null;

  // 수정 취소
  const handleEditCancel = () => {
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
      importance: 'medium',
      notes: '',
      ssn: '',
      ssnFront: '',
      ssnBack: '',
      birthDate: '',
      gender: '',
      referredById: undefined, // 🆕 소개자 ID 필드
      ssnError: undefined, // 🎯 에러 메시지 초기화
    });
  };

  // 🎯 에러 모달 표시 함수
  const showError = (title: string, message: string) => {
    setErrorModalContent({ title, message });
    setShowErrorModal(true);
  };

  // ✅ 유틸리티 함수 분리 완료 - import로 대체

  // 수정 저장
  const handleEditSave = async () => {
    // 🎯 유효성 검증 먼저 실행
    const validation = validateForm(editFormData);
    if (!validation.isValid) {
      showError('입력 정보 확인 필요', validation.errors.join('\n'));
      return;
    }

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('intent', 'updateClient');
      formData.append('fullName', editFormData.fullName);
      formData.append('phone', editFormData.phone);
      formData.append('email', editFormData.email || '');
      formData.append('telecomProvider', editFormData.telecomProvider);
      formData.append('address', editFormData.address || '');
      formData.append('occupation', editFormData.occupation || '');
      formData.append('height', editFormData.height || '');
      formData.append('weight', editFormData.weight || '');
      formData.append('importance', editFormData.importance);
      formData.append('notes', editFormData.notes || '');
      formData.append(
        'hasDrivingLicense',
        editFormData.hasDrivingLicense.toString()
      );

      // 🔒 주민등록번호 필드 추가
      if (editFormData.ssnFront && editFormData.ssnBack) {
        formData.append('ssnFront', editFormData.ssnFront);
        formData.append('ssnBack', editFormData.ssnBack);
      }

      // 🆕 소개자 ID 필드 추가
      if (editFormData.referredById !== undefined) {
        formData.append('referredById', editFormData.referredById || '');
      }

      // Action 호출
      submit(formData, { method: 'post' });

      // 성공 처리는 fetcher.data를 통해 확인
      // 먼저 모달 표시
      setShowSaveSuccessModal(true);
      setIsEditing(false);

      // navigate를 사용하여 페이지 재로드 (새로고침 대신)
      setTimeout(() => {
        navigate(`/clients/${client.id}`, { replace: true });
      }, 1500); // 모달 표시 시간 확보
    } catch (error) {
      let errorMessage = '고객 정보 업데이트에 실패했습니다.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showError('저장 실패', `${errorMessage}\n\n다시 시도해 주세요.`);
    }
  };

  // 새 영업 기회 생성 핸들러
  const handleCreateOpportunity = async (data: {
    insuranceType: string;
    notes: string;
    productName?: string;
    insuranceCompany?: string;
    monthlyPremium?: number;
    expectedCommission?: number;
  }) => {
    setIsCreatingOpportunity(true);

    try {
      // 🔧 안전성 검사: 필수 데이터 확인 (강화)
      if (!client?.id || !client?.agentId) {
        throw new Error('고객 정보가 올바르지 않습니다.');
      }

      if (!data?.insuranceType || typeof data.insuranceType !== 'string') {
        throw new Error('보험 상품 타입을 선택해주세요.');
      }

      // 🔧 데이터 정제: undefined 방지
      const sanitizedData = {
        insuranceType: String(data.insuranceType).trim(),
        notes: data.notes ? String(data.notes).trim() : '',
        productName: data.productName
          ? String(data.productName).trim()
          : undefined,
        insuranceCompany: data.insuranceCompany
          ? String(data.insuranceCompany).trim()
          : undefined,
        monthlyPremium: data.monthlyPremium,
        expectedCommission: data.expectedCommission,
      };

      console.log('🚀 영업 기회 생성 시작:', {
        clientId: client.id,
        agentId: client.agentId,
        insuranceType: sanitizedData.insuranceType,
        notesLength: sanitizedData.notes.length,
        hasProductInfo: !!(
          sanitizedData.productName && sanitizedData.insuranceCompany
        ),
      });

      // 🎯 loader에서 받은 파이프라인 단계 사용
      console.log('📋 파이프라인 단계 확인:', availableStages.length, '개');

      // 🔧 안전성 검사: stages 배열 유효성 확인 (강화)
      if (availableStages.length === 0) {
        throw new Error(
          '파이프라인 단계가 설정되지 않았습니다. 먼저 파이프라인을 설정해주세요.'
        );
      }

      // 첫 상담 단계 찾기 (더 안전한 방식)
      let firstStage = null;
      try {
        firstStage =
          availableStages.find((s: any) => s?.name === '첫 상담') ||
          availableStages.find(
            (s: any) => s?.name?.includes && s.name.includes('상담')
          ) ||
          availableStages.find((s: any) => s?.id) || // id가 있는 첫 번째 단계
          null;
      } catch (findError) {
        console.error('❌ 단계 찾기 에러:', findError);
        firstStage = null;
      }

      if (!firstStage?.id) {
        throw new Error('파이프라인의 첫 번째 단계를 찾을 수 없습니다.');
      }

      console.log('🎯 선택된 파이프라인 단계:', firstStage.name);

      // 상품 정보를 포함한 영업 메모 생성
      let opportunityNotes = `[${getInsuranceTypeName(
        sanitizedData.insuranceType
      )} 영업]`;

      if (sanitizedData.productName || sanitizedData.insuranceCompany) {
        opportunityNotes += '\n📦 상품 정보:';
        if (sanitizedData.productName)
          opportunityNotes += `\n- 상품명: ${sanitizedData.productName}`;
        if (sanitizedData.insuranceCompany)
          opportunityNotes += `\n- 보험회사: ${sanitizedData.insuranceCompany}`;
        if (sanitizedData.monthlyPremium)
          opportunityNotes += `\n- 월 납입료: ${sanitizedData.monthlyPremium.toLocaleString()}원`;
        if (sanitizedData.expectedCommission)
          opportunityNotes += `\n- 예상 수수료: ${sanitizedData.expectedCommission.toLocaleString()}원`;
      }

      if (sanitizedData.notes) {
        opportunityNotes += `\n\n📝 영업 메모:\n${sanitizedData.notes}`;
      } else {
        opportunityNotes += '\n\n새로운 영업 기회';
      }

      // 🆕 상품 정보가 있으면 opportunity_products 테이블에 저장
      if (sanitizedData.productName && sanitizedData.insuranceCompany) {
        try {
          // action을 통해 상품 정보 저장 (dynamic import 문제 해결)
          const productFormData = new FormData();
          productFormData.append('intent', 'createOpportunityProduct');
          productFormData.append('productName', sanitizedData.productName);
          productFormData.append(
            'insuranceCompany',
            sanitizedData.insuranceCompany
          );
          productFormData.append('insuranceType', sanitizedData.insuranceType);
          if (sanitizedData.monthlyPremium) {
            productFormData.append(
              'monthlyPremium',
              sanitizedData.monthlyPremium.toString()
            );
          }
          if (sanitizedData.expectedCommission) {
            productFormData.append(
              'expectedCommission',
              sanitizedData.expectedCommission.toString()
            );
          }
          if (sanitizedData.notes) {
            productFormData.append('productNotes', sanitizedData.notes);
          }

          // 상품 정보를 action으로 전송
          await submit(productFormData, { method: 'post' });
          console.log('✅ 상품 정보 저장 요청 완료');
        } catch (error) {
          console.warn(
            '🔧 상품 정보 저장 중 오류 (영업 기회는 계속 진행):',
            error
          );
        }
      }

      // 🎯 action을 통해 고객 단계 변경
      const stageUpdateData = new FormData();
      stageUpdateData.append('intent', 'updateClientStage');
      stageUpdateData.append('targetStageId', firstStage.id);
      stageUpdateData.append('notes', opportunityNotes);

      // Action 호출
      submit(stageUpdateData, { method: 'post' });

      console.log('✅ 영업 기회 생성 완료');

      // 🎯 극한 분석: 영업 기회 생성 이벤트 추적
      InsuranceAgentEvents.opportunityCreate(
        sanitizedData.insuranceType,
        sanitizedData.expectedCommission,
        client.importance
      );

      setShowOpportunitySuccessModal(true);
      setOpportunitySuccessData({
        clientName: client.fullName,
        insuranceType: getInsuranceTypeName(sanitizedData.insuranceType), // 🎯 한국어 보험 타입
        stageName: firstStage.name,
      });

      // 🔥 자동 새로고침 제거 - 사용자가 모달 확인 버튼을 눌렀을 때만 새로고침
    } catch (error) {
      console.error('❌ 영업 기회 생성 실패:', error);

      // 사용자 친화적인 에러 메시지
      let userMessage = '영업 기회 생성에 실패했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('파이프라인')) {
          userMessage = '파이프라인 설정이 필요합니다. 관리자에게 문의하세요.';
        } else if (error.message.includes('단계')) {
          userMessage = '파이프라인 단계 설정에 문제가 있습니다.';
        } else if (error.message.includes('권한')) {
          userMessage = '접근 권한이 없습니다.';
        } else {
          userMessage = error.message;
        }
      }

      showError(
        '영업 기회 생성 실패',
        `${userMessage}\n\n🔧 기술적 세부사항:\n${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      );
    } finally {
      setIsCreatingOpportunity(false);
    }
  };

  // 보험 타입 이름 변환 함수
  // 🆕 상담동반자 관리 함수들
  const handleAddCompanion = () => {
    setEditingCompanion({
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    });
    setShowAddCompanionModal(true);
  };

  const handleEditCompanion = (companion: any) => {
    setEditingCompanion({
      id: companion.id,
      name: companion.name,
      phone: companion.phone,
      relationship: companion.relationship,
      isPrimary: companion.isPrimary,
    });
    setShowAddCompanionModal(true);
  };

  const handleSaveCompanion = async () => {
    if (!editingCompanion?.name || !editingCompanion?.relationship) {
      alert('성함과 관계는 필수 입력 사항입니다.');
      return;
    }

    try {
      const formData = new FormData();

      if (editingCompanion.id) {
        // 수정
        formData.append('intent', 'update-companion');
        formData.append('companionId', editingCompanion.id);
      } else {
        // 추가
        formData.append('intent', 'create-companion');
      }

      formData.append('companionName', editingCompanion.name);
      formData.append('companionPhone', editingCompanion.phone || '');
      formData.append('companionRelationship', editingCompanion.relationship);
      formData.append(
        'companionIsPrimary',
        editingCompanion.isPrimary.toString()
      );

      submit(formData, { method: 'post' });

      // 성공 모달 표시
      setSuccessMessage(
        editingCompanion.id
          ? t(
              'successModal.companionUpdated',
              '상담동반자가 성공적으로 수정되었습니다.'
            )
          : t(
              'successModal.companionAdded',
              '상담동반자가 성공적으로 추가되었습니다.'
            )
      );
      setShowSuccessModal(true);
      setShowAddCompanionModal(false);
      setEditingCompanion(null);
    } catch (error) {
      console.error('상담동반자 저장 실패:', error);
      alert('동반자 저장에 실패했습니다.');
    }
  };

  const handleDeleteCompanion = async (companionId: string) => {
    // 삭제할 동반자 정보를 찾아서 설정
    const companionToDelete = consultationCompanions.find(
      c => c.id === companionId
    );
    if (companionToDelete) {
      setCompanionToDelete({
        id: companionId,
        name: companionToDelete.name,
      });
      setShowDeleteCompanionModal(true);
    }
  };

  // 실제 동반자 삭제 함수
  const handleConfirmDeleteCompanion = async () => {
    if (!companionToDelete?.id) return;

    try {
      const formData = new FormData();
      formData.append('intent', 'delete-companion');
      formData.append('companionId', companionToDelete.id);

      submit(formData, { method: 'post' });

      // 모달 닫기
      setShowDeleteCompanionModal(false);
      setCompanionToDelete(null);

      // 성공 모달 표시
      setSuccessMessage(
        t(
          'successModal.companionDeleted',
          '상담동반자가 성공적으로 삭제되었습니다.'
        )
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('상담동반자 삭제 실패:', error);
      alert('동반자 삭제에 실패했습니다.');
    }
  };

  // 🆕 상담내용 관리 함수들
  const handleAddNote = () => {
    setEditingNote({
      consultationDate: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      contractInfo: '',
      followUpDate: '',
      followUpNotes: '',
    });
    setShowAddNoteModal(true);
  };

  // 🗑️ 삭제 확인 모달 표시
  const handleShowDeleteModal = (note: any) => {
    setNoteToDelete({
      id: note.id,
      title: note.title,
      consultationDate: note.consultationDate,
    });
    setShowDeleteNoteModal(true);
  };

  // 🗑️ 실제 상담 기록 삭제
  const handleDeleteNote = async (noteId: string) => {
    setIsDeletingNote(true);

    try {
      const formData = new FormData();
      formData.append('intent', 'delete-note');
      formData.append('noteId', noteId);

      submit(formData, { method: 'post' });

      // 모달 닫기
      setShowDeleteNoteModal(false);
      setNoteToDelete(null);

      // 성공 모달 표시
      setSuccessMessage('상담 기록이 성공적으로 삭제되었습니다.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('상담내용 삭제 실패:', error);
      alert('상담 기록 삭제에 실패했습니다.');
    } finally {
      setIsDeletingNote(false);
    }
  };

  // 🗑️ 삭제 모달 닫기
  const handleCloseDeleteModal = () => {
    if (!isDeletingNote) {
      setShowDeleteNoteModal(false);
      setNoteToDelete(null);
    }
  };

  const handleEditNote = (note: any) => {
    // contractInfo가 JSON 문자열로 저장된 경우 파싱해서 처리
    let contractInfoValue = '';
    if (note.contractInfo) {
      if (typeof note.contractInfo === 'string') {
        try {
          // JSON 문자열인지 확인하고 파싱 시도
          const parsed = JSON.parse(note.contractInfo);
          // content 필드가 있으면 그것을 사용, 아니면 빈 문자열
          contractInfoValue =
            typeof parsed === 'object' && parsed !== null
              ? parsed.content || ''
              : parsed;
        } catch {
          // JSON이 아니면 그대로 사용
          contractInfoValue = note.contractInfo;
        }
      } else if (
        typeof note.contractInfo === 'object' &&
        note.contractInfo !== null
      ) {
        // 이미 객체인 경우 content 필드 추출
        contractInfoValue = note.contractInfo.content || '';
      } else {
        contractInfoValue = note.contractInfo;
      }
    }

    setEditingNote({
      id: note.id,
      consultationDate: note.consultationDate,
      title: note.title,
      content: note.content,
      contractInfo: contractInfoValue,
      followUpDate: note.followUpDate || '',
      followUpNotes: note.followUpNotes || '',
    });
    setShowAddNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (
      !editingNote?.consultationDate ||
      !editingNote?.title ||
      !editingNote?.content
    ) {
      alert('상담 날짜, 제목, 내용은 필수 입력 사항입니다.');
      return;
    }

    try {
      const formData = new FormData();

      if (editingNote.id) {
        // 수정
        formData.append('intent', 'update-note');
        formData.append('noteId', editingNote.id);
      } else {
        // 추가
        formData.append('intent', 'create-note');
      }

      // 🎯 정확한 field 이름 사용 (action과 일치)
      formData.append('consultationDate', editingNote.consultationDate);
      formData.append('title', editingNote.title);
      formData.append('content', editingNote.content);
      formData.append('contractInfo', editingNote.contractInfo || '');
      formData.append('followUpDate', editingNote.followUpDate || '');
      formData.append('followUpNotes', editingNote.followUpNotes || '');

      submit(formData, { method: 'post' });

      // 성공 모달 표시
      setSuccessMessage(
        editingNote.id
          ? t(
              'successModal.consultationUpdated',
              '상담내용이 성공적으로 수정되었습니다.'
            )
          : t(
              'successModal.consultationAdded',
              '상담내용이 성공적으로 추가되었습니다.'
            )
      );
      setShowSuccessModal(true);
      setShowAddNoteModal(false);
      setEditingNote(null);
    } catch (error) {
      console.error('상담내용 저장 실패:', error);
      alert('상담내용 저장에 실패했습니다.');
    }
  };

  // ✅ 유틸리티 함수 분리 완료 - import로 대체

  const handleOpenTagModal = () => {
    setSelectedTagIds(clientTags.map(tag => tag.id));
    setShowTagModal(true);
    loadAvailableTags();
  };

  const handleSaveTags = async () => {
    if (!client?.id) return;

    try {
      setIsLoadingTags(true);

      const response = await fetch('/api/clients/client-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          tagIds: selectedTagIds,
          action: 'update',
        }),
      });

      if (response.ok) {
        await loadClientTags();
        setShowTagModal(false);
        setTagSuccessMessage(
          t('messages.tagSaveSuccess', '태그가 성공적으로 저장되었습니다.')
        );
        setShowTagSuccessModal(true);
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
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleCreateTag = async () => {
    if (!tagForm.name.trim()) {
      showError('태그 생성 실패', '태그 이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoadingTags(true);

      const response = await fetch('/api/clients/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tagForm.name.trim(),
          color: tagForm.color,
          description: tagForm.description.trim() || null,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        await loadAvailableTags();
        setShowCreateTagModal(false);
        setTagForm({ id: '', name: '', color: '#3b82f6', description: '' });
        setTagSuccessMessage(
          t('messages.tagCreateSuccess', '새 태그가 성공적으로 생성되었습니다.')
        );
        setShowTagSuccessModal(true);

        // 새로 생성된 태그를 자동으로 선택상태로 만들기
        setSelectedTagIds(prev => [...prev, newTag.id]);
      } else {
        const error = await response.json();
        showError(
          '태그 생성 실패',
          error.message || '태그 생성 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('태그 생성 실패:', error);
      showError('태그 생성 실패', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoadingTags(false);
    }
  };

  // ✅ 저장 핸들러들 생성
  const handleSaveMedicalHistory = createSaveHandler({
    intent: 'updateMedicalHistory',
    data: medicalHistory,
    successMessage: '병력사항이 성공적으로 저장되었습니다.',
    submit,
    setSuccessMessage,
    setShowSuccessModal,
    errorPrefix: '병력사항 저장 실패',
  });

  const handleSaveCheckupPurposes = createSaveHandler({
    intent: 'update-checkup-purposes',
    data: checkupPurposes,
    successMessage: t(
      'successModal.checkupPurposesSaved',
      '점검목적이 성공적으로 저장되었습니다.'
    ),
    submit,
    setSuccessMessage,
    setShowSuccessModal,
    errorPrefix: '점검목적 저장 실패',
  });

  const handleSaveInterestCategories = createSaveHandler({
    intent: 'update-interest-categories',
    data: interestCategories,
    successMessage: t(
      'successModal.interestCategoriesSaved',
      '관심사항이 성공적으로 저장되었습니다.'
    ),
    submit,
    setSuccessMessage,
    setShowSuccessModal,
    errorPrefix: '관심사항 저장 실패',
  });

  const removeClientTag = async (tagId: string) => {
    if (!client?.id) return;

    try {
      const response = await fetch('/api/clients/client-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          tagId: tagId,
          action: 'remove',
        }),
      });

      if (response.ok) {
        await loadClientTags();
        setTagSuccessMessage(
          t('messages.tagRemoveSuccess', '태그가 성공적으로 제거되었습니다.')
        );
        setShowTagSuccessModal(true);
      } else {
        const error = await response.json();
        showError(
          '태그 제거 실패',
          error.message || '태그 제거 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('태그 제거 실패:', error);
      showError('태그 제거 실패', '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <MainLayout
      title={`${client?.fullName || t('labels.client', '고객')} - ${t('tabs.overview', '고객 상세')}`}
    >
      <ResponsiveClientDetail
        client={client}
        clientTags={clientTags}
        isEditing={isEditing}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onEditStart={handleEditStart}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        onSsnChange={handleSsnChange}
        onTagModalOpen={handleOpenTagModal}
        onTagRemove={removeClientTag}
        availableReferrers={availableReferrers}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDeleteClient={handleDeleteClient}
        onShowOpportunityModal={() => setShowOpportunityModal(true)}
      >
        {/* 🎯 데스크톱용 기존 레이아웃 (lg 이상에서만 표시) */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 왼쪽 사이드바 - 기본 정보 */}
            <ClientSidebar
              client={client}
              isEditing={isEditing}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              handleEditStart={handleEditStart}
              handleEditSave={handleEditSave}
              handleEditCancel={handleEditCancel}
              handleSsnChange={handleSsnChange}
              clientTags={clientTags}
              handleOpenTagModal={handleOpenTagModal}
              removeClientTag={removeClientTag}
              availableReferrers={availableReferrers}
              onDeleteClient={handleDeleteClient}
            />

            {/* 오른쪽 메인 컨텐츠 */}
            <div className="lg:col-span-3">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto lg:h-9 gap-1 lg:gap-0 p-1">
                  <TabsTrigger value="notes">
                    {t('tabs.notes', '상담내용')}
                  </TabsTrigger>
                  <TabsTrigger value="medical">
                    {t('tabs.medical', '병력사항')}
                  </TabsTrigger>
                  <TabsTrigger value="checkup">
                    {t('tabs.purposes', '점검목적')}
                  </TabsTrigger>
                  <TabsTrigger value="interests">
                    {t('tabs.interests', '관심사항')}
                  </TabsTrigger>
                  <TabsTrigger value="companions">
                    {t('tabs.companions', '상담동반자')}
                  </TabsTrigger>
                  <TabsTrigger value="insurance">
                    {t('tabs.contracts', '보험계약')}
                  </TabsTrigger>
                  <TabsTrigger value="family">
                    {t('tabs.family', '가족')}
                  </TabsTrigger>
                </TabsList>

                {/* 탭 컨텐츠들 */}
                <TabsContent value="insurance" className="space-y-6">
                  <InsuranceContractsTab
                    clientId={client?.id}
                    clientName={client?.fullName || t('labels.client', '고객')}
                    agentId={data?.currentUserId}
                    initialContracts={insuranceContracts}
                    shouldOpenModal={shouldCreateContract}
                  />
                </TabsContent>

                <TabsContent value="family" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t('tabs.family', '가족')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {t(
                            'messages.familyInfoPending',
                            '가족 정보가 준비 중입니다.'
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 🆕 병력사항 탭 */}
                <MedicalHistoryTab
                  medicalHistory={medicalHistory}
                  setMedicalHistory={setMedicalHistory}
                  submit={submit}
                  setSuccessMessage={setSuccessMessage}
                  setShowSuccessModal={setShowSuccessModal}
                />

                {/* 🆕 점검목적 탭 */}
                <CheckupPurposesTab
                  checkupPurposes={checkupPurposes}
                  setCheckupPurposes={setCheckupPurposes}
                  onSave={handleSaveCheckupPurposes}
                />

                {/* 🆕 관심사항 탭 */}
                <InterestCategoriesTab
                  interestCategories={interestCategories}
                  setInterestCategories={setInterestCategories}
                  onSave={handleSaveInterestCategories}
                />

                {/* 🆕 상담동반자 탭 */}
                <CompanionsTab
                  consultationCompanions={consultationCompanions}
                  handleAddCompanion={handleAddCompanion}
                  handleEditCompanion={handleEditCompanion}
                  handleDeleteCompanion={handleDeleteCompanion}
                />

                {/* 🆕 상담내용 탭 */}
                <ConsultationNotesTab
                  notes={client?.notes || ''}
                  onSaveMemo={async (notes: string) => {
                    // 메모 저장을 위한 별도 함수
                    const formData = new FormData();
                    formData.append('intent', 'update-notes');
                    formData.append('notes', notes);

                    try {
                      console.log('📝 메모 저장 시작:', { notes });
                      const result = await submit(formData, { method: 'post' });
                      // 성공 시 클라이언트 데이터 업데이트는 loader가 자동으로 처리
                      console.log('✅ 메모 저장 완료:', result);
                    } catch (error) {
                      console.error('❌ 메모 저장 실패:', error);
                      throw error; // 에러를 다시 던져서 컴포넌트에서 처리할 수 있도록
                    }
                  }}
                  consultationNotes={consultationNotes}
                  onAddNote={handleAddNote}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                  onShowDeleteModal={handleShowDeleteModal}
                />
              </Tabs>
            </div>
          </div>
        </div>

        {/* 🎯 모바일/태블릿 탭 컨텐츠 (lg 미만에서만 표시) */}
        <div className="lg:hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* 탭 컨텐츠들 - 모바일 최적화 */}
            <TabsContent value="notes" className="mt-0 space-y-4">
              <ConsultationNotesTab
                notes={client?.notes || ''}
                onSaveMemo={async (notes: string) => {
                  const formData = new FormData();
                  formData.append('intent', 'update-notes');
                  formData.append('notes', notes);

                  try {
                    console.log('📝 메모 저장 시작 (모바일):', { notes });
                    const result = await submit(formData, { method: 'post' });
                    console.log('✅ 메모 저장 완료 (모바일):', result);
                  } catch (error) {
                    console.error('❌ 메모 저장 실패 (모바일):', error);
                    throw error;
                  }
                }}
                consultationNotes={consultationNotes}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                onShowDeleteModal={handleShowDeleteModal}
              />
            </TabsContent>

            <TabsContent value="medical" className="mt-0 space-y-4">
              <MedicalHistoryTab
                medicalHistory={medicalHistory}
                setMedicalHistory={setMedicalHistory}
                submit={submit}
                setSuccessMessage={setSuccessMessage}
                setShowSuccessModal={setShowSuccessModal}
              />
            </TabsContent>

            <TabsContent value="checkup" className="mt-0 space-y-4">
              <CheckupPurposesTab
                checkupPurposes={checkupPurposes}
                setCheckupPurposes={setCheckupPurposes}
                onSave={handleSaveCheckupPurposes}
              />
            </TabsContent>

            <TabsContent value="interests" className="mt-0 space-y-4">
              <InterestCategoriesTab
                interestCategories={interestCategories}
                setInterestCategories={setInterestCategories}
                onSave={handleSaveInterestCategories}
              />
            </TabsContent>

            <TabsContent value="companions" className="mt-0 space-y-4">
              <CompanionsTab
                consultationCompanions={consultationCompanions}
                handleAddCompanion={handleAddCompanion}
                handleEditCompanion={handleEditCompanion}
                handleDeleteCompanion={handleDeleteCompanion}
              />
            </TabsContent>

            <TabsContent value="insurance" className="mt-0 space-y-4">
              <InsuranceContractsTab
                clientId={client?.id}
                clientName={client?.fullName || '고객'}
                agentId={data?.currentUserId}
                initialContracts={insuranceContracts}
                shouldOpenModal={shouldCreateContract}
              />
            </TabsContent>

            <TabsContent value="family" className="mt-0 space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('tabs.family', '가족')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'messages.familyInfoPending',
                        '가족 정보가 준비 중입니다.'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 모든 모달들 */}
        <ClientModalsSection
          // 새 영업 기회 모달
          showOpportunityModal={showOpportunityModal}
          setShowOpportunityModal={setShowOpportunityModal}
          onCreateOpportunity={handleCreateOpportunity}
          clientName={client?.fullName || '고객'}
          isCreatingOpportunity={isCreatingOpportunity}
          // 삭제 확인 모달
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onConfirmDelete={confirmDeleteClient}
          isDeleting={isDeleting}
          // 저장 성공 모달
          showSaveSuccessModal={showSaveSuccessModal}
          setShowSaveSuccessModal={setShowSaveSuccessModal}
          // 삭제 성공 모달
          showDeleteSuccessModal={showDeleteSuccessModal}
          setShowDeleteSuccessModal={setShowDeleteSuccessModal}
          // 새 영업 기회 성공 모달
          showOpportunitySuccessModal={showOpportunitySuccessModal}
          setShowOpportunitySuccessModal={setShowOpportunitySuccessModal}
          opportunitySuccessData={opportunitySuccessData}
          // 에러 모달
          showErrorModal={showErrorModal}
          setShowErrorModal={setShowErrorModal}
          errorModalContent={errorModalContent}
          // 성공 모달
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          successMessage={successMessage}
          // 상담동반자 모달
          showAddCompanionModal={showAddCompanionModal}
          setShowAddCompanionModal={setShowAddCompanionModal}
          editingCompanion={editingCompanion}
          setEditingCompanion={setEditingCompanion}
          onSaveCompanion={handleSaveCompanion}
          // 상담동반자 삭제 모달
          showDeleteCompanionModal={showDeleteCompanionModal}
          setShowDeleteCompanionModal={setShowDeleteCompanionModal}
          companionToDelete={companionToDelete}
          onConfirmDeleteCompanion={handleConfirmDeleteCompanion}
          // 상담내용 모달
          showAddNoteModal={showAddNoteModal}
          setShowAddNoteModal={setShowAddNoteModal}
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          onSaveNote={handleSaveNote}
          // 태그 모달
          showTagModal={showTagModal}
          setShowTagModal={setShowTagModal}
          availableTags={availableTags}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
          isLoadingTags={isLoadingTags}
          onSaveTags={handleSaveTags}
          onCreateTag={handleCreateTag}
          tagForm={tagForm}
          setTagForm={setTagForm}
          showCreateTagModal={showCreateTagModal}
          setShowCreateTagModal={setShowCreateTagModal}
          showTagSuccessModal={showTagSuccessModal}
          setShowTagSuccessModal={setShowTagSuccessModal}
          tagSuccessMessage={tagSuccessMessage}
        />

        {/* 🗑️ 상담 기록 삭제 확인 모달 */}
        <ConsultationNoteDeleteModal
          isOpen={showDeleteNoteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={() => noteToDelete && handleDeleteNote(noteToDelete.id)}
          noteTitle={noteToDelete?.title || ''}
          noteDate={noteToDelete?.consultationDate || ''}
          isDeleting={isDeletingNote}
        />
      </ResponsiveClientDetail>
    </MainLayout>
  );
}

// ✅ action 함수는 라우트 파일에서 정의됨
