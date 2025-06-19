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
  CheckIcon,
} from '@radix-ui/react-icons';
import { VideoIcon, Phone, MapPin, DollarSign } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router';
import { type Client, meetingTypeDetails } from '../types/types';
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
  // 🌐 구글 캘린더는 항상 연동됨 (필드 제거)
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

// 🎨 미팅 유형 배열 (통일된 정의 사용)
const meetingTypes = Object.entries(meetingTypeDetails)
  .filter(([key]) => key !== 'google' && key !== 'google_imported') // 구글 이벤트는 생성 시 제외
  .map(([value, details]) => ({
    value,
    label: details.label,
    description: details.description,
    icon: details.icon,
    googleCategory: details.googleCategory,
    expectedDuration: details.expectedDuration,
    priority: details.priority,
  }));

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
  onSubmit?: (data: MeetingFormData) => void;
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
      // 🌐 구글 캘린더 연동은 항상 활성화 (필드 제거)
      googleMeetLink: false,
      sendClientInvite: true,
      // 🎯 새로운 기본값들
      priority: 'medium',
      expectedOutcome: '',
      contactMethod: 'phone',
      estimatedCommission: undefined,
      productInterest: '',
    },
  });

  // 선택된 고객 정보
  const selectedClientId = form.watch('clientId');
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // 미팅 제목 자동 생성
  const selectedType = form.watch('type');
  const selectedMeetingType = meetingTypes.find(t => t.value === selectedType);

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
    // 🚀 구글 캘린더에 직접 저장 (단일 소스 방식)
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.style.display = 'none';

    // actionType 설정
    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'createMeeting';
    formElement.appendChild(actionInput);

    // 모든 form 데이터를 hidden input으로 추가
    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value?.toString() || '';
      formElement.appendChild(input);
    });

    // form 제출
    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);
    
    // 선택적 onSubmit 콜백 호출
    if (onSubmit) {
      onSubmit(data);
    }
    
    handleClose();
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0'
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">새 미팅 예약</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            고객과의 미팅을 예약하고 구글 캘린더와 자동 동기화합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <Form {...form}>
            <form
              id="meeting-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3 sm:space-y-6"
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

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객 선택 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="고객 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                <PersonIcon className="h-4 w-4" />
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
                      <FormLabel>미팅 유형 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {meetingTypes.map(type => (
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

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>미팅 제목 *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="예: 김영희님 초회 상담"
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우선순위</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map(option => (
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>날짜 *</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                          <Input type="date" className="pl-10 h-10 w-full" {...field} />
                        </div>
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
                      <FormLabel>시간 *</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                          <Input type="time" className="pl-10 h-10 w-full" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>소요 시간</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="시간 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map(option => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락 방법</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactMethods.map(method => (
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

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>장소</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                          <Input placeholder="미팅 장소" className="pl-10 h-10 w-full" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>알림</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reminderOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <BellIcon className="h-4 w-4" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedOutcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기대 성과</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="성과 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expectedOutcomes.map(outcome => (
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
                      <FormLabel>관심 상품</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="상품 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productInterests.map(product => (
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

                <FormField
                  control={form.control}
                  name="estimatedCommission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예상 수수료 (원)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="100,000"
                          value={
                            field.value
                              ? Number(field.value).toLocaleString('ko-KR')
                              : ''
                          }
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? Number(value) : undefined);
                          }}
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value ? `₩${field.value.toLocaleString()}` : ''}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              {/* 동기화 설정 */}
              <div className="space-y-4">
                <FormLabel className="text-sm font-medium text-foreground">
                  동기화 및 알림 설정
                </FormLabel>
                
                <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 border border-border/50 rounded-lg bg-muted/20">
                  {/* 구글 캘린더 자동 동기화 안내 */}
                  <div className="flex items-center justify-between p-3 border border-emerald-200 rounded-md bg-background">
                    <div className="flex items-start space-x-3 flex-1 min-w-0 pr-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          구글 캘린더 자동 등록
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          모든 미팅이 구글 캘린더에 자동으로 등록됩니다
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center h-10 px-3 text-sm font-medium text-muted-foreground flex-shrink-0">
                      활성화됨
                    </div>
                  </div>

                  {/* 고객 초대 발송 토글 */}
                  <FormField
                    control={form.control}
                    name="sendClientInvite"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-3 border border-border/30 rounded-md bg-background">
                        <div className="flex items-start space-x-3 flex-1 min-w-0 pr-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BellIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <FormLabel className="font-medium text-sm text-foreground">
                              고객 초대 발송
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground mt-1">
                              선택한 고객에게 미팅 초대를 이메일로 발송합니다
                            </FormDescription>
                          </div>
                        </div>
                        <div className="flex items-center h-10 px-3 flex-shrink-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 메모 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>미팅 메모</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="• 준비해야 할 자료&#10;• 논의할 주제&#10;• 고객 특이사항 등"
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      구글 캘린더 일정의 설명 부분에 자동으로 동기화됩니다
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* 📱 선택된 고객 정보 미리보기 */}
              {selectedClient && (
                <Alert className="border-emerald-200 ">
                  <PersonIcon className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {(selectedClient as any).fullName ||
                            (selectedClient as any).name ||
                            '고객'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedClient.phone && (
                            <span>{selectedClient.phone}</span>
                          )}
                          {selectedClient.phone && (selectedClient as any).email && (
                            <span className="mx-2">•</span>
                          )}
                          {(selectedClient as any).email && (
                            <span>{(selectedClient as any).email}</span>
                          )}
                          {!selectedClient.phone && !(selectedClient as any).email && (
                            <span>연락처 정보 없음</span>
                          )}
                        </div>
                      </div>
                      <Link to={`/clients/${selectedClient.id}`} className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          고객 정보 보기
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
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
            <Button 
              type="submit"
              form="meeting-form"
              disabled={clients.length === 0}
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              <CheckIcon className="h-3 w-3" />
              미팅 예약하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
