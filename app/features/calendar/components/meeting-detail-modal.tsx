import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Progress } from '~/common/components/ui/progress';
import { Textarea } from '~/common/components/ui/textarea';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Separator } from '~/common/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  CheckIcon,
  FileTextIcon,
  GlobeIcon,
  Pencil2Icon,
  PlusIcon,
  Cross2Icon,
  ArrowRightIcon,
  TrashIcon,
  Pencil1Icon,
  TargetIcon,
  ChatBubbleIcon,
  StarFilledIcon,
  LightningBoltIcon,
  VideoIcon,
  MobileIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { MapPin, Phone, DollarSign } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeDetails,
  meetingTypeKoreanMap,
  type Meeting,
  type MeetingNote,
  type ChecklistItem,
} from '../types/types';
import { useState } from 'react';
import { DeleteMeetingModal } from './delete-meeting-modal';
import { useToast } from '~/common/components/ui/toast';

// 🎯 영업 정보 관련 데이터 (새 미팅 예약 모달과 완전 동일)
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

// ⏰ 알림 옵션
const reminderOptions = [
  { value: 'none', label: '알림 없음' },
  { value: '5_minutes', label: '5분 전' },
  { value: '15_minutes', label: '15분 전' },
  { value: '30_minutes', label: '30분 전' },
  { value: '1_hour', label: '1시간 전' },
  { value: '1_day', label: '1일 전' },
];

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  onClose: () => void;
  onToggleChecklist: (meetingId: string, checklistId: string) => void;
}

