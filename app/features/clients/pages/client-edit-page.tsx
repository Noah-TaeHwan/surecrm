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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Label } from '~/common/components/ui/label';
import { Switch } from '~/common/components/ui/switch';
import {
  ArrowLeftIcon,
  PersonIcon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  Cross2Icon,
  CheckIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

// 유효성 검사 스키마
const formSchema = z.object({
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
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  stage: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  referredBy: z.string().optional(),
  notes: z.string().optional(),
  contractAmount: z.number().min(0).optional(),
  insuranceType: z.string().optional(),
  familySize: z.number().min(1).optional(),
  childrenAges: z.array(z.number()).optional(),
  vehicleType: z.string().optional(),
  drivingExperience: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function loader({ request, params }: Route.LoaderArgs) {
  // 신규 생성인 경우
  if (!params.id) {
    return {
      client: null,
      referrers: [
        { id: '1', name: '박철수' },
        { id: '2', name: '김영희' },
        { id: '3', name: '이민수' },
        { id: '4', name: '정수연' },
      ],
    };
  }

  // 기존 클라이언트 수정인 경우
  const client = {
    id: params.id,
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    company: 'ABC 회사',
    position: '마케팅 팀장',
    address: '서울시 강남구 테헤란로 123',
    status: 'active',
    stage: '첫 상담',
    importance: 'high' as const,
    referredBy: '1',
    tags: ['VIP', '기업', '잠재'],
    notes:
      '적극적으로 보험 가입을 고려하고 있음. 주변 지인들에게도 영향력이 큼.',
    contractAmount: 50000000,
    insuranceType: 'family',
    familySize: 4,
    childrenAges: [10, 8],
    vehicleType: '',
    drivingExperience: 0,
    createdAt: '2023-03-15T09:30:00.000Z',
    updatedAt: '2023-04-02T14:15:00.000Z',
  };

  const referrers = [
    { id: '1', name: '박철수' },
    { id: '2', name: '김영희' },
    { id: '3', name: '이민수' },
    { id: '4', name: '정수연' },
  ];

  return { client, referrers };
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
  const { client, referrers } = loaderData;
  const isNew = !client;

  const [tags, setTags] = useState<string[]>(client?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 폼 초기화
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      phone: client?.phone || '',
      email: client?.email || '',
      company: client?.company || '',
      position: client?.position || '',
      address: client?.address || '',
      stage: client?.stage || '첫 상담',
      importance: client?.importance || 'medium',
      referredBy: client?.referredBy || '',
      notes: client?.notes || '',
      contractAmount: client?.contractAmount || 0,
      insuranceType: client?.insuranceType || '',
      familySize: client?.familySize || 1,
      childrenAges: client?.childrenAges || [],
      vehicleType: client?.vehicleType || '',
      drivingExperience: client?.drivingExperience || 0,
    },
  });

  const watchInsuranceType = form.watch('insuranceType');

  // 중복 고객 검사 (실제로는 API 호출)
  const checkDuplicate = (phone: string) => {
    if (phone === '010-9999-9999') {
      setDuplicateWarning('이미 등록된 고객입니다. (홍길동)');
    } else {
      setDuplicateWarning(null);
    }
  };

  // 태그 추가
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 폼 제출
  const onSubmit = (data: FormData) => {
    console.log('제출 데이터:', { ...data, tags });
    // TODO: 실제 저장 로직
  };

  return (
    <MainLayout title={isNew ? '고객 등록' : '고객 수정'}>
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
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
            {/* 기본 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
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
                      <FormItem>
                        <FormLabel>주소</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="서울시 강남구..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 영업 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>영업 정보</CardTitle>
                <CardDescription>
                  영업 단계와 관련 정보를 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>영업 단계 *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="단계 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="첫 상담">첫 상담</SelectItem>
                            <SelectItem value="니즈 분석">니즈 분석</SelectItem>
                            <SelectItem value="상품 설명">상품 설명</SelectItem>
                            <SelectItem value="계약 검토">계약 검토</SelectItem>
                            <SelectItem value="계약 완료">계약 완료</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="중요도 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">높음</SelectItem>
                            <SelectItem value="medium">보통</SelectItem>
                            <SelectItem value="low">낮음</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="소개자 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">없음</SelectItem>
                            {referrers.map((referrer) => (
                              <SelectItem key={referrer.id} value={referrer.id}>
                                {referrer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          이 고객을 소개한 사람을 선택하세요
                        </FormDescription>
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
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          예상 계약 금액을 원 단위로 입력하세요
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* 태그 관리 */}
                <div className="space-y-2">
                  <Label>태그</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
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
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="새 태그 입력"
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addTag())
                      }
                      className="max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 메모 */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>메모</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="고객에 대한 특이사항이나 중요한 정보를 입력하세요..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 보험 유형별 특화 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>보험 정보</CardTitle>
                <CardDescription>
                  관심 보험 유형별 상세 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="insuranceType"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>주요 관심 보험</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="보험 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="life">생명보험</SelectItem>
                          <SelectItem value="health">건강보험</SelectItem>
                          <SelectItem value="family">가족보험</SelectItem>
                          <SelectItem value="child">태아/어린이보험</SelectItem>
                          <SelectItem value="car">자동차보험</SelectItem>
                          <SelectItem value="pension">연금보험</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* 보험 유형별 동적 필드 */}
                {watchInsuranceType === 'family' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">가족 정보</h4>
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
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {watchInsuranceType === 'child' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">자녀 정보</h4>
                    <div className="space-y-2">
                      <Label>자녀 나이</Label>
                      <div className="text-sm text-muted-foreground">
                        각 자녀의 나이를 입력하세요
                      </div>
                      {/* 간단한 예시 - 실제로는 동적으로 추가/제거 가능하게 구현 */}
                      <Input placeholder="첫째 나이" type="number" />
                      <Input placeholder="둘째 나이" type="number" />
                    </div>
                  </div>
                )}

                {watchInsuranceType === 'car' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">차량 정보</h4>
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>차량 종류</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="차량 종류 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedan">승용차</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="truck">화물차</SelectItem>
                              <SelectItem value="van">승합차</SelectItem>
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
                                field.onChange(parseInt(e.target.value) || 0)
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

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3">
              <Link to="/clients">
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
