import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import { Card, CardContent } from '~/common/components/ui/card';
import {
  TrendingUp,
  Shield,
  Car,
  Heart,
  Home,
  Briefcase,
  Plus,
  Check,
  ArrowRight,
  Building2,
  DollarSign,
  Banknote,
} from 'lucide-react';
import { Input } from '~/common/components/ui/input';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    insuranceType: string;
    notes: string;
    productName?: string;
    insuranceCompany?: string;
    monthlyPremium?: number;
    expectedCommission?: number;
  }) => Promise<void>;
  clientName: string;
  isLoading?: boolean;
}

// 보험 상품 타입 정의
const insuranceTypes = [
  {
    id: 'auto',
    name: '자동차보험',
    icon: <Car className="h-5 w-5" />,
    description: '자동차 사고 및 손해 보장',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'life',
    name: '생명보험',
    icon: <Heart className="h-5 w-5" />,
    description: '생명 보장 및 저축 기능',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    id: 'health',
    name: '건강보험',
    icon: <Shield className="h-5 w-5" />,
    description: '질병 및 상해 의료비 보장',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    id: 'home',
    name: '주택보험',
    icon: <Home className="h-5 w-5" />,
    description: '주택 및 가재도구 손해 보장',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'business',
    name: '사업자보험',
    icon: <Briefcase className="h-5 w-5" />,
    description: '사업 관련 리스크 보장',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export function NewOpportunityModal({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  isLoading = false,
}: NewOpportunityModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'details'>('select');

  // 🆕 새로운 상품 정보 상태들
  const [productName, setProductName] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [monthlyPremium, setMonthlyPremium] = useState('');
  const [expectedCommission, setExpectedCommission] = useState('');

  const handleNext = () => {
    if (selectedType) {
      setStep('details');
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleConfirm = async () => {
    if (selectedType) {
      await onConfirm({
        insuranceType: selectedType,
        notes,
        productName: productName || undefined,
        insuranceCompany: insuranceCompany || undefined,
        monthlyPremium: monthlyPremium ? parseFloat(monthlyPremium) : undefined,
        expectedCommission: expectedCommission
          ? parseFloat(expectedCommission)
          : undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType('');
    setNotes('');
    setProductName('');
    setInsuranceCompany('');
    setMonthlyPremium('');
    setExpectedCommission('');
    setStep('select');
    onClose();
  };

  const selectedInsurance = insuranceTypes.find(
    type => type.id === selectedType
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />새 영업 기회 생성
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-medium text-foreground">{clientName}</span>{' '}
            고객에게 새로운 보험 상품 영업을 시작합니다.
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          // 1단계: 보험 상품 선택
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                영업할 보험 상품을 선택하세요
              </h3>
              <p className="text-sm text-muted-foreground">
                고객의 니즈에 맞는 보험 상품을 선택하면 영업 파이프라인의 '첫
                상담' 단계에 추가됩니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insuranceTypes.map(insurance => (
                <Card
                  key={insurance.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedType === insurance.id
                      ? 'ring-2 ring-primary border-primary bg-primary/5'
                      : 'hover:border-border'
                  }`}
                  onClick={() => setSelectedType(insurance.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${insurance.color}`}>
                        {insurance.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{insurance.name}</h4>
                          {selectedType === insurance.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insurance.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedType && selectedInsurance && (
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedInsurance.color}`}>
                    {selectedInsurance.icon}
                  </div>
                  <div>
                    <p className="font-medium">
                      선택된 상품: {selectedInsurance.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      이 상품으로 영업 기회를 생성합니다
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 2단계: 상세 정보 입력
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">상품 정보 및 영업 메모</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-2">
                  {selectedInsurance?.icon}
                  {selectedInsurance?.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  선택된 상품
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* 🆕 상품 정보 섹션 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  상품 정보
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      상품명
                    </label>
                    <Input
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="예: 무배당 통합보험"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      보험회사명
                    </label>
                    <Input
                      value={insuranceCompany}
                      onChange={e => setInsuranceCompany(e.target.value)}
                      placeholder="예: 삼성화재, 현대해상"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2  items-center gap-2">
                      <Banknote className="h-4 w-4" />월 납입료 (보험료)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={monthlyPremium}
                        onChange={e => setMonthlyPremium(e.target.value)}
                        placeholder="0"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        원
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2  items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      예상 수수료 (매출)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={expectedCommission}
                        onChange={e => setExpectedCommission(e.target.value)}
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

              {/* 영업 메모 섹션 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  영업 메모 (선택사항)
                </label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={`${clientName} 고객의 ${selectedInsurance?.name} 영업에 대한 메모를 입력하세요...\n\n예시:\n- 고객 관심사: 보험료 부담 최소화\n- 기존 보험: 타사 자동차보험 가입 중\n- 영업 전략: 기존 보험과 비교 견적 제시`}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  고객의 상황, 관심사, 영업 전략 등을 기록하세요
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      영업 파이프라인 진행 과정
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>
                        ✓ 첫 상담 → 니즈 분석 → 상품 설명 → 계약 검토 → 계약
                        완료
                      </p>
                      <p className="text-xs">
                        이 고객 카드가 '첫 상담' 단계에 추가됩니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'select' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedType}
                className="gap-2"
              >
                다음 단계
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                이전 단계
              </Button>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    영업 기회 생성
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
