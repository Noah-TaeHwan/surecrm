import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Textarea } from '~/common/components/ui/textarea';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import {
  Plus,
  X,
  User,
  Briefcase,
  Shield,
  Calendar,
  Check,
  AlertCircle,
} from 'lucide-react';
import type {
  PipelineStage,
  InsuranceInfo,
} from '~/features/pipeline/types/types';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  referrers: { id: string; name: string }[];
  initialStageId?: string;
  onAddClient: (client: {
    name: string;
    phone?: string; // 🔧 전화번호 선택사항으로 변경
    email?: string;
    address?: string;
    occupation?: string;
    telecomProvider?: string;
    height?: number;
    weight?: number;
    hasDrivingLicense?: boolean;
    stageId: string;
    importance: 'high' | 'medium' | 'low';
    referrerId?: string;
    note?: string;
    tags?: string[];
    insuranceInfo?: InsuranceInfo[];
  }) => void;
}

export function AddClientModal({
  open,
  onOpenChange,
  stages,
  referrers,
  initialStageId = '',
  onAddClient,
}: AddClientModalProps) {
  const { t } = useHydrationSafeTranslation('pipeline');

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState('basic');

  // 기본 정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [telecomProvider, setTelecomProvider] = useState('');

  // 🌍 직접 입력을 위한 상태 추가
  const [isCustomTelecom, setIsCustomTelecom] = useState(false);
  const [customTelecomProvider, setCustomTelecomProvider] = useState('');

  // 신체 정보
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [hasDrivingLicense, setHasDrivingLicense] = useState<
    boolean | undefined
  >(undefined);

  // 영업 정보
  const [stageId, setStageId] = useState(initialStageId || stages[0]?.id || '');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const [referrerId, setReferrerId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');

  // 태그
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // 보험 정보
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo[]>([]);

  // 폼 검증 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 통신사 목록 (🔧 다른 페이지와 일치하도록 표준화)
  const telecomProviders = [
    'SKT',
    'KT',
    'LG U+',
    '알뜰폰 SKT',
    '알뜰폰 KT',
    '알뜰폰 LG U+',
  ];

  // 초기 단계 ID가 변경되면 업데이트
  useEffect(() => {
    if (initialStageId) {
      setStageId(initialStageId);
    }
  }, [initialStageId]);

  // 폼 완성도 계산
  const getFormProgress = () => {
    let completed = 0;
    let total = 3; // 필수 항목들 (이름, 단계, 중요도)

    if (name.trim()) completed++;
    if (stageId) completed++;
    if (importance) completed++;

    // 전화번호는 선택사항이지만 입력 시 완성도에 기여
    if (phone.trim()) completed += 0.5;

    // 선택 항목들 (가중치 낮음)
    if (email) total++;
    if (email && email.trim()) completed++;

    if (occupation) completed += 0.5;
    if (note) completed += 0.5;
    if (tags.length > 0) completed += 0.5;
    if (insuranceInfo.length > 0) completed += 0.5;

    return Math.min(100, Math.round((completed / total) * 100));
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('forms.validation.required', '필수 입력 항목입니다');
    }

    // 전화번호는 선택사항으로 변경 - 값이 있을 때만 형식 검증
    if (
      phone.trim() &&
      !/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(phone.replace(/-/g, ''))
    ) {
      newErrors.phone = t(
        'forms.validation.invalidPhone',
        '올바른 전화번호 형식이 아닙니다'
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t(
        'forms.validation.invalidEmail',
        '올바른 이메일 형식이 아닙니다'
      );
    }

    if (!stageId) {
      newErrors.stageId = t(
        'forms.validation.selectStage',
        '진행 단계를 선택해주세요'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setActiveTab('basic');
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setOccupation('');
    setTelecomProvider('');
    setIsCustomTelecom(false);
    setCustomTelecomProvider('');
    setHeight(undefined);
    setWeight(undefined);
    setHasDrivingLicense(undefined);
    setStageId(initialStageId || stages[0]?.id || '');
    setImportance('medium');
    setReferrerId(undefined);
    setNote('');
    setTags([]);
    setNewTag('');
    setInsuranceInfo([]);
    setErrors({});
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addInsurance = (type: InsuranceInfo['type']) => {
    const newInsurance: InsuranceInfo = {
      id: Date.now().toString(),
      type,
      details: {},
    };
    setInsuranceInfo([...insuranceInfo, newInsurance]);
  };

  const removeInsurance = (id: string) => {
    setInsuranceInfo(insuranceInfo.filter(ins => ins.id !== id));
  };

  const updateInsuranceDetails = (id: string, field: string, value: any) => {
    setInsuranceInfo(
      insuranceInfo.map(ins =>
        ins.id === id
          ? { ...ins, details: { ...ins.details, [field]: value } }
          : ins
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // 첫 번째 에러가 있는 탭으로 이동
      if (errors.name || errors.phone || errors.email) {
        setActiveTab('basic');
      } else if (errors.stageId) {
        setActiveTab('sales');
      }
      return;
    }

    // 🌍 직접 입력된 통신사 값 처리
    const finalTelecomProvider = isCustomTelecom
      ? customTelecomProvider.trim()
      : telecomProvider;

    onAddClient({
      name,
      phone,
      email: email || undefined,
      address: address || undefined,
      occupation: occupation || undefined,
      telecomProvider: finalTelecomProvider || undefined,
      height,
      weight,
      hasDrivingLicense,
      stageId,
      importance,
      referrerId,
      note: note || undefined,
      tags: tags.length > 0 ? tags : undefined,
      insuranceInfo: insuranceInfo.length > 0 ? insuranceInfo : undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  const getInsuranceTypeLabel = (type: string) => {
    switch (type) {
      case 'auto':
        return t('insurance.types.auto', '자동차보험');
      case 'prenatal':
        return t('insurance.types.prenatal', '태아보험');
      case 'health':
        return t('insurance.types.health', '건강보험');
      case 'life':
        return t('insurance.types.life', '생명보험');
      case 'property':
        return t('insurance.types.property', '재산보험');
      default:
        return t('insurance.types.other', '기타보험');
    }
  };

  const getTabStatus = (tabValue: string) => {
    switch (tabValue) {
      case 'basic':
        return name && !errors.name && !errors.phone && !errors.email; // 전화번호 필수 조건 제거
      case 'personal':
        return true; // 개인 정보는 모두 선택사항
      case 'insurance':
        return true; // 보험 정보는 선택사항
      case 'sales':
        return stageId && !errors.stageId;
      default:
        return false;
    }
  };

  const progress = getFormProgress();

  // 🚫 자동 포커스 완전 차단
  useEffect(() => {
    if (open) {
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
  }, [open]);

  // 🔍 실제 모달 높이 측정 및 표시
  useEffect(() => {
    if (!open) return;

    const measureHeight = () => {
      const modal = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement;
      const debugEl = document.getElementById('add-modal-height-debug');

      if (modal && debugEl) {
        const actualHeight = modal.getBoundingClientRect().height;
        const expectedHeight = Math.round(window.innerHeight * 0.75);
        debugEl.textContent = `신규모달 실제높이: ${Math.round(actualHeight)}px | 75vh: ${expectedHeight}px | 차이: ${Math.round(expectedHeight - actualHeight)}px`;

        // 콘솔에도 로그 출력
        console.log('🔍 신규 고객 모달 높이 디버깅:', {
          실제높이: actualHeight,
          예상높이_75vh: expectedHeight,
          차이: expectedHeight - actualHeight,
          CSS적용상태: getComputedStyle(modal).maxHeight,
        });
      }
    };

    // 모달이 완전히 렌더링된 후 측정
    const timer = setTimeout(measureHeight, 100);

    // 리사이즈 이벤트에도 측정
    window.addEventListener('resize', measureHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureHeight);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[75vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0',
        }}
      >
        {/* 🔍 디버깅: 실제 높이 표시 */}
        <div
          className="absolute top-2 right-16 z-50 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-80"
          id="add-modal-height-debug"
        >
          신규모달 실제높이: 0px | 75vh: {Math.round(window.innerHeight * 0.75)}
          px
        </div>

        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {t('forms.addClient.title', '신규 고객 추가')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {t(
              'forms.addClient.subtitle',
              '새로운 고객 정보를 입력하고 영업 파이프라인에 추가하세요.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
            {/* 진행 상황 표시 */}
            <div className="p-4 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-primary mb-2 sm:mb-3 flex items-center gap-2">
                📋 {t('forms.addClient.progress', '입력 진행률')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {t('forms.addClient.completion', '완성도')}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {getFormProgress()}%
                  </span>
                </div>
                <Progress value={getFormProgress()} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡{' '}
                {t(
                  'forms.addClient.helpText',
                  '필수 정보만 입력해도 고객 등록이 가능합니다'
                )}
              </p>
            </div>

            {/* 탭 네비게이션 */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
                <TabsTrigger
                  value="basic"
                  className="text-xs sm:text-sm relative"
                >
                  {t('forms.addClient.tabs.basic', '기본정보')}
                  {getTabStatus('basic') && (
                    <Check className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="physical"
                  className="text-xs sm:text-sm relative"
                >
                  {t('forms.addClient.tabs.physical', '신체정보')}
                  {getTabStatus('physical') && (
                    <Check className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="text-xs sm:text-sm relative"
                >
                  {t('forms.addClient.tabs.sales', '영업정보')}
                  {getTabStatus('sales') && (
                    <Check className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="insurance"
                  className="text-xs sm:text-sm relative"
                >
                  {t('forms.addClient.tabs.insurance', '보험정보')}
                  {getTabStatus('insurance') && (
                    <Check className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* 🏷️ 기본 정보 탭 */}
              <TabsContent
                value="basic"
                className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
              >
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    👤 {t('forms.addClient.sections.basicInfo', '기본 정보')}
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.fullName', '고객명')}{' '}
                      {t('forms.addClient.options.required', '*')}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t(
                        'forms.addClient.placeholders.fullName',
                        '고객명을 입력하세요'
                      )}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`h-9 sm:h-10 text-xs sm:text-sm ${
                        errors.name ? 'border-destructive' : ''
                      }`}
                      autoFocus={false}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.phone', '전화번호')}{' '}
                      <span className="text-muted-foreground">
                        {t('forms.addClient.options.optional', '(선택사항)')}
                      </span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t(
                        'forms.addClient.placeholders.phone',
                        '010-1234-5678 (선택사항)'
                      )}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={`h-9 sm:h-10 text-xs sm:text-sm ${
                        errors.phone ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.email', '이메일')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t(
                        'forms.addClient.placeholders.email',
                        'example@email.com'
                      )}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`h-9 sm:h-10 text-xs sm:text-sm ${
                        errors.email ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.address', '주소')}
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder={t(
                        'forms.addClient.placeholders.address',
                        '주소를 입력하세요'
                      )}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="occupation"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.occupation', '직업')}
                    </Label>
                    <Input
                      id="occupation"
                      type="text"
                      placeholder={t(
                        'forms.addClient.placeholders.occupation',
                        '직업을 입력하세요'
                      )}
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="telecom"
                        className="text-xs sm:text-sm font-medium"
                      >
                        {t('forms.addClient.fields.telecomProvider', '통신사')}
                      </Label>
                      <Select
                        value={isCustomTelecom ? 'custom' : telecomProvider}
                        onValueChange={value => {
                          if (value === 'custom') {
                            setIsCustomTelecom(true);
                            setTelecomProvider('');
                          } else {
                            setIsCustomTelecom(false);
                            setCustomTelecomProvider('');
                            setTelecomProvider(value);
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue
                            placeholder={t(
                              'forms.addClient.placeholders.telecomProvider',
                              '통신사를 선택하세요'
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-xs sm:text-sm py-2">
                              {t(
                                'forms.addClient.telecom.mainProviders',
                                '주요 통신사'
                              )}
                            </SelectLabel>
                            {telecomProviders.slice(0, 3).map(provider => (
                              <SelectItem
                                key={provider}
                                value={provider}
                                className="text-xs sm:text-sm py-2"
                              >
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel className="text-xs sm:text-sm py-2">
                              {t(
                                'forms.addClient.telecom.mvnoProviders',
                                '알뜰폰'
                              )}
                            </SelectLabel>
                            {telecomProviders.slice(3).map(provider => (
                              <SelectItem
                                key={provider}
                                value={provider}
                                className="text-xs sm:text-sm py-2"
                              >
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel className="text-xs sm:text-sm py-2">
                              🌍{' '}
                              {t(
                                'forms.addClient.telecom.global.other',
                                '기타'
                              )}
                            </SelectLabel>
                            <SelectItem
                              value="custom"
                              className="text-xs sm:text-sm py-2 font-medium"
                            >
                              {t(
                                'forms.addClient.telecom.customInputOption',
                                '기타 (직접 입력)'
                              )}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 🌍 직접 입력 필드 (조건부 표시) */}
                    {isCustomTelecom && (
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          {t(
                            'forms.addClient.telecom.customInput',
                            '직접 입력'
                          )}
                        </Label>
                        <Input
                          type="text"
                          placeholder={t(
                            'forms.addClient.telecom.customInputPlaceholder',
                            '통신사명을 직접 입력하세요'
                          )}
                          value={customTelecomProvider}
                          onChange={e =>
                            setCustomTelecomProvider(e.target.value)
                          }
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'forms.addClient.telecom.exampleText',
                            '💡 예: Verizon, AT&T, T-Mobile, Vodafone 등'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* 💪 신체 정보 탭 */}
              <TabsContent
                value="physical"
                className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
              >
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    💪 {t('forms.addClient.sections.physicalInfo', '신체 정보')}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="height"
                        className="text-xs sm:text-sm font-medium"
                      >
                        {t('forms.addClient.fields.height', '키 (cm)')}
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder={t(
                          'forms.addClient.placeholders.height',
                          '170'
                        )}
                        value={height || ''}
                        onChange={e =>
                          setHeight(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="weight"
                        className="text-xs sm:text-sm font-medium"
                      >
                        {t('forms.addClient.fields.weight', '몸무게 (kg)')}
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder={t(
                          'forms.addClient.placeholders.weight',
                          '70'
                        )}
                        value={weight || ''}
                        onChange={e =>
                          setWeight(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">
                      {t(
                        'forms.addClient.fields.drivingLicense',
                        '운전면허 보유'
                      )}
                    </Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="license-yes"
                          checked={hasDrivingLicense === true}
                          onCheckedChange={checked =>
                            setHasDrivingLicense(checked ? true : undefined)
                          }
                        />
                        <Label
                          htmlFor="license-yes"
                          className="text-xs sm:text-sm cursor-pointer"
                        >
                          {t('forms.addClient.options.hasLicense', '있음')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="license-no"
                          checked={hasDrivingLicense === false}
                          onCheckedChange={checked =>
                            setHasDrivingLicense(checked ? false : undefined)
                          }
                        />
                        <Label
                          htmlFor="license-no"
                          className="text-xs sm:text-sm cursor-pointer"
                        >
                          {t('forms.addClient.options.noLicense', '없음')}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 📊 영업 정보 탭 */}
              <TabsContent
                value="sales"
                className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
              >
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    📊 {t('forms.addClient.sections.salesInfo', '영업 정보')}
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="stage"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.stage', '진행 단계')}{' '}
                      {t('forms.addClient.options.required', '*')}
                    </Label>
                    <Select value={stageId} onValueChange={setStageId}>
                      <SelectTrigger
                        className={`h-9 sm:h-10 text-xs sm:text-sm ${
                          errors.stageId ? 'border-destructive' : ''
                        }`}
                      >
                        <SelectValue
                          placeholder={t(
                            'forms.addClient.placeholders.stage',
                            '진행 단계를 선택하세요'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(stage => (
                          <SelectItem
                            key={stage.id}
                            value={stage.id}
                            className="text-xs sm:text-sm py-2"
                          >
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stageId && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.stageId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="importance"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.importance', '중요도')}
                    </Label>
                    <Select
                      value={importance}
                      onValueChange={(value: 'high' | 'medium' | 'low') =>
                        setImportance(value)
                      }
                    >
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue
                          placeholder={t(
                            'forms.addClient.placeholders.importance',
                            '중요도를 선택하세요'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="high"
                          className="text-xs sm:text-sm py-2"
                        >
                          🔴{' '}
                          {t('forms.addClient.importanceValues.high', '키맨')}
                        </SelectItem>
                        <SelectItem
                          value="medium"
                          className="text-xs sm:text-sm py-2"
                        >
                          🟡{' '}
                          {t('forms.addClient.importanceValues.medium', '보통')}
                        </SelectItem>
                        <SelectItem
                          value="low"
                          className="text-xs sm:text-sm py-2"
                        >
                          🟢 {t('forms.addClient.importanceValues.low', '낮음')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {referrers.length > 0 && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="referrer"
                        className="text-xs sm:text-sm font-medium"
                      >
                        {t('forms.addClient.fields.referrer', '소개자')}
                      </Label>
                      <Select
                        value={referrerId || ''}
                        onValueChange={value =>
                          setReferrerId(value || undefined)
                        }
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue
                            placeholder={t(
                              'forms.addClient.placeholders.referrer',
                              '소개자를 선택하세요'
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value=""
                            className="text-xs sm:text-sm py-2"
                          >
                            {t(
                              'forms.addClient.options.noReferrer',
                              '소개자 없음'
                            )}
                          </SelectItem>
                          {referrers.map(referrer => (
                            <SelectItem
                              key={referrer.id}
                              value={referrer.id}
                              className="text-xs sm:text-sm py-2"
                            >
                              {referrer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="note"
                      className="text-xs sm:text-sm font-medium"
                    >
                      {t('forms.addClient.fields.notes', '메모')}
                    </Label>
                    <Textarea
                      id="note"
                      placeholder={t(
                        'forms.addClient.placeholders.notes',
                        '고객에 대한 메모를 입력하세요'
                      )}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="text-xs sm:text-sm min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">
                      {t('forms.addClient.fields.tags', '태그')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t(
                          'forms.addClient.placeholders.tags',
                          '태그를 입력하고 Enter를 누르세요'
                        )}
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="h-9 sm:h-10 text-xs sm:text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTag}
                        className="h-9 sm:h-10 px-3"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-2 py-1 flex items-center gap-1"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTag(tag)}
                              className="h-auto w-auto p-0 hover:bg-transparent"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* 🛡️ 보험 정보 탭 */}
              <TabsContent
                value="insurance"
                className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                      🛡️{' '}
                      {t('forms.addClient.sections.insuranceInfo', '보험 정보')}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addInsurance('life')}
                        className="text-xs sm:text-sm h-8 px-3"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t(
                          'forms.addClient.buttons.addInsurance.life',
                          '생명보험'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addInsurance('health')}
                        className="text-xs sm:text-sm h-8 px-3"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t(
                          'forms.addClient.buttons.addInsurance.health',
                          '건강보험'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addInsurance('auto')}
                        className="text-xs sm:text-sm h-8 px-3"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t(
                          'forms.addClient.buttons.addInsurance.auto',
                          '자동차보험'
                        )}
                      </Button>
                    </div>
                  </div>

                  {insuranceInfo.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-xs sm:text-sm">
                        {t(
                          'forms.addClient.messages.noInsurance',
                          '등록된 보험 정보가 없습니다'
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t(
                          'forms.addClient.messages.addInsuranceHelp',
                          '위 버튼을 클릭하여 보험 정보를 추가하세요'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insuranceInfo.map(insurance => (
                        <Card key={insurance.id} className="border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                {getInsuranceTypeLabel(insurance.type)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInsurance(insurance.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.insuranceCompany',
                                    '보험사'
                                  )}
                                </Label>
                                <Input
                                  placeholder={t(
                                    'forms.addClient.placeholders.insuranceCompany',
                                    '보험사명'
                                  )}
                                  value={insurance.details.company || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'company',
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.productName',
                                    '상품명'
                                  )}
                                </Label>
                                <Input
                                  placeholder={t(
                                    'forms.addClient.placeholders.productName',
                                    '상품명'
                                  )}
                                  value={insurance.details.productName || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'productName',
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.monthlyPremium',
                                    '보험료 (월)'
                                  )}
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="100000"
                                  value={insurance.details.premium || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'premium',
                                      e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.coverageAmount',
                                    '보장금액'
                                  )}
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="50000000"
                                  value={insurance.details.coverageAmount || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'coverageAmount',
                                      e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.startDate',
                                    '가입일'
                                  )}
                                </Label>
                                <Input
                                  type="date"
                                  value={insurance.details.startDate || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'startDate',
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">
                                  {t(
                                    'forms.addClient.fields.endDate',
                                    '만료일'
                                  )}
                                </Label>
                                <Input
                                  type="date"
                                  value={insurance.details.endDate || ''}
                                  onChange={e =>
                                    updateInsuranceDetails(
                                      insurance.id,
                                      'endDate',
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* 푸터 - 고정 */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-3 p-2 sm:p-6 border-t border-border/30">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
            >
              {t('forms.common.cancel', '취소')}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              <Plus className="h-3 w-3" />
              {t('actions.addClient', '고객 추가')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
