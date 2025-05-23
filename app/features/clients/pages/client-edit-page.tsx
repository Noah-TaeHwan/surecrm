import type { Route } from '.react-router/types/app/features/clients/pages/+types/client-edit-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import { Label } from '~/common/components/ui/label';
import { Switch } from '~/common/components/ui/switch';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Separator } from '~/common/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  ArrowLeftIcon,
  PersonIcon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  Cross2Icon,
  CheckIcon,
  PlusIcon,
  CalendarIcon,
  RulerHorizontalIcon,
  UpdateIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

// 확장된 폼 스키마
const extendedClientFormSchema = z.object({
  // 기본 정보
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  phone: z
    .string()
    .regex(
      /^010-\d{4}-\d{4}$/,
      '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
    ),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),

  // 회사 정보
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),

  // 개인 상세 정보
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  ssn: z.string().optional(),

  // 신체 정보
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(20).max(200).optional(),
  hasDrivingLicense: z.boolean().optional(),

  // 영업 정보
  stage: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  referredBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  contractAmount: z.number().min(0).optional(),

  // 보험 관련
  insuranceType: z.string().optional(),
  familySize: z.number().min(1).optional(),
  childrenAges: z.array(z.number()).optional(),
  vehicleType: z.string().optional(),
  drivingExperience: z.number().min(0).optional(),
});

type ExtendedClientFormData = z.infer<typeof extendedClientFormSchema>;

// 폼 옵션들
const formOptions = {
  telecomProviders: [
    'SK텔레콤',
    'KT',
    'LG U+',
    '알뜰폰(SK)',
    '알뜰폰(KT)',
    '알뜰폰(LG)',
  ],
  stages: ['첫 상담', '니즈 분석', '상품 설명', '계약 검토', '계약 완료'],
  importance: [
    { value: 'high', label: '높음' },
    { value: 'medium', label: '보통' },
    { value: 'low', label: '낮음' },
  ],
  commonTags: [
    'VIP',
    '기업',
    '개인',
    '잠재',
    '진행중',
    '완료',
    '교육보험',
    '고액',
    '자영업',
    '투자형',
    '학생',
    '저예산',
    '전문직',
    '세금절약',
    '영향력자',
    '소개자',
    '공무원',
    '교육',
    '안정형',
    '금융업',
    '복합상품',
  ],
  insuranceTypes: [
    { value: 'life', label: '생명보험' },
    { value: 'health', label: '건강보험' },
    { value: 'auto', label: '자동차보험' },
    { value: 'prenatal', label: '태아보험' },
    { value: 'property', label: '재산보험' },
    { value: 'other', label: '기타' },
  ],
  vehicleTypes: ['승용차', 'SUV', '화물차', '승합차', '오토바이', '기타'],
};

export function loader({ request, params }: Route.LoaderArgs) {
  // 신규 생성인 경우
  if (!params.id) {
    return {
      client: null,
      clientDetail: null,
      referrers: [
        { id: '1', name: '박철수' },
        { id: '2', name: '김영희' },
        { id: '3', name: '이민수' },
        { id: '4', name: '정수연' },
      ],
    };
  }

  // 기존 클라이언트 수정인 경우 - 상세 페이지와 동일한 데이터
  const client = {
    id: params.id,
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    telecomProvider: 'SK텔레콤',
    company: 'ABC 회사',
    position: '마케팅 팀장',
    address: '서울시 강남구 테헤란로 123',
    occupation: '마케팅 전문가 (10년 경력, 디지털 마케팅 전문)',
    height: 165,
    weight: 55,
    hasDrivingLicense: true,
    status: 'active',
    stage: '첫 상담',
    importance: 'high' as const,
    referredBy: '1',
    tags: ['VIP', '기업', '잠재'],
    notes:
      '적극적으로 보험 가입을 고려하고 있음. 주변 지인들에게도 영향력이 큼.',
    contractAmount: 50000000,
    insuranceType: 'life',
    familySize: 4,
    childrenAges: [10, 8],
    vehicleType: '',
    drivingExperience: 0,
    createdAt: '2023-03-15T09:30:00.000Z',
    updatedAt: '2023-04-02T14:15:00.000Z',
  };

  const clientDetail = {
    ssn: '900515-2******',
    birthDate: '1990-05-15',
    gender: 'female' as const,
    consentDate: '2024-01-15T10:30:00Z',
  };

  const referrers = [
    { id: '1', name: '박철수' },
    { id: '2', name: '김영희' },
    { id: '3', name: '이민수' },
    { id: '4', name: '정수연' },
  ];

  return { client, clientDetail, referrers };
}

