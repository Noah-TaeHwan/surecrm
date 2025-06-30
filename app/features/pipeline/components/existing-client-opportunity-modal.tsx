import { useState, useEffect, useRef } from 'react';
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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

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

// 보험 상품 타입 정의 함수 (번역 지원)
const getInsuranceTypes = (t: any) => [
  {
    id: 'auto',
    name: t('insurance.types.auto', '자동차보험'),
    icon: <Car className="h-5 w-5" />,
    description: t(
      'forms.existingClientOpportunity.descriptions.auto',
      '자동차 사고 및 손해 보장'
    ),
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'life',
    name: t('insurance.types.life', '생명보험'),
    icon: <Heart className="h-5 w-5" />,
    description: t(
      'forms.existingClientOpportunity.descriptions.life',
      '생명 보장 및 저축 기능'
    ),
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    id: 'health',
    name: t('insurance.types.health', '건강보험'),
    icon: <Shield className="h-5 w-5" />,
    description: t(
      'forms.existingClientOpportunity.descriptions.health',
      '질병 및 상해 의료비 보장'
    ),
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    id: 'home',
    name: t('insurance.types.home', '주택보험'),
    icon: <Home className="h-5 w-5" />,
    description: t(
      'forms.existingClientOpportunity.descriptions.home',
      '주택 및 가재도구 손해 보장'
    ),
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'business',
    name: t('insurance.types.business', '사업자보험'),
    icon: <Briefcase className="h-5 w-5" />,
    description: t(
      'forms.existingClientOpportunity.descriptions.business',
      '사업 관련 리스크 보장'
    ),
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
  const { t } = useHydrationSafeTranslation('pipeline');
  const insuranceTypes = getInsuranceTypes(t);

  // 🎯 스테이지 이름을 번역 키로 매핑하는 헬퍼 함수 (pipeline-board.tsx와 동일)
  const getStageTranslationKey = (stageName: string) => {
    switch (stageName) {
      case '첫 상담':
        return 'firstConsultation';
      case '니즈 분석':
        return 'needsAnalysis';
      case '상품 설명':
        return 'productExplanation';
      case '계약 검토':
        return 'contractReview';
      case '계약 완료':
        return 'contractCompleted';
      default:
        return null;
    }
  };

  // 🎯 스테이지 이름을 번역된 텍스트로 변환하는 함수
  const getTranslatedStageName = (stageName: string) => {
    const stageKey = getStageTranslationKey(stageName);
    if (stageKey) {
      return t(`stages.${stageKey}`, stageName);
    }
    return stageName;
  };

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
    // 🧹 모달 상태 완전 초기화
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

  // 🔄 모달이 닫힐 때마다 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힌 후 상태 초기화
      const timer = setTimeout(() => {
        setSelectedClientId(preSelectedClientId || '');
        setClientSearchQuery('');
        setSelectedType('');
        setNotes('');
        setProductName('');
        setInsuranceCompany('');
        setMonthlyPremium('');
        setExpectedCommission('');
        setStep('selectClient');
      }, 100); // 약간의 지연을 두어 애니메이션 완료 후 초기화

      return () => clearTimeout(timer);
    }
  }, [isOpen, preSelectedClientId]);

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
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose(); // 🔄 X 버튼이나 ESC로 닫힐 때도 상태 초기화
        }
      }}
    >
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[75vh] gap-0 border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        style={{
          maxHeight: '75vh',
          height: '75vh',
          minHeight: '75vh',
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {t(
                'forms.existingClientOpportunity.title',
                '기존 고객 영업 기회 추가'
              )}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {t(
              'forms.existingClientOpportunity.subtitle',
              '기존 고객에게 새로운 보험 상품을 제안하고 영업 기회를 만들어보세요.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div
          className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-1 sm:py-2 space-y-2 sm:space-y-6"
          style={{ minHeight: 'calc(75vh - 200px)' }}
        >
          {/* STEP 1: 고객 선택 */}
          {step === 'selectClient' && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                👤{' '}
                {t(
                  'forms.existingClientOpportunity.steps.selectClient',
                  '고객 선택'
                )}
              </h4>

              {/* 검색 입력 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t(
                    'forms.existingClientOpportunity.fields.clientSearch',
                    '고객명으로 검색하세요'
                  )}
                  value={clientSearchQuery}
                  onChange={e => setClientSearchQuery(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                  autoFocus={false}
                />
              </div>

              {/* 고객 리스트 */}
              <div className="space-y-2 flex-1 min-h-0">
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
                                {getTranslatedStageName(client.currentStage)}
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
                  <p className="text-xs sm:text-sm">
                    {t(
                      'forms.existingClientOpportunity.messages.noSearchResults',
                      '검색 결과가 없습니다'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'forms.existingClientOpportunity.messages.tryDifferentSearch',
                      '다른 검색어로 시도해보세요'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: 보험 상품 선택 */}
          {step === 'selectProduct' && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                🛡️{' '}
                {t(
                  'forms.existingClientOpportunity.steps.selectProduct',
                  '보험 상품 선택'
                )}
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
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}
                          >
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
                📝{' '}
                {t(
                  'forms.existingClientOpportunity.steps.details',
                  '상세 정보'
                )}
              </h4>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    {t(
                      'forms.existingClientOpportunity.fields.productName',
                      '상품명'
                    )}
                  </label>
                  <Input
                    placeholder={t(
                      'forms.existingClientOpportunity.placeholders.productName',
                      '상품명을 입력하세요'
                    )}
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    {t(
                      'forms.existingClientOpportunity.fields.insuranceCompany',
                      '보험사'
                    )}
                  </label>
                  <Input
                    placeholder={t(
                      'forms.existingClientOpportunity.placeholders.insuranceCompany',
                      '보험사를 입력하세요'
                    )}
                    value={insuranceCompany}
                    onChange={e => setInsuranceCompany(e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      {t(
                        'forms.existingClientOpportunity.fields.monthlyPremium',
                        '월 보험료 (원)'
                      )}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={t(
                          'forms.existingClientOpportunity.placeholders.monthlyPremium',
                          '100000'
                        )}
                        value={monthlyPremium}
                        onChange={e => setMonthlyPremium(e.target.value)}
                        className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      {t(
                        'forms.existingClientOpportunity.fields.expectedCommission',
                        '예상 수수료 (원)'
                      )}
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={t(
                          'forms.existingClientOpportunity.placeholders.expectedCommission',
                          '15000'
                        )}
                        value={expectedCommission}
                        onChange={e => setExpectedCommission(e.target.value)}
                        className="h-9 sm:h-10 text-xs sm:text-sm pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">
                    {t('forms.existingClientOpportunity.fields.notes', '메모')}
                  </label>
                  <Textarea
                    placeholder={t(
                      'forms.existingClientOpportunity.placeholders.notes',
                      '영업 기회에 대한 메모를 입력하세요'
                    )}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="text-xs sm:text-sm min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* 선택된 정보 요약 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="text-xs sm:text-sm font-medium mb-2">
                    {t(
                      'forms.existingClientOpportunity.summary.title',
                      '선택된 정보'
                    )}
                  </h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t(
                          'forms.existingClientOpportunity.summary.client',
                          '고객:'
                        )}
                      </span>
                      <span className="font-medium">
                        {clients.find(c => c.id === selectedClientId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t(
                          'forms.existingClientOpportunity.summary.insuranceType',
                          '보험 종류:'
                        )}
                      </span>
                      <span className="font-medium">
                        {insuranceTypes.find(t => t.id === selectedType)?.name}
                      </span>
                    </div>
                    {monthlyPremium && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t(
                            'forms.existingClientOpportunity.summary.monthlyPremium',
                            '월 보험료:'
                          )}
                        </span>
                        <span className="font-medium">
                          {parseFloat(monthlyPremium).toLocaleString()}
                          {t('labels.currency', '원')}
                        </span>
                      </div>
                    )}
                    {expectedCommission && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t(
                            'forms.existingClientOpportunity.summary.expectedCommission',
                            '예상 수수료:'
                          )}
                        </span>
                        <span className="font-medium text-primary">
                          {parseFloat(expectedCommission).toLocaleString()}
                          {t('labels.currency', '원')}
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
              {t('forms.common.cancel', '취소')}
            </Button>

            {step !== 'selectClient' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
              >
                {t('forms.existingClientOpportunity.buttons.previous', '이전')}
              </Button>
            )}

            {step === 'selectClient' && (
              <Button
                onClick={handleClientNext}
                disabled={!selectedClientId}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-3 w-3" />
                {t('forms.existingClientOpportunity.buttons.next', '다음')}
              </Button>
            )}

            {step === 'selectProduct' && (
              <Button
                onClick={handleProductNext}
                disabled={!selectedType}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-3 w-3" />
                {t('forms.existingClientOpportunity.buttons.next', '다음')}
              </Button>
            )}

            {step === 'details' && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading || !selectedClientId || !selectedType}
                className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
              >
                <Plus className="h-3 w-3" />
                {isLoading
                  ? t(
                      'forms.existingClientOpportunity.buttons.adding',
                      '추가 중...'
                    )
                  : t(
                      'forms.existingClientOpportunity.buttons.addOpportunity',
                      '영업 기회 추가'
                    )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
