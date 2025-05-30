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

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  referrers: { id: string; name: string }[];
  initialStageId?: string;
  onAddClient: (client: {
    name: string;
    phone: string;
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
  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState('basic');

  // 기본 정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [telecomProvider, setTelecomProvider] = useState('');

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

  // 통신사 목록
  const telecomProviders = ['SKT', 'KT', 'LG U+', '알뜰폰'];

  // 초기 단계 ID가 변경되면 업데이트
  useEffect(() => {
    if (initialStageId) {
      setStageId(initialStageId);
    }
  }, [initialStageId]);

  // 폼 완성도 계산
  const getFormProgress = () => {
    let completed = 0;
    let total = 4; // 필수 항목들

    if (name.trim()) completed++;
    if (phone.trim()) completed++;
    if (stageId) completed++;
    if (importance) completed++;

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
      newErrors.name = '고객명을 입력해주세요';
    }

    if (!phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!stageId) {
      newErrors.stageId = '진행 단계를 선택해주세요';
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
    setTags(tags.filter((tag) => tag !== tagToRemove));
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
    setInsuranceInfo(insuranceInfo.filter((ins) => ins.id !== id));
  };

  const updateInsuranceDetails = (id: string, field: string, value: any) => {
    setInsuranceInfo(
      insuranceInfo.map((ins) =>
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

    onAddClient({
      name,
      phone,
      email: email || undefined,
      address: address || undefined,
      occupation: occupation || undefined,
      telecomProvider: telecomProvider || undefined,
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
        return '자동차보험';
      case 'prenatal':
        return '태아보험';
      case 'health':
        return '건강보험';
      case 'life':
        return '생명보험';
      case 'property':
        return '재산보험';
      default:
        return '기타보험';
    }
  };

  const getTabStatus = (tabValue: string) => {
    switch (tabValue) {
      case 'basic':
        return name && phone && !errors.name && !errors.phone && !errors.email;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 space-y-3">
          <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
            <User className="h-5 w-5 text-primary" />
            <span>새 고객 추가</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            고객 정보를 입력하여 파이프라인에 추가하세요.
          </DialogDescription>
          <div className="flex items-center space-x-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground font-medium min-w-[35px]">
              {progress}%
            </span>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0 mb-4 h-15">
              <TabsTrigger
                value="basic"
                className="flex items-center gap-1.5 text-sm py-2"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">기본정보</span>
                {getTabStatus('basic') && (
                  <Check className="h-3 w-3 text-green-600" />
                )}
                {(errors.name || errors.phone || errors.email) && (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="personal"
                className="flex items-center gap-1.5 text-sm py-2"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">개인정보</span>
                {getTabStatus('personal') && (
                  <Check className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="insurance"
                className="flex items-center gap-1.5 text-sm py-2"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">보험정보</span>
                {insuranceInfo.length > 0 && (
                  <Check className="h-3 w-3 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="flex items-center gap-1.5 text-sm py-2"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">영업정보</span>
                {getTabStatus('sales') && (
                  <Check className="h-3 w-3 text-green-600" />
                )}
                {errors.stageId && (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="basic" className="space-y-4 m-0 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>고객명</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          const newErrors = { ...errors };
                          delete newErrors.name;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="홍길동"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>전화번호</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          const newErrors = { ...errors };
                          delete newErrors.phone;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="010-0000-0000"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      이메일
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          const newErrors = { ...errors };
                          delete newErrors.email;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="example@email.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telecom" className="text-sm font-medium">
                      통신사
                    </Label>
                    <Select
                      value={telecomProvider}
                      onValueChange={setTelecomProvider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="통신사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {telecomProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    주소
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="서울시 강남구..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 m-0 p-1">
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    직업
                  </Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="회사원, 자영업 등"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-medium">
                      키 (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={height || ''}
                      onChange={(e) =>
                        setHeight(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="170"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium">
                      몸무게 (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight || ''}
                      onChange={(e) =>
                        setWeight(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="70"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">운전 가능 여부</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="driving-yes"
                        checked={hasDrivingLicense === true}
                        onCheckedChange={(checked) =>
                          setHasDrivingLicense(checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="driving-yes" className="text-sm">
                        운전 가능
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="driving-no"
                        checked={hasDrivingLicense === false}
                        onCheckedChange={(checked) =>
                          setHasDrivingLicense(checked ? false : undefined)
                        }
                      />
                      <Label htmlFor="driving-no" className="text-sm">
                        운전 불가
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4 m-0 p-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">보험 정보</Label>
                  <Select
                    onValueChange={(value) =>
                      addInsurance(value as InsuranceInfo['type'])
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="보험 추가" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">자동차보험</SelectItem>
                      <SelectItem value="prenatal">태아보험</SelectItem>
                      <SelectItem value="health">건강보험</SelectItem>
                      <SelectItem value="life">생명보험</SelectItem>
                      <SelectItem value="property">재산보험</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {insuranceInfo.map((insurance) => (
                  <Card key={insurance.id} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {getInsuranceTypeLabel(insurance.type)}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInsurance(insurance.id!)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {insurance.type === 'prenatal' && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">출생 예정일</Label>
                              <Input
                                type="date"
                                value={insurance.details.dueDate || ''}
                                onChange={(e) =>
                                  updateInsuranceDetails(
                                    insurance.id!,
                                    'dueDate',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">임신 방법</Label>
                              <Select
                                value={insurance.details.conceptionMethod || ''}
                                onValueChange={(value) =>
                                  updateInsuranceDetails(
                                    insurance.id!,
                                    'conceptionMethod',
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="natural">
                                    자연임신
                                  </SelectItem>
                                  <SelectItem value="ivf">시험관</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`abortion-prev-${insurance.id}`}
                                checked={
                                  insurance.details.abortionPreventionMeds ||
                                  false
                                }
                                onCheckedChange={(checked) =>
                                  updateInsuranceDetails(
                                    insurance.id!,
                                    'abortionPreventionMeds',
                                    checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`abortion-prev-${insurance.id}`}
                                className="text-xs"
                              >
                                유산방지제
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`abnormal-${insurance.id}`}
                                checked={
                                  insurance.details.abnormalFindings || false
                                }
                                onCheckedChange={(checked) =>
                                  updateInsuranceDetails(
                                    insurance.id!,
                                    'abnormalFindings',
                                    checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`abnormal-${insurance.id}`}
                                className="text-xs"
                              >
                                태아 이상소견
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`disability-${insurance.id}`}
                                checked={
                                  insurance.details.disabilityTestFindings ||
                                  false
                                }
                                onCheckedChange={(checked) =>
                                  updateInsuranceDetails(
                                    insurance.id!,
                                    'disabilityTestFindings',
                                    checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`disability-${insurance.id}`}
                                className="text-xs"
                              >
                                장애검사 이상
                              </Label>
                            </div>
                          </div>
                        </>
                      )}

                      {insurance.type === 'auto' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">차량번호</Label>
                            <Input
                              value={insurance.details.vehicleNumber || ''}
                              onChange={(e) =>
                                updateInsuranceDetails(
                                  insurance.id!,
                                  'vehicleNumber',
                                  e.target.value
                                )
                              }
                              placeholder="12가3456"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">차량 소유자</Label>
                            <Input
                              value={insurance.details.ownerName || ''}
                              onChange={(e) =>
                                updateInsuranceDetails(
                                  insurance.id!,
                                  'ownerName',
                                  e.target.value
                                )
                              }
                              placeholder="홍길동"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">차종</Label>
                            <Input
                              value={insurance.details.vehicleType || ''}
                              onChange={(e) =>
                                updateInsuranceDetails(
                                  insurance.id!,
                                  'vehicleType',
                                  e.target.value
                                )
                              }
                              placeholder="승용차"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">제조사</Label>
                            <Input
                              value={insurance.details.manufacturer || ''}
                              onChange={(e) =>
                                updateInsuranceDetails(
                                  insurance.id!,
                                  'manufacturer',
                                  e.target.value
                                )
                              }
                              placeholder="현대"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="sales" className="space-y-4 m-0 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="stage"
                      className="flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>진행 단계</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={stageId}
                      onValueChange={(value) => {
                        setStageId(value);
                        if (errors.stageId) {
                          const newErrors = { ...errors };
                          delete newErrors.stageId;
                          setErrors(newErrors);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={errors.stageId ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="단계 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>영업 단계</SelectLabel>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.stageId && (
                      <p className="text-xs text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.stageId}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importance" className="text-sm font-medium">
                      중요도 *
                    </Label>
                    <Select
                      value={importance}
                      onValueChange={(val) =>
                        setImportance(val as 'high' | 'medium' | 'low')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="중요도 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>중요도</SelectLabel>
                          <SelectItem value="high">높음</SelectItem>
                          <SelectItem value="medium">중간</SelectItem>
                          <SelectItem value="low">낮음</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referrer" className="text-sm font-medium">
                    소개자
                  </Label>
                  <Select value={referrerId} onValueChange={setReferrerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="소개자 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>소개자</SelectLabel>
                        {referrers.map((referrer) => (
                          <SelectItem key={referrer.id} value={referrer.id}>
                            {referrer.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">태그</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1.5 py-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="태그 입력"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm font-medium">
                    메모
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="고객에 대한 메모를 입력하세요"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="pt-6 flex-shrink-0 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!name || !phone || !stageId}
              className="min-w-[80px]"
            >
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