export function action({ request, params }: Route.ActionArgs) {
  // TODO: 실제 저장 로직 구현
  return { success: true };
}

export function meta({ data, params }: Route.MetaArgs) {
  const isNew = !params.id;
  return [
    { title: `${isNew ? '고객 등록' : '고객 수정'} - SureCRM` },
    {
      name: 'description',
      content: `고객 정보를 ${isNew ? '등록' : '수정'}합니다`,
    },
  ];
}

export default function ClientEditPage({ loaderData }: Route.ComponentProps) {
  const { client, clientDetail, referrers } = loaderData;
  const isNew = !client;

  const [tags, setTags] = useState<string[]>(client?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 폼 초기화
  const form = useForm<ExtendedClientFormData>({
    resolver: zodResolver(extendedClientFormSchema),
    defaultValues: {
      name: client?.name || '',
      phone: client?.phone || '',
      email: client?.email || '',
      telecomProvider: client?.telecomProvider || '',
      company: client?.company || '',
      position: client?.position || '',
      address: client?.address || '',
      occupation: client?.occupation || '',
      birthDate: clientDetail?.birthDate || '',
      gender: clientDetail?.gender || undefined,
      ssn: clientDetail?.ssn || '',
      height: client?.height || undefined,
      weight: client?.weight || undefined,
      hasDrivingLicense: client?.hasDrivingLicense || false,
      stage: client?.stage || '첫 상담',
      importance: client?.importance || 'medium',
      referredBy: client?.referredBy || 'none',
      notes: client?.notes || '',
      contractAmount: client?.contractAmount || 0,
      insuranceType: client?.insuranceType || '',
      familySize: client?.familySize || 1,
      childrenAges: client?.childrenAges || [],
      vehicleType: client?.vehicleType || '',
      drivingExperience: client?.drivingExperience || 0,
      tags: client?.tags || [],
    },
  });

  const watchInsuranceType = form.watch('insuranceType');
  const watchHeight = form.watch('height');
  const watchWeight = form.watch('weight');

  // BMI 계산
  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI(watchHeight, watchWeight);

  // 중복 고객 검사
  const checkDuplicate = (phone: string) => {
    if (phone === '010-9999-9999') {
      setDuplicateWarning('이미 등록된 고객입니다. (홍길동)');
    } else {
      setDuplicateWarning(null);
    }
  };

  // 태그 추가
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 폼 제출
  const onSubmit = (data: ExtendedClientFormData) => {
    console.log('제출 데이터:', { ...data, tags });
    // TODO: 실제 저장 로직
  };

  return (
    <MainLayout title={isNew ? '고객 등록' : '고객 수정'}>
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Link to={isNew ? '/clients' : `/clients/${client?.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {isNew ? '고객 목록' : '고객 상세'}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? '새 고객 등록' : '고객 정보 수정'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? '새로운 고객 정보를 입력하세요'
                : '고객 정보를 수정하세요'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="personal">개인 상세</TabsTrigger>
                <TabsTrigger value="sales">영업 정보</TabsTrigger>
                <TabsTrigger value="insurance">보험 관련</TabsTrigger>
              </TabsList>

              {/* 기본 정보 탭 */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>연락처 정보</CardTitle>
                    <CardDescription>
                      고객의 기본적인 연락처 정보를 입력하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이름 *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <PersonIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  className="pl-10"
                                  placeholder="홍길동"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>휴대폰 번호 *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MobileIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  className="pl-10"
                                  placeholder="010-0000-0000"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    checkDuplicate(e.target.value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                            {duplicateWarning && (
                              <p className="text-sm text-yellow-600 mt-1">
                                {duplicateWarning}
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telecomProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>통신사</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="통신사 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {formOptions.telecomProviders.map(
                                  (provider) => (
                                    <SelectItem key={provider} value={provider}>
                                      {provider}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="email"
                                  className="pl-10"
                                  placeholder="example@email.com"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>직장 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>회사명</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HomeIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  className="pl-10"
                                  placeholder="ABC 회사"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>직책</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="팀장" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>주소</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="서울시 강남구 테헤란로 123"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>직업 상세</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="직업에 대한 상세한 설명 (경력, 전문 분야 등)"
                                className="resize-none"
                                rows={3}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 개인 상세 탭 */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>개인 정보</CardTitle>
                    <CardDescription>
                      고객의 개인적인 상세 정보를 입력하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>생년월일</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="date"
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>성별</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="성별 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">남성</SelectItem>
                                <SelectItem value="female">여성</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>주민등록번호</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="예: 900101-1******"
                                type="password"
                              />
                            </FormControl>
                            <FormDescription>
                              민감 정보로 암호화되어 저장됩니다
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>신체 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>키 (cm)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <RulerHorizontalIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="number"
                                  className="pl-10"
                                  placeholder="170"
                                  onChange={(e) =>
                                    field.onChange(
                                      Number(e.target.value) || undefined
                                    )
                                  }
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>몸무게 (kg)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="65"
                                onChange={(e) =>
                                  field.onChange(
                                    Number(e.target.value) || undefined
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {bmi && (
                        <div>
                          <Label>BMI</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold">{bmi}</span>
                            <Badge
                              variant={
                                Number(bmi) < 18.5
                                  ? 'outline'
                                  : Number(bmi) < 25
                                  ? 'default'
                                  : Number(bmi) < 30
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {Number(bmi) < 18.5
                                ? '저체중'
                                : Number(bmi) < 25
                                ? '정상'
                                : Number(bmi) < 30
                                ? '과체중'
                                : '비만'}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="hasDrivingLicense"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                운전 가능
                              </FormLabel>
                              <FormDescription>
                                운전면허 보유 여부
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 영업 정보 탭 */}
              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>영업 현황</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>영업 단계 *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {formOptions.stages.map((stage) => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="importance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>중요도 *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {formOptions.importance.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contractAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>예상 계약금액</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="50000000"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value
                                ? `₩${field.value.toLocaleString()}`
                                : ''}
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="referredBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>소개자</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="소개자 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">직접 방문</SelectItem>
                                {referrers.map((referrer) => (
                                  <SelectItem
                                    key={referrer.id}
                                    value={referrer.id}
                                  >
                                    {referrer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* 태그 관리 */}
                    <div>
                      <Label className="text-base">태그</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <Cross2Icon
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="새 태그 입력"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {formOptions.commonTags
                            .filter((tag) => !tags.includes(tag))
                            .map((tag) => (
                              <Button
                                key={tag}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => setTags([...tags, tag])}
                              >
                                + {tag}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>메모</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="고객에 대한 메모를 입력하세요..."
                              className="resize-none"
                              rows={4}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 보험 관련 탭 */}
              <TabsContent value="insurance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>보험 관련 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="insuranceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>관심 보험 유형</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="보험 유형 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formOptions.insuranceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* 생명보험 관련 추가 정보 */}
                    {watchInsuranceType === 'life' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="familySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>가족 구성원 수</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 1)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* 자동차보험 관련 추가 정보 */}
                    {watchInsuranceType === 'auto' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vehicleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>차량 종류</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="차량 종류 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {formOptions.vehicleTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="drivingExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>운전 경력 (년)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 pt-4">
              <Link to={isNew ? '/clients' : `/clients/${client?.id}`}>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button type="submit">
                <CheckIcon className="mr-2 h-4 w-4" />
                {isNew ? '고객 등록' : '수정 완료'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
