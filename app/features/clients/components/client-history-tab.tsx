import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  CalendarIcon,
  UpdateIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LockClosedIcon,
  ActivityLogIcon,
  FileTextIcon,
  PersonIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 임시 타입 정의 (실제로는 각 스키마에서 import)
interface Meeting {
  id: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: string;
  location?: string;
  notes?: string;
  duration?: number;
  participants?: string[];
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
}

interface StageHistory {
  id: string;
  fromStage?: string;
  toStage: string;
  changedAt: string;
  changedBy: string;
  notes?: string;
  reason?: string;
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
}

interface ClientHistoryTabProps {
  client: ClientDisplay;
  meetings: Meeting[];
  stageHistory: StageHistory[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
}

type TimelineItem = (Meeting | StageHistory) & {
  itemType: 'meeting' | 'stage';
};

export function ClientHistoryTab({
  client,
  meetings,
  stageHistory,
  agentId,
  onDataAccess,
}: ClientHistoryTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'public' | 'business'>(
    'business'
  );

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
        `고객 이력 ${accessType}`
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

  // 🔒 항목 필터링 (보안 레벨에 따라)
  const filterBySecurityLevel = (items: (Meeting | StageHistory)[]) => {
    if (filterLevel === 'all' && showConfidentialData) return items;

    return items.filter(item => {
      const itemLevel = item.confidentialityLevel || 'public';

      switch (filterLevel) {
        case 'public':
          return itemLevel === 'public';
        case 'business':
          return ['public', 'restricted'].includes(itemLevel);
        case 'all':
          return (
            ['public', 'restricted', 'private'].includes(itemLevel) ||
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

  // 필터링된 데이터
  const filteredMeetings: Meeting[] = filterBySecurityLevel(
    meetings
  ) as Meeting[];
  const filteredStageHistory: StageHistory[] = filterBySecurityLevel(
    stageHistory
  ) as StageHistory[];

  // 미팅과 진행 내역을 합쳐서 날짜순으로 정렬
  const timelineItems: TimelineItem[] = [
    ...filteredMeetings.map(item => ({
      ...item,
      itemType: 'meeting' as const,
    })),
    ...filteredStageHistory.map(item => ({
      ...item,
      itemType: 'stage' as const,
    })),
  ].sort((a, b) => {
    const dateA =
      a.itemType === 'meeting'
        ? new Date((a as any).scheduledDate)
        : new Date((a as any).changedAt);
    const dateB =
      b.itemType === 'meeting'
        ? new Date((b as any).scheduledDate)
        : new Date((b as any).changedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const isMeeting = (
    item: TimelineItem
  ): item is Meeting & { itemType: 'meeting' } => {
    return item.itemType === 'meeting';
  };

  const isStageHistory = (
    item: TimelineItem
  ): item is StageHistory & { itemType: 'stage' } => {
    return item.itemType === 'stage';
  };

  // 🔒 기밀 레벨에 따른 배지 색상
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

  return (
    <div className="space-y-6">
      {/* 🔒 보안 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">이력 보기 레벨:</span>
                <div className="flex gap-1">
                  {(['public', 'business', 'all'] as const).map(level => (
                    <Button
                      key={level}
                      variant={filterLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilterLevel(level);
                        handleDataAccess(`이력 필터 변경: ${level}`, [
                          'filter_settings',
                        ]);
                      }}
                    >
                      {level === 'public'
                        ? '공개'
                        : level === 'business'
                          ? '업무'
                          : '전체'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-confidential-history" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-history"
                  checked={showConfidentialData}
                  onCheckedChange={checked => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {timelineItems.length}개 항목
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 타임라인 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityLogIcon className="h-5 w-5" />
            진행 내역
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
          </CardTitle>
          <CardDescription>
            고객과의 모든 상호작용 기록 (보안 필터 적용됨)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ActivityLogIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  표시할 이력이 없습니다
                </h3>
                <p className="text-sm">
                  {filterLevel !== 'all' ? '필터 설정을 변경하거나 ' : ''}
                  새로운 활동이 있을 때 여기에 표시됩니다
                </p>
              </div>
            ) : (
              timelineItems.map((item, index) => {
                const isFirstItem = index === 0;
                const isLastItem = index === timelineItems.length - 1;

                return (
                  <div
                    key={`${item.itemType}-${item.id}-${index}`}
                    className="relative"
                  >
                    {/* 타임라인 연결선 */}
                    {!isLastItem && (
                      <div className="absolute left-4 top-12 w-0.5 h-8 bg-border" />
                    )}

                    <div
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() =>
                        handleDataAccess(
                          `${isMeeting(item) ? '미팅' : '단계 변경'} 상세 조회`,
                          [item.itemType, item.id]
                        )
                      }
                    >
                      {/* 아이콘 */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isMeeting(item)
                            ? meetingStatusConfig[item.status]?.bgColor ||
                              'bg-gray-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        <div
                          className={
                            isMeeting(item)
                              ? meetingStatusConfig[item.status]?.color ||
                                'text-gray-600'
                              : 'text-blue-600'
                          }
                        >
                          {isMeeting(item) ? (
                            meetingStatusConfig[item.status]?.icon || (
                              <CalendarIcon className="h-4 w-4" />
                            )
                          ) : (
                            <UpdateIcon className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">
                            {isMeeting(item)
                              ? maskData(item.type, privacyLevel)
                              : `단계 변경: ${
                                  isStageHistory(item)
                                    ? `${item.fromStage || '시작'} → ${
                                        item.toStage
                                      }`
                                    : ''
                                }`}
                          </div>

                          {/* 상태 배지 */}
                          {isMeeting(item) && (
                            <Badge
                              variant={
                                item.status === 'completed'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {meetingStatusConfig[item.status]?.text ||
                                item.status}
                            </Badge>
                          )}

                          {/* 기밀성 배지 */}
                          {getConfidentialityBadge(item.confidentialityLevel)}
                        </div>

                        {/* 날짜 및 추가 정보 */}
                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {isMeeting(item)
                              ? maskData(item.scheduledDate, privacyLevel)
                              : maskData((item as any).changedAt, privacyLevel)}

                            {isMeeting(item) && item.location && (
                              <>
                                <span>•</span>
                                <span>
                                  {maskData(item.location, privacyLevel)}
                                </span>
                              </>
                            )}

                            {isMeeting(item) && item.duration && (
                              <>
                                <span>•</span>
                                <span>{item.duration}분</span>
                              </>
                            )}

                            {isStageHistory(item) && (
                              <>
                                <span>•</span>
                                <PersonIcon className="h-3 w-3" />
                                <span>
                                  {maskData(item.changedBy, privacyLevel)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 참가자 (미팅의 경우) */}
                        {isMeeting(item) &&
                          item.participants &&
                          item.participants.length > 0 && (
                            <div className="text-xs text-muted-foreground mb-2">
                              <span className="font-medium">참가자: </span>
                              {showConfidentialData
                                ? item.participants.join(', ')
                                : `${item.participants.length}명`}
                            </div>
                          )}

                        {/* 노트 */}
                        {item.notes && (
                          <div className="text-sm mt-2 p-3 bg-muted/50 rounded-md border-l-2 border-primary/20">
                            <div className="flex items-start gap-2">
                              <FileTextIcon className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div>{maskData(item.notes, privacyLevel)}</div>
                            </div>
                          </div>
                        )}

                        {/* 변경 사유 (단계 변경의 경우) */}
                        {isStageHistory(item) && item.reason && (
                          <div className="text-sm mt-2 p-3 bg-blue-50 rounded-md border-l-2 border-blue-200">
                            <div className="flex items-start gap-2">
                              <UpdateIcon className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-blue-800">
                                  변경 사유:{' '}
                                </span>
                                {maskData(item.reason, privacyLevel)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔒 이력 통계 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ActivityLogIcon className="h-5 w-5" />
            이력 통계
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
                {filteredMeetings.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">완료된 미팅</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredStageHistory.length}
              </div>
              <div className="text-sm text-muted-foreground">단계 변경</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  (filteredMeetings.filter(m => m.status === 'completed')
                    .length /
                    Math.max(filteredMeetings.length, 1)) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">완료율</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
