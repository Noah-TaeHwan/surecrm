import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Label } from '~/common/components/ui/label';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  Cross2Icon,
  BellIcon,
  LockClosedIcon,
  EyeClosedIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import type { ClientPrivacyLevel } from '../types';

// 🔒 **보안 강화된 미팅 스키마**
const secureMeetingSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(100, '제목이 너무 깁니다'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string().min(1, '날짜를 선택하세요'),
  time: z.string().min(1, '시간을 선택하세요'),
  duration: z.number().min(15, '최소 15분').max(480, '최대 8시간'),
  type: z.string().min(1, '미팅 유형을 선택하세요'),
  location: z
    .string()
    .min(1, '장소를 입력하세요')
    .max(200, '장소명이 너무 깁니다'),
  description: z.string().max(1000, '메모가 너무 깁니다').optional(),
  reminder: z.string(),
  repeat: z.string(),
  // 🔒 보안 관련 필드들
  meetingPrivacyLevel: z.enum([
    'public',
    'restricted',
    'private',
    'confidential',
  ]),
  containsSensitiveInfo: z.boolean(),
  dataProcessingConsent: z.boolean(),
  recordingConsent: z.boolean().optional(),
  attendeeConfidentiality: z.boolean(),
});

type SecureMeetingFormData = z.infer<typeof secureMeetingSchema>;

// 🔒 **보안 감사 로그 인터페이스**
interface MeetingSecurityLog {
  id: string;
  timestamp: string;
  action: string;
  meetingId?: string;
  clientId: string;
  agentId: string;
  details: string;
  privacyLevel: ClientPrivacyLevel;
  ipAddress?: string;
}

// 🔒 **보안 강화된 미팅 유형들**
const secureMeetingTypes = [
  {
    value: '첫 상담',
    label: '첫 상담',
    privacyLevel: 'restricted' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '신규 고객 초기 상담',
  },
  {
    value: '니즈 분석',
    label: '니즈 분석',
    privacyLevel: 'private' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '고객 요구사항 상세 분석',
  },
  {
    value: '건강정보 상담',
    label: '건강정보 상담',
    privacyLevel: 'confidential' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '민감한 건강정보 논의',
  },
  {
    value: '금융정보 검토',
    label: '금융정보 검토',
    privacyLevel: 'confidential' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '재정 상태 및 투자 정보',
  },
  {
    value: '가족정보 상담',
    label: '가족정보 상담',
    privacyLevel: 'private' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '가족 구성원 관련 논의',
  },
  {
    value: '상품 설명',
    label: '상품 설명',
    privacyLevel: 'restricted' as ClientPrivacyLevel,
    requiresConsent: false,
    description: '보험 상품 소개 및 설명',
  },
  {
    value: '계약 검토',
    label: '계약 검토',
    privacyLevel: 'private' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '계약서 내용 검토',
  },
  {
    value: '계약 체결',
    label: '계약 체결',
    privacyLevel: 'confidential' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '정식 계약 체결',
  },
  {
    value: '정기 점검',
    label: '정기 점검',
    privacyLevel: 'restricted' as ClientPrivacyLevel,
    requiresConsent: false,
    description: '기존 계약 정기 점검',
  },
  {
    value: '클레임 상담',
    label: '클레임 상담',
    privacyLevel: 'confidential' as ClientPrivacyLevel,
    requiresConsent: true,
    description: '보험금 청구 관련 상담',
  },
];

// 🔒 **보안 강화된 장소 옵션들**
const secureLocationOptions = [
  { value: '본사 상담실', label: '본사 상담실', isSecure: true },
  { value: '지점 회의실', label: '지점 회의실', isSecure: true },
  { value: '고객 사무실', label: '고객 사무실', isSecure: false },
  { value: '고객 자택', label: '고객 자택', isSecure: false },
  { value: '화상회의', label: '화상회의', isSecure: true },
  { value: '카페/음식점', label: '카페/음식점', isSecure: false },
];

// 🔒 **알림 옵션 (보안 고려)**
const secureReminderOptions = [
  { value: '0', label: '알림 없음', security: 'low' },
  { value: '15', label: '15분 전', security: 'medium' },
  { value: '30', label: '30분 전', security: 'medium' },
  { value: '60', label: '1시간 전', security: 'high' },
  { value: '1440', label: '1일 전', security: 'high' },
  { value: '2880', label: '2일 전', security: 'medium' },
];

