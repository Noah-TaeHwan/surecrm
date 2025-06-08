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
  AlertCircle,
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

// 📋 보험계약 타입 정의
interface InsuranceContract {
  id: string;
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  contractNumber?: string;
  policyNumber?: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate?: string;
  contractorName: string;
  insuredName: string;
  beneficiaryName?: string;
  monthlyPremium?: number;
  annualPremium?: number;
  coverageAmount?: number;
  agentCommission?: number;
  status: 'draft' | 'active' | 'cancelled' | 'expired' | 'suspended';
  paymentMethod?: string;
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
}

// 📝 보험계약 폼 데이터 타입
interface ContractFormData {
  productName: string;
  insuranceCompany: string;
  insuranceType: string;
  contractNumber: string;
  policyNumber: string;
  contractDate: string;
  effectiveDate: string;
  expirationDate: string;
  contractorName: string;
  insuredName: string;
  beneficiaryName: string;
  monthlyPremium: string;
  annualPremium: string;
  coverageAmount: string;
  agentCommission: string;
  paymentMethod: string;
  paymentPeriod: string;
  specialClauses: string;
  notes: string;
}

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

// 💰 금액 포맷팅
const formatCurrency = (amount?: number) => {
  if (!amount) return '-';
  return `₩${amount.toLocaleString()}`;
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
}: InsuranceContractsTabProps) {
  // 📊 실제 데이터 상태
  const [contracts, setContracts] =
    useState<InsuranceContract[]>(initialContracts);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  // React Router hooks
  const revalidator = useRevalidator();
  const fetcher = useFetcher();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<InsuranceContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 📝 폼 데이터 상태
  const [formData, setFormData] = useState<ContractFormData>({
    productName: '',
    insuranceCompany: '',
    insuranceType: 'life',
    contractNumber: '',
    policyNumber: '',
    contractDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    contractorName: clientName || '',
    insuredName: clientName || '',
    beneficiaryName: '',
    monthlyPremium: '',
    annualPremium: '',
    coverageAmount: '',
    agentCommission: '',
    paymentMethod: '월납',
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
      contractNumber: '',
      policyNumber: '',
      contractDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      contractorName: clientName || '',
      insuredName: clientName || '',
      beneficiaryName: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentMethod: '월납',
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
      contractNumber: contract.contractNumber || '',
      policyNumber: contract.policyNumber || '',
      contractDate: contract.contractDate,
      effectiveDate: contract.effectiveDate,
      expirationDate: contract.expirationDate || '',
      contractorName: contract.contractorName,
      insuredName: contract.insuredName,
      beneficiaryName: contract.beneficiaryName || '',
      monthlyPremium: contract.monthlyPremium?.toString() || '',
      annualPremium: contract.annualPremium?.toString() || '',
      coverageAmount: contract.coverageAmount?.toString() || '',
      agentCommission: contract.agentCommission?.toString() || '',
      paymentMethod: contract.paymentMethod || '월납',
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

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    try {
      // 🎯 Fetcher를 사용한 API 호출
      const submitData = new FormData();
      submitData.append('intent', 'createInsuranceContract');
      submitData.append('clientId', clientId);
      submitData.append('agentId', agentId);

      // 계약 데이터 추가
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          submitData.append(key, value.toString());
        }
      });

      console.log('📋 보험계약 저장 중...', formData);

      // React Router fetcher로 action 호출
      fetcher.submit(submitData, { method: 'POST' });

      setShowAddModal(false);
      setIsSubmitting(false);

      // 성공 알림
      alert('✅ 보험계약이 성공적으로 등록되었습니다!');

      // 페이지 데이터 새로고침
      revalidator.revalidate();
    } catch (error) {
      console.error('❌ 보험계약 저장 실패:', error);
      setIsSubmitting(false);
      alert(
        `❌ 저장에 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
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
    .reduce((sum, c) => sum + (c.monthlyPremium || 0), 0);
  const totalCommission = contracts
    .filter((c) => c.status === 'active' && c.agentCommission)
    .reduce((sum, c) => sum + (c.agentCommission || 0), 0);

  return (
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">보험사:</span>{' '}
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
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">계약일:</span>{' '}
                          {formatDate(contract.contractDate)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">개시일:</span>{' '}
                          {formatDate(contract.effectiveDate)}
                        </div>
                      </div>
                      <div className="space-y-2">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Paperclip className="h-4 w-4" />
                            <span>
                              첨부파일 {contract.attachments.length}개
                            </span>
                          </div>
                        </div>
                      )}
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
          onClose={() => setShowAddModal(false)}
          onConfirm={handleSubmit}
          clientName={clientName}
          isLoading={isSubmitting}
        />
      )}
    </TabsContent>
  );
}

// 🆕 보험계약 등록 모달 컴포넌트
function NewContractModal({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  clientName: string;
  isLoading?: boolean;
}) {
  // 상태 관리
  const [formData, setFormData] = useState({
    productName: '',
    insuranceCompany: '',
    insuranceType: 'life',
    contractNumber: '',
    policyNumber: '',
    contractDate: '',
    effectiveDate: '',
    expirationDate: '',
    contractorName: clientName,
    insuredName: clientName,
    beneficiaryName: '',
    monthlyPremium: '',
    annualPremium: '',
    coverageAmount: '',
    agentCommission: '',
    paymentMethod: 'monthly',
    paymentPeriod: '',
    specialClauses: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      productName: '',
      insuranceCompany: '',
      insuranceType: 'life',
      contractNumber: '',
      policyNumber: '',
      contractDate: '',
      effectiveDate: '',
      expirationDate: '',
      contractorName: clientName,
      insuredName: clientName,
      beneficiaryName: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentMethod: 'monthly',
      paymentPeriod: '',
      specialClauses: '',
      notes: '',
    });
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

    if (!formData.monthlyPremium) {
      newErrors.monthlyPremium = '월 보험료를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />새 보험계약 등록
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            고객의 보험계약 정보를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
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
              </div>
            </div>

            {/* 📅 계약 일정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                계약 일정
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    htmlFor="monthlyPremium"
                    className="flex items-center space-x-1 text-sm font-medium"
                  >
                    <span>월 보험료</span>
                    <span className="text-destructive">*</span>
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
                      className={`pr-8 ${
                        errors.monthlyPremium ? 'border-destructive' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      원
                    </span>
                  </div>
                  {errors.monthlyPremium && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.monthlyPremium}
                    </p>
                  )}
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* 📌 안내 메시지 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    계약 등록 후 진행사항
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p>✓ 영업 파이프라인에서 "계약 완료" 상태로 업데이트</p>
                    <p>✓ 대시보드 및 보고서에 수수료 반영</p>
                    <p>✓ 계약서류 업로드 및 관리 기능 제공</p>
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
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                등록 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                계약 등록
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
