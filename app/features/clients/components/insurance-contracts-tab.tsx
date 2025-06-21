import { useState, useEffect, useCallback, useRef } from 'react';
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
import { formatCurrencyCompact } from '~/lib/utils/currency';
import { cn } from '~/lib/utils';

// 🆔 주민등록번호 유틸리티 import
import {
  parseKoreanId,
  maskKoreanId,
  validateKoreanId,
  formatKoreanIdInput,
} from '~/lib/utils/korean-id-utils';

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
  { value: 'contract', label: '계약서' },
  { value: 'application', label: '청약서' },
  { value: 'identification', label: '신분증' },
  { value: 'medical_report', label: '의료진단서' },
  { value: 'financial_statement', label: '재정증명서' },
  { value: 'other_document', label: '기타 문서' },
];

// 🏷️ 문서 타입 라벨 변환 함수
const getDocumentTypeLabel = (documentType: string) => {
  const type = DOCUMENT_TYPES.find(t => t.value === documentType);
  return type?.label || '기타 문서';
};

// 🎨 보험 유형별 설정
const getInsuranceTypeConfig = (type: string) => {
  const configs = {
    auto: {
      label: '자동차보험',
      icon: '🚗',
      color: 'bg-blue-100 text-blue-800',
    },
    life: { label: '생명보험', icon: '❤️', color: 'bg-red-100 text-red-800' },
    health: {
      label: '건강보험',
      icon: '🏥',
      color: 'bg-green-100 text-green-800',
    },
    home: {
      label: '주택보험',
      icon: '🏠',
      color: 'bg-orange-100 text-orange-800',
    },
    business: {
      label: '사업자보험',
      icon: '💼',
      color: 'bg-purple-100 text-purple-800',
    },
  };
  return (
    configs[type as keyof typeof configs] || {
      label: type,
      icon: '📋',
      color: 'bg-gray-100 text-gray-800',
    }
  );
};

// 📊 계약 상태별 배지
const getStatusBadge = (status: string) => {
  const statusConfigs = {
    draft: { label: '초안', variant: 'outline' as const },
    active: { label: '유효', variant: 'default' as const },
    cancelled: { label: '해지', variant: 'destructive' as const },
    expired: { label: '만료', variant: 'secondary' as const },
    suspended: { label: '정지', variant: 'secondary' as const },
  };
  const config =
    statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// 💰 금액 포맷팅 (한국 원화)
const formatCurrency = (amount?: number | string) => {
  if (!amount || amount === 0) return '-';
  return formatCurrencyCompact(amount);
};

// 📅 날짜 포맷팅
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  } catch {
    return dateStr;
  }
};

// 💰 납입주기 한국어 변환 함수
const getPaymentCycleLabel = (cycle?: string) => {
  const cycleMap: { [key: string]: string } = {
    monthly: '월납',
    quarterly: '분기납',
    'semi-annual': '반년납',
    annual: '연납',
    'lump-sum': '일시납',
  };
  return cycle ? cycleMap[cycle] || cycle : '';
};

// 🏢 보험회사 목록
const INSURANCE_COMPANIES = [
  '삼성생명',
  '한화생명',
  '교보생명',
  '신한생명',
  '미래에셋생명',
  '삼성화재',
  '현대해상',
  'DB손해보험',
  '메리츠화재',
  'KB손해보험',
  '롯데손해보험',
  '한화손해보험',
  'AIG손해보험',
  '처브라이프손해보험',
  '기타',
];

// 💳 납입방법 목록
const PAYMENT_METHODS = [
  '월납',
  '분기납',
  '반기납',
  '연납',
  '일시납',
  '자동이체',
  '계좌이체',
  '기타',
];