// 🔒 **반복 옵션 (보안 고려)**
const secureRepeatOptions = [
  { value: 'none', label: '반복 없음', privacy: 'low' },
  { value: 'daily', label: '매일', privacy: 'medium' },
  { value: 'weekly', label: '매주', privacy: 'medium' },
  { value: 'monthly', label: '매월', privacy: 'high' },
  { value: 'quarterly', label: '분기별', privacy: 'high' },
];

interface AddMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
  onMeetingAdded?: (meeting: any) => void;
  // 🔒 보안 강화 props
  enableSecurity?: boolean;
  currentUserRole?: 'agent' | 'manager' | 'admin';
  agentId?: string;
  onSecurityAudit?: (log: MeetingSecurityLog) => void;
}

export function AddMeetingModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  onMeetingAdded,
  enableSecurity = false,
  currentUserRole = 'agent',
  agentId = '',
  onSecurityAudit,
}: AddMeetingModalProps) {
  const [selectedMeetingType, setSelectedMeetingType] =
    useState<string>('첫 상담');
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const form = useForm<SecureMeetingFormData>({
    resolver: zodResolver(secureMeetingSchema),
    defaultValues: {
      title: '',
      clientId: clientId || '',
      date: '',
      time: '',
      duration: 60,
      type: '첫 상담',
      location: '',
      description: '',
      reminder: '30',
      repeat: 'none',
      meetingPrivacyLevel: 'restricted' as ClientPrivacyLevel,
      containsSensitiveInfo: false,
      dataProcessingConsent: false,
      recordingConsent: false,
      attendeeConfidentiality: false,
    },
  });

  // TODO: 실제 앱에서는 API에서 가져와야 함
  const availableClients = [
    { id: '1', name: '김영희' },
    { id: '2', name: '이철수' },
    { id: '3', name: '박지민' },
    { id: '4', name: '최민수' },
    { id: '5', name: '정수연' },
  ];

  // 🔒 **보안 감사 로깅 함수**
  const logSecurityAction = (
    action: string,
    details: string,
    privacyLevel: ClientPrivacyLevel = 'restricted'
  ) => {
    if (!enableSecurity || !onSecurityAudit) return;

    const log: MeetingSecurityLog = {
      id: `meeting_audit_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      clientId: clientId || form.getValues('clientId'),
      agentId: agentId,
      details,
      privacyLevel,
      ipAddress: undefined, // 실제 환경에서는 IP 추적
    };

    onSecurityAudit(log);
    console.log(`🔒 [미팅보안] ${action}: ${details}`);
  };

  // 🔒 **미팅 타입 변경 핸들러**
  const handleMeetingTypeChange = (type: string) => {
    setSelectedMeetingType(type);
    const meetingTypeInfo = secureMeetingTypes.find(t => t.value === type);

    if (meetingTypeInfo) {
      form.setValue('meetingPrivacyLevel', meetingTypeInfo.privacyLevel);
      form.setValue('containsSensitiveInfo', meetingTypeInfo.requiresConsent);

      if (meetingTypeInfo.privacyLevel === 'confidential') {
        setShowPrivacyWarning(true);
        logSecurityAction(
          'HIGH_PRIVACY_MEETING_SELECTED',
          `기밀 미팅 타입 선택: ${type}`,
          'confidential'
        );
      }
    }
  };

  // 🔒 **장소 보안 검증**
  const getLocationSecurityLevel = (
    location: string
  ): { isSecure: boolean; warning?: string } => {
    const locationInfo = secureLocationOptions.find(
      loc => loc.value === location
    );

    if (!locationInfo?.isSecure) {
      return {
        isSecure: false,
        warning:
          '이 장소는 보안이 보장되지 않습니다. 민감한 정보 논의 시 주의하세요.',
      };
    }

    return { isSecure: true };
  };

  // 🔒 **개인정보 보호 레벃 뱃지**
  const getPrivacyLevelBadge = (level: ClientPrivacyLevel) => {
    const badgeConfig = {
      public: { variant: 'secondary' as const, icon: null, label: '공개' },
      restricted: {
        variant: 'outline' as const,
        icon: <EyeClosedIcon className="w-3 h-3" />,
        label: '제한',
      },
      private: {
        variant: 'default' as const,
        icon: <LockClosedIcon className="w-3 h-3" />,
        label: '비공개',
      },
      confidential: {
        variant: 'destructive' as const,
        icon: <ExclamationTriangleIcon className="w-3 h-3" />,
        label: '기밀',
      },
    };

    const config = badgeConfig[level];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // 🔒 **데이터 처리 동의 확인**
  const validateConsents = (): { isValid: boolean; message?: string } => {
    const formData = form.getValues();

    if (formData.containsSensitiveInfo && !formData.dataProcessingConsent) {
      return {
        isValid: false,
        message: '민감한 정보를 다루는 미팅은 데이터 처리 동의가 필요합니다.',
      };
    }

    if (
      formData.meetingPrivacyLevel === 'confidential' &&
      !formData.attendeeConfidentiality
    ) {
      return {
        isValid: false,
        message: '기밀 미팅은 참석자 기밀유지 동의가 필요합니다.',
      };
    }

    return { isValid: true };
  };

  const onSubmit = (data: SecureMeetingFormData) => {
    // 🔒 동의 사항 검증
    const consentValidation = validateConsents();
    if (!consentValidation.isValid) {
      alert(consentValidation.message);
      return;
    }

    // 🔒 장소 보안 검증
    const locationSecurity = getLocationSecurityLevel(data.location);
    if (
      !locationSecurity.isSecure &&
      data.meetingPrivacyLevel === 'confidential'
    ) {
      const confirmed = confirm(
        `${locationSecurity.warning}\n\n기밀 미팅을 이 장소에서 진행하시겠습니까?`
      );
      if (!confirmed) return;
    }

    const newMeeting = {
      id: Date.now().toString(),
      title: data.title,
      client: availableClients.find(c => c.id === data.clientId) || {
        id: data.clientId,
        name: clientName || '알 수 없음',
      },
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      location: data.location,
      description: data.description,
      status: 'scheduled' as const,
      reminder: data.reminder,
      repeat: data.repeat,
      checklist: [],
      createdAt: new Date().toISOString(),
      // 🔒 보안 필드들
      meetingPrivacyLevel: data.meetingPrivacyLevel,
      containsSensitiveInfo: data.containsSensitiveInfo,
      dataProcessingConsent: data.dataProcessingConsent,
      recordingConsent: data.recordingConsent,
      attendeeConfidentiality: data.attendeeConfidentiality,
      locationSecurity: locationSecurity.isSecure,
    };

    // 🔒 보안 감사 로깅
    logSecurityAction(
      'MEETING_CREATED',
      `새 미팅 생성: ${data.title} (${data.meetingPrivacyLevel})`,
      data.meetingPrivacyLevel
    );

    console.log('🔒 보안 강화된 새 미팅 추가:', newMeeting);
    onMeetingAdded?.(newMeeting);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 미팅 예약</DialogTitle>
          <DialogDescription>
            고객과의 미팅 일정을 예약합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>미팅 제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder="김영희님 첫 상담" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>고객 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="고객 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {secureMeetingTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
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
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="time" className="pl-10" {...field} />
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
                    <FormLabel>소요 시간 (분)</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">1시간</SelectItem>
                        <SelectItem value="90">1시간 30분</SelectItem>
                        <SelectItem value="120">2시간</SelectItem>
                        <SelectItem value="180">3시간</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 장소 및 설명 */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소 *</FormLabel>
                  <FormControl>
                    <Input placeholder="카페 스타벅스 강남점" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="미팅 목적, 준비사항 등을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    미팅의 목적이나 특별한 준비사항을 입력하세요.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* 알림 및 반복 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알림 설정</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <BellIcon className="mr-2 h-4 w-4" />
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {secureReminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
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
                name="repeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>반복 설정</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {secureRepeatOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <Cross2Icon className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button type="submit">
                <CheckIcon className="mr-2 h-4 w-4" />
                미팅 예약
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
