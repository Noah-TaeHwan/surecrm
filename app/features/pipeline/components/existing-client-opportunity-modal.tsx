import { useState, useEffect, useRef } from 'react';

// 🔥 모달 높이 강제 CSS 주입
const FORCE_MODAL_HEIGHT_CSS = `
  /* 🚨 기존 고객 영업 기회 모달 75vh 강제 적용 */
  [data-slot="dialog-content"] {
    max-height: 75vh !important;
    height: auto !important;
    min-height: 0 !important;
  }
  
  div[role="dialog"] > [data-slot="dialog-content"] {
    max-height: 75vh !important;
  }
  
  .fixed.z-50.grid.w-full.max-w-lg {
    max-height: 75vh !important;
  }
  
  /* 모든 가능한 모달 selector 강제 */
  [data-radix-dialog-content] {
    max-height: 75vh !important;
  }
`;
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
import { Input } from '~/common/components/ui/input';
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
  Search,
  User,
  Building2,
  DollarSign,
  Banknote,
} from 'lucide-react';

interface ExistingClientOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    clientId: string;
    clientName: string;
    insuranceType: string;
    notes: string;
    productName?: string;
    insuranceCompany?: string;
    monthlyPremium?: number;
    expectedCommission?: number;
  }) => Promise<void>;
  clients: { id: string; name: string; phone: string; currentStage?: string }[];
  isLoading?: boolean;
  preSelectedClientId?: string; // 특정 고객 자동 선택
}

// 보험 상품 타입 정의 (새 영업 기회 모달과 동일)
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

