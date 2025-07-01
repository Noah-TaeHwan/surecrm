import React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { TabsContent } from '~/common/components/ui/tabs';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Plus,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Edit,
  Paperclip,
  Upload,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';

// React Router hooks import
import { useRevalidator, useFetcher } from 'react-router';

// 커스텀 토스트 import
import { useToast, ToastContainer } from '~/common/components/ui/toast';

// 📁 공통 포맷팅 함수 import
import { formatCurrency as formatCurrencyWithLocale } from '~/lib/utils/currency';
import { cn } from '~/lib/utils';

// 🆔 주민등록번호 유틸리티 import
import {
  parseKoreanId,
  maskKoreanId,
  validateKoreanId,
  formatKoreanIdInput,
} from '~/lib/utils/korean-id-utils';

// 🌐 다국어 훅 import
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { useTranslation } from 'react-i18next';

// 📋 보험계약 타입 정의
interface InsuranceContract {
  id: string;
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  insuranceCode?: string; // 🆕 보종코드
  contractNumber?: string;
  policyNumber?: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate?: string;
  paymentDueDate?: string; // 🆕 납기일
  contractorName: string;
  contractorSsn?: string; // 🆕 계약자 주민번호
  contractorPhone?: string; // 🆕 계약자 연락처
  insuredName: string;
  insuredSsn?: string; // 🆕 피보험자 주민번호
  insuredPhone?: string; // 🆕 피보험자 연락처
  beneficiaryName?: string;
  premiumAmount?: string; // 🆕 납입보험료 (통합)
  monthlyPremium?: string; // 🔧 decimal 타입은 string으로 반환됨
  annualPremium?: string; // 🔧 decimal 타입은 string으로 반환됨
  coverageAmount?: string; // 🔧 decimal 타입은 string으로 반환됨
  agentCommission?: string; // 🔧 decimal 타입은 string으로 반환됨
  status: 'draft' | 'active' | 'cancelled' | 'expired' | 'suspended';
  paymentMethod?: string;
  paymentCycle?: string; // 🆕 납입주기
  paymentPeriod?: number;
  specialClauses?: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileDisplayName: string;
    documentType: string;
    description?: string; // 🔧 설명 필드 추가
  }>;
}

interface InsuranceContractsTabProps {
  clientId?: string;
  clientName?: string;
  agentId?: string;
  initialContracts?: InsuranceContract[];
  shouldOpenModal?: boolean; // 🏢 파이프라인에서 계약 전환 시 모달 자동 열기
}

// 📝 보험계약 폼 데이터 타입
interface ContractFormData {
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  insuranceCode: string; // 🆕 보종코드
  contractNumber: string;
  policyNumber: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate: string;
  paymentDueDate: string; // 🆕 납기일
  contractorName: string;
  contractorSsn: string; // 🆕 계약자 주민번호
  contractorPhone: string; // 🆕 계약자 연락처
  insuredName: string;
  insuredSsn: string; // 🆕 피보험자 주민번호
  insuredPhone: string; // 🆕 피보험자 연락처
  beneficiaryName: string;
  premiumAmount: string; // 🆕 납입보험료 (통합)
  monthlyPremium: string;
  annualPremium: string;
  coverageAmount: string;
  agentCommission: string;
  paymentCycle: string; // 🆕 납입주기 (납입방법)
  paymentPeriod: string;
  specialClauses: string;
  notes: string;
}

// 📁 첨부파일 타입 정의
interface AttachmentData {
  id: string;
  file?: File; // 새 첨부파일의 경우에만 File 객체 존재
  fileName: string;
  fileDisplayName: string;
  documentType: string;
  description?: string;
  isExisting?: boolean; // 기존 첨부파일 여부
  fileUrl?: string; // 기존 첨부파일의 URL
}

// 📄 문서 타입 상수 정의
const DOCUMENT_TYPES = [
  'contract',
  'application',
  'identification',
  'medical_report',
  'financial_statement',
  'other_document',
];

// 🏷️ 문서 타입 라벨 변환 함수
const getDocumentTypeLabel = (documentType: string, t: any) => {
  return t(
    `insuranceContractsTab.documentTypes.${documentType}`,
    t('insuranceContractsTab.documentTypes.other_document', '기타 문서')
  );
};

// 🎨 보험 유형별 설정

