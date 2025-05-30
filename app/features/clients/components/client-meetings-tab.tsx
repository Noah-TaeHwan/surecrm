import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
  PlusIcon,
  LockClosedIcon,
  CalendarIcon,
  PersonIcon,
  FileTextIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import { AddMeetingModal } from './add-meeting-modal';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 임시 미팅 타입 정의 (실제로는 meetings schema에서 import)
interface Meeting {
  id: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: string;
  duration: number;
  location?: string;
  notes?: string;
  checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  participants?: string[];
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
  outcome?: string;
  nextSteps?: string[];
  documents?: string[];
}

interface ClientMeetingsTabProps {
  client: ClientDisplay;
  meetings: Meeting[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
  onMeetingAdded?: (meeting: Meeting) => void;
}

export function ClientMeetingsTab({
  client,
  meetings,
  agentId,
  onDataAccess,
  onMeetingAdded,
}: ClientMeetingsTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'scheduled' | 'completed' | 'cancelled'
  >('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'public' | 'business'>(
    'business'
  );
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  const privacyLevel = (client.accessLevel ||
    client.privacyLevel ||
    'private') as ClientPrivacyLevel;

  // 🔒 데이터 접근 로깅
  const handleDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logDataAccess(
        client.id,
        agentId,
        'view',
        dataFields,
        undefined,
        navigator.userAgent,
        `고객 미팅 ${accessType}`
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('데이터 접근 로깅 실패:', error);
    }
  };

  // 🔒 데이터 마스킹 함수
  const maskData = (data: string, level: ClientPrivacyLevel = privacyLevel) => {
    return typeHelpers.maskData(data, level, showConfidentialData);
  };

  // 🔒 미팅 필터링 (상태 및 보안 레벨)
  const filterMeetings = (meetings: Meeting[]) => {
    return meetings.filter((meeting) => {
      // 상태 필터
      if (filterStatus !== 'all' && meeting.status !== filterStatus) {
        return false;
      }

      // 보안 레벨 필터
      const meetingLevel = meeting.confidentialityLevel || 'public';
      switch (filterLevel) {
        case 'public':
          return meetingLevel === 'public';
        case 'business':
          return ['public', 'restricted'].includes(meetingLevel);
        case 'all':
          return (
            ['public', 'restricted', 'private'].includes(meetingLevel) ||
            showConfidentialData
          );
        default:
          return true;
      }
    });
  };

  // 미팅 상태별 설정
  const meetingStatusConfig: Record<
    string,
    {
      icon: React.ReactNode;
      color: string;
      text: string;
      bgColor: string;
    }
  > = {
    scheduled: {
      icon: <ClockIcon className="h-4 w-4" />,
      color: 'text-blue-600',
      text: '예정',
      bgColor: 'bg-blue-100',
    },
    completed: {
      icon: <CheckCircledIcon className="h-4 w-4" />,
      color: 'text-green-600',
      text: '완료',
      bgColor: 'bg-green-100',
    },
    cancelled: {
      icon: <CrossCircledIcon className="h-4 w-4" />,
      color: 'text-red-600',
      text: '취소',
      bgColor: 'bg-red-100',
    },
    rescheduled: {
      icon: <UpdateIcon className="h-4 w-4" />,
      color: 'text-yellow-600',
      text: '일정변경',
      bgColor: 'bg-yellow-100',
    },
  };

