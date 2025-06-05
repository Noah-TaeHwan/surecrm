import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useFetcher, useSubmit } from 'react-router';
import type { Route } from './+types/client-detail-page';
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
import { requireAuth } from '~/lib/auth/middleware';
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

// 🎯 확장된 고객 프로필 타입 (상세 페이지용)
interface ClientDetailProfile extends Client {
  // 계산 필드들
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  // 상세 데이터
  recentContacts: AppClientContactHistory[];
  analytics: AppClientAnalytics | null;
  familyMembers: any[];
  milestones: any[];
}

interface LoaderData {
  client: Client | null;
  currentUserId: string | null;
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
  isEmpty: boolean;
  error?: string;
}

// 🎯 Zod 유효성 검증 스키마
const ClientValidationSchema = z.object({
  fullName: z
    .string()
    .min(1, '고객명을 입력해주세요')
    .max(50, '고객명은 50자 이내로 입력해주세요'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(
      /^(01[016789])-?(\d{3,4})-?(\d{4})$/,
      '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      '올바른 이메일 형식이 아닙니다'
    ),
  address: z.string().max(200, '주소는 200자 이내로 입력해주세요').optional(),
  occupation: z.string().max(50, '직업은 50자 이내로 입력해주세요').optional(),
  height: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const height = parseInt(val);
      return !isNaN(height) && height >= 100 && height <= 250;
    }, '키는 100cm~250cm 사이로 입력해주세요'),
  weight: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const weight = parseInt(val);
      return !isNaN(weight) && weight >= 30 && weight <= 200;
    }, '몸무게는 30kg~200kg 사이로 입력해주세요'),
  telecomProvider: z.string().optional(),
  notes: z.string().max(1000, '메모는 1000자 이내로 입력해주세요').optional(),
  ssn: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']),
  hasDrivingLicense: z.boolean(),
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id: clientId } = params;

  console.log('🔍 고객 상세 페이지 loader 시작:', { clientId });

  if (!clientId) {
    console.error('❌ 클라이언트 ID가 없음');
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🎯 실제 로그인된 보험설계사 정보 가져오기
    const user = await requireAuth(request);
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // 🆕 새로운 API 함수를 사용하여 통합 고객 데이터 조회
    const { getClientOverview } = await import(
      '~/features/clients/lib/client-data'
    );

    // IP 주소 추출 (보안 로깅용)
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('📞 통합 고객 데이터 조회 시작:', { clientId, agentId });

    // 통합 고객 개요 데이터 조회
    const clientOverview = await getClientOverview(
      clientId,
      agentId,
      clientIP,
      userAgent
    );

    if (!clientOverview || !clientOverview.client) {
      console.log('⚠️ 고객을 찾을 수 없음');
      return {
        client: null,
        clientOverview: null,
        currentUserId: agentId,
        currentUser: {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email.split('@')[0],
        },
        isEmpty: true,
      };
    }

    console.log('✅ 통합 고객 데이터 조회 완료:', {
      clientName: clientOverview.client.fullName,
      hasExtendedData: {
        medicalHistory: !!clientOverview.medicalHistory,
        checkupPurposes: !!clientOverview.checkupPurposes,
        interestCategories: !!clientOverview.interestCategories,
        companionsCount: clientOverview.consultationCompanions?.length || 0,
        notesCount: clientOverview.consultationNotes?.length || 0,
      },
    });

    // 🎯 파이프라인 단계들 조회 (새 영업 기회 생성용)
    const { createAdminClient } = await import('~/lib/core/supabase');
    const supabase = createAdminClient();

    // 🎯 파이프라인 단계들 조회 (새 영업 기회 생성용)
    const { data: stagesData, error: stagesError } = await supabase
      .from('app_pipeline_stages')
      .select('id, name, color, "order"')
      .eq('agent_id', agentId)
      .neq('name', '제외됨') // 제외됨 단계는 숨김
      .order('order');

    const availableStages = stagesData || [];

    return {
      client: clientOverview.client,
      clientOverview: clientOverview, // 🆕 통합 고객 데이터 추가
      availableStages: availableStages,
      currentUserId: agentId,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.fullName || user.email.split('@')[0],
      },
      isEmpty: false,
    };
  } catch (error) {
    console.error('❌ 고객 상세 정보 조회 실패:', error);

    // 🎯 에러 상태 반환 (서버 에러 대신)
    return {
      client: null,
      clientOverview: null,
      availableStages: [],
      currentUserId: null,
      currentUser: {
        id: '',
        email: '',
        name: '',
      },
      isEmpty: true,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const loaderData = data as any; // 임시 타입 우회
  const clientName = loaderData?.client?.fullName || '고객';
  return [
    { title: `${clientName} - 고객 상세 | SureCRM` },
    { name: 'description', content: `${clientName}의 상세 정보를 확인하세요.` },
  ];
}

export default function ClientDetailPage({ loaderData }: Route.ComponentProps) {
  // 안전한 타입 체크와 기본값 설정
  const data = loaderData as any;
  const client = data?.client || null;
  const clientOverview = data?.clientOverview || null; // 🆕 통합 고객 데이터
  const availableStages = data?.availableStages || [];
  const isEmpty = data?.isEmpty || false;
  const error = data?.error || null;
  const currentUser = data?.currentUser || null;

  const [activeTab, setActiveTab] = useState('notes');
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
              ? JSON.stringify(note.contractDetails)
              : '',
            followUpDate: note.followUpDate,
            followUpNotes: note.followUpNotes,
          }))
        );
      }
    }
  }, [clientOverview]);

  // 🎨 중요도별 은은한 색상 스타일 (왼쪽 보더 제거)
  const getClientCardStyle = (importance: string) => {
    switch (importance) {
      case 'high':
        return {
          bgGradient:
            'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
          borderClass: 'client-card-vip', // VIP 전용 애니메이션 클래스
        };
      case 'medium':
        return {
          bgGradient:
            'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
          borderClass: 'client-card-normal', // 일반 고객 은은한 효과
        };
      case 'low':
        return {
          bgGradient:
            'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
          borderClass: '', // 효과 없음
        };
      default:
        return {
          bgGradient:
            'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
          borderClass: '',
        };
    }
  };

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

  const getImportanceBadge = (importance: string) => {
    // 🎨 중요도별 통일된 색상 시스템 (CSS 변수 사용)
    const importanceStyles = {
      high: 'border bg-[var(--importance-high-badge-bg)] text-[var(--importance-high-badge-text)] border-[var(--importance-high-border)]',
      medium:
        'border bg-[var(--importance-medium-badge-bg)] text-[var(--importance-medium-badge-text)] border-[var(--importance-medium-border)]',
      low: 'border bg-[var(--importance-low-badge-bg)] text-[var(--importance-low-badge-text)] border-[var(--importance-low-border)]',
    };

    const importanceText = {
      high: 'VIP',
      medium: '일반',
      low: '관심',
    };

    const style =
      importanceStyles[importance as keyof typeof importanceStyles] ||
      importanceStyles.medium;
    const text =
      importanceText[importance as keyof typeof importanceText] || importance;

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
          setEditFormData((prev) => ({
            ...prev,
            ssn: fullSsn,
            ssnFront,
            ssnBack,
            birthDate: parseResult.birthDate!.toISOString().split('T')[0],
            gender: parseResult.gender!,
          }));
        } else {
          // 🎯 유효하지 않은 경우 - 서버 측 파싱 결과만 사용
          setEditFormData((prev) => ({
            ...prev,
            ssn: fullSsn,
            ssnFront,
            ssnBack,
            ssnError:
              parseResult.errorMessage || '주민등록번호를 확인해주세요.',
          }));
        }
      } catch (error) {
        setEditFormData((prev) => ({
          ...prev,
          ssn: fullSsn,
          ssnFront,
          ssnBack,
          ssnError: '주민등록번호 형식을 확인해주세요.',
        }));
      }
    } else {
      setEditFormData((prev) => ({
        ...prev,
        ssn: fullSsn,
        ssnFront,
        ssnBack,
        ssnError: undefined, // 입력 중일 때는 에러 메시지 제거
      }));
    }
  };

  // 🎯 3가지 나이 계산 함수
  const calculateAge = (
    birthDate: Date,
    type: 'standard' | 'korean' | 'insurance'
  ) => {
    const today = new Date();
    const birth = new Date(birthDate);

    switch (type) {
      case 'standard': // 만 나이
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }
        return age;

      case 'korean': // 한국 나이 (연도 차이 + 1)
        return today.getFullYear() - birth.getFullYear() + 1;

      case 'insurance': // 보험 나이 (상령일 기준 - 생일이 지나면 +1)
        let insuranceAge = today.getFullYear() - birth.getFullYear();
        const birthdayThisYear = new Date(
          today.getFullYear(),
          birth.getMonth(),
          birth.getDate()
        );
        if (today >= birthdayThisYear) {
          insuranceAge++;
        }
        return insuranceAge;

      default:
        return 0;
    }
  };

  // 🎯 BMI 계산 함수
  const calculateBMI = (height: string, weight: string) => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) return null;

    const bmi = w / Math.pow(h / 100, 2);
    return Math.round(bmi * 10) / 10; // 소수점 1자리
  };

  // 🎯 BMI 상태 분류 함수
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '저체중', color: 'text-blue-600' };
    if (bmi < 23) return { text: '정상', color: 'text-green-600' };
    if (bmi < 25) return { text: '과체중', color: 'text-yellow-600' };
    if (bmi < 30) return { text: '비만', color: 'text-orange-600' };
    return { text: '고도비만', color: 'text-red-600' };
  };

  // 현재 BMI 계산 (읽기 모드용)
  const currentBMI =
    client?.height && client?.weight
      ? calculateBMI(client.height.toString(), client.weight.toString())
      : null;

  // 수정 중 BMI 계산 (수정 모드용)
  const editingBMI =
    editFormData.height && editFormData.weight
      ? calculateBMI(editFormData.height, editFormData.weight)
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
      ssnError: undefined, // 🎯 에러 메시지 초기화
    });
  };

  // 🎯 에러 모달 표시 함수
  const showError = (title: string, message: string) => {
    setErrorModalContent({ title, message });
    setShowErrorModal(true);
  };

  // 🎯 폼 유효성 검증 함수
  const validateForm = () => {
    try {
      const formData = {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        email: editFormData.email || undefined,
        address: editFormData.address || undefined,
        occupation: editFormData.occupation || undefined,
        height: editFormData.height || undefined,
        weight: editFormData.weight || undefined,
        telecomProvider:
          editFormData.telecomProvider === 'none'
            ? undefined
            : editFormData.telecomProvider,
        notes: editFormData.notes || undefined,
        ssn: editFormData.ssn || undefined,
        importance: editFormData.importance,
        hasDrivingLicense: editFormData.hasDrivingLicense,
      };

      ClientValidationSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(
            (err) => `${err.path.join('.')}: ${err.message}`
          ),
        };
      }
      return {
        isValid: false,
        errors: ['알 수 없는 유효성 검사 오류가 발생했습니다.'],
      };
    }
  };

  // 수정 저장
  const handleEditSave = async () => {
    // 🎯 유효성 검증 먼저 실행
    const validation = validateForm();
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
      };

      console.log('🚀 영업 기회 생성 시작:', {
        clientId: client.id,
        agentId: client.agentId,
        insuranceType: sanitizedData.insuranceType,
        notesLength: sanitizedData.notes.length,
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

      // 🎯 action을 통해 고객 단계 변경
      const stageUpdateData = new FormData();
      stageUpdateData.append('intent', 'updateClientStage');
      stageUpdateData.append('targetStageId', firstStage.id);
      stageUpdateData.append(
        'notes',
        `[${getInsuranceTypeName(sanitizedData.insuranceType)} 영업] ${
          sanitizedData.notes || '새로운 영업 기회'
        }`
      );

      // Action 호출
      submit(stageUpdateData, { method: 'post' });

      console.log('✅ 영업 기회 생성 완료');
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
        formData.append('intent', 'updateConsultationCompanion');
        formData.append('companionId', editingCompanion.id);
      } else {
        // 추가
        formData.append('intent', 'createConsultationCompanion');
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
        `동반자가 성공적으로 ${
          editingCompanion.id ? '수정' : '추가'
        }되었습니다.`
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
    if (!confirm('이 동반자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('intent', 'deleteConsultationCompanion');
      formData.append('companionId', companionId);

      submit(formData, { method: 'post' });

      // 성공 모달 표시
      setSuccessMessage('동반자가 성공적으로 삭제되었습니다.');
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

  const handleEditNote = (note: any) => {
    setEditingNote({
      id: note.id,
      consultationDate: note.consultationDate,
      title: note.title,
      content: note.content,
      contractInfo:
        typeof note.contractInfo === 'string'
          ? note.contractInfo
          : JSON.stringify(note.contractInfo || {}),
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
        formData.append('intent', 'updateConsultationNote');
        formData.append('noteId', editingNote.id);
      } else {
        // 추가
        formData.append('intent', 'createConsultationNote');
      }

      formData.append('consultationDate', editingNote.consultationDate);
      formData.append('consultationTitle', editingNote.title);
      formData.append('consultationContent', editingNote.content);
      formData.append('contractInfo', editingNote.contractInfo || '');
      formData.append('followUpDate', editingNote.followUpDate || '');
      formData.append('followUpNotes', editingNote.followUpNotes || '');

      submit(formData, { method: 'post' });

      // 성공 모달 표시
      setSuccessMessage(
        `상담내용이 성공적으로 ${editingNote.id ? '수정' : '추가'}되었습니다.`
      );
      setShowSuccessModal(true);
      setShowAddNoteModal(false);
      setEditingNote(null);
    } catch (error) {
      console.error('상담내용 저장 실패:', error);
      alert('상담내용 저장에 실패했습니다.');
    }
  };

  const getInsuranceTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      auto: '자동차보험',
      life: '생명보험',
      health: '건강보험',
      home: '주택보험',
      business: '사업자보험',
    };
    return typeMap[type] || type;
  };

  // 🏷️ 태그 관련 함수들
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
      console.error('사용 가능한 태그 로딩 실패:', error);
    }
  }, [currentUser?.id]);

  const handleOpenTagModal = () => {
    setSelectedTagIds(clientTags.map((tag) => tag.id));
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
        setTagSuccessMessage('태그가 성공적으로 저장되었습니다.');
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
        setTagSuccessMessage('새 태그가 성공적으로 생성되었습니다.');
        setShowTagSuccessModal(true);

        // 새로 생성된 태그를 자동으로 선택상태로 만들기
        setSelectedTagIds((prev) => [...prev, newTag.id]);
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
        setTagSuccessMessage('태그가 성공적으로 제거되었습니다.');
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

  // 🏷️ 페이지 로드 시 태그 데이터 로딩
  useEffect(() => {
    if (client?.id && currentUser?.id) {
      loadClientTags();
    }
  }, [client?.id, currentUser?.id, loadClientTags]);

  return (
    <MainLayout title={`${client?.fullName || '고객'} - 고객 상세`}>
      <div className="space-y-6">
        {/* 🎯 헤더 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                고객 목록
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* 🚀 새 영업 기회 추가 (핵심 기능) */}
            <Button
              variant="outline"
              onClick={() => setShowOpportunityModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />새 영업 기회
            </Button>

            {!isEditing ? (
              <Button variant="outline" onClick={handleEditStart}>
                <Edit2 className="h-4 w-4 mr-2" />
                수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEditCancel}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button onClick={handleEditSave}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleDeleteClient}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>

        {/* 🎯 메인 컨텐츠 - 이력서 스타일 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 - 기본 정보 */}
          <div className="lg:col-span-1 mb-6">
            <div className="relative">
              <Card
                className={`sticky top-6 border-border/50 ${cardStyle.bgGradient} ${cardStyle.borderClass} overflow-hidden`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          고객명
                        </label>
                        <Input
                          value={editFormData.fullName}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              fullName: e.target.value,
                            })
                          }
                          className="text-center text-lg font-semibold"
                          placeholder="고객명"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          중요도
                        </label>
                        <Select
                          value={editFormData.importance}
                          onValueChange={(value: 'high' | 'medium' | 'low') =>
                            setEditFormData({
                              ...editFormData,
                              importance: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="중요도" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">VIP</SelectItem>
                            <SelectItem value="medium">일반</SelectItem>
                            <SelectItem value="low">관심</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-xl">
                        {client?.fullName || '고객'}
                      </CardTitle>
                      <div className="flex justify-center">
                        {getImportanceBadge(client?.importance || 'medium')}
                      </div>
                    </>
                  )}
                </CardHeader>

                <CardContent className="p-6 pt-3 space-y-4">
                  {/* 연락처 정보 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData.phone}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="전화번호"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {client?.phone || '정보 없음'}
                        </span>
                      )}
                    </div>

                    {/* 이메일 */}
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData.email}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                          placeholder="email@example.com"
                          type="email"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {client?.email || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={handleEditStart}
                              title="클릭하여 입력"
                            >
                              이메일 미입력
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 주소 - 항상 표시 */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      {isEditing ? (
                        <Input
                          value={editFormData.address}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              address: e.target.value,
                            })
                          }
                          placeholder="주소"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm leading-relaxed">
                          {client?.address || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={handleEditStart}
                              title="클릭하여 입력"
                            >
                              주소 미입력
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 직업 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData.occupation}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              occupation: e.target.value,
                            })
                          }
                          placeholder="직업"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">
                          {client?.occupation || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={handleEditStart}
                              title="클릭하여 입력"
                            >
                              직업 미입력
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* 통신사 정보 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 text-muted-foreground flex items-center justify-center">
                        📱
                      </span>
                      {isEditing ? (
                        <Select
                          value={editFormData.telecomProvider || 'none'}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              telecomProvider: value,
                            })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="통신사 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">선택 안함</SelectItem>
                            <SelectItem value="SKT">SKT</SelectItem>
                            <SelectItem value="KT">KT</SelectItem>
                            <SelectItem value="LG U+">LG U+</SelectItem>
                            <SelectItem value="알뜰폰 SKT">
                              알뜰폰 SKT
                            </SelectItem>
                            <SelectItem value="알뜰폰 KT">알뜰폰 KT</SelectItem>
                            <SelectItem value="알뜰폰 LG U+">
                              알뜰폰 LG U+
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">
                          <span className="text-xs text-muted-foreground mr-2">
                            통신사
                          </span>
                          {client?.telecomProvider || (
                            <span
                              className="text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                              onClick={handleEditStart}
                              title="클릭하여 선택"
                            >
                              미선택
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 현재 단계 - 위로 이동 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">현재 단계</h4>
                    <Badge
                      variant="outline"
                      className="w-full justify-center h-10 text-md font-semibold"
                    >
                      {client?.currentStage?.name || '미설정'}
                    </Badge>
                    {!client?.currentStage?.name && (
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border-l-2 border-muted-foreground/30">
                        💡 <strong>미설정</strong>은 아직 영업 파이프라인에
                        진입하지 않은 상태입니다. "새 영업 기회" 버튼을 눌러
                        파이프라인에 추가할 수 있습니다.
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 개인 상세 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">개인 정보</h4>

                    {/* 생년월일 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[50px]">
                        생년월일
                      </span>
                      {!isEditing ? (
                        client?.extendedDetails?.birthDate ? (
                          <div className="space-y-1">
                            <span className="text-sm">
                              {new Date(
                                client.extendedDetails.birthDate
                              ).toLocaleDateString('ko-KR')}
                            </span>
                            {/* 3가지 나이 표시 */}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>
                                만 나이:{' '}
                                {calculateAge(
                                  new Date(client.extendedDetails.birthDate),
                                  'standard'
                                )}
                                세
                              </div>
                              <div>
                                한국 나이:{' '}
                                {calculateAge(
                                  new Date(client.extendedDetails.birthDate),
                                  'korean'
                                )}
                                세
                              </div>
                              <div>
                                보험 나이:{' '}
                                {calculateAge(
                                  new Date(client.extendedDetails.birthDate),
                                  'insurance'
                                )}
                                세
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                            onClick={handleEditStart}
                            title="클릭하여 입력"
                          >
                            미입력
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-orange-600">
                          주민등록번호를 입력하시면 자동으로 저장됩니다
                        </span>
                      )}
                    </div>

                    {/* 성별 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[50px]">
                        성별
                      </span>
                      {!isEditing ? (
                        client?.extendedDetails?.gender ? (
                          <Badge variant="outline" className="text-xs">
                            {client.extendedDetails.gender === 'male'
                              ? '남성'
                              : '여성'}
                          </Badge>
                        ) : (
                          <span
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                            onClick={handleEditStart}
                            title="클릭하여 입력"
                          >
                            미입력
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-orange-600">
                          주민등록번호를 입력하시면 자동으로 저장됩니다
                        </span>
                      )}
                    </div>

                    {/* 주민등록번호 - 읽기 모드에서도 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[50px]">
                        주민등록번호
                      </span>
                      {!isEditing ? (
                        client?.extendedDetails?.ssn ? (
                          <span className="text-sm font-mono">
                            {(() => {
                              // 🔓 extendedDetails.ssn은 이미 복호화된 상태
                              const decryptedSSN = client.extendedDetails.ssn;
                              if (decryptedSSN) {
                                // 🎯 앞6자리-뒤첫1자리****** 형태로 마스킹
                                return decryptedSSN.replace(
                                  /(\d{6})-(\d{1})(\d{6})/,
                                  '$1-$2******'
                                );
                              } else {
                                return '🔒 복호화 실패';
                              }
                            })()}
                          </span>
                        ) : (
                          <span
                            className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                            onClick={handleEditStart}
                            title="클릭하여 입력"
                          >
                            미입력
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-orange-600">
                          하단에서 입력하세요
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 신체 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">신체 정보</h4>

                    {/* 키 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        키
                      </span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editFormData.height}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              height: e.target.value,
                            })
                          }
                          placeholder="170"
                          className="text-sm"
                        />
                      ) : client?.height ? (
                        <span className="text-sm">{client.height}cm</span>
                      ) : (
                        <span
                          className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                          onClick={handleEditStart}
                          title="클릭하여 입력"
                        >
                          미입력
                        </span>
                      )}
                      {isEditing && (
                        <span className="text-xs text-muted-foreground">
                          cm
                        </span>
                      )}
                    </div>

                    {/* 몸무게 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        몸무게
                      </span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editFormData.weight}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              weight: e.target.value,
                            })
                          }
                          placeholder="70"
                          className="text-sm"
                        />
                      ) : client?.weight ? (
                        <span className="text-sm">{client.weight}kg</span>
                      ) : (
                        <span
                          className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
                          onClick={handleEditStart}
                          title="클릭하여 입력"
                        >
                          미입력
                        </span>
                      )}
                      {isEditing && (
                        <span className="text-xs text-muted-foreground">
                          kg
                        </span>
                      )}
                    </div>

                    {/* 🎯 BMI 표시 - 키와 몸무게가 모두 있을 때만 */}
                    {((isEditing && editingBMI) ||
                      (!isEditing && currentBMI)) && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground min-w-[40px]">
                          BMI
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {isEditing ? editingBMI : currentBMI}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              getBMIStatus(
                                isEditing ? editingBMI! : currentBMI!
                              ).color
                            }`}
                          >
                            {
                              getBMIStatus(
                                isEditing ? editingBMI! : currentBMI!
                              ).text
                            }
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* 운전 여부 - 항상 표시 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        운전
                      </span>
                      {isEditing ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.hasDrivingLicense}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                hasDrivingLicense: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">운전 가능</span>
                        </label>
                      ) : (
                        <Badge
                          variant={
                            client?.hasDrivingLicense ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {client?.hasDrivingLicense !== undefined
                            ? client.hasDrivingLicense
                              ? '운전 가능'
                              : '운전 불가'
                            : '미설정'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 주민등록번호 입력 - 수정 모드에서만 표시 */}
                  {isEditing && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          🔒 민감정보 관리
                        </h4>
                        <div className="border border-border rounded-lg p-4 bg-muted/30">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-medium text-foreground">
                                주민등록번호
                              </span>
                              <span className="text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800">
                                ⚠️ 민감정보
                              </span>
                            </div>

                            {/* 주민등록번호 분리 입력 - Full Width */}
                            <div className="grid grid-cols-5 gap-2 items-center">
                              <Input
                                type="text"
                                placeholder="YYMMDD"
                                value={editFormData.ssnFront}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6);
                                  handleSsnChange(value, editFormData.ssnBack);
                                }}
                                className="col-span-2 text-center font-mono"
                                maxLength={6}
                              />
                              <span className="text-muted-foreground font-bold text-center">
                                -
                              </span>
                              <Input
                                type="text"
                                placeholder="1●●●●●●"
                                value={editFormData.ssnBack}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 7);
                                  handleSsnChange(editFormData.ssnFront, value);
                                }}
                                className="col-span-2 text-center font-mono"
                                maxLength={7}
                              />
                            </div>

                            {/* 입력 가이드 */}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>
                                • 생년월일 6자리 (YYMMDD) + 개인식별번호 7자리
                              </p>
                              <p>• 입력된 정보는 안전하게 저장됩니다</p>
                            </div>

                            {/* 🚨 에러 메시지 표시 */}
                            {editFormData.ssnError && (
                              <div className="mt-2 p-3 bg-red-50/70 border border-red-200/60 rounded-lg dark:bg-red-950/30 dark:border-red-800/50">
                                <div className="flex items-start gap-2">
                                  <span className="text-red-500 text-sm">
                                    ⚠️
                                  </span>
                                  <div className="text-xs text-red-800 dark:text-red-300">
                                    {editFormData.ssnError}
                                  </div>
                                </div>
                                {/* 예시 표시 */}
                                {(editFormData.ssnError.includes(
                                  '77년생 남성'
                                ) ||
                                  editFormData.ssnError.includes(
                                    '77년생 여성'
                                  )) && (
                                  <div className="mt-2 text-xs text-red-700 dark:text-red-400">
                                    <div className="font-medium mb-1">
                                      올바른 예시:
                                    </div>
                                    <div>
                                      • 77년생 남성: 771111-
                                      <span className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                        1
                                      </span>
                                      ●●●●●●
                                    </div>
                                    <div>
                                      • 77년생 여성: 771111-
                                      <span className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                        2
                                      </span>
                                      ●●●●●●
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 추출된 정보 표시 */}
                            {editFormData.ssn.length === 14 &&
                              editFormData.birthDate &&
                              editFormData.gender &&
                              !editFormData.ssnError && (
                                <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200/60 rounded-lg dark:bg-blue-950/30 dark:border-blue-800/50">
                                  <div className="text-xs font-medium text-blue-800 mb-2 dark:text-blue-300">
                                    추출된 정보
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-400">
                                        생년월일:
                                      </span>
                                      <span className="ml-1 font-medium text-foreground">
                                        {new Date(
                                          editFormData.birthDate
                                        ).toLocaleDateString('ko-KR')}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-400">
                                        성별:
                                      </span>
                                      <span className="ml-1 font-medium text-foreground">
                                        {editFormData.gender === 'male'
                                          ? '남성'
                                          : '여성'}
                                      </span>
                                    </div>
                                  </div>
                                  {/* 3가지 나이 표시 */}
                                  <div className="mt-2 space-y-1 text-xs">
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-400">
                                        만 나이:
                                      </span>
                                      <span className="ml-1 font-medium text-foreground">
                                        {calculateAge(
                                          new Date(editFormData.birthDate),
                                          'standard'
                                        )}
                                        세
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-400">
                                        한국 나이:
                                      </span>
                                      <span className="ml-1 font-medium text-foreground">
                                        {calculateAge(
                                          new Date(editFormData.birthDate),
                                          'korean'
                                        )}
                                        세
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 dark:text-blue-400">
                                        보험 나이:
                                      </span>
                                      <span className="ml-1 font-medium text-foreground">
                                        {calculateAge(
                                          new Date(editFormData.birthDate),
                                          'insurance'
                                        )}
                                        세
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* 소개 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">소개 정보</h4>

                    {/* 누가 이 고객을 소개했는지 */}
                    <div className="flex items-center gap-3">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          이 고객을 소개한 사람
                        </div>
                        {client?.referredBy ? (
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/clients/${client.referredBy.id}`}
                              className="text-sm text-primary hover:underline font-medium"
                            >
                              {client.referredBy.name}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                              소개자
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              직접 개발 고객
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              신규 개발
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 이 고객이 소개한 다른 고객들 */}
                    <div className="flex items-start gap-3">
                      <Network className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          이 고객이 소개한 사람들
                        </div>
                        {client?.referredClients &&
                        client.referredClients.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                총 {client.referralCount}명 소개
                              </span>
                              <Badge
                                variant="default"
                                className="text-xs bg-green-100 text-green-700 border-green-300"
                              >
                                소개 기여자
                              </Badge>
                            </div>
                            {/* 🔥 실제 소개한 사람들 이름 목록 */}
                            <div className="space-y-1">
                              {client.referredClients.map(
                                (referredClient: any, index: number) => (
                                  <div
                                    key={referredClient.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Link
                                      to={`/clients/${referredClient.id}`}
                                      className="text-sm text-primary hover:underline font-medium"
                                    >
                                      {index + 1}. {referredClient.name}
                                    </Link>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {new Date(
                                        referredClient.createdAt
                                      ).toLocaleDateString('ko-KR')}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              아직 소개한 고객이 없습니다
                            </span>
                            <Badge variant="outline" className="text-xs">
                              잠재 소개자
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 태그 섹션 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">태그</h4>
                      {clientTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleOpenTagModal}
                          className="h-6 text-xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          편집
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clientTags.length > 0 ? (
                        clientTags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80 group relative"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                            }}
                          >
                            <span style={{ color: tag.color }}>{tag.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeClientTag(tag.id);
                              }}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <div className="text-center py-3 w-full">
                          <Target className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-2">
                            태그가 없습니다
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={handleOpenTagModal}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            태그 추가
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto lg:h-9 gap-1 lg:gap-0 p-1">
                <TabsTrigger value="notes">상담내용</TabsTrigger>
                <TabsTrigger value="medical">병력사항</TabsTrigger>
                <TabsTrigger value="checkup">점검목적</TabsTrigger>
                <TabsTrigger value="interests">관심사항</TabsTrigger>
                <TabsTrigger value="companions">상담동반자</TabsTrigger>
                <TabsTrigger value="insurance">보험</TabsTrigger>
                <TabsTrigger value="family">가족</TabsTrigger>
              </TabsList>

              {/* 탭 컨텐츠들 */}
              <TabsContent value="insurance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      보험 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        보험 정보가 준비 중입니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="family" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      가족 구성원
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        가족 정보가 준비 중입니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 🆕 병력사항 탭 */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-lg">🏥</span>
                      병력사항
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      고객의 의료 이력 및 건강 상태 정보를 관리합니다.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* 3개월 이내 의료사항 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        🕐 3개월 이내 의료 관련 사항
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                        {[
                          {
                            key: 'hasRecentDiagnosis',
                            label: '질병 확정진단',
                            icon: '🔬',
                          },
                          {
                            key: 'hasRecentSuspicion',
                            label: '질병 의심소견',
                            icon: '🤔',
                          },
                          {
                            key: 'hasRecentMedication',
                            label: '투약',
                            icon: '💊',
                          },
                          {
                            key: 'hasRecentTreatment',
                            label: '치료',
                            icon: '🩺',
                          },
                          {
                            key: 'hasRecentHospitalization',
                            label: '입원',
                            icon: '🏥',
                          },
                          {
                            key: 'hasRecentSurgery',
                            label: '수술',
                            icon: '⚕️',
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={
                                  medicalHistory[
                                    item.key as keyof typeof medicalHistory
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  setMedicalHistory((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                              />
                              <span>{item.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 1년 이내 재검사 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        📅 1년 이내 재검사 관련
                      </h4>
                      <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg border border-border/40">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🔄</span>
                          <label className="flex items-center space-x-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded border-border"
                              checked={medicalHistory.hasAdditionalExam}
                              onChange={(e) =>
                                setMedicalHistory((prev) => ({
                                  ...prev,
                                  hasAdditionalExam: e.target.checked,
                                }))
                              }
                            />
                            <span>
                              의사로부터 진찰 또는 검사를 통하여
                              추가검사(재검사) 소견 여부
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 5년 이내 주요 의료 이력 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        🗓️ 5년 이내 주요 의료 이력
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg border border-border/60">
                        {[
                          {
                            key: 'hasMajorHospitalization',
                            label: '입원',
                            icon: '🏥',
                          },
                          { key: 'hasMajorSurgery', label: '수술', icon: '⚕️' },
                          {
                            key: 'hasLongTermTreatment',
                            label: '7일 이상 치료',
                            icon: '📅',
                          },
                          {
                            key: 'hasLongTermMedication',
                            label: '30일 이상 투약',
                            icon: '💊',
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={
                                  medicalHistory[
                                    item.key as keyof typeof medicalHistory
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  setMedicalHistory((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                              />
                              <span>{item.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 상세 메모 섹션 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">상세 내용</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">
                            3개월 이내 상세 내용
                          </label>
                          <textarea
                            className="w-full mt-1 p-3 border rounded-lg text-sm"
                            rows={3}
                            placeholder="3개월 이내 의료 관련 상세 내용을 입력하세요..."
                            value={medicalHistory.recentMedicalDetails}
                            onChange={(e) =>
                              setMedicalHistory((prev) => ({
                                ...prev,
                                recentMedicalDetails: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            5년 이내 상세 내용
                          </label>
                          <textarea
                            className="w-full mt-1 p-3 border rounded-lg text-sm"
                            rows={3}
                            placeholder="5년 이내 주요 의료 이력 상세 내용을 입력하세요..."
                            value={medicalHistory.majorMedicalDetails}
                            onChange={(e) =>
                              setMedicalHistory((prev) => ({
                                ...prev,
                                majorMedicalDetails: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="px-6"
                        onClick={async () => {
                          try {
                            const formData = new FormData();
                            formData.append('intent', 'updateMedicalHistory');

                            // 병력사항 데이터 추가
                            Object.entries(medicalHistory).forEach(
                              ([key, value]) => {
                                formData.append(key, value.toString());
                              }
                            );

                            submit(formData, { method: 'post' });

                            // 성공 모달 표시
                            setSuccessMessage(
                              '병력사항이 성공적으로 저장되었습니다.'
                            );
                            setShowSuccessModal(true);
                          } catch (error) {
                            console.error('병력사항 저장 실패:', error);
                          }
                        }}
                      >
                        병력사항 저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 🆕 점검목적 탭 */}
              <TabsContent value="checkup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      점검 목적
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      고객의 보험 관련 걱정사항과 필요사항을 파악합니다.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* 걱정사항 체크리스트 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        😟 현재 걱정되는 사항
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/25 rounded-lg border border-border/50">
                        {[
                          {
                            key: 'isInsurancePremiumConcern',
                            label: '현재 보험료가 걱정되시나요?',
                            icon: '💰',
                          },
                          {
                            key: 'isCoverageConcern',
                            label: '현재 보장이 걱정되시나요?',
                            icon: '🛡️',
                          },
                          {
                            key: 'isMedicalHistoryConcern',
                            label: '현재 병력이 있어서 걱정되시나요?',
                            icon: '🏥',
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={
                                  checkupPurposes[
                                    item.key as keyof typeof checkupPurposes
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  setCheckupPurposes((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                              />
                              <span>{item.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 필요사항 체크리스트 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        ✅ 필요한 사항
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/25 rounded-lg border border-border/50">
                        {[
                          {
                            key: 'needsDeathBenefit',
                            label: '현재 사망보험금이 필요하신가요?',
                            icon: '💼',
                          },
                          {
                            key: 'needsImplantPlan',
                            label: '2년후 임플란트 계획이 있으신가요?',
                            icon: '🦷',
                          },
                          {
                            key: 'needsCaregiverInsurance',
                            label: '현재 간병인 보험이 필요하신가요?',
                            icon: '👩‍⚕️',
                          },
                          {
                            key: 'needsDementiaInsurance',
                            label: '현재 치매보험이 필요하신가요?',
                            icon: '🧠',
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={
                                  checkupPurposes[
                                    item.key as keyof typeof checkupPurposes
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  setCheckupPurposes((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.checked,
                                  }))
                                }
                              />
                              <span>{item.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 저축 현황 (주관식) */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        💰 저축 현황
                      </h4>
                      <div className="p-4 bg-accent/20 rounded-lg border border-border/40">
                        <label className="block text-sm text-muted-foreground mb-2">
                          지금 저축은 어디서 하고 계신가요?
                        </label>
                        <textarea
                          className="w-full p-3 border rounded-lg text-sm"
                          rows={3}
                          placeholder="저축 현황에 대해 자세히 입력해주세요..."
                          value={checkupPurposes.currentSavingsLocation}
                          onChange={(e) =>
                            setCheckupPurposes((prev) => ({
                              ...prev,
                              currentSavingsLocation: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* 추가 걱정사항 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">
                        기타 걱정사항
                      </h4>
                      <textarea
                        className="w-full p-3 border rounded-lg text-sm"
                        rows={4}
                        placeholder="기타 걱정사항이나 추가로 논의하고 싶은 내용을 입력해주세요..."
                        value={checkupPurposes.additionalConcerns}
                        onChange={(e) =>
                          setCheckupPurposes((prev) => ({
                            ...prev,
                            additionalConcerns: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="px-6"
                        onClick={async () => {
                          try {
                            const formData = new FormData();
                            formData.append('intent', 'updateCheckupPurposes');

                            // 점검목적 데이터 추가
                            Object.entries(checkupPurposes).forEach(
                              ([key, value]) => {
                                formData.append(key, value.toString());
                              }
                            );

                            submit(formData, { method: 'post' });

                            // 성공 모달 표시
                            setSuccessMessage(
                              '점검목적이 성공적으로 저장되었습니다.'
                            );
                            setShowSuccessModal(true);
                          } catch (error) {
                            console.error('점검목적 저장 실패:', error);
                          }
                        }}
                      >
                        점검목적 저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 🆕 관심사항 탭 */}
              <TabsContent value="interests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-lg">❓</span>
                      무엇이든 물어보세요!
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      고객의 관심사항을 체크리스트로 관리합니다.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        {
                          key: 'interestedInAutoInsurance',
                          label: '자동차보험',
                          icon: '🚗',
                        },
                        {
                          key: 'interestedInDementia',
                          label: '치매',
                          icon: '🧠',
                        },
                        {
                          key: 'interestedInDental',
                          label: '치아(임플란트)',
                          icon: '🦷',
                        },
                        {
                          key: 'interestedInDriverInsurance',
                          label: '운전자',
                          icon: '🚙',
                        },
                        {
                          key: 'interestedInHealthCheckup',
                          label: '건강검진',
                          icon: '🏥',
                        },
                        {
                          key: 'interestedInMedicalExpenses',
                          label: '실비원가',
                          icon: '💊',
                        },
                        {
                          key: 'interestedInFireInsurance',
                          label: '화재보험',
                          icon: '🔥',
                        },
                        {
                          key: 'interestedInCaregiver',
                          label: '간병인',
                          icon: '👩‍⚕️',
                        },
                        {
                          key: 'interestedInCancer',
                          label: '암 (표적항암, 로봇수술)',
                          icon: '🎗️',
                        },
                        {
                          key: 'interestedInSavings',
                          label: '저축 (연금, 노후, 목돈)',
                          icon: '💰',
                        },
                        {
                          key: 'interestedInLiability',
                          label: '일상배상책임',
                          icon: '⚖️',
                        },
                        {
                          key: 'interestedInLegalAdvice',
                          label: '민사소송법률',
                          icon: '⚖️',
                        },
                        {
                          key: 'interestedInTax',
                          label: '상속세, 양도세',
                          icon: '📋',
                        },
                        {
                          key: 'interestedInInvestment',
                          label: '재테크',
                          icon: '📈',
                        },
                        {
                          key: 'interestedInPetInsurance',
                          label: '펫보험',
                          icon: '🐕',
                        },
                        {
                          key: 'interestedInAccidentInsurance',
                          label: '상해보험',
                          icon: '🩹',
                        },
                        {
                          key: 'interestedInTrafficAccident',
                          label: '교통사고(합의)',
                          icon: '🚨',
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          <label className="flex flex-col items-center text-center cursor-pointer space-y-2">
                            <span className="text-2xl">{item.icon}</span>
                            <input
                              type="checkbox"
                              className="rounded border-border"
                              checked={
                                interestCategories[
                                  item.key as keyof typeof interestCategories
                                ] as boolean
                              }
                              onChange={(e) =>
                                setInterestCategories((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.checked,
                                }))
                              }
                            />
                            <span className="text-xs text-foreground leading-tight">
                              {item.label}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* 추가 관심사항 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">
                        기타 관심사항
                      </h4>
                      <textarea
                        className="w-full p-3 border rounded-lg text-sm"
                        rows={4}
                        placeholder="위 목록에 없는 관심사항이나 추가로 알고 싶은 내용을 입력해주세요..."
                        value={interestCategories.interestNotes}
                        onChange={(e) =>
                          setInterestCategories((prev) => ({
                            ...prev,
                            interestNotes: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="px-6"
                        onClick={async () => {
                          try {
                            const formData = new FormData();
                            formData.append(
                              'intent',
                              'updateInterestCategories'
                            );

                            // 관심사항 데이터 추가
                            Object.entries(interestCategories).forEach(
                              ([key, value]) => {
                                formData.append(key, value.toString());
                              }
                            );

                            submit(formData, { method: 'post' });

                            // 성공 모달 표시
                            setSuccessMessage(
                              '관심사항이 성공적으로 저장되었습니다.'
                            );
                            setShowSuccessModal(true);
                          } catch (error) {
                            console.error('관심사항 저장 실패:', error);
                          }
                        }}
                      >
                        관심사항 저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 🆕 상담동반자 탭 */}
              <TabsContent value="companions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      상담 같이 들어야하는 소중한 분
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      상담에 함께 참석할 동반자 정보를 관리합니다.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* 동반자 추가 버튼 */}
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">
                        등록된 동반자
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddCompanion}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        동반자 추가
                      </Button>
                    </div>

                    {/* 동반자 목록 */}
                    <div className="space-y-4">
                      {consultationCompanions &&
                      consultationCompanions.length > 0 ? (
                        consultationCompanions.map((companion) => (
                          <div
                            key={companion.id}
                            className="p-4 bg-muted/20 rounded-lg border border-border/40"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">👤</span>
                                  <div>
                                    <h5 className="font-medium text-foreground">
                                      {companion.name}
                                    </h5>
                                    <span className="text-sm text-muted-foreground">
                                      {companion.relationship}
                                    </span>
                                  </div>
                                </div>
                                {companion.phone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{companion.phone}</span>
                                  </div>
                                )}
                                {companion.isPrimary && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      주 동반자
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    companion.id &&
                                    handleEditCompanion(companion)
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    companion.id &&
                                    handleDeleteCompanion(companion.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* 빈 상태 */
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">👥</span>
                          </div>
                          <h4 className="font-medium text-foreground mb-2">
                            동반자가 없습니다
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            상담에 함께 참석할 동반자를 추가해보세요.
                          </p>
                          <Button
                            variant="outline"
                            onClick={handleAddCompanion}
                          >
                            <Plus className="h-4 w-4 mr-2" />첫 동반자 추가
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 동반자 추가 폼 (숨김 상태) */}
                    <div className="hidden p-4 bg-muted/30 rounded-lg border border-border">
                      <h5 className="font-medium text-foreground mb-4">
                        새 동반자 추가
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            성함 *
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="동반자 성함"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            관계 *
                          </label>
                          <select
                            className="w-full p-2 border rounded-lg text-sm"
                            disabled
                          >
                            <option>관계 선택</option>
                            <option>배우자</option>
                            <option>자녀</option>
                            <option>부모</option>
                            <option>형제/자매</option>
                            <option>기타</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            연락처 *
                          </label>
                          <input
                            type="tel"
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="010-0000-0000"
                            disabled
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded"
                              disabled
                            />
                            <span className="text-sm">주 동반자로 설정</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" disabled>
                          저장
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          취소
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 🆕 상담내용 탭 */}
              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      상담 내용 및 계약사항 메모
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      날짜별로 상담 내용과 계약사항을 기록합니다.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* 고객 메모 및 특이사항 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        고객 메모 및 특이사항
                      </h4>
                      <div className="p-4 bg-muted/20 rounded-lg border border-border/40">
                        {isEditing ? (
                          <Textarea
                            value={editFormData.notes}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                notes: e.target.value,
                              })
                            }
                            placeholder="고객에 대한 메모를 입력하세요..."
                            className="min-h-[120px] resize-none border-none p-0 bg-transparent"
                          />
                        ) : client?.notes ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {client.notes}
                          </p>
                        ) : (
                          <div className="text-center py-6">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">
                              메모가 없습니다
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditStart}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              메모 추가
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* 상담 노트 추가 버튼 */}
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">상담 기록</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddNote}
                      >
                        <Plus className="h-4 w-4 mr-2" />새 상담 기록
                      </Button>
                    </div>

                    {/* 상담 기록 타임라인 */}
                    <div className="space-y-6">
                      {consultationNotes && consultationNotes.length > 0 ? (
                        consultationNotes.map((note, index) => (
                          <div key={note.id} className="relative pl-8">
                            <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                            {index < consultationNotes.length - 1 && (
                              <div className="absolute left-1.5 top-5 w-0.5 h-full bg-border"></div>
                            )}

                            <div className="border rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h5 className="font-medium text-foreground">
                                    {note.title}
                                  </h5>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span>📅 {note.consultationDate}</span>
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      상담
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      note.id && handleEditNote(note)
                                    }
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h6 className="text-sm font-medium text-muted-foreground mb-1">
                                    상담 내용
                                  </h6>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                  </p>
                                </div>

                                {note.contractInfo && (
                                  <div>
                                    <h6 className="text-sm font-medium text-muted-foreground mb-1">
                                      계약 관련
                                    </h6>
                                    <div className="bg-accent/20 p-3 rounded border border-border/40">
                                      <p className="text-sm whitespace-pre-wrap">
                                        {note.contractInfo}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {(note.followUpDate || note.followUpNotes) && (
                                  <div>
                                    <h6 className="text-sm font-medium text-muted-foreground mb-1">
                                      다음 액션
                                    </h6>
                                    <div className="flex items-center gap-2 text-sm">
                                      {note.followUpDate && (
                                        <span className="bg-orange-900 text-orange-100 px-2 py-1 rounded">
                                          ✅ {note.followUpDate}
                                        </span>
                                      )}
                                      {note.followUpNotes && (
                                        <span>{note.followUpNotes}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* 빈 상태 */
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📝</span>
                          </div>
                          <h4 className="font-medium text-foreground mb-2">
                            상담 기록이 없습니다
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            첫 상담 기록을 추가해보세요.
                          </p>
                          <Button variant="outline" onClick={handleAddNote}>
                            <Plus className="h-4 w-4 mr-2" />첫 상담 기록 작성
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 새 상담 기록 추가 폼 (숨김 상태) */}
                    <div className="hidden p-4 bg-muted/30 rounded-lg border border-border">
                      <h5 className="font-medium text-foreground mb-4">
                        새 상담 기록 작성
                      </h5>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              상담 날짜 *
                            </label>
                            <input
                              type="date"
                              className="w-full p-2 border rounded-lg text-sm"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              유형 *
                            </label>
                            <select
                              className="w-full p-2 border rounded-lg text-sm"
                              disabled
                            >
                              <option>상담 유형 선택</option>
                              <option>초기 상담</option>
                              <option>보험 상담</option>
                              <option>계약 체결</option>
                              <option>클레임 처리</option>
                              <option>팔로업</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              중요도
                            </label>
                            <select
                              className="w-full p-2 border rounded-lg text-sm"
                              disabled
                            >
                              <option>보통</option>
                              <option>높음</option>
                              <option>낮음</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            제목 *
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="상담 제목을 입력하세요"
                            disabled
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            상담 내용 *
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg text-sm"
                            rows={6}
                            placeholder="상담 내용을 상세히 입력하세요..."
                            disabled
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            다음 팔로업 날짜
                          </label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded-lg text-sm"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button disabled>저장</Button>
                        <Button variant="outline" disabled>
                          취소
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 🚀 새 영업 기회 모달 */}
        <NewOpportunityModal
          isOpen={showOpportunityModal}
          onClose={() => setShowOpportunityModal(false)}
          onConfirm={handleCreateOpportunity}
          clientName={client?.fullName || '고객'}
          isLoading={isCreatingOpportunity}
        />

        {/* 🗑️ 삭제 확인 모달 */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteClient}
          title="고객 삭제 확인"
          description={`정말로 "${
            client?.fullName || '고객'
          }" 고객을 삭제하시겠습니까?`}
          itemName={client?.fullName}
          itemType="고객"
          warningMessage="이 고객과 관련된 모든 데이터(보험 정보, 미팅 기록, 연락 이력 등)가 함께 삭제됩니다."
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
                <DialogTitle>저장 완료</DialogTitle>
                <DialogDescription>
                  고객 정보가 성공적으로 업데이트되었습니다.
                </DialogDescription>
              </DialogHeader>
              <Button
                onClick={() => setShowSaveSuccessModal(false)}
                className="w-full"
              >
                확인
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
                <DialogTitle>삭제 완료</DialogTitle>
                <DialogDescription>
                  '{client?.fullName || '고객'}' 고객이 성공적으로
                  삭제되었습니다.
                  <br />
                  <span className="text-sm text-muted-foreground mt-2 block">
                    잠시 후 고객 목록으로 이동합니다.
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
                고객 목록으로 이동
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🎉 새 영업 기회 성공 모달 */}
        <Dialog
          open={showOpportunitySuccessModal}
          onOpenChange={setShowOpportunitySuccessModal}
        >
          <DialogContent className="max-w-md">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl text-emerald-700 dark:text-emerald-400">
                  🎉 영업 기회 생성 완료!
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-4">
                    <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-lg p-4 dark:bg-emerald-950/30 dark:border-emerald-800/50">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">고객:</span>
                          <span className="font-semibold text-foreground">
                            {opportunitySuccessData.clientName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">상품:</span>
                          <span className="font-semibold text-foreground">
                            {opportunitySuccessData.insuranceType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">단계:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {opportunitySuccessData.stageName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 영업 파이프라인 페이지에서 확인할 수 있습니다.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowOpportunitySuccessModal(false);
                    setShowOpportunityModal(false);
                    // 🎯 사용자가 확인 버튼을 누른 후에만 새로고침
                    setTimeout(() => {
                      window.location.reload();
                    }, 500); // 모달이 닫힌 후 새로고침
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  확인
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ❌ 에러 모달 */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="max-w-md">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <DialogHeader>
                <DialogTitle>{errorModalContent.title}</DialogTitle>
                <DialogDescription className="text-left whitespace-pre-wrap">
                  {errorModalContent.message}
                </DialogDescription>
              </DialogHeader>
              <Button
                onClick={() => setShowErrorModal(false)}
                variant="outline"
                className="w-full"
              >
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🆕 성공 모달 */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                저장 완료
              </DialogTitle>
              <DialogDescription>
                변경사항이 성공적으로 저장되었습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-foreground">{successMessage}</p>
            </div>
            <DialogFooter className="flex justify-end pt-4">
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="px-6"
              >
                확인
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 🆕 상담동반자 추가/수정 모달 */}
        <Dialog
          open={showAddCompanionModal}
          onOpenChange={setShowAddCompanionModal}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                {editingCompanion?.id ? '동반자 수정' : '동반자 추가'}
              </DialogTitle>
              <DialogDescription>
                상담에 함께 참석할 동반자 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  성함 *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="동반자 성함"
                  value={editingCompanion?.name || ''}
                  onChange={(e) =>
                    setEditingCompanion((prev) => ({
                      ...prev!,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  관계 *
                </label>
                <Select
                  value={editingCompanion?.relationship || ''}
                  onValueChange={(value) =>
                    setEditingCompanion((prev) => ({
                      ...prev!,
                      relationship: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="관계 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="배우자">
                      <div className="flex items-center gap-2">
                        <span>💑</span>
                        배우자
                      </div>
                    </SelectItem>
                    <SelectItem value="자녀">
                      <div className="flex items-center gap-2">
                        <span>👶</span>
                        자녀
                      </div>
                    </SelectItem>
                    <SelectItem value="부모">
                      <div className="flex items-center gap-2">
                        <span>👨‍👩‍👧‍👦</span>
                        부모
                      </div>
                    </SelectItem>
                    <SelectItem value="형제/자매">
                      <div className="flex items-center gap-2">
                        <span>👫</span>
                        형제/자매
                      </div>
                    </SelectItem>
                    <SelectItem value="친구">
                      <div className="flex items-center gap-2">
                        <span>👭</span>
                        친구
                      </div>
                    </SelectItem>
                    <SelectItem value="동료">
                      <div className="flex items-center gap-2">
                        <span>🤝</span>
                        동료
                      </div>
                    </SelectItem>
                    <SelectItem value="기타">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        기타
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  연락처
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="010-0000-0000"
                  value={editingCompanion?.phone || ''}
                  onChange={(e) =>
                    setEditingCompanion((prev) => ({
                      ...prev!,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={editingCompanion?.isPrimary || false}
                    onChange={(e) =>
                      setEditingCompanion((prev) => ({
                        ...prev!,
                        isPrimary: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">주 동반자로 설정</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  주 동반자는 상담의 주요 참석자로 표시됩니다.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCompanionModal(false);
                  setEditingCompanion(null);
                }}
              >
                취소
              </Button>
              <Button onClick={handleSaveCompanion}>
                {editingCompanion?.id ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 🆕 상담내용 추가/수정 모달 */}
        <Dialog open={showAddNoteModal} onOpenChange={setShowAddNoteModal}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                {editingNote?.id ? '상담내용 수정' : '상담내용 추가'}
              </DialogTitle>
              <DialogDescription>
                고객과의 상담 내용과 계약사항을 기록하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    상담 날짜 *
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-lg text-sm"
                    value={editingNote?.consultationDate || ''}
                    onChange={(e) =>
                      setEditingNote((prev) => ({
                        ...prev!,
                        consultationDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg text-sm"
                    placeholder="상담 제목 (예: 보험 상담, 계약 체결)"
                    value={editingNote?.title || ''}
                    onChange={(e) =>
                      setEditingNote((prev) => ({
                        ...prev!,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  상담 내용 *
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm"
                  rows={6}
                  placeholder="상담 내용을 자세히 기록하세요..."
                  value={editingNote?.content || ''}
                  onChange={(e) =>
                    setEditingNote((prev) => ({
                      ...prev!,
                      content: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  계약 정보
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm"
                  rows={3}
                  placeholder="계약 관련 정보 (보험 종류, 보험료, 보장 내용 등)"
                  value={editingNote?.contractInfo || ''}
                  onChange={(e) =>
                    setEditingNote((prev) => ({
                      ...prev!,
                      contractInfo: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    후속 일정
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-lg text-sm"
                    value={editingNote?.followUpDate || ''}
                    onChange={(e) =>
                      setEditingNote((prev) => ({
                        ...prev!,
                        followUpDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    후속 메모
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg text-sm"
                    placeholder="후속 조치 사항"
                    value={editingNote?.followUpNotes || ''}
                    onChange={(e) =>
                      setEditingNote((prev) => ({
                        ...prev!,
                        followUpNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddNoteModal(false);
                  setEditingNote(null);
                }}
              >
                취소
              </Button>
              <Button onClick={handleSaveNote}>
                {editingNote?.id ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                태그 관리
              </DialogTitle>
              <DialogDescription id="tag-modal-description">
                고객에게 적용할 태그를 선택하거나 새로운 태그를 생성하세요.
                체크박스를 통해 태그를 선택하고 적용 버튼을 눌러 저장하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* 새 태그 생성 섹션 */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">새 태그 생성</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateTagModal(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    생성
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  새로운 태그를 생성하여 고객을 분류하고 관리하세요.
                </p>
              </div>

              {/* 사용 가능한 태그 목록 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">사용 가능한 태그</h4>
                {isLoadingTags ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      태그를 불러오는 중...
                    </p>
                  </div>
                ) : availableTags.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTagIds.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTagIds((prev) => [...prev, tag.id]);
                            } else {
                              setSelectedTagIds((prev) =>
                                prev.filter((id) => id !== tag.id)
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
                      사용 가능한 태그가 없습니다.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      새 태그를 생성해보세요.
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
                취소
              </Button>
              <Button onClick={handleSaveTags} disabled={isLoadingTags}>
                {isLoadingTags ? '저장 중...' : '적용'}
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
                새 태그 생성
              </DialogTitle>
              <DialogDescription id="create-tag-modal-description">
                새로운 태그를 생성하여 고객을 효율적으로 분류하세요. 태그 이름과
                색상을 설정할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  태그 이름 *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="예: VIP 고객, 신규 고객, 관심 고객"
                  value={tagForm.name}
                  onChange={(e) =>
                    setTagForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  태그 색상
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) =>
                      setTagForm((prev) => ({ ...prev, color: e.target.value }))
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
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setTagForm((prev) => ({ ...prev, color }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  설명 (선택사항)
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm resize-none"
                  placeholder="태그에 대한 설명을 입력하세요"
                  rows={3}
                  value={tagForm.description}
                  onChange={(e) =>
                    setTagForm((prev) => ({
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
                  미리보기
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
                      태그 이름을 입력하면 미리보기가 표시됩니다.
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
                취소
              </Button>
              <Button
                onClick={handleCreateTag}
                disabled={!tagForm.name.trim() || isLoadingTags}
              >
                {isLoadingTags ? '생성 중...' : '생성'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 🏷️ 태그 성공 모달 */}
        <Dialog
          open={showTagSuccessModal}
          onOpenChange={setShowTagSuccessModal}
        >
          <DialogContent
            className="sm:max-w-md"
            aria-describedby="tag-success-modal-description"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-green-600" aria-hidden="true">
                  ✅
                </span>
                태그 저장 완료
              </DialogTitle>
              <DialogDescription id="tag-success-modal-description">
                태그 변경사항이 성공적으로 저장되었습니다.
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
                확인
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const { id: clientId } = params;

  if (!clientId) {
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'updateClient') {
    try {
      // 폼 데이터 추출
      const updateData: any = {};

      const fullName = formData.get('fullName')?.toString();
      const phone = formData.get('phone')?.toString();
      const email = formData.get('email')?.toString();
      const telecomProvider = formData.get('telecomProvider')?.toString();
      const address = formData.get('address')?.toString();
      const occupation = formData.get('occupation')?.toString();
      const height = formData.get('height')?.toString();
      const weight = formData.get('weight')?.toString();
      const importance = formData.get('importance')?.toString();
      const notes = formData.get('notes')?.toString();
      const hasDrivingLicense = formData.get('hasDrivingLicense') === 'true';

      // 🔒 주민등록번호 관련 필드들 추가
      const ssnFront = formData.get('ssnFront')?.toString();
      const ssnBack = formData.get('ssnBack')?.toString();

      // snake_case 필드명으로 변환
      if (fullName) updateData.full_name = fullName;
      if (phone) updateData.phone = phone;
      if (email !== undefined) updateData.email = email || null;
      if (telecomProvider !== undefined) {
        updateData.telecom_provider =
          telecomProvider === 'none' ? null : telecomProvider;
      }
      if (address !== undefined) updateData.address = address || null;
      if (occupation !== undefined) updateData.occupation = occupation || null;
      if (height !== undefined) updateData.height = height || null;
      if (weight !== undefined) updateData.weight = weight || null;
      if (importance) updateData.importance = importance;
      if (notes !== undefined) updateData.notes = notes || null;
      if (hasDrivingLicense !== undefined)
        updateData.has_driving_license = hasDrivingLicense;

      updateData.updated_at = new Date().toISOString();

      // 🎯 Supabase Admin 클라이언트를 사용하여 직접 업데이트 (RLS 우회)
      const { createAdminClient } = await import('~/lib/core/supabase');
      const supabase = createAdminClient();

      // 1️⃣ 기본 프로필 정보 업데이트
      const { error: updateError } = await supabase
        .from('app_client_profiles')
        .update(updateData)
        .eq('id', clientId)
        .eq('agent_id', agentId)
        .eq('is_active', true);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2️⃣ 주민등록번호가 입력된 경우 상세 정보 처리
      if (
        ssnFront &&
        ssnBack &&
        ssnFront.length === 6 &&
        ssnBack.length === 7
      ) {
        const fullSSN = `${ssnFront}-${ssnBack}`;

        console.log('🔍 주민등록번호 처리 시작:', {
          clientId,
          agentId,
          ssnMasked: `${ssnFront}-${ssnBack.charAt(0)}******`,
        });

        // 🔍 주민등록번호 파싱
        const { parseKoreanId } = await import('~/lib/utils/korean-id-utils');
        const parseResult = parseKoreanId(fullSSN);

        console.log('📋 주민등록번호 파싱 결과:', {
          isValid: parseResult.isValid,
          hasBirthDate: !!parseResult.birthDate,
          hasGender: !!parseResult.gender,
          errorMessage: parseResult.errorMessage,
        });

        if (
          parseResult.isValid &&
          parseResult.birthDate &&
          parseResult.gender
        ) {
          try {
            // 🔒 주민등록번호 Base64 인코딩 (임시 - 나중에 AES-256-GCM으로 업그레이드)
            console.log('🔐 Base64 인코딩 시작...');
            const encryptedSSN = btoa(fullSSN); // 간단한 Base64 인코딩

            console.log('✅ Base64 인코딩 완료:', {
              encryptedLength: encryptedSSN.length,
              hasEncryptedData: encryptedSSN.length > 0,
            });

            // 상세 정보 객체 생성
            const detailsData = {
              client_id: clientId,
              birth_date: parseResult.birthDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
              gender: parseResult.gender,
              ssn: encryptedSSN, // 🔒 AES-256-GCM 암호화된 JSON 문자열
              updated_at: new Date().toISOString(),
            };

            console.log('📊 저장할 데이터:', {
              client_id: detailsData.client_id,
              birth_date: detailsData.birth_date,
              gender: detailsData.gender,
              ssnLength: detailsData.ssn.length,
              updated_at: detailsData.updated_at,
            });

            // 🎯 기존 데이터 확인 후 upsert
            console.log('🔍 기존 데이터 확인 중...');
            const { data: existingDetails } = await supabase
              .from('app_client_details')
              .select('id')
              .eq('client_id', clientId)
              .single();

            console.log('📋 기존 데이터 확인 결과:', {
              hasExisting: !!existingDetails,
              existingId: existingDetails?.id,
            });

            if (existingDetails) {
              // 기존 데이터 업데이트
              console.log('🔄 기존 데이터 업데이트 시작...');
              const { data: updateResult, error: detailsUpdateError } =
                await supabase
                  .from('app_client_details')
                  .update(detailsData)
                  .eq('client_id', clientId)
                  .select(); // 업데이트된 데이터 반환

              if (detailsUpdateError) {
                console.error(
                  '❌ 상세 정보 업데이트 실패:',
                  detailsUpdateError
                );
                throw new Error(
                  `상세 정보 업데이트 실패: ${detailsUpdateError.message}`
                );
              } else {
                console.log('✅ 상세 정보 업데이트 성공:', {
                  updatedRecords: updateResult?.length || 0,
                  firstRecord: updateResult?.[0]
                    ? {
                        id: updateResult[0].id,
                        birth_date: updateResult[0].birth_date,
                        gender: updateResult[0].gender,
                      }
                    : null,
                });
              }
            } else {
              // 새 데이터 삽입
              console.log('➕ 새 데이터 삽입 시작...');
              const { data: insertResult, error: detailsInsertError } =
                await supabase
                  .from('app_client_details')
                  .insert(detailsData)
                  .select(); // 삽입된 데이터 반환

              if (detailsInsertError) {
                console.error('❌ 상세 정보 삽입 실패:', detailsInsertError);
                throw new Error(
                  `상세 정보 삽입 실패: ${detailsInsertError.message}`
                );
              } else {
                console.log('✅ 상세 정보 삽입 성공:', {
                  insertedRecords: insertResult?.length || 0,
                  firstRecord: insertResult?.[0]
                    ? {
                        id: insertResult[0].id,
                        birth_date: insertResult[0].birth_date,
                        gender: insertResult[0].gender,
                      }
                    : null,
                });
              }
            }

            console.log('✅ 주민등록번호 파싱 및 저장 완료:', {
              birthDate: parseResult.birthDate.toISOString().split('T')[0],
              gender: parseResult.gender,
              ssnMasked: `${ssnFront}-${ssnBack.charAt(0)}******`, // 🔒 마스킹된 SSN만 로그
            });
          } catch (encodingError) {
            console.error(
              '❌ Base64 인코딩 또는 저장 과정에서 오류:',
              encodingError
            );
            throw new Error(
              `주민등록번호 처리 실패: ${
                encodingError instanceof Error
                  ? encodingError.message
                  : '알 수 없는 오류'
              }`
            );
          }
        } else {
          console.warn('⚠️ 주민등록번호 파싱 실패:', parseResult.errorMessage);

          // 🎯 주민등록번호 관련 구체적 에러 메시지 반환
          let userFriendlyMessage = '주민등록번호를 확인해주세요.';

          if (parseResult.errorMessage?.includes('1977년생은 성별코드가')) {
            userFriendlyMessage =
              '77년생의 경우 성별코드는 1(남성) 또는 2(여성)입니다. 입력하신 번호를 다시 확인해주세요.';
          } else if (parseResult.errorMessage?.includes('성별코드가')) {
            userFriendlyMessage =
              '생년과 성별코드가 일치하지 않습니다. 주민등록번호를 다시 확인해주세요.';
          } else if (parseResult.errorMessage?.includes('미래 날짜')) {
            userFriendlyMessage =
              '미래 날짜로 입력되었습니다. 주민등록번호를 다시 확인해주세요.';
          } else if (parseResult.errorMessage?.includes('유효하지 않은 날짜')) {
            userFriendlyMessage =
              '존재하지 않는 날짜입니다. 생년월일 부분을 확인해주세요.';
          } else if (parseResult.errorMessage?.includes('13자리')) {
            userFriendlyMessage =
              '주민등록번호는 13자리여야 합니다. (예: 771111-1234567)';
          }

          return {
            success: false,
            message: userFriendlyMessage,
            error: parseResult.errorMessage,
            inputError: true, // 입력 오류임을 표시
          };
        }
      } else {
        console.log('ℹ️ 주민등록번호 입력되지 않음 - 상세 정보 처리 건너뜀');
      }

      return {
        success: true,
        message: '고객 정보가 성공적으로 업데이트되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 고객 정보 업데이트 실패:', error);
      return {
        success: false,
        message: `고객 정보 업데이트에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  if (intent === 'deleteClient') {
    try {
      // 🎯 Supabase Admin 클라이언트를 사용하여 직접 삭제 (soft delete)
      const { createAdminClient } = await import('~/lib/core/supabase');
      const supabase = createAdminClient();

      const { error: deleteError } = await supabase
        .from('app_client_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('agent_id', agentId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return {
        success: true,
        message: '고객이 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 고객 삭제 실패:', error);
      return {
        success: false,
        message: `고객 삭제에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  if (intent === 'updateClientStage') {
    try {
      const targetStageId = formData.get('targetStageId')?.toString();
      const notes = formData.get('notes')?.toString();

      if (!targetStageId) {
        throw new Error('대상 단계 ID가 필요합니다.');
      }

      // 🎯 Supabase Admin 클라이언트를 사용하여 직접 업데이트
      const { createAdminClient } = await import('~/lib/core/supabase');
      const supabase = createAdminClient();

      // 기존 메모와 새 메모 결합
      const { data: currentClient, error: fetchError } = await supabase
        .from('app_client_profiles')
        .select('notes')
        .eq('id', clientId)
        .eq('agent_id', agentId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const existingNotes = currentClient?.notes || '';
      const currentDate = new Date().toLocaleDateString('ko-KR');
      const updatedNotes = existingNotes
        ? `${existingNotes}\n\n--- 새 영업 기회 (${currentDate}) ---\n${notes}`
        : notes;

      // 고객 단계와 메모 업데이트
      const { error: updateError } = await supabase
        .from('app_client_profiles')
        .update({
          current_stage_id: targetStageId,
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('agent_id', agentId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return {
        success: true,
        message: '영업 기회가 성공적으로 생성되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 영업 기회 생성 실패:', error);
      return {
        success: false,
        message: `영업 기회 생성에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 병력사항 업데이트
  if (intent === 'updateMedicalHistory') {
    try {
      // 🆕 새로운 API 함수 import
      const { updateMedicalHistory } = await import(
        '~/features/clients/lib/client-data'
      );

      const medicalData = {
        // 3개월 이내 항목들 (스키마와 매칭)
        hasRecentDiagnosis: formData.get('hasRecentDiagnosis') === 'true',
        hasRecentSuspicion: formData.get('hasRecentSuspicion') === 'true',
        hasRecentMedication: formData.get('hasRecentMedication') === 'true',
        hasRecentTreatment: formData.get('hasRecentTreatment') === 'true',
        hasRecentHospitalization:
          formData.get('hasRecentHospitalization') === 'true',
        hasRecentSurgery: formData.get('hasRecentSurgery') === 'true',
        recentMedicalDetails:
          formData.get('recentMedicalDetails')?.toString() || null,
        // 1년 이내 항목들 (스키마와 매칭)
        hasAdditionalExam: formData.get('hasAdditionalExam') === 'true',
        additionalExamDetails:
          formData.get('additionalExamDetails')?.toString() || null,
        // 5년 이내 항목들 (스키마와 매칭)
        hasMajorHospitalization:
          formData.get('hasMajorHospitalization') === 'true',
        hasMajorSurgery: formData.get('hasMajorSurgery') === 'true',
        hasLongTermTreatment: formData.get('hasLongTermTreatment') === 'true',
        hasLongTermMedication: formData.get('hasLongTermMedication') === 'true',
        majorMedicalDetails:
          formData.get('majorMedicalDetails')?.toString() || null,
        lastUpdatedBy: agentId,
      };

      await updateMedicalHistory(clientId, medicalData, agentId);

      return {
        success: true,
        message: '병력사항이 성공적으로 업데이트되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 병력사항 업데이트 실패:', error);
      return {
        success: false,
        message: `병력사항 업데이트에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 점검목적 업데이트
  if (intent === 'updateCheckupPurposes') {
    try {
      const { updateCheckupPurposes } = await import(
        '~/features/clients/lib/client-data'
      );

      const checkupData = {
        // 걱정 관련 항목들 (스키마와 매칭)
        isInsurancePremiumConcern:
          formData.get('isInsurancePremiumConcern') === 'true',
        isCoverageConcern: formData.get('isCoverageConcern') === 'true',
        isMedicalHistoryConcern:
          formData.get('isMedicalHistoryConcern') === 'true',
        // 필요 관련 항목들
        needsDeathBenefit: formData.get('needsDeathBenefit') === 'true',
        needsImplantPlan: formData.get('needsImplantPlan') === 'true',
        needsCaregiverInsurance:
          formData.get('needsCaregiverInsurance') === 'true',
        needsDementiaInsurance:
          formData.get('needsDementiaInsurance') === 'true',
        // 저축 현황 (스키마와 매칭)
        currentSavingsLocation:
          formData.get('currentSavingsLocation')?.toString() || null,
        // 기타 걱정사항 (스키마와 매칭)
        additionalConcerns:
          formData.get('additionalConcerns')?.toString() || null,
        lastUpdatedBy: agentId,
      };

      await updateCheckupPurposes(clientId, checkupData, agentId);

      return {
        success: true,
        message: '점검목적이 성공적으로 업데이트되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 점검목적 업데이트 실패:', error);
      return {
        success: false,
        message: `점검목적 업데이트에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 관심사항 업데이트
  if (intent === 'updateInterestCategories') {
    try {
      const { updateInterestCategories } = await import(
        '~/features/clients/lib/client-data'
      );

      const interestData = {
        interestedInAutoInsurance:
          formData.get('interestedInAutoInsurance') === 'true',
        interestedInDementia: formData.get('interestedInDementia') === 'true',
        interestedInDental: formData.get('interestedInDental') === 'true',
        interestedInDriverInsurance:
          formData.get('interestedInDriverInsurance') === 'true',
        interestedInHealthCheckup:
          formData.get('interestedInHealthCheckup') === 'true',
        interestedInMedicalExpenses:
          formData.get('interestedInMedicalExpenses') === 'true',
        interestedInFireInsurance:
          formData.get('interestedInFireInsurance') === 'true',
        interestedInCaregiver: formData.get('interestedInCaregiver') === 'true',
        interestedInCancer: formData.get('interestedInCancer') === 'true',
        interestedInSavings: formData.get('interestedInSavings') === 'true',
        interestedInLiability: formData.get('interestedInLiability') === 'true',
        interestedInLegalAdvice:
          formData.get('interestedInLegalAdvice') === 'true',
        interestedInTax: formData.get('interestedInTax') === 'true',
        interestedInInvestment:
          formData.get('interestedInInvestment') === 'true',
        interestedInPetInsurance:
          formData.get('interestedInPetInsurance') === 'true',
        interestedInAccidentInsurance:
          formData.get('interestedInAccidentInsurance') === 'true',
        interestedInTrafficAccident:
          formData.get('interestedInTrafficAccident') === 'true',
        // 추가 관심사항 메모
        interestNotes: formData.get('interestNotes')?.toString() || null,
        lastUpdatedBy: agentId,
      };

      await updateInterestCategories(clientId, interestData, agentId);

      return {
        success: true,
        message: '관심사항이 성공적으로 업데이트되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 관심사항 업데이트 실패:', error);
      return {
        success: false,
        message: `관심사항 업데이트에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 상담동반자 생성
  if (intent === 'createConsultationCompanion') {
    try {
      const { createConsultationCompanion } = await import(
        '~/features/clients/lib/client-data'
      );

      const companionData = {
        name: formData.get('companionName')?.toString() || '',
        phone: formData.get('companionPhone')?.toString() || '',
        relationship: formData.get('companionRelationship')?.toString() || '',
        isPrimary: formData.get('companionIsPrimary') === 'true',
        addedBy: agentId,
      };

      if (!companionData.name.trim()) {
        throw new Error('동반자 이름은 필수입니다.');
      }

      await createConsultationCompanion(clientId, companionData, agentId);

      return {
        success: true,
        message: '상담동반자가 성공적으로 추가되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 상담동반자 생성 실패:', error);
      return {
        success: false,
        message: `상담동반자 추가에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 상담동반자 수정
  if (intent === 'updateConsultationCompanion') {
    try {
      const { updateConsultationCompanion } = await import(
        '~/features/clients/lib/client-data'
      );

      const companionId = formData.get('companionId')?.toString();
      if (!companionId) {
        throw new Error('동반자 ID가 필요합니다.');
      }

      const companionData = {
        name: formData.get('companionName')?.toString() || '',
        phone: formData.get('companionPhone')?.toString() || '',
        relationship: formData.get('companionRelationship')?.toString() || '',
        isPrimary: formData.get('companionIsPrimary') === 'true',
      };

      if (!companionData.name.trim()) {
        throw new Error('동반자 이름은 필수입니다.');
      }

      await updateConsultationCompanion(companionId, companionData, agentId);

      return {
        success: true,
        message: '상담동반자가 성공적으로 수정되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 상담동반자 수정 실패:', error);
      return {
        success: false,
        message: `상담동반자 수정에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 상담동반자 삭제
  if (intent === 'deleteConsultationCompanion') {
    try {
      const { deleteConsultationCompanion } = await import(
        '~/features/clients/lib/client-data'
      );

      const companionId = formData.get('companionId')?.toString();
      if (!companionId) {
        throw new Error('동반자 ID가 필요합니다.');
      }

      await deleteConsultationCompanion(companionId, agentId);

      return {
        success: true,
        message: '상담동반자가 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 상담동반자 삭제 실패:', error);
      return {
        success: false,
        message: `상담동반자 삭제에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 상담내용 생성
  if (intent === 'createConsultationNote') {
    try {
      const { createConsultationNote } = await import(
        '~/features/clients/lib/client-data'
      );

      const noteData = {
        consultationDate:
          formData.get('consultationDate')?.toString() ||
          new Date().toISOString().split('T')[0],
        noteType: 'consultation',
        title: formData.get('consultationTitle')?.toString() || '',
        content: formData.get('consultationContent')?.toString() || '',
        contractDetails: formData.get('contractInfo')?.toString() || null,
        followUpDate: formData.get('followUpDate')?.toString() || null,
        followUpNotes: formData.get('followUpNotes')?.toString() || null,
      };

      if (!noteData.title.trim() || !noteData.content.trim()) {
        throw new Error('상담 제목과 내용은 필수입니다.');
      }

      await createConsultationNote(clientId, noteData, agentId);

      return {
        success: true,
        message: '상담내용이 성공적으로 추가되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 상담내용 생성 실패:', error);
      return {
        success: false,
        message: `상담내용 추가에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  // 🆕 상담내용 수정
  if (intent === 'updateConsultationNote') {
    try {
      const { updateConsultationNote } = await import(
        '~/features/clients/lib/client-data'
      );

      const noteId = formData.get('noteId')?.toString();
      if (!noteId) {
        throw new Error('상담 기록 ID가 필요합니다.');
      }

      const noteData = {
        consultationDate:
          formData.get('consultationDate')?.toString() ||
          new Date().toISOString().split('T')[0],
        noteType: 'consultation',
        title: formData.get('consultationTitle')?.toString() || '',
        content: formData.get('consultationContent')?.toString() || '',
        contractDetails: formData.get('contractInfo')?.toString() || null,
        followUpDate: formData.get('followUpDate')?.toString() || null,
        followUpNotes: formData.get('followUpNotes')?.toString() || null,
      };

      if (!noteData.title.trim() || !noteData.content.trim()) {
        throw new Error('상담 제목과 내용은 필수입니다.');
      }

      await updateConsultationNote(noteId, noteData, agentId);

      return {
        success: true,
        message: '상담내용이 성공적으로 수정되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 상담내용 수정 실패:', error);
      return {
        success: false,
        message: `상담내용 수정에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  return {
    success: false,
    message: '알 수 없는 요청입니다.',
  };
}
