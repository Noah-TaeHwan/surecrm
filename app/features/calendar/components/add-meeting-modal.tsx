import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
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
import { Button } from '~/common/components/ui/button';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  CalendarIcon,
  InfoCircledIcon,
  ClockIcon,
  PersonIcon,
  BellIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ChatBubbleIcon,
  TargetIcon,
} from '@radix-ui/react-icons';
import { VideoIcon, Phone, MapPin, DollarSign } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router';
import { type Client } from '../types/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Separator } from '~/common/components/ui/separator';

// 🎯 개선된 미팅 폼 스키마 - 실용적 기능 추가
const meetingSchema = z.object({
  title: z.string().min(1, '미팅 제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string().min(1, '날짜를 선택하세요'),
  time: z.string().min(1, '시간을 선택하세요'),
  duration: z.number().min(15, '최소 15분').max(480, '최대 8시간'),
  type: z.string().min(1, '미팅 유형을 선택하세요'),
  location: z.string().optional(),
  description: z.string().optional(),
  reminder: z.string(),
  // 🌐 구글 캘린더 연동 옵션 (기본 ON)
  syncToGoogle: z.boolean(),
  googleMeetLink: z.boolean(),
  // 📧 자동 초대 기능
  sendClientInvite: z.boolean(),
  // 🎯 새로운 실용적 기능들
  priority: z.string(),
  expectedOutcome: z.string().optional(),
  contactMethod: z.string(),
  // 💰 영업 관련 (보험설계사 특화)
  estimatedCommission: z.number().optional(),
  productInterest: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

// 🎨 미팅 유형 정의 - 구글 캘린더 연동 최적화
const meetingTypes = [
  {
    value: 'first_consultation',
    label: '초회 상담',
    description: '신규 고객과의 첫 상담',
    color: 'bg-emerald-500',
    googleCategory: 'consultation',
    icon: '🤝',
  },
  {
    value: 'follow_up',
    label: '후속 상담',
    description: '기존 고객 후속 미팅',
    color: 'bg-blue-500',
    googleCategory: 'follow-up',
    icon: '📞',
  },
  {
    value: 'product_explanation',
    label: '상품 설명',
    description: '보험 상품 상세 설명',
    color: 'bg-purple-500',
    googleCategory: 'presentation',
    icon: '📋',
  },
  {
    value: 'contract_review',
    label: '계약 검토',
    description: '계약서 검토 및 서명',
    color: 'bg-orange-500',
    googleCategory: 'contract',
    icon: '📄',
  },
  {
    value: 'contract_signing',
    label: '계약 체결',
    description: '최종 계약 체결 미팅',
    color: 'bg-green-600',
    googleCategory: 'contract',
    icon: '✍️',
  },
  {
    value: 'claim_support',
    label: '보험금 청구 지원',
    description: '보험금 청구 관련 상담',
    color: 'bg-red-500',
    googleCategory: 'support',
    icon: '🆘',
  },
  {
    value: 'other',
    label: '기타',
    description: '기타 미팅',
    color: 'bg-gray-500',
    googleCategory: 'other',
    icon: '📝',
  },
];

// ⏰ 알림 옵션
const reminderOptions = [
  { value: 'none', label: '알림 없음' },
  { value: '5_minutes', label: '5분 전' },
  { value: '15_minutes', label: '15분 전' },
  { value: '30_minutes', label: '30분 전' },
  { value: '1_hour', label: '1시간 전' },
  { value: '1_day', label: '1일 전' },
];

// ⏱️ 소요 시간 옵션
const durationOptions = [
  { value: 30, label: '30분', icon: '⚡', desc: '간단 상담' },
  { value: 45, label: '45분', icon: '📝', desc: '기본 미팅' },
  { value: 60, label: '1시간', icon: '💼', desc: '상세 상담' },
  { value: 90, label: '1시간 30분', icon: '📋', desc: '심화 상담' },
  { value: 120, label: '2시간', icon: '📊', desc: '포괄 상담' },
  { value: 180, label: '3시간', icon: '🎯', desc: '집중 상담' },
];

// 🎯 미팅 우선순위
const priorityOptions = [
  {
    value: 'low',
    label: '낮음',
    color: 'bg-gray-100 text-gray-700',
    icon: '⚪',
  },
  {
    value: 'medium',
    label: '보통',
    color: 'bg-blue-100 text-blue-700',
    icon: '🔵',
  },
  {
    value: 'high',
    label: '높음',
    color: 'bg-orange-100 text-orange-700',
    icon: '🟠',
  },
  {
    value: 'urgent',
    label: '긴급',
    color: 'bg-red-100 text-red-700',
    icon: '🔴',
  },
];

// 📞 연락 방법
const contactMethods = [
  { value: 'phone', label: '전화', icon: <Phone className="h-4 w-4" /> },
  {
    value: 'video',
    label: '화상통화',
    icon: <VideoIcon className="h-4 w-4" />,
  },
  { value: 'in_person', label: '대면', icon: <MapPin className="h-4 w-4" /> },
  {
    value: 'hybrid',
    label: '혼합',
    icon: <ChatBubbleIcon className="h-4 w-4" />,
  },
];

// 🏆 기대 성과
const expectedOutcomes = [
  { value: 'information_gathering', label: '정보 수집', icon: '📊' },
  { value: 'needs_analysis', label: '니즈 분석', icon: '🔍' },
  { value: 'proposal_presentation', label: '제안서 발표', icon: '📋' },
  { value: 'objection_handling', label: '이의 제기 해결', icon: '💭' },
  { value: 'contract_discussion', label: '계약 논의', icon: '📄' },
  { value: 'closing', label: '계약 체결', icon: '✅' },
  { value: 'relationship_building', label: '관계 구축', icon: '🤝' },
];

// 🏢 보험 상품 관심 분야
const productInterests = [
  { value: 'life', label: '생명보험', icon: '💗' },
  { value: 'health', label: '건강보험', icon: '🏥' },
  { value: 'auto', label: '자동차보험', icon: '🚗' },
  { value: 'prenatal', label: '태아보험', icon: '👶' },
  { value: 'property', label: '재산보험', icon: '🏠' },
  { value: 'pension', label: '연금보험', icon: '💰' },
  { value: 'investment', label: '투자형 보험', icon: '📈' },
  { value: 'multiple', label: '복합 상품', icon: '🎯' },
];

// 🎯 미팅 유형별 기본 체크리스트 반환 (calendar-data.ts와 동일)
function getDefaultChecklistByType(meetingType: string): string[] {
  const checklistMap: Record<string, string[]> = {
    first_consultation: [
      '고객 정보 확인',
      '상담 자료 준비',
      '니즈 분석 시트 작성',
      '다음 미팅 일정 협의',
    ],
    product_explanation: [
      '상품 설명서 준비',
      '견적서 작성',
      '비교 상품 자료 준비',
      '고객 질문 사항 정리',
    ],
    contract_review: [
      '계약서 검토',
      '약관 설명',
      '서명 및 날인',
      '초회 보험료 수납',
    ],
    follow_up: ['이전 미팅 내용 검토', '진행 사항 확인', '추가 요청 사항 파악'],
    contract_signing: [
      '최종 계약서 확인',
      '보험료 납입 안내',
      '증권 발급 절차 설명',
      '사후 서비스 안내',
    ],
    claim_support: [
      '청구 서류 확인',
      '청구 절차 안내',
      '필요 서류 안내',
      '진행 상황 업데이트',
    ],
  };

  return checklistMap[meetingType] || [];
}

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSubmit: (data: MeetingFormData) => void;
  googleCalendarConnected?: boolean;
}

export function AddMeetingModal({
  isOpen,
  onClose,
  clients,
  onSubmit,
  googleCalendarConnected = false,
}: AddMeetingModalProps) {
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: '',
      date: '',
      time: '',
      duration: 60,
      type: '',
      location: '',
      description: '',
      reminder: '30_minutes',
      // 🌐 구글 캘린더 동기화 기본 ON (사용자 요구사항)
      syncToGoogle: googleCalendarConnected,
      googleMeetLink: false,
      sendClientInvite: true,
      // 🎯 새로운 기본값들
      priority: 'medium',
      expectedOutcome: '',
      contactMethod: 'in_person',
      estimatedCommission: undefined,
      productInterest: '',
    },
  });

  // 선택된 고객 정보
  const selectedClientId = form.watch('clientId');
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // 미팅 제목 자동 생성
  const selectedType = form.watch('type');
  const selectedMeetingType = meetingTypes.find(
    (t) => t.value === selectedType
  );

  // 제목 자동 업데이트
  React.useEffect(() => {
    if (selectedClient && selectedMeetingType && !form.getValues('title')) {
      const clientName =
        (selectedClient as any).fullName ||
        (selectedClient as any).name ||
        '고객';
      const autoTitle = `${clientName}님 ${selectedMeetingType.label}`;
      form.setValue('title', autoTitle);
    }
  }, [selectedClient, selectedMeetingType, form]);

  // 🎯 연락 방법에 따른 자동 설정
  const contactMethod = form.watch('contactMethod');
  React.useEffect(() => {
    if (contactMethod === 'video') {
      form.setValue('googleMeetLink', true);
      form.setValue('location', '온라인 (Google Meet)');
    } else if (contactMethod === 'phone') {
      form.setValue('googleMeetLink', false);
      form.setValue('location', '전화 상담');
    } else if (contactMethod === 'in_person' || contactMethod === 'hybrid') {
      form.setValue('googleMeetLink', false);
      form.setValue('location', ''); // 대면/혼합인 경우 빈 값
    }
  }, [contactMethod, form]);

  const handleSubmit = (data: MeetingFormData) => {
    // Form 데이터를 실제 POST 요청으로 제출
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.style.display = 'none';

    // actionType 추가
    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'createMeeting';
    formElement.appendChild(actionInput);

    // 폼 데이터 추가
    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = String(value);
      formElement.appendChild(input);
    });

    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);

    // 모달 닫기 및 폼 리셋
    onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CalendarIcon className="h-5 w-5 text-primary" />새 미팅 예약
          </DialogTitle>
          <DialogDescription>
            고객과의 미팅을 예약하고 구글 캘린더와 자동 동기화합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3"
          >
            {/* 🚨 고객 없는 경우 안내 */}
            {clients.length === 0 && (
              <Alert>
                <InfoCircledIcon className="h-4 w-4" />
                <AlertDescription>
                  미팅을 예약하려면 먼저 고객을 등록해야 합니다.{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    asChild
                    className="h-auto p-0 underline"
                  >
                    <Link to="/clients">고객 등록하러 가기</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 📋 기본 정보 */}
            <Card className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PersonIcon className="h-4 w-4" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {/* 고객 선택 & 미팅 유형 */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">고객 선택</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="고객 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {(client as any).fullName ||
                                      (client as any).name ||
                                      '고객'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">미팅 유형</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {meetingTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 미팅 제목 */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">미팅 제목</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="예: 김영희님 초회 상담"
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 우선순위 & 연락 방법 */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">우선순위</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{option.icon}</span>
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">연락 방법</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contactMethods.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                <div className="flex items-center gap-2">
                                  {method.icon}
                                  <span>{method.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ⏰ 일정 정보 */}
            <Card className="bg-card text-card-foreground flex flex-col rounded-xl border  shadow-sm">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  일정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {/* 날짜 & 시간 */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">날짜</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">시간</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 소요 시간 */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">소요 시간</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({option.desc})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 장소 */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">미팅 장소</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="예: 고객 사무실, 카페, 온라인"
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 알림 설정 */}
                <FormField
                  control={form.control}
                  name="reminder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">미팅 알림</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reminderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 🌐 구글 캘린더 연동 옵션 */}
            <Card
              className={`bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm ${
                googleCalendarConnected
                  ? 'border-emerald-200'
                  : 'border-amber-200'
              }`}
            >
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  구글 캘린더 연동
                  {googleCalendarConnected && (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 text-xs"
                    >
                      <CheckCircledIcon className="mr-1 h-3 w-3" />
                      연결됨
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                {googleCalendarConnected ? (
                  <div className="grid grid-cols-1 gap-3">
                    <FormField
                      control={form.control}
                      name="syncToGoogle"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-2">
                          <div>
                            <FormLabel className="text-xs font-medium">
                              자동 동기화
                            </FormLabel>
                            <FormDescription className="text-xs">
                              구글 캘린더 추가
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

                    <FormField
                      control={form.control}
                      name="googleMeetLink"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-2">
                          <div>
                            <FormLabel className="text-xs font-medium">
                              Meet 링크
                            </FormLabel>
                            <FormDescription className="text-xs">
                              화상통화 링크
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

                    <FormField
                      control={form.control}
                      name="sendClientInvite"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-2">
                          <div>
                            <FormLabel className="text-xs font-medium">
                              초대장 발송
                            </FormLabel>
                            <FormDescription className="text-xs">
                              고객 이메일 전송
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!(selectedClient as any)?.email}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <Alert>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      구글 캘린더 연동이 설정되지 않았습니다.{' '}
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        asChild
                        className="h-auto p-0 underline"
                      >
                        <Link to="/settings">설정에서 연동하기</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 🎯 영업 정보 */}
            <Card className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TargetIcon className="h-4 w-4" />
                  영업 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {/* 기대 성과 & 상품 관심사 */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="expectedOutcome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">기대 성과</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="목표 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expectedOutcomes.map((outcome) => (
                              <SelectItem
                                key={outcome.value}
                                value={outcome.value}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{outcome.icon}</span>
                                  <span>{outcome.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">관심 상품</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="상품 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productInterests.map((product) => (
                              <SelectItem
                                key={product.value}
                                value={product.value}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{product.icon}</span>
                                  <span>{product.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estimatedCommission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        예상 수수료 (원)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="100,000"
                          className="h-9"
                          value={
                            field.value
                              ? Number(field.value).toLocaleString('ko-KR')
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? Number(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 📝 메모 & 준비사항 */}
            <Card className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ChatBubbleIcon className="h-4 w-4" />
                  메모 & 준비사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">미팅 메모</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="• 준비해야 할 자료&#10;• 논의할 주제&#10;• 고객 특이사항 등"
                          rows={4}
                          className="resize-none text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 🎯 미팅 유형별 자동 체크리스트 미리보기 */}
                {selectedMeetingType && (
                  <div className="space-y-2">
                    <FormLabel className="text-xs">
                      기본 체크리스트 (미팅 생성 후 자동 추가됨)
                    </FormLabel>
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      {getDefaultChecklistByType(selectedMeetingType.value).map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <div className="w-3 h-3 border border-muted-foreground rounded-sm flex items-center justify-center">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            </div>
                            <span>{item}</span>
                          </div>
                        )
                      )}
                      {getDefaultChecklistByType(selectedMeetingType.value)
                        .length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          이 미팅 유형에는 기본 체크리스트가 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 📱 선택된 고객 정보 미리보기 */}
            {selectedClient && (
              <Alert className="border-emerald-200">
                <PersonIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {(selectedClient as any).fullName ||
                          (selectedClient as any).name ||
                          '고객'}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {selectedClient.phone} •{' '}
                        {(selectedClient as any).email || '이메일 없음'}
                      </span>
                    </div>
                    <Link to={`/clients/${selectedClient.id}`}>
                      <Button variant="outline" size="sm">
                        고객 정보 보기
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 버튼 영역 */}
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={clients.length === 0}
                className="flex-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                미팅 예약하기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
