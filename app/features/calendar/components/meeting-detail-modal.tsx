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
  const [notes, setNotes] = useState<MeetingNote[]>(meeting?.notes || []);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 체크리스트 관리 상태
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    meeting?.checklist || []
  );
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 미팅 정보 편집 상태 (🎯 영업 정보 필드 추가)
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState({
    title: meeting?.title || '',
    date: meeting?.date || '',
    time: meeting?.time || '',
    duration: meeting?.duration || 60,
    location: meeting?.location || '',
    description: meeting?.description || '',
    type: meeting?.type || '',
    // 🎯 새로운 영업 정보 필드들
    priority: (meeting as any)?.priority || 'medium',
    expectedOutcome: (meeting as any)?.expectedOutcome || '',
    contactMethod: (meeting as any)?.contactMethod || 'in_person',
    estimatedCommission: (meeting as any)?.estimatedCommission || 0,
    productInterest: (meeting as any)?.productInterest || '',
    // 🌐 구글 캘린더 연동 정보
    syncToGoogle: (meeting as any)?.syncToGoogle || false,
    sendClientInvite: (meeting as any)?.sendClientInvite || false,
    reminder: (meeting as any)?.reminder || '30_minutes',
  });

  if (!meeting) return null;

  const completedTasks = checklist.filter(item => item.completed).length;
  const totalTasks = checklist.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatDate = (dateStr: string, endDateStr?: string) => {
    const startDate = new Date(dateStr);

    // 단일 날짜인 경우
    if (!endDateStr) {
      return startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }

    // 날짜 범위인 경우 (예: 2024년 1월 1일 ~ 3일)
    const endDate = new Date(endDateStr);
    const isSameMonth = startDate.getMonth() === endDate.getMonth();
    const isSameYear = startDate.getFullYear() === endDate.getFullYear();

    if (isSameYear && isSameMonth) {
      return `${startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} ~ ${endDate.getDate()}일`;
    } else if (isSameYear) {
      return `${startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} ~ ${endDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      })}`;
    } else {
      return `${startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} ~ ${endDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;
    }
  };

  const getDurationText = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }
    return `${minutes}분`;
  };

  // 🌐 구글 캘린더 연동 상태 확인
  const isGoogleSynced = (meeting as any).syncToGoogle;
  const googleSyncStatus = (meeting as any)?.syncInfo?.status || 'not_synced';

  // 미팅 타입 정보 가져오기
  const meetingTypeInfo = meetingTypeDetails[meeting.type as keyof typeof meetingTypeDetails];
  const meetingTypeLabel = meetingTypeKoreanMap[meeting.type as keyof typeof meetingTypeKoreanMap] || meeting.type;

  // 우선순위 정보 가져오기
  const priorityInfo = priorityOptions.find(p => p.value === (meeting as any)?.priority) || priorityOptions[1];

  // 연락 방법 정보 가져오기
  const contactMethodInfo = contactMethods.find(c => c.value === (meeting as any)?.contactMethod);

  // 기대 성과 정보 가져오기
  const expectedOutcomeInfo = expectedOutcomes.find(e => e.value === (meeting as any)?.expectedOutcome);

  // 상품 관심 분야 정보 가져오기
  const productInterestInfo = productInterests.find(p => p.value === (meeting as any)?.productInterest);

  // 노트 관리 함수
  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: MeetingNote = {
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
      };
      setNotes([...notes, note]);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  // 체크리스트 관리 함수
  const handleToggleChecklistItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
    onToggleChecklist(meeting.id, itemId);
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
      setIsAddingChecklistItem(false);
    }
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };

  const handleStartEditingItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEditingItem = () => {
    if (editingText.trim()) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === editingItemId
            ? { ...item, text: editingText.trim() }
            : item
        )
      );
    }
    setEditingItemId(null);
    setEditingText('');
  };

  const handleCancelEditing = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const handleStartEditingMeeting = () => {
    setIsEditingMeeting(true);
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
      syncToGoogle: (meeting as any)?.syncToGoogle || false,
      sendClientInvite: (meeting as any)?.sendClientInvite || false,
      reminder: (meeting as any)?.reminder || '30_minutes',
    });
  };

  const handleSaveMeetingChanges = () => {
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
      input.value = value.toString();
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setIsEditingMeeting(false);
  };

  const handleCancelEditingMeeting = () => {
    setIsEditingMeeting(false);
  };

  const handleDeleteMeeting = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Form 제출로 처리
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

    setIsDeleteModalOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={!!meeting} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* 헤더 - 새 미팅 모달과 동일한 구조 */}
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-2 sm:pb-4 border-b border-border/50">
            <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-foreground">
              <div className="flex items-center gap-2">
                {meetingTypeInfo?.icon && <span className="text-lg sm:text-xl">{meetingTypeInfo.icon}</span>}
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              </div>
              <span className="truncate">{meeting.title}</span>
              {/* 우선순위 배지 */}
              <Badge className={cn("text-xs flex-shrink-0", priorityInfo.color)}>
                <span className="mr-1">{priorityInfo.icon}</span>
                {priorityInfo.label}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(meeting.date)} · {meetingTypeLabel}
            </DialogDescription>
          </DialogHeader>

          {/* 콘텐츠 - 스크롤 가능 영역 */}
          <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-4 sm:space-y-6 min-h-0">
            
            {/* 기본 정보 카드 */}
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <InfoCircledIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  미팅 정보
                  {!isEditingMeeting && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEditingMeeting}
                      className="ml-auto h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Pencil2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                
                {!isEditingMeeting ? (
                  /* 보기 모드 */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* 기본 정보 */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground">날짜</div>
                          <div className="text-sm font-medium">{formatDate(meeting.date)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground">시간</div>
                          <div className="text-sm font-medium">
                            {meeting.time || '미설정'} 
                            {meeting.duration && ` (${getDurationText(meeting.duration)})`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <PersonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground">고객</div>
                          <div className="text-sm font-medium">
                            {meeting.client?.name || '미설정'}
                          </div>
                        </div>
                      </div>

                      {meeting.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground">장소</div>
                            <div className="text-sm font-medium">{meeting.location}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 영업 정보 */}
                    <div className="space-y-3 sm:space-y-4">
                      {contactMethodInfo && (
                        <div className="flex items-center gap-3">
                          {contactMethodInfo.icon}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground">연락 방법</div>
                            <div className="text-sm font-medium">{contactMethodInfo.label}</div>
                          </div>
                        </div>
                      )}

                      {expectedOutcomeInfo && (
                        <div className="flex items-center gap-3">
                          <TargetIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground">기대 성과</div>
                            <div className="text-sm font-medium flex items-center gap-1">
                              <span>{expectedOutcomeInfo.icon}</span>
                              {expectedOutcomeInfo.label}
                            </div>
                          </div>
                        </div>
                      )}

                      {productInterestInfo && (
                        <div className="flex items-center gap-3">
                          <StarFilledIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground">관심 상품</div>
                            <div className="text-sm font-medium flex items-center gap-1">
                              <span>{productInterestInfo.icon}</span>
                              {productInterestInfo.label}
                            </div>
                          </div>
                        </div>
                      )}

                      {((meeting as any)?.estimatedCommission || 0) > 0 && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground">예상 수수료</div>
                            <div className="text-sm font-medium">
                              {((meeting as any)?.estimatedCommission || 0).toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 편집 모드 - 새 미팅 모달과 동일한 구조 */
                  <div className="space-y-3 sm:space-y-4">
                    {/* 기본 정보 편집 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">미팅 제목 *</label>
                        <Input
                          value={editedMeeting.title}
                          onChange={(e) => setEditedMeeting(prev => ({ ...prev, title: e.target.value }))}
                          className="h-10 w-full"
                          placeholder="미팅 제목 입력"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">미팅 유형</label>
                        <Select
                          value={editedMeeting.type}
                          onValueChange={(value) => setEditedMeeting(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(meetingTypeDetails)
                              .filter(([key]) => key !== 'google' && key !== 'google_imported')
                              .map(([value, details]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <span>{details.icon}</span>
                                  <span>{details.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">날짜 *</label>
                        <div className="relative w-full">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                          <Input
                            type="date"
                            value={editedMeeting.date}
                            onChange={(e) => setEditedMeeting(prev => ({ ...prev, date: e.target.value }))}
                            className="pl-10 h-10 w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">시간 *</label>
                        <div className="relative w-full">
                          <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                          <Input
                            type="time"
                            value={editedMeeting.time}
                            onChange={(e) => setEditedMeeting(prev => ({ ...prev, time: e.target.value }))}
                            className="pl-10 h-10 w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">우선순위</label>
                        <Select
                          value={editedMeeting.priority}
                          onValueChange={(value) => setEditedMeeting(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <span>{option.icon}</span>
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">연락 방법</label>
                        <Select
                          value={editedMeeting.contactMethod}
                          onValueChange={(value) => setEditedMeeting(prev => ({ ...prev, contactMethod: value }))}
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contactMethods.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  {method.icon}
                                  <span>{method.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 장소 및 설명 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">장소</label>
                      <Input
                        value={editedMeeting.location}
                        onChange={(e) => setEditedMeeting(prev => ({ ...prev, location: e.target.value }))}
                        className="h-10 w-full"
                        placeholder="미팅 장소 입력"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">메모</label>
                      <Textarea
                        value={editedMeeting.description}
                        onChange={(e) => setEditedMeeting(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[80px] resize-none"
                        placeholder="미팅에 대한 추가 정보나 메모를 입력하세요"
                      />
                    </div>

                    {/* 편집 버튼들 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveMeetingChanges}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                      <Button
                        onClick={handleCancelEditingMeeting}
                        variant="outline"
                        size="sm"
                      >
                        <Cross2Icon className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                {/* 설명/메모 (보기 모드에서만) */}
                {!isEditingMeeting && meeting.description && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-2">메모</div>
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-md">
                      {meeting.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 체크리스트 카드 */}
            {(checklist.length > 0 || isAddingChecklistItem) && (
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <CheckCircledIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    체크리스트
                    <Badge variant="secondary" className="text-xs">
                      {completedTasks}/{totalTasks}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingChecklistItem(true)}
                      className="ml-auto h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  {totalTasks > 0 && (
                    <Progress value={progressPercentage} className="h-2" />
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleToggleChecklistItem(item.id)}
                        className="flex-shrink-0"
                      />
                      {editingItemId === item.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditingItem();
                              if (e.key === 'Escape') handleCancelEditing();
                            }}
                            autoFocus
                          />
                          <Button
                            onClick={handleSaveEditingItem}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={handleCancelEditing}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Cross2Icon className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className={cn(
                            "flex-1 text-sm transition-all",
                            item.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          )}>
                            {item.text}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleStartEditingItem(item)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil1Icon className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {isAddingChecklistItem && (
                    <div className="flex gap-2 p-2">
                      <Input
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="새 체크리스트 항목 입력"
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddChecklistItem();
                          if (e.key === 'Escape') setIsAddingChecklistItem(false);
                        }}
                        autoFocus
                      />
                      <Button
                        onClick={handleAddChecklistItem}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => setIsAddingChecklistItem(false)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Cross2Icon className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 노트 카드 */}
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  미팅 노트
                  <Badge variant="secondary" className="text-xs">
                    {notes.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingNote(true)}
                    className="ml-auto h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileTextIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">아직 작성된 노트가 없습니다.</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-md bg-muted/30 border border-border/30">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleString('ko-KR')}
                        </div>
                        <Button
                          onClick={() => handleDeleteNote(note.id)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </div>
                  ))
                )}

                {isAddingNote && (
                  <div className="space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="미팅 노트를 입력하세요..."
                      className="min-h-[100px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddNote}
                        size="sm"
                        disabled={!newNote.trim()}
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        추가
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNote('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Cross2Icon className="h-4 w-4 mr-2" />
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 구글 캘린더 연동 상태 */}
            {isGoogleSynced && (
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    구글 캘린더 연동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        동기화됨
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      양방향 연동
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 푸터 - 새 미팅 모달과 동일한 구조 */}
          <DialogFooter className="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="flex w-full gap-2 sm:gap-3">
              <Button
                onClick={handleDeleteMeeting}
                variant="destructive"
                size="sm"
                className="flex-shrink-0"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                삭제
              </Button>
              <div className="flex-1"></div>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                닫기
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

             {/* 삭제 확인 모달 */}
       <DeleteMeetingModal
         meeting={meeting}
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={handleConfirmDelete}
       />
    </>
  );
}
