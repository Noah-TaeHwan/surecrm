import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
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

    // 🎯 Supabase 클라이언트를 사용하여 직접 조회
    const { createServerClient } = await import('~/lib/core/supabase');
    const supabase = createServerClient();

    // 고객 기본 정보 조회
    const { data: clientData, error: clientError } = await supabase
      .from('app_client_profiles')
      .select('*')
      .eq('id', clientId)
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .single();

    if (clientError || !clientData) {
      console.log('⚠️ 고객을 찾을 수 없음:', clientError?.message);
      return {
        client: null,
        currentUserId: agentId,
        currentUser: {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email.split('@')[0],
        },
        isEmpty: true,
      };
    }

    // 필드명을 camelCase로 변환
    const client = {
      id: clientData.id,
      agentId: clientData.agent_id,
      teamId: clientData.team_id,
      fullName: clientData.full_name,
      email: clientData.email,
      phone: clientData.phone,
      telecomProvider: clientData.telecom_provider,
      address: clientData.address,
      occupation: clientData.occupation,
      hasDrivingLicense: clientData.has_driving_license,
      height: clientData.height,
      weight: clientData.weight,
      tags: clientData.tags,
      importance: clientData.importance,
      currentStageId: clientData.current_stage_id,
      referredById: clientData.referred_by_id,
      notes: clientData.notes,
      customFields: clientData.custom_fields,
      isActive: clientData.is_active,
      createdAt: clientData.created_at,
      updatedAt: clientData.updated_at,
    };

    console.log('✅ 고객 정보 로드 완료:', {
      clientName: client.fullName,
    });

    return {
      client: client,
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
  const isEmpty = data?.isEmpty || false;
  const error = data?.error || null;
  const currentUser = data?.currentUser || null;

  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({
    title: '',
    message: '',
  });
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
  });
  const navigate = useNavigate();

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

      // 🎯 Supabase 클라이언트를 사용하여 직접 삭제 (soft delete)
      const { createServerClient } = await import('~/lib/core/supabase');
      const supabase = createServerClient();

      const { error: deleteError } = await supabase
        .from('app_client_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id)
        .eq('agent_id', client.agentId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

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
      try {
        // Base64로 인코딩된 SSN 디코딩
        existingSsn = atob(client.extendedDetails.ssn);
      } catch (decryptError) {
        existingSsn = '';
      }
    }

    const ssnParts = existingSsn.includes('-')
      ? existingSsn.split('-')
      : ['', ''];

    setEditFormData({
      fullName: client?.fullName || '',
      phone: client?.phone || '',
      email: client?.email || '',
      telecomProvider:
        telecomProviderValue && telecomProviderValue.trim()
          ? telecomProviderValue
          : 'none',
      address: client?.address || '',
      occupation: client?.occupation || '',
      height: client?.height || '',
      weight: client?.weight || '',
      hasDrivingLicense: client?.hasDrivingLicense || false,
      importance: client?.importance || 'medium',
      notes: client?.notes || '',
      ssn: existingSsn,
      ssnFront: ssnParts[0] || '',
      ssnBack: ssnParts[1] || '',
      birthDate: client?.extendedDetails?.birthDate || '',
      gender: client?.extendedDetails?.gender || '',
    });
    setIsEditing(true);
  };

  // 🎯 주민등록번호 자동 처리 함수
  const handleSsnChange = async (ssnFront: string, ssnBack: string) => {
    const fullSsn = ssnFront && ssnBack ? `${ssnFront}-${ssnBack}` : '';

    // SSN 파싱 및 생년월일/성별 추출
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
          // 유효하지 않은 경우 SSN만 업데이트
          setEditFormData((prev) => ({
            ...prev,
            ssn: fullSsn,
            ssnFront,
            ssnBack,
          }));
        }
      } catch (error) {
        setEditFormData((prev) => ({
          ...prev,
          ssn: fullSsn,
          ssnFront,
          ssnBack,
        }));
      }
    } else {
      setEditFormData((prev) => ({
        ...prev,
        ssn: fullSsn,
        ssnFront,
        ssnBack,
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
      // 기본 고객 정보와 민감 정보 분리
      const { ssn, ssnFront, ssnBack, ...basicClientData } = editFormData;

      // telecomProvider 'none' 처리
      const processedBasicData = {
        ...basicClientData,
        telecomProvider:
          basicClientData.telecomProvider === 'none'
            ? null
            : basicClientData.telecomProvider,
      };

      // 전체 데이터 구성
      const updateData = {
        ...processedBasicData,
        // 민감정보 포함
        ssn: ssn,
        birthDate: editFormData.birthDate || null,
        gender: editFormData.gender || null,
      };

      // Supabase 클라이언트를 사용하여 직접 업데이트
      const { createServerClient } = await import('~/lib/core/supabase');
      const supabase = createServerClient();

      // snake_case 필드명으로 변환
      const dbUpdateData: any = {};
      if (updateData.fullName) dbUpdateData.full_name = updateData.fullName;
      if (updateData.phone) dbUpdateData.phone = updateData.phone;
      if (updateData.email !== undefined) dbUpdateData.email = updateData.email;
      if (updateData.telecomProvider !== undefined)
        dbUpdateData.telecom_provider = updateData.telecomProvider;
      if (updateData.address !== undefined)
        dbUpdateData.address = updateData.address;
      if (updateData.occupation !== undefined)
        dbUpdateData.occupation = updateData.occupation;
      if (updateData.height !== undefined)
        dbUpdateData.height = updateData.height;
      if (updateData.weight !== undefined)
        dbUpdateData.weight = updateData.weight;
      if (updateData.hasDrivingLicense !== undefined)
        dbUpdateData.has_driving_license = updateData.hasDrivingLicense;
      if (updateData.importance)
        dbUpdateData.importance = updateData.importance;
      if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;
      dbUpdateData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('app_client_profiles')
        .update(dbUpdateData)
        .eq('id', client.id)
        .eq('agent_id', client.agentId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setShowSaveSuccessModal(true);
      setIsEditing(false);

      // 페이지 새로고침으로 최신 데이터 반영 (모달 닫힌 후 실행하도록 지연)
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

      // 1. 파이프라인 단계 조회 (API route 사용)
      console.log('📋 파이프라인 단계 조회 시작');

      const stagesResponse = await fetch('/api/pipeline/stages', {
        method: 'GET',
      });

      if (!stagesResponse.ok) {
        throw new Error('파이프라인 단계를 조회할 수 없습니다.');
      }

      const stagesResult = await stagesResponse.json();

      if (!stagesResult.success || !Array.isArray(stagesResult.data)) {
        throw new Error(
          '파이프라인 단계를 조회할 수 없습니다. 파이프라인을 먼저 설정해주세요.'
        );
      }

      const stages = stagesResult.data;
      console.log('📋 파이프라인 단계 조회 성공:', stages.length, '개');

      // 🔧 안전성 검사: stages 배열 유효성 확인 (강화)
      if (stages.length === 0) {
        throw new Error(
          '파이프라인 단계가 설정되지 않았습니다. 먼저 파이프라인을 설정해주세요.'
        );
      }

      // 첫 상담 단계 찾기 (더 안전한 방식)
      let firstStage = null;
      try {
        firstStage =
          stages.find((s: any) => s?.name === '첫 상담') ||
          stages.find(
            (s: any) => s?.name?.includes && s.name.includes('상담')
          ) ||
          stages.find((s: any) => s?.id) || // id가 있는 첫 번째 단계
          null;
      } catch (findError) {
        console.error('❌ 단계 찾기 에러:', findError);
        firstStage = null;
      }

      if (!firstStage?.id) {
        throw new Error('파이프라인의 첫 번째 단계를 찾을 수 없습니다.');
      }

      console.log('🎯 선택된 파이프라인 단계:', firstStage.name);

      // 2. 고객 메모 업데이트 (API route 사용)
      console.log('📝 고객 메모 업데이트 시작');

      // 영업 기회 메모 생성 (안전한 문자열 처리)
      const opportunityNotes = `[${getInsuranceTypeName(
        sanitizedData.insuranceType
      )} 영업] ${sanitizedData.notes || '새로운 영업 기회'}`;

      const existingNotes = client.notes ? String(client.notes) : '';
      const currentDate = new Date().toLocaleDateString('ko-KR');

      const memoUpdateData = new FormData();
      memoUpdateData.append(
        'notes',
        existingNotes
          ? `${existingNotes}\n\n--- 새 영업 기회 (${currentDate}) ---\n${opportunityNotes}`
          : opportunityNotes
      );

      try {
        const memoResponse = await fetch(
          `/api/clients/update?clientId=${client.id}`,
          {
            method: 'POST',
            body: memoUpdateData,
          }
        );

        const memoResult = await memoResponse.json();
        if (!memoResult.success) {
          console.warn('⚠️ 메모 업데이트 실패, 계속 진행:', memoResult.message);
        }
      } catch (updateError) {
        console.warn('⚠️ 메모 업데이트 실패, 계속 진행:', updateError);
        // 메모 업데이트 실패는 전체 프로세스를 중단하지 않음
      }

      // 3. 고객 단계를 첫 상담으로 변경 (API route 사용)
      console.log('🔄 고객 단계 변경 시작:', firstStage.name);

      const stageUpdateData = new FormData();
      stageUpdateData.append('targetStageId', firstStage.id);

      const stageResponse = await fetch(
        `/api/clients/stage?clientId=${client.id}`,
        {
          method: 'POST',
          body: stageUpdateData,
        }
      );

      const stageResult = await stageResponse.json();

      if (stageResult?.success) {
        console.log('✅ 영업 기회 생성 완료');
        alert(
          `🎉 ${client.fullName} 고객의 새 영업 기회가 생성되었습니다!\n\n` +
            `📋 상품: ${getInsuranceTypeName(sanitizedData.insuranceType)}\n` +
            `📈 상태: 영업 파이프라인 '${firstStage.name}' 단계에 추가됨\n\n` +
            `💡 영업 파이프라인 페이지에서 확인할 수 있습니다.`
        );
        setShowOpportunityModal(false);

        // 페이지 새로고침 (데이터 동기화)
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(
          stageResult?.message || '고객 단계 변경에 실패했습니다.'
        );
      }
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
          <div className="lg:col-span-1">
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
                              미입력
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
                              try {
                                // 🔓 암호화된 SSN 복호화 후 마스킹 표시
                                const decryptedSSN = atob(
                                  client.extendedDetails.ssn
                                );
                                return decryptedSSN.replace(
                                  /(\d{6})-(\d{7})/,
                                  '$1-*******'
                                );
                              } catch {
                                return '🔒 암호화된 데이터';
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

                            {/* 추출된 정보 표시 */}
                            {editFormData.ssn.length === 14 &&
                              editFormData.birthDate &&
                              editFormData.gender && (
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
                        {client?.referralCount && client.referralCount > 0 ? (
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="insurance">보험</TabsTrigger>
                <TabsTrigger value="family">가족</TabsTrigger>
                <TabsTrigger value="history">이력</TabsTrigger>
              </TabsList>

              {/* 개요 탭 */}
              <TabsContent value="overview" className="space-y-6">
                {/* 메모 섹션 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      메모 및 특이사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
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
                        className="min-h-[120px] resize-none"
                      />
                    ) : client?.notes ? (
                      <div className="p-4 bg-muted/20 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {client.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
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
                  </CardContent>
                </Card>

                {/* 태그 섹션 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      태그
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {client?.tags && client.tags.length > 0 ? (
                        client.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-center py-6 w-full">
                          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            태그가 없습니다
                          </p>
                          <Button variant="outline" size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            태그 추가
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 나머지 탭들 */}
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

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      연락 이력
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        연락 이력이 준비 중입니다.
                      </p>
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
      </div>
    </MainLayout>
  );
}
