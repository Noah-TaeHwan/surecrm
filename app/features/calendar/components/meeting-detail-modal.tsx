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
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  type Meeting,
  type MeetingNote,
  type ChecklistItem,
} from './types';
import { useState } from 'react';

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

  // 체크리스트 관리 상태
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    meeting?.checklist || []
  );
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 미팅 정보 편집 상태
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState({
    title: meeting?.title || '',
    date: meeting?.date || '',
    time: meeting?.time || '',
    duration: meeting?.duration || 60,
    location: meeting?.location || '',
    description: meeting?.description || '',
    type: meeting?.type || '',
  });

  if (!meeting) return null;

  const completedTasks = checklist.filter((item) => item.completed).length;
  const totalTasks = checklist.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getDurationText = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }
    return `${minutes}분`;
  };

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
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  // 체크리스트 관리 함수
  const handleToggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
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
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleStartEditingItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEditingItem = () => {
    if (editingText.trim() && editingItemId) {
      setChecklist((prev) =>
        prev.map((item) =>
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

    // 편집된 데이터 추가
    Object.entries(editedMeeting).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = String(value);
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
    if (confirm('정말로 이 미팅을 삭제하시겠습니까?')) {
      // 실제 form 제출로 미팅 삭제
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
    }
  };

  const meetingTypes = Object.keys(meetingTypeColors);

  return (
    <Dialog open={!!meeting} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {isEditingMeeting ? (
                <Input
                  value={editedMeeting.title}
                  onChange={(e) =>
                    setEditedMeeting((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-3xl font-bold border-none p-0 h-auto shadow-none focus-visible:ring-0"
                  placeholder="미팅 제목"
                />
              ) : (
                <DialogTitle className="text-3xl font-bold text-foreground">
                  {meeting.title}
                </DialogTitle>
              )}
              <DialogDescription className="text-base text-muted-foreground">
                미팅 상세 정보 및 체크리스트
              </DialogDescription>
            </div>
            {isEditingMeeting ? (
              <Select
                value={editedMeeting.type}
                onValueChange={(value) =>
                  setEditedMeeting((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
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

        <div className="space-y-8">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarIcon className="w-5 h-5" />
                <span className="font-medium">날짜</span>
              </div>
              {isEditingMeeting ? (
                <Input
                  type="date"
                  value={editedMeeting.date}
                  onChange={(e) =>
                    setEditedMeeting((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="font-semibold text-lg pl-8"
                />
              ) : (
                <div className="font-semibold text-lg pl-8">
                  {formatDate(meeting.date)}
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
                    onChange={(e) =>
                      setEditedMeeting((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="font-semibold"
                  />
                  <Select
                    value={editedMeeting.duration.toString()}
                    onValueChange={(value) =>
                      setEditedMeeting((prev) => ({
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
                  {meeting.time} ({getDurationText(meeting.duration)})
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <GlobeIcon className="w-5 h-5" />
                <span className="font-medium">장소</span>
              </div>
              {isEditingMeeting ? (
                <Input
                  value={editedMeeting.location}
                  onChange={(e) =>
                    setEditedMeeting((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="font-semibold text-lg pl-8"
                  placeholder="미팅 장소"
                />
              ) : (
                <div className="font-semibold text-lg pl-8">
                  {meeting.location}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <PersonIcon className="w-5 h-5" />
                <span className="font-medium">고객</span>
              </div>
              <div className="flex items-center gap-3 pl-8">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm font-medium">
                    {meeting.client.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-lg">
                  {meeting.client.name}
                </span>
              </div>
            </div>
          </div>

          {(meeting.description || isEditingMeeting) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">설명</h3>
                {isEditingMeeting ? (
                  <Textarea
                    value={editedMeeting.description}
                    onChange={(e) =>
                      setEditedMeeting((prev) => ({
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
            <>
              <Separator />
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
            </>
          )}

          {/* 체크리스트 */}
          <Separator />
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">체크리스트</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {completedTasks}/{totalTasks} 완료
                  </span>
                  <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              <Button
                onClick={() => setIsAddingChecklistItem(true)}
                size="sm"
                className="gap-2"
                disabled={isEditingMeeting}
              >
                <PlusIcon className="w-4 h-4" />
                항목 추가
              </Button>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 group hover:shadow-md transition-all duration-200"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggleChecklistItem(item.id)}
                    className="w-5 h-5"
                    disabled={isEditingMeeting}
                  />

                  <div className="flex-1">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditingItem();
                            if (e.key === 'Escape') handleCancelEditing();
                          }}
                        />
                        <Button size="sm" onClick={handleSaveEditingItem}>
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
                      <span
                        className={cn(
                          'text-base',
                          item.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>

                  {!isEditingMeeting && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              ))}

              {isAddingChecklistItem && (
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                  <Checkbox disabled className="w-5 h-5" />
                  <Input
                    placeholder="새 체크리스트 항목을 입력하세요..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">미팅 기록</h3>
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
                {notes.map((note) => (
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
                  onChange={(e) => setNewNote(e.target.value)}
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

          {/* 액션 버튼 */}
          <Separator />
          <div className="flex items-center justify-between pt-6">
            <Link to={`/clients/${meeting.client.id}`}>
              <Button
                variant="outline"
                className="gap-2"
                disabled={isEditingMeeting}
              >
                고객 정보 보기
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex gap-3">
              {isEditingMeeting ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEditingMeeting}
                  >
                    취소
                  </Button>
                  <Button onClick={handleSaveMeetingChanges}>저장</Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleStartEditingMeeting}
                  >
                    <Pencil2Icon className="w-4 h-4" />
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={handleDeleteMeeting}
                  >
                    <TrashIcon className="w-4 h-4" />
                    삭제
                  </Button>
                  {meeting.status === 'scheduled' && (
                    <Button className="gap-2">
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
    </Dialog>
  );
}