  // 🔒 기밀 레벨에 따른 배지
  const getConfidentialityBadge = (level?: string) => {
    switch (level) {
      case 'confidential':
        return (
          <Badge variant="destructive" className="text-xs">
            기밀
          </Badge>
        );
      case 'private':
        return (
          <Badge variant="secondary" className="text-xs">
            내부
          </Badge>
        );
      case 'restricted':
        return (
          <Badge variant="outline" className="text-xs">
            제한
          </Badge>
        );
      case 'public':
        return (
          <Badge variant="default" className="text-xs">
            공개
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleMeetingAdded = async (newMeeting: Meeting) => {
    await handleDataAccess('새 미팅 추가', ['meetings', 'create']);
    onMeetingAdded?.(newMeeting);
  };

  const filteredMeetings = filterMeetings(meetings);

  return (
    <div className="space-y-6">
      {/* 🔒 보안 및 필터 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">미팅 필터:</span>

                {/* 상태 필터 */}
                <Select
                  value={filterStatus}
                  onValueChange={(value: any) => {
                    setFilterStatus(value);
                    handleDataAccess(`상태 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="scheduled">예정</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>

                {/* 보안 레벨 필터 */}
                <Select
                  value={filterLevel}
                  onValueChange={(value: any) => {
                    setFilterLevel(value);
                    handleDataAccess(`보안 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">공개</SelectItem>
                    <SelectItem value="business">업무</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-confidential-meetings" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-meetings"
                  checked={showConfidentialData}
                  onCheckedChange={(checked) => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredMeetings.length}개 미팅
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 미팅 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              미팅 이력
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>모든 조회가 로그에 기록됩니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setIsAddMeetingOpen(true);
                handleDataAccess('미팅 추가 모달 열기', [
                  'meetings',
                  'create_modal',
                ]);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              미팅 예약
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  표시할 미팅이 없습니다
                </h3>
                <p className="text-sm">
                  {filterStatus !== 'all' || filterLevel !== 'all'
                    ? '필터 설정을 변경하거나 '
                    : ''}
                  새로운 미팅을 예약해보세요
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddMeetingOpen(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />첫 미팅 예약하기
                </Button>
              </div>
            ) : (
              filteredMeetings.map((meeting) => {
                const config = meetingStatusConfig[meeting.status];

                return (
                  <Card
                    key={meeting.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      handleDataAccess('미팅 상세 조회', [
                        'meetings',
                        meeting.id,
                      ])
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.bgColor}`}>
                          <div className={config.color}>{config.icon}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium">
                              {maskData(meeting.type, privacyLevel)}
                            </div>
                            {getConfidentialityBadge(
                              meeting.confidentialityLevel
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {maskData(
                                meeting.scheduledDate,
                                privacyLevel
                              )} • {meeting.duration}분
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-1">
                                📍 {maskData(meeting.location, privacyLevel)}
                              </div>
                            )}
                            {meeting.participants &&
                              meeting.participants.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <PersonIcon className="h-3 w-3" />
                                  {showConfidentialData
                                    ? meeting.participants.join(', ')
                                    : `참가자 ${meeting.participants.length}명`}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          meeting.status === 'completed' ? 'default' : 'outline'
                        }
                      >
                        {config.text}
                      </Badge>
                    </div>

                    {/* 메모 */}
                    {meeting.notes && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1 flex items-center gap-1">
                          <FileTextIcon className="h-3 w-3" />
                          메모
                        </div>
                        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded border-l-2 border-primary/20">
                          {maskData(meeting.notes, privacyLevel)}
                        </div>
                      </div>
                    )}

                    {/* 결과 및 다음 단계 (완료된 미팅의 경우) */}
                    {meeting.status === 'completed' &&
                      (meeting.outcome || meeting.nextSteps) && (
                        <div className="mb-3 p-3 bg-green-50 rounded border-l-2 border-green-200">
                          {meeting.outcome && (
                            <div className="mb-2">
                              <div className="text-sm font-medium text-green-800 mb-1">
                                결과
                              </div>
                              <div className="text-sm text-green-700">
                                {maskData(meeting.outcome, privacyLevel)}
                              </div>
                            </div>
                          )}
                          {meeting.nextSteps &&
                            meeting.nextSteps.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-green-800 mb-1">
                                  다음 단계
                                </div>
                                <ul className="text-sm text-green-700 space-y-1">
                                  {meeting.nextSteps.map((step, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-1"
                                    >
                                      <span className="text-green-500 mt-0.5">
                                        •
                                      </span>
                                      {maskData(step, privacyLevel)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                    {/* 체크리스트 */}
                    {meeting.checklist && meeting.checklist.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <CheckCircledIcon className="h-3 w-3" />
                          체크리스트
                        </div>
                        <div className="space-y-1">
                          {meeting.checklist.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              {item.completed ? (
                                <CheckCircledIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <CrossCircledIcon className="h-4 w-4 text-gray-400" />
                              )}
                              <span
                                className={`text-sm ${
                                  item.completed
                                    ? 'line-through text-muted-foreground'
                                    : ''
                                }`}
                              >
                                {maskData(item.item, privacyLevel)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* 체크리스트 진행률 */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          진행률:{' '}
                          {Math.round(
                            (meeting.checklist.filter((item) => item.completed)
                              .length /
                              meeting.checklist.length) *
                              100
                          )}
                          %
                        </div>
                      </div>
                    )}

                    {/* 관련 문서 */}
                    {meeting.documents &&
                      meeting.documents.length > 0 &&
                      showConfidentialData && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-1 flex items-center gap-1">
                            <FileTextIcon className="h-3 w-3" />
                            관련 문서 ({meeting.documents.length}개)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meeting.documents.join(', ')}
                          </div>
                        </div>
                      )}
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔒 미팅 통계 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ActivityLogIcon className="h-5 w-5" />
            미팅 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredMeetings.length}
              </div>
              <div className="text-sm text-muted-foreground">총 미팅</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredMeetings.filter((m) => m.status === 'completed')
                    .length
                }
              </div>
              <div className="text-sm text-muted-foreground">완료</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  filteredMeetings.filter((m) => m.status === 'scheduled')
                    .length
                }
              </div>
              <div className="text-sm text-muted-foreground">예정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  filteredMeetings.reduce((acc, m) => acc + m.duration, 0) / 60
                )}
                h
              </div>
              <div className="text-sm text-muted-foreground">총 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 미팅 추가 모달 */}
      <AddMeetingModal
        open={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        clientId={client.id}
        clientName={typeHelpers.getClientDisplayName(client)}
        onMeetingAdded={handleMeetingAdded}
      />
    </div>
  );
}