// 📊 계약 상태별 배지
const getStatusBadge = (status: string, t: any) => {
  const statusConfigs = {
    draft: {
      label: t('insuranceContractsTab.contractStatuses.draft', '초안'),
      variant: 'outline' as const,
    },
    active: {
      label: t('insuranceContractsTab.contractStatuses.active', '유효'),
      variant: 'default' as const,
    },
    cancelled: {
      label: t('insuranceContractsTab.contractStatuses.cancelled', '해지'),
      variant: 'destructive' as const,
    },
    expired: {
      label: t('insuranceContractsTab.contractStatuses.expired', '만료'),
      variant: 'secondary' as const,
    },
    suspended: {
      label: t('insuranceContractsTab.contractStatuses.suspended', '정지'),
      variant: 'secondary' as const,
    },
  };
  const config =
    statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// formatDate 함수를 컴포넌트 내부로 이동

// 🏢 보험회사 목록
const INSURANCE_COMPANIES = [
  'samsung_life',
  'hanwha_life',
  'kyobo_life',
  'shinhan_life',
  'mirae_asset_life',
  'samsung_fire',
  'hyundai_marine',
  'db_insurance',
  'meritz_fire',
  'kb_insurance',
  'lotte_insurance',
  'hanwha_insurance',
  'aig_insurance',
  'chubb_insurance',
  'other',
];

// 💳 납입방법 목록
const PAYMENT_CYCLES = [
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
  'lump_sum',
];

export function InsuranceContractsTab({
  clientId = 'test-client-id',
  clientName = '고객',
  agentId = 'test-agent-id',
  initialContracts = [],
  shouldOpenModal = false, // 🏢 파이프라인에서 계약 전환 시 모달 자동 열기
}: InsuranceContractsTabProps) {
  // 🌐 다국어 훅 초기화 (테스트: 일반 useTranslation 사용)
  const { t, i18n } = useTranslation('clients');
  const { isHydrated, formatCurrency: safeFormatCurrency } =
    useHydrationSafeTranslation('clients');

  // 💰 Hydration-safe 금액 포맷팅
  const formatCurrency = (amount?: number | string) => {
    if (!amount || amount === 0) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';

    // hydration-safe 포맷팅 사용
    return safeFormatCurrency(numAmount);
  };

  // 📅 Hydration-safe 날짜 포맷팅 (컴포넌트 내부)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    if (!isHydrated) {
      // Hydration 전에는 한국어 기본값 사용
      try {
        return new Date(dateStr).toLocaleDateString('ko-KR');
      } catch {
        return dateStr;
      }
    }

    try {
      const lang = i18n.language || 'ko';
      const locale =
        lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US';
      return new Date(dateStr).toLocaleDateString(locale);
    } catch {
      return dateStr;
    }
  };

  // 🎨 보험 유형별 설정 (useMemo로 언어 변경 감지)
  const getInsuranceTypeConfig = useMemo(() => {
    console.log(
      '🔍 [DEBUG] getInsuranceTypeConfig 재생성, 현재 언어:',
      i18n.language
    );

    return (type: string) => {
      const configs = {
        auto: {
          label: t('insuranceContractsTab.insuranceTypes.auto', '자동차보험'),
          icon: '🚗',
          color: 'bg-blue-100 text-blue-800',
        },
        life: {
          label: t('insuranceContractsTab.insuranceTypes.life', '생명보험'),
          icon: '❤️',
          color: 'bg-red-100 text-red-800',
        },
        health: {
          label: t('insuranceContractsTab.insuranceTypes.health', '건강보험'),
          icon: '🏥',
          color: 'bg-green-100 text-green-800',
        },
        property: {
          label: t('insuranceContractsTab.insuranceTypes.property', '재산보험'),
          icon: '🏠',
          color: 'bg-orange-100 text-orange-800',
        },
        travel: {
          label: t('insuranceContractsTab.insuranceTypes.travel', '여행보험'),
          icon: '✈️',
          color: 'bg-purple-100 text-purple-800',
        },
        accident: {
          label: t('insuranceContractsTab.insuranceTypes.accident', '상해보험'),
          icon: '💼',
          color: 'bg-yellow-100 text-yellow-800',
        },
      };

      const result = configs[type as keyof typeof configs] || {
        label: t('insuranceContractsTab.insuranceTypes.other', '기타'),
        icon: '📋',
        color: 'bg-gray-100 text-gray-800',
      };

      // 🔍 상세 디버깅 - 여러 방법 테스트

      console.log(
        '  1. 직접 호출:',
        t('insuranceContractsTab.insuranceTypes.life')
      );
      console.log(
        '  2. 기본값 없이:',
        t('insuranceContractsTab.insuranceTypes.life', {
          defaultValue: undefined,
        })
      );
      console.log(
        '  3. 명시적 언어:',
        t('insuranceContractsTab.insuranceTypes.life', { lng: 'en' })
      );
      console.log(
        '  4. 네임스페이스 명시:',
        t('clients:insuranceContractsTab.insuranceTypes.life')
      );
      console.log(
        '  5. i18n 직접 호출:',
        i18n.t('insuranceContractsTab.insuranceTypes.life', {
          ns: 'clients',
          lng: 'en',
        })
      );
      // 🔍 리소스 상태 상세 확인
      console.log('🔍 [DEBUG] 리소스 상태 상세:');
      console.log('  - 현재 언어:', i18n.language);
      console.log('  - 로드된 언어들:', Object.keys(i18n.store.data || {}));
      console.log(
        '  - 영어 리소스 전체:',
        i18n.getResourceBundle('en', 'clients')
      );
      console.log(
        '  - 한국어 리소스 전체:',
        i18n.getResourceBundle('ko', 'clients')
      );
      console.log(
        '  - 현재 언어 리소스:',
        i18n.getResourceBundle(i18n.language, 'clients')
      );
      console.log(
        '  - insuranceContractsTab 영어:',
        i18n.getResourceBundle('en', 'clients')?.insuranceContractsTab
      );
      console.log(
        '  - insuranceContractsTab 한국어:',
        i18n.getResourceBundle('ko', 'clients')?.insuranceContractsTab
      );

      // 🔍 구체적으로 insuranceTypes와 paymentCycles 확인
      const enInsuranceTab = i18n.getResourceBundle(
        'en',
        'clients'
      )?.insuranceContractsTab;
      console.log(
        '🔍 [상세] 영어 insuranceTypes:',
        enInsuranceTab?.insuranceTypes
      );
      console.log(
        '🔍 [상세] 영어 paymentCycles:',
        enInsuranceTab?.paymentCycles
      );
      console.log(
        '🔍 [상세] 영어 life 보험:',
        enInsuranceTab?.insuranceTypes?.life
      );
      console.log(
        '🔍 [상세] 영어 monthly 납입:',
        enInsuranceTab?.paymentCycles?.monthly
      );
      return result;
    };
  }, [t, i18n.language]);

  // 💰 납입주기 다국어 변환 함수 (useMemo로 언어 변경 감지)
  const getPaymentCycleLabel = useMemo(() => {
    console.log(
      '🔍 [DEBUG] getPaymentCycleLabel 재생성, 현재 언어:',
      i18n.language
    );

    return (cycle?: string) => {
      if (!cycle) return '';
      const result = t(`insuranceContractsTab.paymentCycles.${cycle}`, cycle);
      console.log(`🔍 [DEBUG] ${cycle} 납입주기 번역:`, result);
      return result;
    };
  }, [t, i18n.language]);

  // 📊 실제 데이터 상태
  const [contracts, setContracts] =
    useState<InsuranceContract[]>(initialContracts);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  // React Router hooks
  const revalidator = useRevalidator();
  const fetcher = useFetcher();

  // 토스트 알림
  const toast = useToast();

  // 🚀 상태 관리
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<InsuranceContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastProcessedFetcherData, setLastProcessedFetcherData] =
    useState<any>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(
    new Set()
  ); // 🔍 상세보기 토글 상태

  // 👁️ 주민등록번호 마스킹 해제 상태 관리
  const [visibleSsns, setVisibleSsns] = useState<Set<string>>(new Set());

  // 🗑️ 삭제 관련 상태 관리
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] =
    useState<InsuranceContract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🏢 파이프라인에서 계약 전환으로 온 경우 모달 자동 열기 (간단한 프로세스)
  useEffect(() => {
    if (shouldOpenModal) {
      handleAddContract(); // 새 계약 등록 모달 열기
    }
  }, [shouldOpenModal]);

  // 🔄 initialContracts 변경 시 로컬 상태 동기화
  useEffect(() => {
    setContracts(initialContracts);
    // 계약 목록이 변경되면 주민등록번호 표시 상태도 초기화
    setVisibleSsns(new Set());
  }, [initialContracts]);

  // fetcher 상태 모니터링 및 자동 새로고침 (무한루프 방지)
  useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data &&
      fetcher.data !== lastProcessedFetcherData
    ) {
      const result = fetcher.data;
      setLastProcessedFetcherData(result); // 처리된 데이터 기록

      if (result?.success) {
        // 성공 시 토스트 표시 및 자동 새로고침
        toast.success(
          '보험계약 등록 완료!',
          '보험계약이 성공적으로 등록되었습니다.'
        );

        // 🚀 새로운 계약을 로컬 상태에 즉시 추가 (중복 방지)
        if (result.data) {
          setContracts(prev => {
            const existingIds = prev.map(contract => contract.id);
            // 이미 존재하지 않는 경우에만 추가
            if (!existingIds.includes(result.data.id)) {
              return [result.data, ...prev];
            }
            return prev;
          });
        }

        // 모달 닫기
        setShowAddModal(false);
        setIsSubmitting(false);

        // 페이지 데이터 새로고침 (서버 동기화)
        revalidator.revalidate();
      } else if (result?.error) {
        // 에러 시 토스트 표시
        toast.error(
          '계약 등록 실패',
          result.message || '알 수 없는 오류가 발생했습니다.'
        );
        setIsSubmitting(false);
      }
    }
  }, [fetcher.state, fetcher.data, lastProcessedFetcherData]); // 중복 처리 방지

  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 📝 폼 데이터 상태
  const [formData, setFormData] = useState<ContractFormData>({
    productName: '',
    insuranceCompany: '',
    insuranceType: 'life',
    insuranceCode: '',
    contractNumber: '',
    policyNumber: '',
    contractDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    paymentDueDate: '',
    contractorName: clientName || '',
    contractorSsn: '',
    contractorPhone: '',
    insuredName: clientName || '',
    insuredSsn: '',
    insuredPhone: '',
    beneficiaryName: '',
    premiumAmount: '',
    monthlyPremium: '',
    annualPremium: '',
    coverageAmount: '',
    agentCommission: '',
    paymentCycle: 'monthly',
    paymentPeriod: '',
    specialClauses: '',
    notes: '',
  });

  // 📎 첨부파일 상태
  const [attachments, setAttachments] = useState<
    Array<{
      id: string;
      file: File;
      name: string;
      type: string;
    }>
  >([]);

  const handleAddContract = () => {
    setSelectedContract(null);
    setCurrentStep(1);
    setFieldErrors({});
    setFormData({
      productName: '',
      insuranceCompany: '',
      insuranceType: 'life',
      insuranceCode: '',
      contractNumber: '',
      policyNumber: '',
      contractDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      paymentDueDate: '',
      contractorName: clientName || '',
      contractorSsn: '',
      contractorPhone: '',
      insuredName: clientName || '',
      insuredSsn: '',
      insuredPhone: '',
      beneficiaryName: '',
      premiumAmount: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentCycle: 'monthly', // 기본값 설정
      paymentPeriod: '',
      specialClauses: '',
      notes: '',
    });
    setAttachments([]);
    setShowAddModal(true);
  };

  // 📝 실시간 필드 검증
  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    switch (field) {
      case 'productName':
        if (!value.trim()) {
          errors[field] = '상품명을 입력해주세요';
        } else if (value.length < 2) {
          errors[field] = '상품명은 2글자 이상 입력해주세요';
        } else {
          delete errors[field];
        }
        break;
      case 'insuranceCompany':
        if (!value.trim()) {
          errors[field] = '보험회사를 선택해주세요';
        } else {
          delete errors[field];
        }
        break;
      case 'contractorName':
      case 'insuredName':
        if (!value.trim()) {
          errors[field] = '이름을 입력해주세요';
        } else if (value.length < 2) {
          errors[field] = '이름은 2글자 이상 입력해주세요';
        } else {
          delete errors[field];
        }
        break;
      case 'contractDate':
      case 'effectiveDate':
        if (!value) {
          errors[field] = '날짜를 선택해주세요';
        } else {
          delete errors[field];
        }
        break;
      default:
        delete errors[field];
    }

    setFieldErrors(errors);
  };

  // 📊 진행률 계산
  const getProgressPercentage = () => {
    const requiredFields = [
      'productName',
      'insuranceCompany',
      'contractDate',
      'effectiveDate',
      'contractorName',
      'insuredName',
    ];
    const completedFields = requiredFields.filter(field =>
      formData[field as keyof typeof formData]?.toString().trim()
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // 🚀 단계별 진행
  const canProceedToNextStep = (step: number) => {
    switch (step) {
      case 1: // 기본 정보
        return (
          formData.productName &&
          formData.insuranceCompany &&
          formData.insuranceType
        );
      case 2: // 계약 정보
        return formData.contractDate && formData.effectiveDate;
      case 3: // 계약자 정보
        return formData.contractorName && formData.insuredName;
      default:
        return true;
    }
  };

  const handleEditContract = (contract: InsuranceContract) => {
    setSelectedContract(contract);
    setFormData({
      productName: contract.productName,
      insuranceCompany: contract.insuranceCompany,
      insuranceType: contract.insuranceType,
      insuranceCode: contract.insuranceCode || '',
      contractNumber: contract.contractNumber || '',
      policyNumber: contract.policyNumber || '',
      contractDate: contract.contractDate,
      effectiveDate: contract.effectiveDate,
      expirationDate: contract.expirationDate || '',
      paymentDueDate: contract.paymentDueDate || '',
      contractorName: contract.contractorName,
      contractorSsn: contract.contractorSsn || '',
      contractorPhone: contract.contractorPhone || '',
      insuredName: contract.insuredName,
      insuredSsn: contract.insuredSsn || '',
      insuredPhone: contract.insuredPhone || '',
      beneficiaryName: contract.beneficiaryName || '',
      premiumAmount: contract.premiumAmount?.toString() || '',
      monthlyPremium: contract.monthlyPremium?.toString() || '',
      annualPremium: contract.annualPremium?.toString() || '',
      coverageAmount: contract.coverageAmount?.toString() || '',
      agentCommission: contract.agentCommission?.toString() || '',
      paymentCycle: contract.paymentCycle || 'monthly',
      paymentPeriod: contract.paymentPeriod?.toString() || '',
      specialClauses: contract.specialClauses || '',
      notes: contract.notes || '',
    });
    setShowAddModal(true);
  };

  const handleFormChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 실시간 검증
    validateField(field, value);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newAttachments = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // 🔍 상세보기 토글 함수
  const toggleContractDetails = (contractId: string) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  // 👁️ 주민등록번호 마스킹 토글 - 간단한 버전
  const toggleSsnVisibility = (ssnKey: string) => {
    setVisibleSsns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ssnKey)) {
        newSet.delete(ssnKey);
      } else {
        newSet.add(ssnKey);
      }
      return newSet;
    });
  };

  // 📥 첨부파일 다운로드 함수
  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      console.log('📥 첨부파일 다운로드 시작:', attachmentId);

      // 다운로드 API 호출
      const response = await fetch(
        `/api/download-attachment?id=${attachmentId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/octet-stream',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '파일 다운로드에 실패했습니다.');
      }

      // 파일 다운로드 처리
      const blob = await response.blob();

      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'attachment';

      if (contentDisposition) {
        const matches = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (matches && matches[1]) {
          fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
      }

      // 브라우저에서 파일 다운로드 실행
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ 파일 다운로드 성공:', fileName);
      toast.success('다운로드 완료', `${fileName} 파일이 다운로드되었습니다.`);
    } catch (error) {
      console.error('❌ 파일 다운로드 실패:', error);
      toast.error(
        '다운로드 실패',
        error instanceof Error ? error.message : '파일 다운로드에 실패했습니다.'
      );
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    try {
      // 🎯 Fetcher를 사용한 API 호출
      const submitData = new FormData();

      // 🔧 수정 모드인지 생성 모드인지 판단
      const isEditMode = selectedContract !== null;
      const intent = isEditMode
        ? 'updateInsuranceContract'
        : 'createInsuranceContract';

      submitData.append('intent', intent);
      submitData.append('clientId', clientId);
      submitData.append('agentId', agentId);

      // 수정 모드일 때는 contractId도 추가
      if (isEditMode && selectedContract) {
        submitData.append('contractId', selectedContract.id);
      }

      // 첨부파일을 제외한 계약 데이터 추가
      const contractData = { ...formData };
      if (contractData.attachments) {
        delete contractData.attachments; // 첨부파일은 별도 처리
      }

      Object.entries(contractData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          submitData.append(key, value.toString());
        }
      });

      // 📁 첨부파일 디버깅 로그 추가
      console.log('🔍 첨부파일 디버깅:', {
        'formData 전체': formData,
        'attachments 존재여부': !!formData.attachments,
        'attachments 길이': formData.attachments?.length || 0,
        'attachments 내용': formData.attachments,
      });

      // 📁 첨부파일을 FormData에 추가 (NewContractModal에서 전달받은 데이터 사용)
      if (formData.attachments?.length > 0) {
        console.log(
          `📁 [다수파일처리] 첨부파일 ${formData.attachments.length}개 처리 중:`,
          formData.attachments.map((att: any, idx: number) => ({
            index: idx,
            fileName: att.fileName,
            displayName: att.fileDisplayName,
            type: att.documentType,
            size: att.file?.size || 'File 객체 없음',
            hasFile: !!att.file,
            fileType: typeof att.file,
            isExisting: att.isExisting,
          }))
        );

        // 새로운 파일만 FormData에 추가하기 위한 인덱스 카운터
        let newFileIndex = 0;

        // 각 첨부파일을 FormData에 추가
        formData.attachments.forEach((att: any, originalIndex: number) => {
          console.log(`📎 [다수파일처리] 첨부파일 ${originalIndex} 처리:`, {
            fileName: att.fileName,
            fileObject: att.file,
            isFile: att.file instanceof File,
            isExisting: att.isExisting,
            willUseIndex: newFileIndex,
          });

          if (att.file instanceof File && !att.isExisting) {
            // 새로 추가된 파일인 경우
            submitData.append(`attachment_file_${newFileIndex}`, att.file);
            submitData.append(
              `attachment_fileName_${newFileIndex}`,
              att.fileName
            );
            submitData.append(
              `attachment_displayName_${newFileIndex}`,
              att.fileDisplayName
            );
            submitData.append(
              `attachment_documentType_${newFileIndex}`,
              att.documentType
            );
            if (att.description) {
              submitData.append(
                `attachment_description_${newFileIndex}`,
                att.description
              );
            }
            console.log(
              `✅ [다수파일처리] 새 첨부파일 ${originalIndex} → FormData 인덱스 ${newFileIndex} 추가 완료`
            );
            newFileIndex++; // 다음 새 파일을 위해 인덱스 증가
          } else if (att.isExisting) {
            // 기존 첨부파일인 경우 - 메타데이터 업데이트를 FormData에 추가
            submitData.append(
              `existing_attachment_documentType_${att.id}`,
              att.documentType
            );
            if (att.description) {
              submitData.append(
                `existing_attachment_description_${att.id}`,
                att.description
              );
            }
            if (att.fileDisplayName) {
              submitData.append(
                `existing_attachment_displayName_${att.id}`,
                att.fileDisplayName
              );
            }
            console.log(
              `📎 [다수파일처리] 기존 첨부파일 ${originalIndex}: ${att.fileName} (메타데이터 업데이트)`
            );
          } else {
            console.error(
              `❌ [다수파일처리] 첨부파일 ${originalIndex}: File 객체가 아님`,
              att.file
            );
          }
        });

        console.log(
          `📋 [다수파일처리] 최종 결과: 총 ${formData.attachments.length}개 중 ${newFileIndex}개 새 파일을 FormData에 추가`
        );
      } else {
        console.log('📎 [다수파일처리] 첨부파일이 없음 또는 빈 배열');
      }

      console.log('📋 보험계약 저장 중...', contractData);

      // 🔧 수정/등록에 따른 API 엔드포인트 선택
      const apiEndpoint = selectedContract
        ? '/api/update-insurance-contract' // 수정
        : '/api/insurance-contracts'; // 신규 등록

      // contractId를 FormData에 추가 (수정인 경우)
      if (selectedContract) {
        submitData.append('contractId', selectedContract.id);
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: submitData,
      });

      console.log('🔍 응답 상태 확인:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      });

      const responseText = await response.text();
      console.log('🔍 응답 내용 (처음 200자):', responseText.substring(0, 200));

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ JSON 파싱 성공:', result);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.log('📄 전체 응답 내용:', responseText);
        const errorMessage =
          parseError instanceof Error ? parseError.message : '알 수 없는 오류';
        throw new Error(
          `서버에서 올바르지 않은 응답을 받았습니다: ${errorMessage}`
        );
      }

      // 결과 처리
      if (result.success) {
        const isUpdate = !!selectedContract;
        const actionText = isUpdate ? '수정' : '등록';
        console.log(`✅ 보험계약 ${actionText} 성공:`, result.message);
        toast.success(`계약 ${actionText} 완료`, result.message);
        setShowAddModal(false);
        setSelectedContract(null);
        setIsSubmitting(false);
        // 페이지 새로고침으로 최신 데이터 로드
        window.location.reload();
      } else {
        const isUpdate = !!selectedContract;
        const actionText = isUpdate ? '수정' : '등록';
        console.error(`❌ 보험계약 ${actionText} 실패:`, result.error);
        toast.error(`계약 ${actionText} 실패`, result.error || result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      const isUpdate = !!selectedContract;
      const actionText = isUpdate ? '수정' : '등록';
      console.error(`❌ 보험계약 ${actionText} 실패:`, error);
      setIsSubmitting(false);

      // 에러 토스트 알림 (즉시 표시할 수 있는 클라이언트 에러)
      toast.error(
        `계약 ${actionText} 실패`,
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      );
    }
  };

  const isFormValid =
    formData.productName &&
    formData.insuranceCompany &&
    formData.contractDate &&
    formData.effectiveDate &&
    formData.contractorName &&
    formData.insuredName;

  // 📊 계약 통계 계산
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalMonthlyPremium = contracts
    .filter(c => c.status === 'active' && c.monthlyPremium)
    .reduce((sum, c) => sum + Number(c.monthlyPremium || 0), 0);
  const totalCommission = contracts
    .filter(c => c.status === 'active' && c.agentCommission)
    .reduce((sum, c) => sum + Number(c.agentCommission || 0), 0);

  // 🗑️ 보험계약 삭제 관련 함수들
  const handleDeleteContract = (contract: InsuranceContract) => {
    setContractToDelete(contract);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append('actionType', 'delete');
      formData.append('contractId', contractToDelete.id);

      const response = await fetch('/api/insurance-contracts', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 로컬 상태에서 계약 제거
        setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));

        toast.success(
          '계약 삭제 완료',
          `${contractToDelete.productName} 계약이 삭제되었습니다.`
        );

        setShowDeleteModal(false);
        setContractToDelete(null);

        // 페이지 데이터 새로고침
        revalidator.revalidate();
      } else {
        throw new Error(result.message || '계약 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 보험계약 삭제 실패:', error);
      toast.error(
        '계약 삭제 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setContractToDelete(null);
  };

  return (
    <>
      <TabsContent value="insurance" className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {t('insuranceContractsTab.title', '보험계약')}
              </h3>
              <Button
                size="sm"
                className="flex-shrink-0"
                onClick={handleAddContract}
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t('insuranceContractsTab.contract', '계약')}{' '}
                </span>
                {t('insuranceContractsTab.register', '등록')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* 📊 통계 대시보드 */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
                📊 {t('insuranceContractsTab.contractStatus', '계약 현황')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 sm:p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('insuranceContractsTab.totalContracts', '총 계약')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {totalContracts}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t(
                          'insuranceContractsTab.activeContracts',
                          '유효 계약'
                        )}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {activeContracts}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('insuranceContractsTab.monthlyPremium', '월 보험료')}
                      </p>
                      <p className="text-sm sm:text-xl font-bold text-foreground">
                        {formatCurrency(totalMonthlyPremium)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t(
                          'insuranceContractsTab.totalCommission',
                          '총 수수료'
                        )}
                      </p>
                      <p className="text-sm sm:text-xl font-bold text-foreground">
                        {formatCurrency(totalCommission)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 📋 계약 목록 */}
            {contracts.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
                  🗂️ {t('insuranceContractsTab.contractList', '계약 목록')}
                </h4>
                {contracts.map(contract => {
                  const typeConfig = getInsuranceTypeConfig(
                    contract.insuranceType
                  );
                  return (
                    <div
                      key={contract.id}
                      className="p-4 md:p-5 bg-card border border-slate-200/60 dark:border-slate-700/60 rounded-lg hover:border-slate-300/80 dark:hover:border-slate-600/80 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="text-lg md:text-xl">
                            {typeConfig.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-semibold text-sm md:text-base truncate leading-tight">
                              {contract.productName}
                            </h5>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={cn('text-xs', typeConfig.color)}
                              >
                                {typeConfig.label}
                              </Badge>
                              {getStatusBadge(contract.status, t)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => {
                              e.stopPropagation();
                              handleEditContract(contract);
                            }}
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteContract(contract);
                            }}
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 👥 계약자/피보험자 정보 섹션 - 모바일 최적화 */}
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-medium">
                              {t('insuranceContractsTab.contractor', '계약자')}
                            </span>
                            <div className="space-y-1">
                              <span className="font-medium text-sm block">
                                {contract.contractorName}
                              </span>
                              {contract.contractorPhone && (
                                <span className="text-muted-foreground text-xs block font-mono">
                                  {contract.contractorPhone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-medium">
                              {t('insuranceContractsTab.insured', '피보험자')}
                            </span>
                            <div className="space-y-1">
                              <span className="font-medium text-sm block">
                                {contract.insuredName}
                              </span>
                              {contract.insuredPhone && (
                                <span className="text-muted-foreground text-xs block font-mono">
                                  {contract.insuredPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 📋 핵심 정보 - 모바일 우선 세로 배치 */}
                      <div className="space-y-4">
                        {/* 계약 정보 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h6 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {t(
                                'insuranceContractsTab.contractInfo',
                                '계약 정보'
                              )}
                            </h6>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t(
                                  'insuranceContractsTab.insuranceCompany',
                                  '보험사'
                                )}
                              </span>
                              <span className="font-semibold text-sm text-blue-600 dark:text-blue-400 text-right">
                                {contract.insuranceCompany}
                              </span>
                            </div>
                            {contract.policyNumber && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {t('insuranceContractsTab.policyNumber')}
                                </span>
                                <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded break-all text-right">
                                  {contract.policyNumber}
                                </span>
                              </div>
                            )}
                            {contract.insuranceCode && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {t('insuranceContractsTab.insuranceCode')}
                                </span>
                                <span className="font-medium text-sm text-slate-900 dark:text-slate-100 text-right">
                                  {contract.insuranceCode}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t('insuranceContractsTab.contractDate')}
                              </span>
                              <span className="font-medium text-sm text-slate-900 dark:text-slate-100 text-right">
                                {formatDate(contract.contractDate)}
                              </span>
                            </div>
                            {contract.paymentDueDate && (
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {t('insuranceContractsTab.paymentDueDate')}
                                </span>
                                <span className="font-semibold text-sm text-red-600 dark:text-red-400 text-right">
                                  {formatDate(contract.paymentDueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 금액 정보 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                            <h6 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {t('insuranceContractsTab.amountInfo')}
                            </h6>
                          </div>
                          <div className="space-y-2">
                            {contract.premiumAmount && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  {t('insuranceContractsTab.premiumAmount')}
                                </span>
                                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 text-right">
                                  {formatCurrency(contract.premiumAmount)}
                                </span>
                              </div>
                            )}
                            {contract.paymentCycle && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  {t('insuranceContractsTab.paymentCycle')}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="font-medium text-xs"
                                >
                                  {getPaymentCycleLabel(contract.paymentCycle)}
                                </Badge>
                              </div>
                            )}
                            {contract.agentCommission && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  {t('insuranceContractsTab.agentCommission')}
                                </span>
                                <span className="font-bold text-sm text-green-600 dark:text-green-400 text-right">
                                  {formatCurrency(contract.agentCommission)}
                                </span>
                              </div>
                            )}
                            {contract.coverageAmount && (
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  {t('insuranceContractsTab.coverageAmount')}
                                </span>
                                <span className="font-bold text-sm text-amber-600 dark:text-amber-400 text-right">
                                  {formatCurrency(contract.coverageAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 📁 첨부파일 섹션 - 모바일 최적화 */}
                      {contract.attachments &&
                        contract.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Paperclip className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                              </div>
                              <div>
                                <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {t('insuranceContractsTab.attachments')}
                                </h6>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {t('insuranceContractsTab.fileCount', {
                                    count: contract.attachments.length,
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {contract.attachments
                                .slice(0, 3)
                                .map((att, index) => (
                                  <div
                                    key={att.id}
                                    className="p-3 bg-slate-50/80 dark:bg-slate-900/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors"
                                  >
                                    <div className="flex items-start gap-2 mb-2">
                                      <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate"
                                          title={
                                            att.fileDisplayName || att.fileName
                                          }
                                        >
                                          {att.fileDisplayName || att.fileName}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleDownloadAttachment(att.id);
                                        }}
                                        title={t(
                                          'insuranceContractsTab.downloadFile',
                                          '파일 다운로드'
                                        )}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {getDocumentTypeLabel(
                                          att.documentType,
                                          t
                                        )}
                                      </span>
                                      {att.description && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                          {att.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}

                              {contract.attachments.length > 3 && (
                                <div className="flex items-center justify-center p-2.5 bg-slate-50/60 dark:bg-slate-900/15 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {t('insuranceContractsTab.moreFiles', {
                                      count: contract.attachments.length - 3,
                                    })}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-5 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                    onClick={e => {
                                      e.stopPropagation();
                                      // TODO: 전체 첨부파일 보기
                                    }}
                                  >
                                    {t('insuranceContractsTab.viewAll')}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* 🔍 상세보기 토글 및 상세 정보 */}
                      <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleContractDetails(contract.id)}
                          className="w-full flex items-center justify-between p-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg"
                        >
                          <span>
                            {t('insuranceContractsTab.contractDetails')}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {expandedContracts.has(contract.id)
                                ? t('insuranceContractsTab.collapse')
                                : t('insuranceContractsTab.viewDetails')}
                            </span>
                            {expandedContracts.has(contract.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </Button>

                        {/* 상세 정보 펼침 영역 - 모바일 최적화 */}
                        {expandedContracts.has(contract.id) && (
                          <div className="mt-4 space-y-4 p-4 bg-slate-50/60 dark:bg-slate-900/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                            {/* 📄 추가 계약 정보 */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                📄{' '}
                                {t(
                                  'insuranceContractsTab.additionalContractInfo',
                                  '추가 계약 정보'
                                )}
                              </h4>
                              <div className="space-y-2 text-sm">
                                {contract.contractNumber && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t(
                                        'insuranceContractsTab.contractNumber',
                                        '계약번호'
                                      )}
                                    </span>
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                      {contract.contractNumber}
                                    </span>
                                  </div>
                                )}
                                {contract.effectiveDate && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t(
                                        'insuranceContractsTab.effectiveDate',
                                        '효력시작일'
                                      )}
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(contract.effectiveDate)}
                                    </span>
                                  </div>
                                )}
                                {contract.expirationDate && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t(
                                        'insuranceContractsTab.expirationDate',
                                        '만료일'
                                      )}
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(contract.expirationDate)}
                                    </span>
                                  </div>
                                )}
                                {contract.paymentPeriod && (
                                  <div className="flex justify-between items-center py-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t(
                                        'insuranceContractsTab.paymentPeriod',
                                        '납입기간'
                                      )}
                                    </span>
                                    <span className="font-medium">
                                      {contract.paymentPeriod}
                                      {t('insuranceContractsTab.years', '년')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 👥 관련 인물 정보 */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                👥{' '}
                                {t(
                                  'insuranceContractsTab.relatedPersonInfo',
                                  '관련 인물 정보'
                                )}
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t('insuranceContractsTab.contractor')}
                                    </span>
                                    <div className="text-right">
                                      <span className="font-medium block">
                                        {contract.contractorName}
                                      </span>
                                      {contract.contractorSsn && (
                                        <div className="flex items-center gap-1 justify-end mt-1">
                                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {visibleSsns.has(
                                              `contractor-${contract.id}`
                                            )
                                              ? contract.contractorSsn
                                              : maskKoreanId(
                                                  contract.contractorSsn
                                                )}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                                            onClick={e => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const contractorKey = `contractor-${contract.id}`;
                                              console.log(
                                                '🖱️ 계약자 토글 클릭:',
                                                contractorKey
                                              );
                                              toggleSsnVisibility(
                                                contractorKey
                                              );
                                            }}
                                            title={`계약자 주민등록번호 ${
                                              visibleSsns.has(
                                                `contractor-${contract.id}`
                                              )
                                                ? '숨기기'
                                                : '보기'
                                            }`}
                                          >
                                            {visibleSsns.has(
                                              `contractor-${contract.id}`
                                            ) ? (
                                              <EyeOff className="h-3 w-3" />
                                            ) : (
                                              <Eye className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-start py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {t('insuranceContractsTab.insured')}
                                    </span>
                                    <div className="text-right">
                                      <span className="font-medium block">
                                        {contract.insuredName}
                                      </span>
                                      {contract.insuredSsn && (
                                        <div className="flex items-center gap-1 justify-end mt-1">
                                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {visibleSsns.has(
                                              `insured-${contract.id}`
                                            )
                                              ? contract.insuredSsn
                                              : maskKoreanId(
                                                  contract.insuredSsn
                                                )}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                                            onClick={e => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const insuredKey = `insured-${contract.id}`;
                                              console.log(
                                                '🖱️ 피보험자 토글 클릭:',
                                                insuredKey
                                              );
                                              toggleSsnVisibility(insuredKey);
                                            }}
                                            title={`피보험자 주민등록번호 ${
                                              visibleSsns.has(
                                                `insured-${contract.id}`
                                              )
                                                ? '숨기기'
                                                : '보기'
                                            }`}
                                          >
                                            {visibleSsns.has(
                                              `insured-${contract.id}`
                                            ) ? (
                                              <EyeOff className="h-3 w-3" />
                                            ) : (
                                              <Eye className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {contract.beneficiaryName && (
                                    <div className="flex justify-between items-center py-1.5">
                                      <span className="text-slate-600 dark:text-slate-400">
                                        {t(
                                          'insuranceContractsTab.beneficiary',
                                          '수익자'
                                        )}
                                      </span>
                                      <span className="font-medium">
                                        {contract.beneficiaryName}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 📝 기타 정보 */}
                            {(contract.monthlyPremium ||
                              contract.annualPremium ||
                              contract.specialClauses ||
                              contract.notes) && (
                              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                  📋{' '}
                                  {t(
                                    'insuranceContractsTab.otherInfo',
                                    '기타 정보'
                                  )}
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {contract.monthlyPremium && (
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                      <span className="text-slate-600 dark:text-slate-400">
                                        {t(
                                          'insuranceContractsTab.monthlyPremium'
                                        )}
                                      </span>
                                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(
                                          contract.monthlyPremium
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {contract.annualPremium && (
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                      <span className="text-slate-600 dark:text-slate-400">
                                        {t(
                                          'insuranceContractsTab.annualPremium',
                                          '연 보험료'
                                        )}
                                      </span>
                                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(contract.annualPremium)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {contract.specialClauses && (
                                  <div className="mt-3">
                                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium block mb-2">
                                      {t(
                                        'insuranceContractsTab.specialClauses',
                                        '특약 사항'
                                      )}
                                    </span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded">
                                      {contract.specialClauses}
                                    </p>
                                  </div>
                                )}
                                {contract.notes && (
                                  <div className="mt-3">
                                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium block mb-2">
                                      {t('insuranceContractsTab.memo', '메모')}
                                    </span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded">
                                      {contract.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(
                    'insuranceContractsTab.noContracts',
                    '보험계약이 없습니다'
                  )}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t(
                    'insuranceContractsTab.noContractsMessage',
                    '{{clientName}} 고객의 첫 번째 보험계약을 등록해보세요.',
                    { clientName }
                  )}
                </p>
                <Button onClick={handleAddContract}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t(
                    'insuranceContractsTab.registerFirstContract',
                    '첫 계약 등록하기'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🎯 보험계약 등록/수정 모달 */}
        {showAddModal && (
          <NewContractModal
            isOpen={showAddModal}
            onClose={() => {
              setSelectedContract(null);
              setShowAddModal(false);
            }}
            onConfirm={handleSubmit}
            clientName={clientName}
            isLoading={isSubmitting}
            editingContract={selectedContract}
            initialFormData={formData}
            onDownloadAttachment={handleDownloadAttachment}
          />
        )}

        {/* 🗑️ 삭제 확인 모달 */}
        {showDeleteModal && contractToDelete && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  보험계약 삭제 확인
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    다음 보험계약을 정말 삭제하시겠습니까?
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">상품명:</span>{' '}
                      {contractToDelete.productName}
                    </div>
                    <div>
                      <span className="font-medium">보험회사:</span>{' '}
                      {contractToDelete.insuranceCompany}
                    </div>
                    <div>
                      <span className="font-medium">계약자:</span>{' '}
                      {contractToDelete.contractorName}
                    </div>
                    {contractToDelete.policyNumber && (
                      <div>
                        <span className="font-medium">증권번호:</span>{' '}
                        {contractToDelete.policyNumber}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    ⚠️ <span className="font-medium">주의:</span> 삭제된 계약
                    정보는 복구할 수 없습니다. 관련된 첨부파일과 데이터도 함께
                    삭제됩니다.
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      삭제 확인
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </TabsContent>

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer toasts={toast.toasts} />
    </>
  );
}

// 🆕 보험계약 등록 모달 컴포넌트
function NewContractModal({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  isLoading = false,
  editingContract = null,
  initialFormData = null,
  onDownloadAttachment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  clientName: string;
  isLoading?: boolean;
  editingContract?: InsuranceContract | null;
  initialFormData?: ContractFormData | null;
  onDownloadAttachment?: (attachmentId: string) => void;
}) {
  // 🌐 다국어 훅 초기화
  const { t } = useHydrationSafeTranslation('clients');
  // 📋 폼 상태 관리
  const [formData, setFormData] = useState(() => {
    if (initialFormData) {
      return initialFormData;
    }
    return {
      productName: '',
      insuranceCompany: '',
      insuranceType: 'life',
      insuranceCode: '',
      contractNumber: '',
      policyNumber: '',
      contractDate: '',
      effectiveDate: '',
      expirationDate: '',
      paymentDueDate: '',
      contractorName: clientName,
      contractorSsn: '',
      contractorPhone: '',
      insuredName: clientName,
      insuredSsn: '',
      insuredPhone: '',
      beneficiaryName: '',
      premiumAmount: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentCycle: 'monthly',
      paymentPeriod: '',
      specialClauses: '',
      notes: '',
    };
  });

  // 📁 첨부파일 상태 관리
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔄 수정 모드일 때 폼 데이터 업데이트
  useEffect(() => {
    if (initialFormData && isOpen) {
      // 🔧 돈 관련 필드에서 소수점 제거
      const cleanedFormData = {
        ...initialFormData,
        premiumAmount: initialFormData.premiumAmount
          ? Math.floor(parseFloat(initialFormData.premiumAmount)).toString()
          : '',
        monthlyPremium: initialFormData.monthlyPremium
          ? Math.floor(parseFloat(initialFormData.monthlyPremium)).toString()
          : '',
        annualPremium: initialFormData.annualPremium
          ? Math.floor(parseFloat(initialFormData.annualPremium)).toString()
          : '',
        agentCommission: initialFormData.agentCommission
          ? Math.floor(parseFloat(initialFormData.agentCommission)).toString()
          : '',
        coverageAmount: initialFormData.coverageAmount
          ? Math.floor(parseFloat(initialFormData.coverageAmount)).toString()
          : '',
      };
      setFormData(cleanedFormData);
      setErrors({});
    }
  }, [initialFormData, isOpen]);

  // 🚫 자동 포커스 완전 차단
  useEffect(() => {
    if (isOpen) {
      // 모든 input, textarea, select 요소의 포커스 제거
      const timer = setTimeout(() => {
        const focusedElement = document.activeElement as HTMLElement;
        if (
          focusedElement &&
          (focusedElement.tagName === 'INPUT' ||
            focusedElement.tagName === 'TEXTAREA' ||
            focusedElement.tagName === 'SELECT')
        ) {
          focusedElement.blur();
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 🔄 수정 모드일 때 기존 첨부파일 로드
  useEffect(() => {
    if (editingContract && isOpen) {
      if (
        editingContract.attachments &&
        editingContract.attachments.length > 0
      ) {
        const existingAttachments: AttachmentData[] =
          editingContract.attachments.map(att => ({
            id: att.id,
            fileName: att.fileName,
            fileDisplayName: att.fileDisplayName,
            documentType: att.documentType,
            description: att.description || '', // 🔧 설명 필드 포함
            isExisting: true, // 기존 파일 표시
            fileUrl: '', // URL은 필요시 추후 생성
          }));
        setAttachments(existingAttachments);
        console.log(
          `📎 기존 첨부파일 ${existingAttachments.length}개 로드됨:`,
          existingAttachments
        );
      } else {
        setAttachments([]);
      }
    } else if (!editingContract && isOpen) {
      // 새 계약 생성 모드일 때는 첨부파일 초기화
      setAttachments([]);
    }
  }, [editingContract, isOpen]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      productName: '',
      insuranceCompany: '',
      insuranceType: 'life',
      insuranceCode: '',
      contractNumber: '',
      policyNumber: '',
      contractDate: '',
      effectiveDate: '',
      expirationDate: '',
      paymentDueDate: '',
      contractorName: clientName,
      contractorSsn: '',
      contractorPhone: '',
      insuredName: clientName,
      insuredSsn: '',
      insuredPhone: '',
      beneficiaryName: '',
      premiumAmount: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentCycle: 'monthly',
      paymentPeriod: '',
      specialClauses: '',
      notes: '',
    });
    setAttachments([]);
    setErrors({});
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = t(
        'newContractModal.validation.productNameRequired',
        '상품명을 입력해주세요'
      );
    }

    if (!formData.insuranceCompany.trim()) {
      newErrors.insuranceCompany = t(
        'newContractModal.validation.insuranceCompanyRequired',
        '보험회사를 입력해주세요'
      );
    }

    if (!formData.contractDate) {
      newErrors.contractDate = t(
        'newContractModal.validation.contractDateRequired',
        '계약일을 선택해주세요'
      );
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = t(
        'newContractModal.validation.effectiveDateRequired',
        '효력발생일을 선택해주세요'
      );
    }

    if (!formData.contractorName.trim()) {
      newErrors.contractorName = t(
        'newContractModal.validation.contractorNameRequired',
        '계약자명을 입력해주세요'
      );
    }

    if (!formData.insuredName.trim()) {
      newErrors.insuredName = t(
        'newContractModal.validation.insuredNameRequired',
        '피보험자명을 입력해주세요'
      );
    }

    if (!formData.premiumAmount) {
      newErrors.premiumAmount = t(
        'newContractModal.validation.premiumAmountRequired',
        '납입보험료를 입력해주세요'
      );
    }

    // 🆔 주민등록번호 유효성 검사
    if (formData.contractorSsn.trim()) {
      const contractorSsnValidation = validateKoreanId(formData.contractorSsn);
      if (!contractorSsnValidation) {
        const parseResult = parseKoreanId(formData.contractorSsn);
        newErrors.contractorSsn =
          parseResult.errorMessage ||
          t(
            'newContractModal.validation.invalidSsn',
            '유효하지 않은 주민등록번호입니다'
          );
      }
    }

    if (formData.insuredSsn.trim()) {
      const insuredSsnValidation = validateKoreanId(formData.insuredSsn);
      if (!insuredSsnValidation) {
        const parseResult = parseKoreanId(formData.insuredSsn);
        newErrors.insuredSsn =
          parseResult.errorMessage ||
          t(
            'newContractModal.validation.invalidSsn',
            '유효하지 않은 주민등록번호입니다'
          );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm({
        ...formData,
        attachments,
      });
    }
  };

  // 닫기 핸들러
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 필드 업데이트 함수
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // 📁 첨부파일 처리 함수들
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 파일 크기 체크 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      // 여기서는 모달 내부이므로 부모 컴포넌트의 toast를 사용할 수 없음
      // 간단한 에러 표시만 하거나, props로 toast 함수를 전달받아야 함
      alert('파일 크기는 10MB 이하로 제한됩니다.');
      return;
    }

    // 지원하는 파일 타입 체크
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        '지원하지 않는 파일 형식입니다. PDF, Word, Excel, 이미지 파일만 업로드 가능합니다.'
      );
      return;
    }

    // 새 첨부파일 생성 (고유한 ID 보장)
    const newAttachment: AttachmentData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      fileName: file.name,
      fileDisplayName: file.name,
      documentType: 'other_document',
      description: '',
    };

    setAttachments(prev => [...prev, newAttachment]);

    // input 초기화
    e.target.value = '';
  };

  const handleAttachmentUpdate = (
    id: string,
    field: keyof AttachmentData,
    value: string
  ) => {
    setAttachments(prev =>
      prev.map(attachment =>
        attachment.id === id ? { ...attachment, [field]: value } : attachment
      )
    );
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // 📄 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 보험 종류 옵션
  const insuranceTypes = [
    {
      value: 'life',
      label: t('insuranceContractsTab.insuranceTypes.life', '생명보험'),
    },
    {
      value: 'health',
      label: t('insuranceContractsTab.insuranceTypes.health', '건강보험'),
    },
    {
      value: 'auto',
      label: t('insuranceContractsTab.insuranceTypes.auto', '자동차보험'),
    },
    {
      value: 'property',
      label: t('insuranceContractsTab.insuranceTypes.property', '재산보험'),
    },
    {
      value: 'travel',
      label: t('insuranceContractsTab.insuranceTypes.travel', '여행보험'),
    },
    {
      value: 'accident',
      label: t('insuranceContractsTab.insuranceTypes.accident', '상해보험'),
    },
    {
      value: 'other',
      label: t('insuranceContractsTab.insuranceTypes.other', '기타'),
    },
  ];

  // 납입 방법 옵션 (insuranceContractsTab 키로 통일)
  const paymentMethods = [
    {
      value: 'monthly',
      label: t('insuranceContractsTab.paymentCycles.monthly', '월납'),
    },
    {
      value: 'quarterly',
      label: t('insuranceContractsTab.paymentCycles.quarterly', '분기납'),
    },
    {
      value: 'semi-annual',
      label: t('insuranceContractsTab.paymentCycles.semi-annual', '반년납'),
    },
    {
      value: 'annual',
      label: t('insuranceContractsTab.paymentCycles.annual', '연납'),
    },
    {
      value: 'lump-sum',
      label: t('insuranceContractsTab.paymentCycles.lump-sum', '일시납'),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0',
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {editingContract
                ? t('newContractModal.title.edit', '보험계약 수정')
                : t('newContractModal.title.add', '새 보험계약 등록')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            {editingContract
              ? t(
                  'newContractModal.description.edit',
                  '{{clientName}} 고객의 보험계약 정보를 수정하세요.',
                  { clientName }
                )
              : t(
                  'newContractModal.description.add',
                  '{{clientName}} 고객의 보험계약 정보를 등록하세요.',
                  { clientName }
                )}
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <form
            id="contract-form"
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-6"
          >
            {/* 👥 계약자/피보험자 정보 (최상단으로 이동) */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.sections.contractorInfo')}
              </h3>

              {/* 계약자 정보 */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  {t('newContractModal.labels.contractorInfo')}
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="contractorName"
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                    >
                      <span>{t('newContractModal.labels.contractorName')}</span>
                      <span className="text-destructive">
                        {t('newContractModal.labels.required')}
                      </span>
                    </Label>
                    <Input
                      id="contractorName"
                      value={formData.contractorName}
                      onChange={e =>
                        updateField('contractorName', e.target.value)
                      }
                      placeholder={t(
                        'newContractModal.placeholders.contractorName'
                      )}
                      className={`h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] ${
                        errors.contractorName ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.contractorName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.contractorName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="contractorSsn"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('newContractModal.labels.contractorSsn')}
                    </Label>
                    <Input
                      id="contractorSsn"
                      value={formData.contractorSsn}
                      onChange={e => {
                        const formatted = formatKoreanIdInput(e.target.value);
                        updateField('contractorSsn', formatted);
                      }}
                      onBlur={e => {
                        const value = e.target.value.trim();
                        if (value && !validateKoreanId(value)) {
                          const parseResult = parseKoreanId(value);
                          setErrors(prev => ({
                            ...prev,
                            contractorSsn:
                              parseResult.errorMessage ||
                              t('newContractModal.validation.invalidSsn'),
                          }));
                        } else {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.contractorSsn;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder={t(
                        'newContractModal.placeholders.contractorSsn'
                      )}
                      maxLength={14}
                      className={`h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] ${
                        errors.contractorSsn
                          ? 'border-destructive'
                          : formData.contractorSsn &&
                              validateKoreanId(formData.contractorSsn)
                            ? 'border-green-500'
                            : ''
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      {errors.contractorSsn && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.contractorSsn}
                        </p>
                      )}
                      {!errors.contractorSsn &&
                        formData.contractorSsn &&
                        validateKoreanId(formData.contractorSsn) && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('newContractModal.validation.validSsn')}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contractorPhone"
                      className="text-sm font-medium"
                    >
                      {t('newContractModal.labels.contractorPhone')}
                    </Label>
                    <Input
                      id="contractorPhone"
                      value={formData.contractorPhone}
                      onChange={e =>
                        updateField('contractorPhone', e.target.value)
                      }
                      placeholder={t(
                        'newContractModal.placeholders.contractorPhone'
                      )}
                      className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* 피보험자 정보 */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  {t('newContractModal.labels.insuredInfo')}
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="insuredName"
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                    >
                      <span>{t('newContractModal.labels.insuredName')}</span>
                      <span className="text-destructive">
                        {t('newContractModal.labels.required')}
                      </span>
                    </Label>
                    <Input
                      id="insuredName"
                      value={formData.insuredName}
                      onChange={e => updateField('insuredName', e.target.value)}
                      placeholder={t(
                        'newContractModal.placeholders.insuredName'
                      )}
                      className={`h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] ${
                        errors.insuredName ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.insuredName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.insuredName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="insuredSsn"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('newContractModal.labels.insuredSsn')}
                    </Label>
                    <Input
                      id="insuredSsn"
                      value={formData.insuredSsn}
                      onChange={e => {
                        const formatted = formatKoreanIdInput(e.target.value);
                        updateField('insuredSsn', formatted);
                      }}
                      onBlur={e => {
                        const value = e.target.value.trim();
                        if (value && !validateKoreanId(value)) {
                          const parseResult = parseKoreanId(value);
                          setErrors(prev => ({
                            ...prev,
                            insuredSsn:
                              parseResult.errorMessage ||
                              t('newContractModal.validation.invalidSsn'),
                          }));
                        } else {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.insuredSsn;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder={t(
                        'newContractModal.placeholders.insuredSsn'
                      )}
                      maxLength={14}
                      className={`h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] ${
                        errors.insuredSsn
                          ? 'border-destructive'
                          : formData.insuredSsn &&
                              validateKoreanId(formData.insuredSsn)
                            ? 'border-green-500'
                            : ''
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      {errors.insuredSsn && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.insuredSsn}
                        </p>
                      )}
                      {!errors.insuredSsn &&
                        formData.insuredSsn &&
                        validateKoreanId(formData.insuredSsn) && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('newContractModal.validation.validSsn')}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="insuredPhone"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('newContractModal.labels.insuredPhone')}
                    </Label>
                    <Input
                      id="insuredPhone"
                      value={formData.insuredPhone}
                      onChange={e =>
                        updateField('insuredPhone', e.target.value)
                      }
                      placeholder={t(
                        'newContractModal.placeholders.insuredPhone'
                      )}
                      className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 📋 기본 계약 정보 */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.sections.basicInfo')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="productName"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.productName')}</span>
                    <span className="text-destructive">
                      {t('newContractModal.labels.required')}
                    </span>
                  </Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={e => updateField('productName', e.target.value)}
                    placeholder={t('newContractModal.placeholders.productName')}
                    className={`w-full ${
                      errors.productName ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.productName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.productName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="insuranceCompany"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.insuranceCompany')}</span>
                    <span className="text-destructive">
                      {t('newContractModal.labels.required')}
                    </span>
                  </Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={e =>
                      updateField('insuranceCompany', e.target.value)
                    }
                    placeholder={t(
                      'newContractModal.placeholders.insuranceCompany'
                    )}
                    className={`w-full ${
                      errors.insuranceCompany ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.insuranceCompany && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.insuranceCompany}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="insuranceType"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.insuranceType')}
                  </Label>
                  <Select
                    value={formData.insuranceType}
                    onValueChange={value => updateField('insuranceType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t(
                          'newContractModal.placeholders.selectInsuranceType'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="insuranceCode"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.insuranceCode')}
                  </Label>
                  <Input
                    id="insuranceCode"
                    value={formData.insuranceCode}
                    onChange={e => updateField('insuranceCode', e.target.value)}
                    placeholder={t(
                      'newContractModal.placeholders.insuranceCode'
                    )}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contractNumber"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.contractNumber')}
                  </Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={e =>
                      updateField('contractNumber', e.target.value)
                    }
                    placeholder={t(
                      'newContractModal.placeholders.contractNumber'
                    )}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-medium">
                    {t('newContractModal.labels.policyNumber')}
                  </Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={e => updateField('policyNumber', e.target.value)}
                    placeholder={t(
                      'newContractModal.placeholders.policyNumber'
                    )}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 📅 계약 일정 */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.sections.schedule')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contractDate"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.contractDate')}</span>
                    <span className="text-destructive">
                      {t('newContractModal.labels.required')}
                    </span>
                  </Label>
                  <Input
                    id="contractDate"
                    type="date"
                    value={formData.contractDate}
                    onChange={e => updateField('contractDate', e.target.value)}
                    className={`w-full ${
                      errors.contractDate ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.contractDate && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.contractDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="effectiveDate"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.effectiveDate')}</span>
                    <span className="text-destructive">
                      {t('newContractModal.labels.required')}
                    </span>
                  </Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={e => updateField('effectiveDate', e.target.value)}
                    className={`w-full ${
                      errors.effectiveDate ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.effectiveDate && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.effectiveDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="expirationDate"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.expirationDate')}
                  </Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={e =>
                      updateField('expirationDate', e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="paymentDueDate"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.paymentDueDate')}
                  </Label>
                  <Input
                    id="paymentDueDate"
                    type="date"
                    value={formData.paymentDueDate}
                    onChange={e =>
                      updateField('paymentDueDate', e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 💰 금액 정보 */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.sections.amount')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="premiumAmount"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.premiumAmount')}</span>
                    <span className="text-destructive">
                      {t('newContractModal.labels.required')}
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="premiumAmount"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.premiumAmount}
                      onChange={e =>
                        updateField('premiumAmount', e.target.value)
                      }
                      onInput={e => {
                        // 소수점 입력 방지
                        const target = e.target as HTMLInputElement;
                        const value = target.value;
                        if (value.includes('.')) {
                          target.value = value.split('.')[0];
                          updateField('premiumAmount', target.value);
                        }
                      }}
                      placeholder={t('newContractModal.placeholders.amount')}
                      className={`w-full pr-8 ${
                        errors.premiumAmount ? 'border-destructive' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {t('newContractModal.labels.currency')}
                    </span>
                  </div>
                  {errors.premiumAmount && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.premiumAmount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="monthlyPremium"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>{t('newContractModal.labels.monthlyPremium')}</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="monthlyPremium"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.monthlyPremium}
                      onChange={e =>
                        updateField('monthlyPremium', e.target.value)
                      }
                      onInput={e => {
                        // 소수점 입력 방지
                        const target = e.target as HTMLInputElement;
                        const value = target.value;
                        if (value.includes('.')) {
                          target.value = value.split('.')[0];
                          updateField('monthlyPremium', target.value);
                        }
                      }}
                      placeholder={t('newContractModal.placeholders.amount')}
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {t('newContractModal.labels.currency')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="agentCommission"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.agentCommission')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="agentCommission"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.agentCommission}
                      onChange={e =>
                        updateField('agentCommission', e.target.value)
                      }
                      onInput={e => {
                        // 소수점 입력 방지
                        const target = e.target as HTMLInputElement;
                        const value = target.value;
                        if (value.includes('.')) {
                          target.value = value.split('.')[0];
                          updateField('agentCommission', target.value);
                        }
                      }}
                      placeholder={t('newContractModal.placeholders.amount')}
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {t('newContractModal.labels.currency')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="coverageAmount"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.coverageAmount')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="coverageAmount"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.coverageAmount}
                      onChange={e =>
                        updateField('coverageAmount', e.target.value)
                      }
                      onInput={e => {
                        // 소수점 입력 방지
                        const target = e.target as HTMLInputElement;
                        const value = target.value;
                        if (value.includes('.')) {
                          target.value = value.split('.')[0];
                          updateField('coverageAmount', target.value);
                        }
                      }}
                      placeholder={t('newContractModal.placeholders.amount')}
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {t('newContractModal.labels.currency')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentCycle" className="text-sm font-medium">
                    {t('newContractModal.labels.paymentCycle')}
                  </Label>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={value => updateField('paymentCycle', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t(
                          'newContractModal.placeholders.selectPaymentCycle'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="paymentPeriod"
                    className="text-sm font-medium"
                  >
                    {t('newContractModal.labels.paymentPeriod')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="paymentPeriod"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.paymentPeriod}
                      onChange={e =>
                        updateField('paymentPeriod', e.target.value)
                      }
                      placeholder={t('newContractModal.placeholders.amount')}
                      className={`w-full pr-8 ${
                        errors.paymentPeriod ? 'border-destructive' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {t('newContractModal.labels.years')}
                    </span>
                  </div>
                  {errors.paymentPeriod && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.paymentPeriod}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 📝 추가 정보 */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.sections.additional')}
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="beneficiaryName"
                  className="text-sm font-medium"
                >
                  {t('newContractModal.labels.beneficiaryName')}
                </Label>
                <Input
                  id="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={e => updateField('beneficiaryName', e.target.value)}
                  placeholder={t(
                    'newContractModal.placeholders.beneficiaryName'
                  )}
                  className="w-full"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-xs sm:text-sm font-medium"
                >
                  {t('newContractModal.labels.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder={t('newContractModal.placeholders.notes')}
                  className="text-xs sm:text-sm min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* 📁 첨부파일 섹션 */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('newContractModal.labels.attachments')} ({attachments.length}
                )
              </h3>

              {/* 파일 업로드 */}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
                <div className="text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t('newContractModal.instructions.fileUpload')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('newContractModal.instructions.fileTypes')}
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 첨부파일 목록 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    {t('newContractModal.labels.uploadedFiles')}
                  </h4>
                  <div className="space-y-2">
                    {attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className={`p-3 border rounded-lg space-y-2 ${
                          attachment.isExisting
                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                            : 'bg-muted/50'
                        }`}
                      >
                        {/* 파일 기본 정보 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              {attachment.isExisting && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                  {t('newContractModal.labels.existingFile')}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {attachment.fileName}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {attachment.file
                                    ? formatFileSize(attachment.file.size)
                                    : t('newContractModal.labels.uploaded')}
                                </p>
                                {/* 🔧 설명을 옆으로 배치 */}
                                {attachment.description && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400">
                                      📝
                                    </span>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      {attachment.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {attachment.isExisting && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                onClick={() =>
                                  onDownloadAttachment?.(attachment.id)
                                }
                                title={t(
                                  'newContractModal.buttons.downloadFile'
                                )}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleAttachmentRemove(attachment.id)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* 📝 첨부파일 메타데이터 - 개선된 레이아웃 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              {t('newContractModal.labels.displayName')}
                            </Label>
                            <Input
                              value={attachment.fileDisplayName}
                              onChange={e =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'fileDisplayName',
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                'newContractModal.placeholders.fileDisplayName'
                              )}
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              {t('newContractModal.labels.documentType')}
                            </Label>
                            <Select
                              value={attachment.documentType}
                              onValueChange={value =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'documentType',
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className="h-8 text-sm"
                                onPointerDown={e => {
                                  // 모바일에서 더 강한 포커스 유지
                                  if (window.innerWidth < 768) {
                                    e.currentTarget.focus();
                                  }
                                }}
                              >
                                <SelectValue
                                  placeholder={t(
                                    'newContractModal.placeholders.selectDocumentType'
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent
                                className="z-[200]"
                                side="bottom"
                                align="start"
                                sideOffset={8}
                                alignOffset={0}
                                avoidCollisions={false}
                                sticky="always"
                              >
                                {DOCUMENT_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {getDocumentTypeLabel(type, t)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-medium">
                              {t('newContractModal.labels.description')}
                            </Label>
                            <Input
                              value={attachment.description || ''}
                              onChange={e =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                'newContractModal.placeholders.fileDescription'
                              )}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 📌 안내 메시지 */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">
                    {t('newContractModal.completion.title')}{' '}
                  </span>
                  {t('newContractModal.instructions.completion')}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 푸터 - 고정 */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-3 p-2 sm:p-6 border-t border-border/30">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
            >
              {t('newContractModal.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              form="contract-form"
              disabled={isLoading}
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {editingContract
                    ? t('newContractModal.buttons.updating')
                    : t('newContractModal.buttons.registering')}
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  {editingContract
                    ? t('newContractModal.buttons.update')
                    : t('newContractModal.buttons.register')}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