export function ExistingClientOpportunityModal({
  isOpen,
  onClose,
  onConfirm,
  clients,
  isLoading = false,
  preSelectedClientId, // 특정 고객 자동 선택
}: ExistingClientOpportunityModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preSelectedClientId || ''
  );
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<
    'selectClient' | 'selectProduct' | 'details'
  >('selectClient'); // 항상 1단계부터 시작 (미리 선택된 고객이 있으면 1단계에서 선택된 상태로 표시)

  // 새로운 상품 정보 상태들
  const [productName, setProductName] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [monthlyPremium, setMonthlyPremium] = useState('');
  const [expectedCommission, setExpectedCommission] = useState('');

  // 선택된 고객 카드에 대한 ref
  const selectedClientRef = useRef<HTMLDivElement>(null);

  // preSelectedClientId가 변경될 때마다 selectedClientId 동기화
  useEffect(() => {
    if (preSelectedClientId) {
      setSelectedClientId(preSelectedClientId);
    }
  }, [preSelectedClientId, isOpen]); // isOpen도 의존성에 추가하여 모달이 열릴 때마다 동기화

  // 🚨 모달 열릴 때 CSS 강제 주입
  useEffect(() => {
    if (isOpen) {
      const styleElement = document.createElement('style');
      styleElement.id = 'force-modal-height-style';
      styleElement.textContent = FORCE_MODAL_HEIGHT_CSS;
      document.head.appendChild(styleElement);

      return () => {
        const existingStyle = document.getElementById('force-modal-height-style');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);

  // 선택된 고객 카드로 자동 스크롤
  useEffect(() => {
    if (isOpen && preSelectedClientId && selectedClientRef.current) {
      // 약간의 지연을 두어 DOM 렌더링 완료 후 스크롤
      const timer = setTimeout(() => {
        selectedClientRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, preSelectedClientId]); // 모달이 열리고 선택된 고객이 있을 때 스크롤

  const handleClientNext = () => {
    if (selectedClientId) {
      setStep('selectProduct');
    }
  };

  const handleProductNext = () => {
    if (selectedType) {
      setStep('details');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('selectProduct');
    } else if (step === 'selectProduct') {
      setStep('selectClient');
    }
  };

  const handleConfirm = async () => {
    if (selectedClientId && selectedType) {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      if (selectedClient) {
        await onConfirm({
          clientId: selectedClientId,
          clientName: selectedClient.name,
          insuranceType: selectedType,
          notes,
          productName: productName || undefined,
          insuranceCompany: insuranceCompany || undefined,
          monthlyPremium: monthlyPremium
            ? parseFloat(monthlyPremium)
            : undefined,
          expectedCommission: expectedCommission
            ? parseFloat(expectedCommission)
            : undefined,
        });
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedClientId(preSelectedClientId || '');
    setClientSearchQuery('');
    setSelectedType('');
    setNotes('');
    setProductName('');
    setInsuranceCompany('');
    setMonthlyPremium('');
    setExpectedCommission('');
    setStep('selectClient'); // 항상 1단계로 복원
    onClose();
  };

  // 고객 필터링 및 정렬 (선택된 고객을 맨 위로)
  const filteredClients = clients
    .filter(
      client =>
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        (client.phone && client.phone.includes(clientSearchQuery))
    )
    .sort((a, b) => {
      // 파이프라인에서 선택된 고객을 맨 위로 정렬
      if (preSelectedClientId) {
        if (a.id === preSelectedClientId) return -1; // a가 선택된 고객이면 맨 위로
        if (b.id === preSelectedClientId) return 1; // b가 선택된 고객이면 맨 위로
      }
      // 나머지는 이름순 정렬
      return a.name.localeCompare(b.name);
    });

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedInsurance = insuranceTypes.find(
    type => type.id === selectedType
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col gap-0"
        style={{
          maxHeight: '75vh !important',
          height: 'auto !important',
          minHeight: '0 !important',
          '--radix-dialog-content-max-height': '75vh'
        } as React.CSSProperties}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">기존 고객 영업 기회 추가</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            기존 고객에게 새로운 보험 상품을 제안하고 영업 기회를 만들어보세요.
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-1 sm:py-2 space-y-2 sm:space-y-6 min-h-0">
        

          {/* STEP 1: 고객 선택 */}
          {step === 'selectClient' && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                👤 고객 선택
              </h4>

              {/* 검색 입력 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="고객명으로 검색하세요"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                />
              </div>

              {/* 고객 리스트 */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredClients.map(client => (
                    <Card
                      key={client.id}
                      ref={
                        preSelectedClientId === client.id
                          ? selectedClientRef
                          : undefined
                      }
                      className={`cursor-pointer transition-colors border-border/50 hover:border-border py-0 ${
                        selectedClientId === client.id
                          ? 'border-primary bg-primary/5'
                          : ''
                      } ${
                        preSelectedClientId === client.id
                          ? 'ring-2 ring-primary/30 border-primary/60'
                          : ''
                      }`}
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {client.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {client.phone}
                              </div>
                              {client.currentStage && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  {client.currentStage}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedClientId === client.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs sm:text-sm">검색 결과가 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    다른 검색어로 시도해보세요
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: 보험 상품 선택 */}
          {step === 'selectProduct' && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                🛡️ 보험 상품 선택
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {insuranceTypes.map(type => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer py-0 transition-all border-border/50 hover:border-border ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                            {type.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {type.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </div>
                        {selectedType === type.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: 상세 정보 입력 */}
          {step === 'details' && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                📝 상세 정보
              </h4>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">상품명</label>
                  <Input
                    placeholder="상품명을 입력하세요"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">보험사</label>
                  <Input
                    placeholder="보험사를 입력하세요"
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">월 보험료 (원)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="100000"
                        value={monthlyPremium}
                        onChange={(e) => setMonthlyPremium(e.target.value)}
                        className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">예상 수수료 (원)</label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="15000"
                        value={expectedCommission}
                        onChange={(e) => setExpectedCommission(e.target.value)}
                        className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">메모</label>
                  <Textarea
                    placeholder="영업 기회에 대한 메모를 입력하세요"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs sm:text-sm min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* 선택된 정보 요약 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="text-xs sm:text-sm font-medium mb-2">선택된 정보</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">고객:</span>
                      <span className="font-medium">
                        {clients.find(c => c.id === selectedClientId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">보험 종류:</span>
                      <span className="font-medium">
                        {insuranceTypes.find(t => t.id === selectedType)?.name}
                      </span>
                    </div>
                    {monthlyPremium && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">월 보험료:</span>
                        <span className="font-medium">
                          {parseFloat(monthlyPremium).toLocaleString()}원
                        </span>
                      </div>
                    )}
                    {expectedCommission && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">예상 수수료:</span>
                        <span className="font-medium text-primary">
                          {parseFloat(expectedCommission).toLocaleString()}원
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            
            {step !== 'selectClient' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
              >
                이전
              </Button>
            )}

            {step === 'selectClient' && (
              <Button
                onClick={handleClientNext}
                disabled={!selectedClientId}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-3 w-3" />
                다음
              </Button>
            )}

            {step === 'selectProduct' && (
              <Button
                onClick={handleProductNext}
                disabled={!selectedType}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-3 w-3" />
                다음
              </Button>
            )}

            {step === 'details' && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading || !selectedClientId || !selectedType}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <Plus className="h-3 w-3" />
                {isLoading ? '추가 중...' : '영업 기회 추가'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