export function MeetingDetailModal({
  meeting,
  onClose,
  onToggleChecklist,
}: MeetingDetailModalProps) {
  const { success, error } = useToast();
  
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  
  // 편집된 미팅 데이터
  const [editedMeeting, setEditedMeeting] = useState({
    title: meeting?.title || '',
    date: meeting?.date || '',
    time: meeting?.time || '',
    duration: meeting?.duration || 60,
    location: meeting?.location || '',
    description: meeting?.description || '',
    type: meeting?.type || '',
    priority: (meeting as any)?.priority || 'medium',
    expectedOutcome: (meeting as any)?.expectedOutcome || '',
    contactMethod: (meeting as any)?.contactMethod || 'in_person',
    estimatedCommission: (meeting as any)?.estimatedCommission || 0,
    productInterest: (meeting as any)?.productInterest || '',
  });

  if (!meeting) return null;

  // 미팅 타입 정보
  const meetingTypeInfo = meetingTypeDetails[meeting.type as keyof typeof meetingTypeDetails] || {
    label: '일반 미팅',
    icon: '📅',
    color: 'blue',
  };

  // 우선순위 정보 (실제 데이터베이스 값 기반)
  const priorityInfo = priorityOptions.find(
    p => p.value === (meeting as any)?.priority || 'medium'
  ) || priorityOptions[1];

  // 연락 방법 정보
  const contactMethodInfo = contactMethods.find(
    c => c.value === (meeting as any)?.contactMethod || 'in_person'
  ) || contactMethods[2];

  // 기대 성과 정보
  const expectedOutcomeInfo = expectedOutcomes.find(
    o => o.value === (meeting as any)?.expectedOutcome
  );

  // 상품 관심 정보
  const productInterestInfo = productInterests.find(
    p => p.value === (meeting as any)?.productInterest
  );

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '미설정';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  // 시간 포맷팅
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '미설정';
    return timeStr;
  };

  // 소요시간 포맷팅
  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}분`;
    if (duration === 60) return '1시간';
    if (duration < 120) return `1시간 ${duration - 60}분`;
    return `${Math.floor(duration / 60)}시간${duration % 60 ? ` ${duration % 60}분` : ''}`;
  };

  // 수정 저장
  const handleSave = () => {
    // Form 제출로 처리
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'updateMeeting';
    form.appendChild(actionInput);

    const meetingIdInput = document.createElement('input');
    meetingIdInput.name = 'meetingId';
    meetingIdInput.value = meeting.id;
    form.appendChild(meetingIdInput);

    // 편집된 데이터를 모두 추가
    Object.entries(editedMeeting).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value?.toString() || '';
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setIsEditing(false);
    success('미팅 정보가 구글 캘린더와 함께 업데이트되었습니다.');
  };

  // 삭제 처리
  const handleDelete = () => {
    if (confirm('정말로 이 미팅을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';

      const actionInput = document.createElement('input');
      actionInput.name = 'actionType';
      actionInput.value = 'deleteMeeting';
      form.appendChild(actionInput);

      const meetingIdInput = document.createElement('input');
      meetingIdInput.name = 'meetingId';
      meetingIdInput.value = meeting.id;
      form.appendChild(meetingIdInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      onClose();
      success('미팅이 삭제되었습니다.');
    }
  };

  return (
    <Dialog open={!!meeting} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0',
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <DialogTitle className="text-sm sm:text-lg truncate">
              {meeting.title || '제목 없는 미팅'}
            </DialogTitle>
          </div>
          <div className="flex items-center justify-between pt-2">
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(meeting.date)} • {formatTime(meeting.time)}
            </DialogDescription>
            {/* 우선순위 배지 - 적절한 위치로 이동 */}
            <Badge className={cn("text-xs ml-2", priorityInfo.color)}>
              {priorityInfo.icon} {priorityInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-3 sm:space-y-6 min-h-0">
          {/* 미팅 정보 */}
          <div className="space-y-3 sm:space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">미팅 제목 *</Label>
                {isEditing ? (
                  <Input
                    value={editedMeeting.title}
                    onChange={(e) => setEditedMeeting(prev => ({...prev, title: e.target.value}))}
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2">
                    {meeting.title || '미설정'}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">미팅 유형 *</Label>
                {isEditing ? (
                  <Select
                    value={editedMeeting.type}
                    onValueChange={(value) => setEditedMeeting(prev => ({...prev, type: value}))}
                  >
                    <SelectTrigger className="h-10 w-full mt-2">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(meetingTypeDetails).map(([value, details]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <span>{details.icon}</span>
                            <span>{details.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <span>{meetingTypeInfo.icon}</span>
                    <span>{meetingTypeInfo.label}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">고객</Label>
                <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                  <PersonIcon className="h-4 w-4" />
                  <span>{(meeting as any).clientName || '미설정'}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">우선순위</Label>
                {isEditing ? (
                  <Select
                    value={editedMeeting.priority}
                    onValueChange={(value) => setEditedMeeting(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger className="h-10 w-full mt-2">
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <span>{priorityInfo.icon}</span>
                    <span>{priorityInfo.label}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">날짜 *</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedMeeting.date}
                    onChange={(e) => setEditedMeeting(prev => ({...prev, date: e.target.value}))}
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2">
                    {formatDate(meeting.date)}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">시간 *</Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={editedMeeting.time}
                    onChange={(e) => setEditedMeeting(prev => ({...prev, time: e.target.value}))}
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(meeting.time)}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">소요 시간</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={editedMeeting.duration}
                    onChange={(e) => setEditedMeeting(prev => ({...prev, duration: Number(e.target.value)}))}
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2">
                    {formatDuration(meeting.duration || 60)}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">연락 방법</Label>
                {isEditing ? (
                  <Select
                    value={editedMeeting.contactMethod}
                    onValueChange={(value) => setEditedMeeting(prev => ({...prev, contactMethod: value}))}
                  >
                    <SelectTrigger className="h-10 w-full mt-2">
                      <SelectValue placeholder="연락 방법 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <span>{method.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    {contactMethodInfo.icon}
                    <span>{contactMethodInfo.label}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">장소</Label>
                {isEditing ? (
                  <Input
                    value={editedMeeting.location}
                    onChange={(e) => setEditedMeeting(prev => ({...prev, location: e.target.value}))}
                    placeholder="미팅 장소를 입력하세요"
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{meeting.location || '미설정'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">기대 성과</Label>
                {isEditing ? (
                  <Select
                    value={editedMeeting.expectedOutcome}
                    onValueChange={(value) => setEditedMeeting(prev => ({...prev, expectedOutcome: value}))}
                  >
                    <SelectTrigger className="h-10 w-full mt-2">
                      <SelectValue placeholder="기대 성과 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {expectedOutcomes.map((outcome) => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          <div className="flex items-center gap-2">
                            <span>{outcome.icon}</span>
                            <span>{outcome.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <span>{expectedOutcomeInfo?.icon || '📝'}</span>
                    <span>{expectedOutcomeInfo?.label || '미설정'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">상품 관심 분야</Label>
                {isEditing ? (
                  <Select
                    value={editedMeeting.productInterest}
                    onValueChange={(value) => setEditedMeeting(prev => ({...prev, productInterest: value}))}
                  >
                    <SelectTrigger className="h-10 w-full mt-2">
                      <SelectValue placeholder="상품 관심 분야 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {productInterests.map((product) => (
                        <SelectItem key={product.value} value={product.value}>
                          <div className="flex items-center gap-2">
                            <span>{product.icon}</span>
                            <span>{product.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <span>{productInterestInfo?.icon || '📋'}</span>
                    <span>{productInterestInfo?.label || '미설정'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">예상 수수료 (원)</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    placeholder="100,000"
                    value={
                      editedMeeting.estimatedCommission
                        ? Number(editedMeeting.estimatedCommission).toLocaleString('ko-KR')
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setEditedMeeting(prev => ({
                        ...prev, 
                        estimatedCommission: value ? Number(value) : 0
                      }));
                    }}
                    className="h-10 w-full mt-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 py-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {(meeting as any).estimatedCommission 
                        ? `${Number((meeting as any).estimatedCommission).toLocaleString()}원`
                        : '미설정'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 메모 영역 (구글 캘린더 설명과 연동) */}
            <div>
              <Label className="text-sm font-medium text-foreground">미팅 메모</Label>
              {isEditing ? (
                <Textarea
                  value={editedMeeting.description}
                  onChange={(e) => setEditedMeeting(prev => ({...prev, description: e.target.value}))}
                  placeholder="• 준비해야 할 자료&#10;• 논의할 주제&#10;• 고객 특이사항 등"
                  className="resize-none mt-2"
                  rows={3}
                />
              ) : (
                <div className="text-sm text-muted-foreground mt-2 py-2 min-h-[60px] whitespace-pre-wrap border rounded-md px-3 py-2 bg-muted/20">
                  {meeting.description || '메모가 없습니다.'}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                구글 캘린더 일정의 설명 부분에 자동으로 동기화됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 - 고정 */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-3 p-2 sm:p-6 border-t border-border/30">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // 원래 데이터로 복원
                    setEditedMeeting({
                      title: meeting?.title || '',
                      date: meeting?.date || '',
                      time: meeting?.time || '',
                      duration: meeting?.duration || 60,
                      location: meeting?.location || '',
                      description: meeting?.description || '',
                      type: meeting?.type || '',
                      priority: (meeting as any)?.priority || 'medium',
                      expectedOutcome: (meeting as any)?.expectedOutcome || '',
                      contactMethod: (meeting as any)?.contactMethod || 'in_person',
                      estimatedCommission: (meeting as any)?.estimatedCommission || 0,
                      productInterest: (meeting as any)?.productInterest || '',
                    });
                  }}
                  className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Cross2Icon className="h-3 w-3 mr-2" />
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
                >
                  <CheckIcon className="h-3 w-3" />
                  저장
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <TrashIcon className="h-3 w-3 mr-2" />
                  삭제
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                >
                  닫기
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
                >
                  <Pencil1Icon className="h-3 w-3" />
                  수정
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