export function InsuranceContractsTab({
  clientId = 'test-client-id',
  clientName = '고객',
  agentId = 'test-agent-id',
  initialContracts = [],
  shouldOpenModal = false, // 🏢 파이프라인에서 계약 전환 시 모달 자동 열기
}: InsuranceContractsTabProps) {
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

  // 🏢 파이프라인에서 계약 전환으로 온 경우 모달 자동 열기
  useEffect(() => {
    if (shouldOpenModal) {
      setShowAddModal(true);
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
    console.log('📋 보험계약 저장 시작:', formData);
    setIsSubmitting(true);

    try {
      // FormData 생성
      const submitData = new FormData();
      
      // intent 설정 (고객 상세 페이지의 action 함수에서 처리)
      submitData.append('intent', 'createInsuranceContract');
      submitData.append('clientId', clientId || '');
      submitData.append('agentId', agentId || '');

      // 계약 데이터 추가
      const contractData = {
        productName: formData.productName || '',
        insuranceCompany: formData.insuranceCompany || '',
        insuranceType: formData.insuranceType || 'life',
        insuranceCode: formData.insuranceCode || '',
        contractNumber: formData.contractNumber || '',
        policyNumber: formData.policyNumber || '',
        contractDate: formData.contractDate || '',
        effectiveDate: formData.effectiveDate || '',
        expirationDate: formData.expirationDate || '',
        paymentDueDate: formData.paymentDueDate || '',
        contractorName: formData.contractorName || '',
        contractorSsn: formData.contractorSsn || '',
        contractorPhone: formData.contractorPhone || '',
        insuredName: formData.insuredName || '',
        insuredSsn: formData.insuredSsn || '',
        insuredPhone: formData.insuredPhone || '',
        beneficiaryName: formData.beneficiaryName || '',
        premiumAmount: formData.premiumAmount || '',
        monthlyPremium: formData.monthlyPremium || '',
        annualPremium: formData.annualPremium || '',
        coverageAmount: formData.coverageAmount || '',
        agentCommission: formData.agentCommission || '',
        paymentCycle: formData.paymentCycle || 'monthly',
        paymentPeriod: formData.paymentPeriod || '',
        specialClauses: formData.specialClauses || '',
        notes: formData.notes || '',
      };

      // 모든 계약 데이터를 FormData에 추가
      Object.entries(contractData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value.toString());
        }
      });

      // 첨부파일 처리
      if (formData.attachments && Array.isArray(formData.attachments)) {
        console.log(`📎 첨부파일 ${formData.attachments.length}개 처리 중...`);
        
        let newFileIndex = 0;
        formData.attachments.forEach((att: any, originalIndex: number) => {
          if (att.file && att.file instanceof File) {
            // 새 첨부파일인 경우
            submitData.append(`attachment_file_${newFileIndex}`, att.file);
            submitData.append(`attachment_fileName_${newFileIndex}`, att.fileName || att.file.name);
            submitData.append(`attachment_displayName_${newFileIndex}`, att.fileDisplayName || att.file.name);
            submitData.append(`attachment_documentType_${newFileIndex}`, att.documentType || 'other_document');
            if (att.description) {
              submitData.append(`attachment_description_${newFileIndex}`, att.description);
            }
            console.log(`📎 새 첨부파일 ${newFileIndex}: ${att.fileName || att.file.name}`);
            newFileIndex++;
          }
        });
      }

      console.log('📋 보험계약 저장 중... (React Router Form 사용)');

      // React Router Form을 사용하여 제출
      const result = await fetcher.submit(submitData, { 
        method: 'post',
        encType: 'multipart/form-data'
      });

      console.log('✅ 보험계약 등록 성공');
      toast.success('계약 등록 완료', '보험계약이 성공적으로 등록되었습니다.');
      setShowAddModal(false);
      setSelectedContract(null);
      setIsSubmitting(false);

      // 페이지 데이터 새로고침
      revalidator.revalidate();

    } catch (error) {
      console.error('❌ 보험계약 등록 실패:', error);
      setIsSubmitting(false);

      toast.error(
        '계약 등록 실패',
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
                보험계약
              </h3>
              <Button
                size="sm"
                className="flex-shrink-0"
                onClick={handleAddContract}
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">계약 </span>등록
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* 📊 통계 대시보드 */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
                📊 계약 현황
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 sm:p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        총 계약
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
                        유효 계약
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
                        월 보험료
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
                        총 수수료
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
                  🗂️ 계약 목록
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
                              {getStatusBadge(contract.status)}
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
                              계약자
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
                              피보험자
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
                              계약 정보
                            </h6>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                보험사
                              </span>
                              <span className="font-semibold text-sm text-blue-600 dark:text-blue-400 text-right">
                                {contract.insuranceCompany}
                              </span>
                            </div>
                            {contract.policyNumber && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  증권번호
                                </span>
                                <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded break-all text-right">
                                  {contract.policyNumber}
                                </span>
                              </div>
                            )}
                            {contract.insuranceCode && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  보종코드
                                </span>
                                <span className="font-medium text-sm text-slate-900 dark:text-slate-100 text-right">
                                  {contract.insuranceCode}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                계약일
                              </span>
                              <span className="font-medium text-sm text-slate-900 dark:text-slate-100 text-right">
                                {formatDate(contract.contractDate)}
                              </span>
                            </div>
                            {contract.paymentDueDate && (
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  납기일
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
                              금액 정보
                            </h6>
                          </div>
                          <div className="space-y-2">
                            {contract.premiumAmount && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  납입보험료
                                </span>
                                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 text-right">
                                  {formatCurrency(contract.premiumAmount)}
                                </span>
                              </div>
                            )}
                            {contract.paymentCycle && (
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  납입주기
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
                                  수수료
                                </span>
                                <span className="font-bold text-sm text-green-600 dark:text-green-400 text-right">
                                  {formatCurrency(contract.agentCommission)}
                                </span>
                              </div>
                            )}
                            {contract.coverageAmount && (
                              <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs text-slate-700 dark:text-slate-300">
                                  보장금액
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
                                  첨부파일
                                </h6>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {contract.attachments.length}개 파일
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
                                        title="파일 다운로드"
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {getDocumentTypeLabel(att.documentType)}
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
                                    +{contract.attachments.length - 3}개 파일 더
                                    있음
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
                                    모두 보기
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
                          <span>계약 상세 정보</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {expandedContracts.has(contract.id)
                                ? '접기'
                                : '상세보기'}
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
                                📄 추가 계약 정보
                              </h4>
                              <div className="space-y-2 text-sm">
                                {contract.contractNumber && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      계약번호
                                    </span>
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                      {contract.contractNumber}
                                    </span>
                                  </div>
                                )}
                                {contract.effectiveDate && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      효력시작일
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(contract.effectiveDate)}
                                    </span>
                                  </div>
                                )}
                                {contract.expirationDate && (
                                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      만료일
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(contract.expirationDate)}
                                    </span>
                                  </div>
                                )}
                                {contract.paymentPeriod && (
                                  <div className="flex justify-between items-center py-1.5">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      납입기간
                                    </span>
                                    <span className="font-medium">
                                      {contract.paymentPeriod}년
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 👥 관련 인물 정보 */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                👥 관련 인물 정보
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      계약자
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
                                      피보험자
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
                                        수익자
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
                                  📋 기타 정보
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {contract.monthlyPremium && (
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-700/50">
                                      <span className="text-slate-600 dark:text-slate-400">
                                        월 보험료
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
                                        연 보험료
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
                                      특약 사항
                                    </span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded">
                                      {contract.specialClauses}
                                    </p>
                                  </div>
                                )}
                                {contract.notes && (
                                  <div className="mt-3">
                                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium block mb-2">
                                      메모
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
                  보험계약이 없습니다
                </h3>
                <p className="text-muted-foreground mb-4">
                  {clientName} 고객의 첫 번째 보험계약을 등록해보세요.
                </p>
                <Button onClick={handleAddContract}>
                  <Plus className="mr-2 h-4 w-4" />첫 계약 등록하기
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
      newErrors.productName = '상품명을 입력해주세요';
    }

    if (!formData.insuranceCompany.trim()) {
      newErrors.insuranceCompany = '보험회사를 입력해주세요';
    }

    if (!formData.contractDate) {
      newErrors.contractDate = '계약일을 선택해주세요';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = '효력발생일을 선택해주세요';
    }

    if (!formData.contractorName.trim()) {
      newErrors.contractorName = '계약자명을 입력해주세요';
    }

    if (!formData.insuredName.trim()) {
      newErrors.insuredName = '피보험자명을 입력해주세요';
    }

    if (!formData.premiumAmount) {
      newErrors.premiumAmount = '납입보험료를 입력해주세요';
    }

    // 🆔 주민등록번호 유효성 검사
    if (formData.contractorSsn.trim()) {
      const contractorSsnValidation = validateKoreanId(formData.contractorSsn);
      if (!contractorSsnValidation) {
        const parseResult = parseKoreanId(formData.contractorSsn);
        newErrors.contractorSsn =
          parseResult.errorMessage || '유효하지 않은 주민등록번호입니다';
      }
    }

    if (formData.insuredSsn.trim()) {
      const insuredSsnValidation = validateKoreanId(formData.insuredSsn);
      if (!insuredSsnValidation) {
        const parseResult = parseKoreanId(formData.insuredSsn);
        newErrors.insuredSsn =
          parseResult.errorMessage || '유효하지 않은 주민등록번호입니다';
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
    { value: 'life', label: '생명보험' },
    { value: 'health', label: '건강보험' },
    { value: 'auto', label: '자동차보험' },
    { value: 'property', label: '재산보험' },
    { value: 'travel', label: '여행보험' },
    { value: 'accident', label: '상해보험' },
    { value: 'other', label: '기타' },
  ];

  // 납입 방법 옵션
  const paymentMethods = [
    { value: 'monthly', label: '월납' },
    { value: 'quarterly', label: '분기납' },
    { value: 'semi-annual', label: '반년납' },
    { value: 'annual', label: '연납' },
    { value: 'lump-sum', label: '일시납' },
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
              {editingContract ? '보험계약 수정' : '새 보험계약 등록'}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            고객의 보험계약 정보를 {editingContract ? '수정' : '등록'}하세요.
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
                계약자/피보험자 정보
              </h3>

              {/* 계약자 정보 */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  계약자 정보
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="contractorName"
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                    >
                      <span>계약자명</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contractorName"
                      value={formData.contractorName}
                      onChange={e =>
                        updateField('contractorName', e.target.value)
                      }
                      placeholder="홍길동"
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
                      계약자 주민번호
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
                              '유효하지 않은 주민등록번호입니다',
                          }));
                        } else {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.contractorSsn;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="000000-0000000"
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
                            유효한 주민등록번호입니다
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contractorPhone"
                      className="text-sm font-medium"
                    >
                      계약자 연락처
                    </Label>
                    <Input
                      id="contractorPhone"
                      value={formData.contractorPhone}
                      onChange={e =>
                        updateField('contractorPhone', e.target.value)
                      }
                      placeholder="010-0000-0000"
                      className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* 피보험자 정보 */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                  피보험자 정보
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="insuredName"
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium"
                    >
                      <span>피보험자명</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="insuredName"
                      value={formData.insuredName}
                      onChange={e => updateField('insuredName', e.target.value)}
                      placeholder="홍길동"
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
                      피보험자 주민번호
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
                              '유효하지 않은 주민등록번호입니다',
                          }));
                        } else {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.insuredSsn;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="000000-0000000"
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
                            유효한 주민등록번호입니다
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="insuredPhone"
                      className="text-xs sm:text-sm font-medium"
                    >
                      피보험자 연락처
                    </Label>
                    <Input
                      id="insuredPhone"
                      value={formData.insuredPhone}
                      onChange={e =>
                        updateField('insuredPhone', e.target.value)
                      }
                      placeholder="010-0000-0000"
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
                기본 계약 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="productName"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>상품명</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={e => updateField('productName', e.target.value)}
                    placeholder="예: 무배당 종합보험"
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
                    <span>보험회사</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={e =>
                      updateField('insuranceCompany', e.target.value)
                    }
                    placeholder="예: 삼성화재, 현대해상"
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
                    보험 종류
                  </Label>
                  <Select
                    value={formData.insuranceType}
                    onValueChange={value => updateField('insuranceType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="보험 종류 선택" />
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
                    보종코드
                  </Label>
                  <Input
                    id="insuranceCode"
                    value={formData.insuranceCode}
                    onChange={e => updateField('insuranceCode', e.target.value)}
                    placeholder="예: 01-01-01"
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
                    계약번호
                  </Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={e =>
                      updateField('contractNumber', e.target.value)
                    }
                    placeholder="예: CT2024001234"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-medium">
                    증권번호
                  </Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={e => updateField('policyNumber', e.target.value)}
                    placeholder="예: PL2024001234"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 📅 계약 일정 */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                계약 일정
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contractDate"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>계약일</span>
                    <span className="text-destructive">*</span>
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
                    <span>효력발생일</span>
                    <span className="text-destructive">*</span>
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
                    만료일
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
                    납기일
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
                금액 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="premiumAmount"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>납입보험료</span>
                    <span className="text-destructive">*</span>
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
                      placeholder="0"
                      className={`w-full pr-8 ${
                        errors.premiumAmount ? 'border-destructive' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
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
                    <span>월 보험료</span>
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
                      placeholder="0"
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
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
                    수수료 (매출)
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
                      placeholder="0"
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="coverageAmount"
                    className="text-sm font-medium"
                  >
                    보장금액
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
                      placeholder="0"
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentCycle" className="text-sm font-medium">
                    납입주기 (납입방법)
                  </Label>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={value => updateField('paymentCycle', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="납입주기 선택" />
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
                    납입기간
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
                      placeholder="0"
                      className={`w-full pr-8 ${
                        errors.paymentPeriod ? 'border-destructive' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      년
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
                추가 정보
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="beneficiaryName"
                  className="text-sm font-medium"
                >
                  수익자명 (선택사항)
                </Label>
                <Input
                  id="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={e => updateField('beneficiaryName', e.target.value)}
                  placeholder="수익자가 계약자/피보험자와 다른 경우에만 입력"
                  className="w-full"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-xs sm:text-sm font-medium"
                >
                  메모 (선택사항)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder="계약 관련 특이사항, 고객 요청사항 등을 기록하세요..."
                  className="text-xs sm:text-sm min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* 📁 첨부파일 섹션 */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                첨부파일 ({attachments.length}개)
              </h3>

              {/* 파일 업로드 */}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
                <div className="text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Word, Excel, 이미지 파일 (최대 10MB)
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
                  <h4 className="font-medium text-sm">업로드된 파일</h4>
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
                                  기존 파일
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
                                    : '업로드됨'}
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
                                title="파일 다운로드"
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
                              표시명
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
                              placeholder="파일 표시명"
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              문서 종류
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
                                <SelectValue placeholder="문서 종류 선택" />
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
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-medium">
                              설명 (선택사항)
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
                              placeholder="파일에 대한 설명을 입력하세요..."
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
                  <span className="font-medium">등록 완료 시:</span> 파이프라인
                  업데이트, 수수료 반영, 서류 관리 제공
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
              취소
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
                  등록 중...
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  {editingContract ? '계약 수정' : '계약 등록'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
