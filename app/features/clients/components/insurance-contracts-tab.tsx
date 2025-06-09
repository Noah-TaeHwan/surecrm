import { useState, useEffect } from 'react';
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
  Eye,
  Download,
  Users,
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
  paymentMethod: string;
  paymentCycle: string; // 🆕 납입주기
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

// 📂 문서 타입 옵션
const DOCUMENT_TYPES = [
  { value: 'contract', label: '계약서' },
  { value: 'policy', label: '증권' },
  { value: 'application', label: '청약서' },
  { value: 'identification', label: '신분증' },
  { value: 'medical_report', label: '건강검진서' },
  { value: 'vehicle_registration', label: '자동차등록증' },
  { value: 'other_document', label: '기타 서류' },
];

// 🏷️ 문서 타입 라벨 변환 함수
const getDocumentTypeLabel = (documentType: string) => {
  const type = DOCUMENT_TYPES.find((t) => t.value === documentType);
  return type ? type.label : '기타 서류';
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

  // 🏢 파이프라인에서 계약 전환으로 온 경우 모달 자동 열기
  useEffect(() => {
    if (shouldOpenModal) {
      setShowAddModal(true);
    }
  }, [shouldOpenModal]);

  // 🔄 initialContracts 변경 시 로컬 상태 동기화
  useEffect(() => {
    setContracts(initialContracts);
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
          setContracts((prev) => {
            const existingIds = prev.map((contract) => contract.id);
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
    paymentMethod: '월납',
    paymentCycle: '',
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
      paymentMethod: '월납',
      paymentCycle: '',
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
    const completedFields = requiredFields.filter((field) =>
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
      paymentMethod: contract.paymentMethod || '월납',
      paymentCycle: contract.paymentCycle || '',
      paymentPeriod: contract.paymentPeriod?.toString() || '',
      specialClauses: contract.specialClauses || '',
      notes: contract.notes || '',
    });
    setShowAddModal(true);
  };

  const handleFormChange = (field: keyof ContractFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 실시간 검증
    validateField(field, value);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newAttachments = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  // 🔍 상세보기 토글 함수
  const toggleContractDetails = (contractId: string) => {
    setExpandedContracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
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
            // 기존 첨부파일인 경우 - 서버에서 별도 처리 필요
            console.log(
              `📎 [다수파일처리] 기존 첨부파일 ${originalIndex}: ${att.fileName} (유지)`
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
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const totalMonthlyPremium = contracts
    .filter((c) => c.status === 'active' && c.monthlyPremium)
    .reduce((sum, c) => sum + Number(c.monthlyPremium || 0), 0);
  const totalCommission = contracts
    .filter((c) => c.status === 'active' && c.agentCommission)
    .reduce((sum, c) => sum + Number(c.agentCommission || 0), 0);

  return (
    <>
      <TabsContent value="insurance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-lg">📋</span>
              보험계약 관리
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {clientName} 고객의 보험계약 현황을 관리하고 관련 서류를 첨부할 수
              있습니다.
            </p>
            <div className="flex justify-end pb-4 border-b">
              <Button
                onClick={handleAddContract}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />새 계약 등록
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 📊 통계 대시보드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-card rounded-lg border  hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">총 계약</p>
                    <p className="text-xl font-bold text-foreground">
                      {totalContracts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">유효 계약</p>
                    <p className="text-xl font-bold text-foreground">
                      {activeContracts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-card rounded-lg border  hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">월 보험료</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(totalMonthlyPremium)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">총 수수료</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(totalCommission)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 📋 계약 목록 */}
            {contracts.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  🗂️ 계약 목록
                </h4>
                {contracts.map((contract) => {
                  const typeConfig = getInsuranceTypeConfig(
                    contract.insuranceType
                  );
                  return (
                    <div
                      key={contract.id}
                      className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeConfig.icon}</span>
                          <div>
                            <h5 className="font-semibold">
                              {contract.productName}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={typeConfig.color}
                              >
                                {typeConfig.label}
                              </Badge>
                              {getStatusBadge(contract.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditContract(contract);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 🔄 계약자/피보험자 정보 섹션 추가 */}
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground font-medium">
                              계약자:
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-medium">
                                {contract.contractorName}
                              </span>
                              {contract.contractorPhone && (
                                <span className="text-muted-foreground text-xs">
                                  {contract.contractorPhone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground font-medium">
                              피보험자:
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-medium">
                                {contract.insuredName}
                              </span>
                              {contract.insuredPhone && (
                                <span className="text-muted-foreground text-xs">
                                  {contract.insuredPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground">
                              보험사:
                            </span>{' '}
                            {contract.insuranceCompany}
                          </div>
                          {contract.contractNumber && (
                            <div>
                              <span className="text-muted-foreground">
                                계약번호:
                              </span>{' '}
                              {contract.contractNumber}
                            </div>
                          )}
                          {contract.policyNumber && (
                            <div>
                              <span className="text-muted-foreground">
                                증권번호:
                              </span>{' '}
                              {contract.policyNumber}
                            </div>
                          )}
                          {contract.insuranceCode && (
                            <div>
                              <span className="text-muted-foreground">
                                보종코드:
                              </span>{' '}
                              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                {contract.insuranceCode}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground">
                              계약일:
                            </span>{' '}
                            {formatDate(contract.contractDate)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              개시일:
                            </span>{' '}
                            {formatDate(contract.effectiveDate)}
                          </div>
                          {contract.paymentDueDate && (
                            <div>
                              <span className="text-muted-foreground">
                                납기일:
                              </span>{' '}
                              {formatDate(contract.paymentDueDate)}
                            </div>
                          )}
                          {contract.paymentCycle && (
                            <div>
                              <span className="text-muted-foreground">
                                납입주기:
                              </span>{' '}
                              <Badge variant="outline" className="text-xs">
                                {contract.paymentCycle}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {contract.premiumAmount && (
                            <div>
                              <span className="text-muted-foreground">
                                납입보험료:
                              </span>
                              <span className="font-semibold text-purple-600 ml-1">
                                {formatCurrency(contract.premiumAmount)}
                              </span>
                            </div>
                          )}
                          {contract.monthlyPremium && (
                            <div>
                              <span className="text-muted-foreground">
                                월 보험료:
                              </span>
                              <span className="font-semibold text-blue-600 ml-1">
                                {formatCurrency(contract.monthlyPremium)}
                              </span>
                            </div>
                          )}
                          {contract.agentCommission && (
                            <div>
                              <span className="text-muted-foreground">
                                수수료:
                              </span>
                              <span className="font-semibold text-green-600 ml-1">
                                {formatCurrency(contract.agentCommission)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {contract.attachments &&
                        contract.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Paperclip className="h-4 w-4 text-primary" />
                                <span>
                                  첨부파일 {contract.attachments.length}개
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary hover:text-primary/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: 첨부파일 전체보기 모달 구현
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                전체보기
                              </Button>
                            </div>

                            {/* 📁 향상된 첨부파일 목록 */}
                            <div className="space-y-2">
                              {contract.attachments
                                .slice(0, 6) // 6개까지 표시로 증가
                                .map((att, index) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-center min-w-fit">
                                          {getDocumentTypeLabel(
                                            att.documentType
                                          )}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className="text-xs font-medium truncate"
                                          title={
                                            att.fileDisplayName || att.fileName
                                          }
                                        >
                                          {att.fileDisplayName || att.fileName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          문서
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // TODO: 파일 미리보기/다운로드 기능
                                        }}
                                        title="파일 보기"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadAttachment(att.id);
                                        }}
                                        title="파일 다운로드"
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}

                              {/* 더 많은 첨부파일이 있을 때 요약 표시 */}
                              {contract.attachments.length > 6 && (
                                <div className="flex items-center justify-center p-2 bg-muted/20 rounded-md border border-dashed">
                                  <span className="text-xs text-muted-foreground">
                                    +{contract.attachments.length - 6}개 파일 더
                                    있음
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-5 px-2 text-xs text-primary hover:text-primary/80"
                                    onClick={(e) => {
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
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            계약 상세 정보
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleContractDetails(contract.id)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {expandedContracts.has(contract.id)
                              ? '접기'
                              : '상세보기'}
                            {expandedContracts.has(contract.id) ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                        </div>

                        {/* 상세 정보 펼침 영역 */}
                        {expandedContracts.has(contract.id) && (
                          <div className="mt-4 space-y-4 p-4 bg-muted/20 rounded-lg">
                            {/* 계약 기본 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">
                                  계약 정보
                                </h4>
                                {contract.policyNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      증권번호:
                                    </span>
                                    <span>{contract.policyNumber}</span>
                                  </div>
                                )}
                                {contract.expirationDate && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      만료일:
                                    </span>
                                    <span>
                                      {formatDate(contract.expirationDate)}
                                    </span>
                                  </div>
                                )}
                                {contract.paymentMethod && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      납입방법:
                                    </span>
                                    <span>{contract.paymentMethod}</span>
                                  </div>
                                )}
                                {contract.paymentPeriod && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      납입기간:
                                    </span>
                                    <span>{contract.paymentPeriod}년</span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">
                                  계약자 정보
                                </h4>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    계약자:
                                  </span>
                                  <span>{contract.contractorName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    피보험자:
                                  </span>
                                  <span>{contract.insuredName}</span>
                                </div>
                                {contract.beneficiaryName && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      수익자:
                                    </span>
                                    <span>{contract.beneficiaryName}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 금액 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">
                                  보험료 정보
                                </h4>
                                {contract.annualPremium && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      연 보험료:
                                    </span>
                                    <span className="font-semibold text-blue-600">
                                      {formatCurrency(contract.annualPremium)}
                                    </span>
                                  </div>
                                )}
                                {contract.coverageAmount && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      보장금액:
                                    </span>
                                    <span className="font-semibold text-orange-600">
                                      {formatCurrency(contract.coverageAmount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 특약 및 메모 */}
                            {(contract.specialClauses || contract.notes) && (
                              <div className="space-y-2 text-sm">
                                {contract.specialClauses && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-1">
                                      특약사항
                                    </h4>
                                    <p className="text-muted-foreground bg-background p-2 rounded">
                                      {contract.specialClauses}
                                    </p>
                                  </div>
                                )}
                                {contract.notes && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-1">
                                      메모
                                    </h4>
                                    <p className="text-muted-foreground bg-background p-2 rounded">
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
      paymentMethod: 'monthly',
      paymentCycle: '',
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
      setFormData(initialFormData);
      setErrors({});
    }
  }, [initialFormData, isOpen]);

  // 🔄 수정 모드일 때 기존 첨부파일 로드
  useEffect(() => {
    if (editingContract && isOpen) {
      if (
        editingContract.attachments &&
        editingContract.attachments.length > 0
      ) {
        const existingAttachments: AttachmentData[] =
          editingContract.attachments.map((att) => ({
            id: att.id,
            fileName: att.fileName,
            fileDisplayName: att.fileDisplayName,
            documentType: att.documentType,
            isExisting: true, // 기존 파일 표시
            fileUrl: '', // URL은 필요시 추후 생성
          }));
        setAttachments(existingAttachments);
        console.log(`📎 기존 첨부파일 ${existingAttachments.length}개 로드됨`);
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
      paymentMethod: 'monthly',
      paymentCycle: '',
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setAttachments((prev) => [...prev, newAttachment]);

    // input 초기화
    e.target.value = '';
  };

  const handleAttachmentUpdate = (
    id: string,
    field: keyof AttachmentData,
    value: string
  ) => {
    setAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === id ? { ...attachment, [field]: value } : attachment
      )
    );
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            {editingContract ? '보험계약 수정' : '새 보험계약 등록'}
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            고객의 보험계약 정보를 {editingContract ? '수정' : '등록'}합니다.
          </DialogDescription>
        </DialogHeader>

        <form
          id="contract-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto space-y-6 px-1 py-1">
            {/* 📋 기본 계약 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
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
                    onChange={(e) => updateField('productName', e.target.value)}
                    placeholder="예: 무배당 종합보험"
                    className={errors.productName ? 'border-destructive' : ''}
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
                    onChange={(e) =>
                      updateField('insuranceCompany', e.target.value)
                    }
                    placeholder="예: 삼성화재, 현대해상"
                    className={
                      errors.insuranceCompany ? 'border-destructive' : ''
                    }
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
                    onValueChange={(value) =>
                      updateField('insuranceType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="보험 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceTypes.map((type) => (
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
                    onChange={(e) =>
                      updateField('insuranceCode', e.target.value)
                    }
                    placeholder="예: 01-01-01"
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
                    onChange={(e) =>
                      updateField('contractNumber', e.target.value)
                    }
                    placeholder="예: CT2024001234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-medium">
                    증권번호
                  </Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) =>
                      updateField('policyNumber', e.target.value)
                    }
                    placeholder="예: PL2024001234"
                  />
                </div>
              </div>
            </div>

            {/* 📅 계약 일정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                계약 일정
              </h3>

              {/* 🔄 2x2 레이아웃으로 변경 */}
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
                    onChange={(e) =>
                      updateField('contractDate', e.target.value)
                    }
                    className={errors.contractDate ? 'border-destructive' : ''}
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
                    onChange={(e) =>
                      updateField('effectiveDate', e.target.value)
                    }
                    className={errors.effectiveDate ? 'border-destructive' : ''}
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
                    onChange={(e) =>
                      updateField('expirationDate', e.target.value)
                    }
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
                    onChange={(e) =>
                      updateField('paymentDueDate', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* 💰 금액 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
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
                      value={formData.premiumAmount}
                      onChange={(e) =>
                        updateField('premiumAmount', e.target.value)
                      }
                      placeholder="0"
                      className={`pr-8 ${
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
                      value={formData.monthlyPremium}
                      onChange={(e) =>
                        updateField('monthlyPremium', e.target.value)
                      }
                      placeholder="0"
                      className="pr-8"
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
                      value={formData.agentCommission}
                      onChange={(e) =>
                        updateField('agentCommission', e.target.value)
                      }
                      placeholder="0"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="paymentMethod"
                    className="text-sm font-medium"
                  >
                    납입 방법
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      updateField('paymentMethod', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="납입 방법 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentCycle" className="text-sm font-medium">
                    납입주기
                  </Label>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={(value) =>
                      updateField('paymentCycle', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="납입주기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {['월', '분기', '반기', '연'].map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
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
                      value={formData.paymentPeriod}
                      onChange={(e) =>
                        updateField('paymentPeriod', e.target.value)
                      }
                      placeholder="0"
                      className={`pr-8 ${
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={formData.coverageAmount}
                      onChange={(e) =>
                        updateField('coverageAmount', e.target.value)
                      }
                      placeholder="0"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 📝 추가 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                추가 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="beneficiaryName"
                    className="text-sm font-medium"
                  >
                    수익자명
                  </Label>
                  <Input
                    id="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={(e) =>
                      updateField('beneficiaryName', e.target.value)
                    }
                    placeholder="예: 홍길동 배우자"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-medium">
                    증권번호
                  </Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) =>
                      updateField('policyNumber', e.target.value)
                    }
                    placeholder="예: PL2024001234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  메모 (선택사항)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="계약 관련 특이사항, 고객 요청사항 등을 기록하세요..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* 📁 첨부파일 섹션 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
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
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {attachments.map((attachment) => (
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
                              <p className="text-xs text-muted-foreground">
                                {attachment.file
                                  ? formatFileSize(attachment.file.size)
                                  : '업로드됨'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {attachment.isExisting && (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                  title="기존 파일 미리보기"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
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
                              </>
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

                        {/* 파일 메타데이터 - 한 줄로 압축 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              표시명
                            </Label>
                            <Input
                              value={attachment.fileDisplayName}
                              onChange={(e) =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'fileDisplayName',
                                  e.target.value
                                )
                              }
                              placeholder="파일 표시명"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              문서 종류
                            </Label>
                            <Select
                              value={attachment.documentType}
                              onValueChange={(value) =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'documentType',
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
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

                          <div className="space-y-1">
                            <Label className="text-xs font-medium">
                              설명 (선택사항)
                            </Label>
                            <Input
                              value={attachment.description || ''}
                              onChange={(e) =>
                                handleAttachmentUpdate(
                                  attachment.id,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="파일 설명..."
                              className="h-8 text-xs"
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

            {/* 👥 계약자/피보험자 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                계약자/피보험자 정보
              </h3>

              {/* 계약자 정보 */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm text-muted-foreground">
                  계약자 정보
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="contractorName"
                      className="flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>계약자명</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contractorName"
                      value={formData.contractorName}
                      onChange={(e) =>
                        updateField('contractorName', e.target.value)
                      }
                      placeholder="홍길동"
                      className={
                        errors.contractorName ? 'border-destructive' : ''
                      }
                    />
                    {errors.contractorName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.contractorName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contractorSsn"
                      className="text-sm font-medium"
                    >
                      계약자 주민번호
                    </Label>
                    <Input
                      id="contractorSsn"
                      value={formData.contractorSsn}
                      onChange={(e) =>
                        updateField('contractorSsn', e.target.value)
                      }
                      placeholder="000000-0000000"
                      maxLength={14}
                    />
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
                      onChange={(e) =>
                        updateField('contractorPhone', e.target.value)
                      }
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* 피보험자 정보 */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm text-muted-foreground">
                  피보험자 정보
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="insuredName"
                      className="flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>피보험자명</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="insuredName"
                      value={formData.insuredName}
                      onChange={(e) =>
                        updateField('insuredName', e.target.value)
                      }
                      placeholder="홍길동"
                      className={errors.insuredName ? 'border-destructive' : ''}
                    />
                    {errors.insuredName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.insuredName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuredSsn" className="text-sm font-medium">
                      피보험자 주민번호
                    </Label>
                    <Input
                      id="insuredSsn"
                      value={formData.insuredSsn}
                      onChange={(e) =>
                        updateField('insuredSsn', e.target.value)
                      }
                      placeholder="000000-0000000"
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="insuredPhone"
                      className="text-sm font-medium"
                    >
                      피보험자 연락처
                    </Label>
                    <Input
                      id="insuredPhone"
                      value={formData.insuredPhone}
                      onChange={(e) =>
                        updateField('insuredPhone', e.target.value)
                      }
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            type="submit"
            form="contract-form"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                등록 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {editingContract ? '계약 수정' : '계약 등록'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
