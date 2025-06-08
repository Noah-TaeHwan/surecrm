import { useState } from 'react';
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
} from 'lucide-react';

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
  status: 'draft' | 'active' | 'cancelled' | 'expired';
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
}: InsuranceContractsTabProps) {
  // 📊 임시 데이터 (실제로는 loader에서 받아올 예정)
  const [contracts] = useState<InsuranceContract[]>([
    {
      id: '1',
      productName: '무배당 라이프플래너 종신보험',
      insuranceCompany: '삼성생명',
      insuranceType: 'life',
      contractNumber: 'SL-2024-001234',
      policyNumber: 'P-2024-567890',
      contractDate: '2024-01-15',
      effectiveDate: '2024-02-01',
      expirationDate: '2054-02-01',
      contractorName: '홍길동',
      insuredName: '홍길동',
      monthlyPremium: 150000,
      coverageAmount: 50000000,
      agentCommission: 2250000,
      status: 'active',
      notes: '건강한 상태에서 가입 완료',
      attachments: [
        {
          id: '1',
          fileName: 'contract.pdf',
          fileDisplayName: '계약서.pdf',
          documentType: 'contract',
        },
        {
          id: '2',
          fileName: 'policy.pdf',
          fileDisplayName: '증권.pdf',
          documentType: 'policy',
        },
      ],
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<InsuranceContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 🎯 실제 API 호출을 위한 데이터 준비
      const contractData = {
        clientId,
        agentId,
        productName: formData.productName,
        insuranceCompany: formData.insuranceCompany,
        insuranceType: formData.insuranceType,
        contractDate: formData.contractDate,
        effectiveDate: formData.effectiveDate,
        contractorName: formData.contractorName,
        insuredName: formData.insuredName,
        monthlyPremium: formData.monthlyPremium
          ? parseFloat(formData.monthlyPremium)
          : null,
        agentCommission: formData.agentCommission
          ? parseFloat(formData.agentCommission)
          : null,
        notes: formData.notes,
        status: 'active' as const,
      };

      console.log('📋 보험계약 저장 중...', contractData);

      // TODO: 실제 API 함수 호출
      // import { createInsuranceContract } from '~/api/shared/insurance-contracts';
      // const result = await createInsuranceContract(contractData);

      // 💡 임시: 저장 시뮬레이션 (실제 API 연동 전까지)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowAddModal(false);
      setIsSubmitting(false);

      // 🎉 성공 알림 - 서비스 톤앤매너에 맞게 개선
      alert('✅ 보험계약이 성공적으로 등록되었습니다!');

      // TODO: 계약 목록 새로고침
      // 실제 구현 시에는 상위 컴포넌트의 refetch 함수 호출
    } catch (error) {
      console.error('❌ 보험계약 저장 실패:', error);
      setIsSubmitting(false);
      alert('❌ 저장에 실패했습니다. 다시 시도해주세요.');
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto border border-border shadow-lg">
            <div className="sticky top-0 bg-card border-b border-border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedContract ? '보험계약 수정' : '새 보험계약 등록'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* 🏢 보험 상품 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  보험 상품 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">상품명 *</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) =>
                        handleFormChange('productName', e.target.value)
                      }
                      placeholder="예: 무배당 라이프플래너 종신보험"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCompany">보험회사 *</Label>
                    <Select
                      value={formData.insuranceCompany}
                      onValueChange={(value) =>
                        handleFormChange('insuranceCompany', value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="보험회사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSURANCE_COMPANIES.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceType">보험 유형 *</Label>
                    <Select
                      value={formData.insuranceType}
                      onValueChange={(value) =>
                        handleFormChange('insuranceType', value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="life">생명보험</SelectItem>
                        <SelectItem value="health">건강보험</SelectItem>
                        <SelectItem value="auto">자동차보험</SelectItem>
                        <SelectItem value="home">주택보험</SelectItem>
                        <SelectItem value="business">사업자보험</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 📋 계약 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  계약 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractDate">계약일 *</Label>
                    <Input
                      id="contractDate"
                      type="date"
                      value={formData.contractDate}
                      onChange={(e) =>
                        handleFormChange('contractDate', e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">보험개시일 *</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) =>
                        handleFormChange('effectiveDate', e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 👤 계약자 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  계약자 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractorName">계약자명 *</Label>
                    <Input
                      id="contractorName"
                      value={formData.contractorName}
                      onChange={(e) =>
                        handleFormChange('contractorName', e.target.value)
                      }
                      placeholder="계약자 이름"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuredName">피보험자명 *</Label>
                    <Input
                      id="insuredName"
                      value={formData.insuredName}
                      onChange={(e) =>
                        handleFormChange('insuredName', e.target.value)
                      }
                      placeholder="피보험자 이름"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 💰 금액 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  금액 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPremium">월 보험료 (원)</Label>
                    <Input
                      id="monthlyPremium"
                      type="number"
                      value={formData.monthlyPremium}
                      onChange={(e) =>
                        handleFormChange('monthlyPremium', e.target.value)
                      }
                      placeholder="예: 150000"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentCommission">설계사 수수료 (원)</Label>
                    <Input
                      id="agentCommission"
                      type="number"
                      value={formData.agentCommission}
                      onChange={(e) =>
                        handleFormChange('agentCommission', e.target.value)
                      }
                      placeholder="예: 2250000"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 📎 첨부파일 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  첨부파일 (엑셀, PDF)
                </h3>

                <div className="border-2 border-dashed border-border/30 rounded-lg p-8 text-center bg-muted/10">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-foreground mb-2">
                    파일을 드래그하여 업로드하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    지원 형식: .xlsx, .xls, .pdf (최대 10MB)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                    disabled={isSubmitting}
                  >
                    파일 선택
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      업로드된 파일 ({attachments.length}개)
                    </h4>
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.type} •{' '}
                              {(attachment.file.size / 1024 / 1024).toFixed(2)}
                              MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* 📝 메모 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">메모</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">기타 메모사항</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="기타 메모사항을 입력하세요"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="sticky bottom-0 bg-card border-t border-border p-6">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {selectedContract ? '수정' : '등록'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
