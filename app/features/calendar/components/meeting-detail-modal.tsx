import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
} from '@radix-ui/react-icons';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  type Meeting,
  type MeetingNote,
  type ChecklistItem,
} from '../types/types';
import { useState } from 'react';
import { DeleteMeetingModal } from './delete-meeting-modal';

// 🎯 영업 정보 관련 데이터 (새 미팅 예약 모달과 동일)
const priorityOptions = [
  { value: 'low', label: '낮음', color: 'bg-gray-500' },
  { value: 'medium', label: '보통', color: 'bg-blue-500' },
  { value: 'high', label: '높음', color: 'bg-orange-500' },
  { value: 'urgent', label: '긴급', color: 'bg-red-500' },
];

// 📞 연락 방법
const contactMethods = [
  { value: 'phone', label: '전화', icon: '📞' },
  { value: 'video', label: '화상통화', icon: '📹' },
  { value: 'in_person', label: '대면', icon: '👥' },
  { value: 'hybrid', label: '혼합', icon: '💬' },
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
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  };

  const handleStartEditingItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEditingItem = () => {
    if (editingText.trim() && editingItemId) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === editingItemId
            ? { ...item, text: editingText.trim() }
            : item
        )
      );
      setEditingItemId(null);
      setEditingText('');
    }
  };

  const handleCancelEditing = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  // 미팅 정보 편집 함수
  const handleStartEditingMeeting = () => {
    setIsEditingMeeting(true);
    setEditedMeeting({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      location: meeting.location,
      description: meeting.description || '',
      type: meeting.type,
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
    // 실제 form 제출로 미팅 업데이트
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.style.display = 'none';

    // actionType 추가
    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'updateMeeting';
    formElement.appendChild(actionInput);

    // meetingId 추가
    const meetingIdInput = document.createElement('input');
    meetingIdInput.name = 'meetingId';
    meetingIdInput.value = meeting.id;
    formElement.appendChild(meetingIdInput);

    // 편집된 데이터 추가 (🎯 영업 정보 포함)
    Object.entries(editedMeeting).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      // estimatedCommission은 숫자에서 콤마 제거 후 전송
      if (key === 'estimatedCommission') {
        input.value = value ? String(value).replace(/[^0-9]/g, '') : '0';
      } else {
        input.value = String(value);
      }
      formElement.appendChild(input);
    });

    // 현재 상태 추가
    const statusInput = document.createElement('input');
    statusInput.name = 'status';
    statusInput.value = meeting.status;
    formElement.appendChild(statusInput);

    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);

    setIsEditingMeeting(false);
  };

  const handleCancelEditingMeeting = () => {
    setIsEditingMeeting(false);
  };

  const handleDeleteMeeting = () => {
    // 🎨 커스텀 삭제 모달 표시
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // 🗑️ 실제 form 제출로 미팅 삭제 (구글 캘린더 연동 포함)
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.style.display = 'none';

    // actionType 추가
    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'deleteMeeting';
    formElement.appendChild(actionInput);

    // meetingId 추가
    const meetingIdInput = document.createElement('input');
    meetingIdInput.name = 'meetingId';
    meetingIdInput.value = meeting.id;
    formElement.appendChild(meetingIdInput);

    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);

    onClose();
  };

  const meetingTypes = Object.keys(meetingTypeColors);

  return (
    <Dialog open={!!meeting} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-6xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '85vh',
          height: 'auto',
          minHeight: '0'
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {isEditingMeeting ? (
                <Input
                  value={editedMeeting.title}
                  onChange={e =>
                    setEditedMeeting(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-2xl sm:text-3xl font-bold border-none p-0 h-auto shadow-none focus-visible:ring-0"
                  placeholder="미팅 제목"
                />
              ) : (
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {meeting.title}
                </DialogTitle>
              )}
              <DialogDescription className="text-xs sm:text-base text-muted-foreground">
                미팅 상세 정보 및 체크리스트
              </DialogDescription>

              {/* 🌐 구글 캘린더 연동 상태 뱃지 */}
              {(meeting as any).syncToGoogle && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  <GlobeIcon className="w-3 h-3 mr-1" />
                  구글 캘린더 연동됨
                </Badge>
              )}
            </div>
            {isEditingMeeting ? (
              <Select
                value={editedMeeting.type}
                onValueChange={value =>
                  setEditedMeeting(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge
                className={cn(
                  'text-white font-medium px-4 py-2 text-sm',
                  meetingTypeColors[
                    meeting.type as keyof typeof meetingTypeColors
                  ]
                )}
              >
                {meeting.type}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          {/* 기본 정보 - 개선된 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarIcon className="w-5 h-5" />
                <span className="font-medium">날짜</span>
              </div>
              {isEditingMeeting ? (
                <Input
                  type="date"
                  value={editedMeeting.date}
                  onChange={e =>
                    setEditedMeeting(prev => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="font-semibold text-lg pl-8"
                />
              ) : (
                <div className="pl-8 space-y-2">
                  {meeting.date ? (
                    <>
                      <div className="font-semibold text-lg">
                        {formatDate(meeting.date)}
                      </div>
                      {/* 미팅 상태 표시 */}
                      <div className="flex items-center gap-2">
                        {meeting.status === 'scheduled' && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            📅 예정됨
                          </Badge>
                        )}
                        {meeting.status === 'completed' && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            ✅ 완료됨
                          </Badge>
                        )}
                        {meeting.status === 'cancelled' && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            ❌ 취소됨
                          </Badge>
                        )}
                        {meeting.status === 'rescheduled' && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            🔄 일정 변경됨
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic font-semibold text-lg">
                      날짜 미설정
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ClockIcon className="w-5 h-5" />
                <span className="font-medium">시간</span>
              </div>
              {isEditingMeeting ? (
                <div className="flex gap-3 pl-8">
                  <Input
                    type="time"
                    value={editedMeeting.time}
                    onChange={e =>
                      setEditedMeeting(prev => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="font-semibold"
                  />
                  <Select
                    value={editedMeeting.duration.toString()}
                    onValueChange={value =>
                      setEditedMeeting(prev => ({
                        ...prev,
                        duration: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30분</SelectItem>
                      <SelectItem value="45">45분</SelectItem>
                      <SelectItem value="60">1시간</SelectItem>
                      <SelectItem value="90">1시간 30분</SelectItem>
                      <SelectItem value="120">2시간</SelectItem>
                      <SelectItem value="180">3시간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="font-semibold text-lg pl-8">
                  {meeting.time ? (
                    `${meeting.time} (${getDurationText(meeting.duration)})`
                  ) : (
                    <span className="text-muted-foreground italic">
                      시간 미설정
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">장소</span>
              </div>
              {isEditingMeeting ? (
                <Input
                  value={editedMeeting.location}
                  onChange={e =>
                    setEditedMeeting(prev => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="font-semibold text-lg pl-8"
                  placeholder="미팅 장소"
                />
              ) : (
                <div className="font-semibold text-lg pl-8">
                  {meeting.location && meeting.location.trim() ? (
                    meeting.location
                  ) : (
                    <span className="text-muted-foreground italic">
                      장소 미설정
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <PersonIcon className="w-5 h-5" />
                <span className="font-medium">고객</span>
              </div>
              <div className="font-semibold text-lg pl-8">
                <Link 
                  to={`/clients/${meeting.client.id}`}
                  className="text-primary hover:underline"
                >
                  {meeting.client.name}
                </Link>
              </div>
            </div>
          </div>

          {/* 🎯 영업 정보 섹션 */}
          <Separator />
          <Card className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
            <CardHeader className="pb-1 px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                영업 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 우선순위 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">우선순위</label>
                  {isEditingMeeting ? (
                    <Select
                      value={editedMeeting.priority}
                      onValueChange={value =>
                        setEditedMeeting(prev => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(priority => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  priority.color
                                )}
                              />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          priorityOptions.find(
                            p => p.value === (meeting as any)?.priority
                          )?.color || 'bg-blue-500'
                        )}
                      />
                      <span className="font-medium">
                        {priorityOptions.find(
                          p => p.value === (meeting as any)?.priority
                        )?.label || '보통'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 연락 방법 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">연락 방법</label>
                  {isEditingMeeting ? (
                    <Select
                      value={editedMeeting.contactMethod}
                      onValueChange={value =>
                        setEditedMeeting(prev => ({
                          ...prev,
                          contactMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contactMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <span>{method.icon}</span>
                              <span>{method.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>
                        {contactMethods.find(
                          m => m.value === (meeting as any)?.contactMethod
                        )?.icon || '👥'}
                      </span>
                      <span className="font-medium">
                        {contactMethods.find(
                          m => m.value === (meeting as any)?.contactMethod
                        )?.label || '대면'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 기대 성과 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">기대 성과</label>
                  {isEditingMeeting ? (
                    <Select
                      value={editedMeeting.expectedOutcome}
                      onValueChange={value =>
                        setEditedMeeting(prev => ({
                          ...prev,
                          expectedOutcome: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="성과 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {expectedOutcomes.map(outcome => (
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
                    <div className="flex items-center gap-2">
                      <span>
                        {expectedOutcomes.find(
                          o => o.value === (meeting as any)?.expectedOutcome
                        )?.icon || '💬'}
                      </span>
                      <span className="font-medium">
                        {expectedOutcomes.find(
                          o => o.value === (meeting as any)?.expectedOutcome
                        )?.label || '상담 진행'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 관심 상품 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">관심 상품</label>
                  {isEditingMeeting ? (
                    <Select
                      value={editedMeeting.productInterest}
                      onValueChange={value =>
                        setEditedMeeting(prev => ({
                          ...prev,
                          productInterest: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상품 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {productInterests.map(product => (
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
                    <div className="flex items-center gap-2">
                      <span>
                        {productInterests.find(
                          p => p.value === (meeting as any)?.productInterest
                        )?.icon || '🎯'}
                      </span>
                      <span className="font-medium">
                        {productInterests.find(
                          p => p.value === (meeting as any)?.productInterest
                        )?.label || '복합 상품'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 예상 수수료 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">예상 수수료 (원)</label>
                {isEditingMeeting ? (
                  <Input
                    type="text"
                    placeholder="100,000"
                    value={
                      editedMeeting.estimatedCommission
                        ? Number(
                            editedMeeting.estimatedCommission
                          ).toLocaleString('ko-KR')
                        : ''
                    }
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setEditedMeeting(prev => ({
                        ...prev,
                        estimatedCommission: value ? Number(value) : 0,
                      }));
                    }}
                  />
                ) : (
                  <div className="font-medium text-lg">
                    {(meeting as any)?.estimatedCommission
                      ? `${Number(
                          (meeting as any).estimatedCommission
                        ).toLocaleString('ko-KR')}원`
                      : '미정'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🌐 구글 캘린더 연동 정보 */}
          <Card className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
            <CardHeader className="pb-1 px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                구글 캘린더 연동
                {/* 연동 상태 표시 */}
                {isGoogleSynced && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800 text-xs"
                  >
                    연동됨
                  </Badge>
                )}
              </CardTitle>
              {/* 연동 상태 설명 */}
              <p className="text-sm text-muted-foreground mt-1">
                {isGoogleSynced
                  ? '이 미팅은 구글 캘린더와 자동으로 동기화됩니다'
                  : '구글 캘린더 연동이 비활성화되어 있습니다'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">자동 동기화</label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        isEditingMeeting
                          ? editedMeeting.syncToGoogle
                          : (meeting as any)?.syncToGoogle
                      }
                      onCheckedChange={checked =>
                        isEditingMeeting &&
                        setEditedMeeting(prev => ({
                          ...prev,
                          syncToGoogle: !!checked,
                        }))
                      }
                      disabled={!isEditingMeeting}
                    />
                    <span className="text-sm">
                      {(
                        isEditingMeeting
                          ? editedMeeting.syncToGoogle
                          : (meeting as any)?.syncToGoogle
                      )
                        ? '켜짐'
                        : '꺼짐'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">고객 초대</label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        isEditingMeeting
                          ? editedMeeting.sendClientInvite
                          : (meeting as any)?.sendClientInvite
                      }
                      onCheckedChange={checked =>
                        isEditingMeeting &&
                        setEditedMeeting(prev => ({
                          ...prev,
                          sendClientInvite: !!checked,
                        }))
                      }
                      disabled={!isEditingMeeting}
                    />
                    <span className="text-sm">
                      {(
                        isEditingMeeting
                          ? editedMeeting.sendClientInvite
                          : (meeting as any)?.sendClientInvite
                      )
                        ? '발송'
                        : '미발송'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">알림</label>
                  {isEditingMeeting ? (
                    <Select
                      value={editedMeeting.reminder}
                      onValueChange={value =>
                        setEditedMeeting(prev => ({
                          ...prev,
                          reminder: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15_minutes">15분 전</SelectItem>
                        <SelectItem value="30_minutes">30분 전</SelectItem>
                        <SelectItem value="1_hour">1시간 전</SelectItem>
                        <SelectItem value="1_day">1일 전</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm font-medium">
                      {((meeting as any)?.reminder === '15_minutes' &&
                        '15분 전') ||
                        ((meeting as any)?.reminder === '30_minutes' &&
                          '30분 전') ||
                        ((meeting as any)?.reminder === '1_hour' &&
                          '1시간 전') ||
                        ((meeting as any)?.reminder === '1_day' && '1일 전') ||
                        '30분 전'}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {(meeting.description || isEditingMeeting) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  미팅 설명
                </h3>
                {isEditingMeeting ? (
                  <Textarea
                    value={editedMeeting.description}
                    onChange={e =>
                      setEditedMeeting(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="미팅 설명을 입력하세요..."
                    className="text-base leading-relaxed min-h-24"
                    rows={4}
                  />
                ) : (
                  <p className="text-base leading-relaxed bg-muted/30 p-4 rounded-lg">
                    {meeting.description}
                  </p>
                )}
              </div>
            </>
          )}

          {/* 편집 모드 액션 버튼 */}
          {isEditingMeeting && (
            <div className="flex gap-3 justify-end bg-muted/20 p-4 rounded-lg">
              <Button
                variant="outline"
                onClick={handleCancelEditingMeeting}
                className="gap-2"
              >
                <Cross2Icon className="w-4 h-4" />
                취소
              </Button>
              <Button onClick={handleSaveMeetingChanges} className="gap-2">
                <CheckIcon className="w-4 h-4" />
                저장
              </Button>
            </div>
          )}

          {/* 체크리스트 */}
          <Separator />
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">
                체크리스트 ({completedTasks}/{totalTasks})
              </h3>
              <div className="flex items-center gap-3">
                <Progress
                  value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                  className="w-24 h-2"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingChecklistItem(true)}
                  className="gap-2"
                  disabled={isEditingMeeting}
                >
                  <PlusIcon className="w-4 h-4" />
                  추가
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-sm transition-all duration-200"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggleChecklistItem(item.id)}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEditingItem();
                          if (e.key === 'Escape') handleCancelEditing();
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEditingItem}
                        disabled={!editingText.trim()}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditing}
                      >
                        <Cross2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1">
                      <span
                        className={cn(
                          'text-base',
                          item.completed
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        )}
                      >
                        {item.text}
                      </span>
                      {!isEditingMeeting && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEditingItem(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil1Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isAddingChecklistItem && (
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                  <Checkbox disabled className="w-5 h-5" />
                  <Input
                    placeholder="새 체크리스트 항목을 입력하세요..."
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddChecklistItem();
                      if (e.key === 'Escape') {
                        setIsAddingChecklistItem(false);
                        setNewChecklistItem('');
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddChecklistItem}
                      disabled={!newChecklistItem.trim()}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingChecklistItem(false);
                        setNewChecklistItem('');
                      }}
                    >
                      <Cross2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {checklist.length === 0 && !isAddingChecklistItem && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base font-medium mb-1">
                    체크리스트가 비어있습니다
                  </p>
                  <p className="text-sm">첫 번째 항목을 추가해보세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 미팅 기록 */}
          <Separator />
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">미팅 기록</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingNote(true)}
                className="gap-2"
                disabled={isEditingMeeting}
              >
                <PlusIcon className="w-4 h-4" />
                기록 추가
              </Button>
            </div>

            {notes.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="p-5 border rounded-xl group hover:shadow-md transition-all duration-200 bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-muted-foreground font-medium">
                        {new Date(note.createdAt).toLocaleString('ko-KR')}
                      </span>
                      {!isEditingMeeting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium mb-1">
                  아직 작성된 기록이 없습니다
                </p>
                <p className="text-sm">미팅 후 기록을 남겨보세요</p>
              </div>
            )}

            {isAddingNote && (
              <div className="space-y-4 p-5 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                <Textarea
                  placeholder="미팅 기록을 작성하세요..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex gap-3">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    저장
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNote('');
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 - 고정 */}
        <div className="flex-shrink-0 border-t border-border/30 p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Link to={`/clients/${meeting.client.id}`}>
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                disabled={isEditingMeeting}
              >
                고객 정보 보기
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {isEditingMeeting ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEditingMeeting}
                    className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={handleSaveMeetingChanges}
                    className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
                  >
                    저장
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                    onClick={handleStartEditingMeeting}
                  >
                    <Pencil2Icon className="w-4 h-4" />
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
                    onClick={handleDeleteMeeting}
                  >
                    <TrashIcon className="w-4 h-4" />
                    삭제
                  </Button>
                  {meeting.status === 'scheduled' && (
                    <Button className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground">
                      <CheckIcon className="w-4 h-4" />
                      완료 처리
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* 🗑️ 삭제 확인 모달 */}
      <DeleteMeetingModal
        meeting={meeting}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Dialog>
  );
}
