import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Separator } from '~/common/components/ui/separator';
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  TargetIcon,
  BellIcon,
  StarIcon,
  CheckCircledIcon,
  GearIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeKoreanMap,
  meetingTypeDetails,
  type Meeting,
} from '../types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';

interface CalendarSidebarProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes: string[];
  onFilterChange: (types: string[]) => void;
  googleCalendarSettings?: {
    isConnected: boolean;
    lastSyncAt?: string;
    googleEventsCount?: number;
  };
}

export function CalendarSidebar({
  meetings,
  onMeetingClick,
  filteredTypes,
  onFilterChange,
  googleCalendarSettings,
}: CalendarSidebarProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  // 이번 주 통계 계산 고도화
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const thisWeekMeetings = meetings.filter((m: Meeting) => {
    const meetingDate = new Date(m.date);
    return meetingDate >= thisWeekStart && meetingDate <= thisWeekEnd;
  });

  // 미팅 타입별 분류
  const thisWeekByType = thisWeekMeetings.reduce((acc, meeting) => {
    const type = meeting.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 오늘 미팅
  const today = new Date();
  const todayMeetings = meetings.filter((m: Meeting) => {
    const meetingDate = new Date(m.date);
    return meetingDate.toDateString() === today.toDateString();
  });

  // 다음 미팅 (3개만)
  const upcomingMeetings = meetings
    .filter((m: Meeting) => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return '동기화된 적 없음';

    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return format(date, 'MM/dd HH:mm', { locale: ko });
  };

  // 수동 동기화 실행
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ 구글 캘린더 동기화 완료');
        // 페이지 새로고침하여 최신 데이터 로드
        window.location.reload();
      } else {
        console.error('❌ 동기화 실패:', await response.text());
      }
    } catch (error) {
      console.error('❌ 동기화 오류:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-5 p-4 border-sidebar-border h-full">
      {/* 1. 구글 캘린더 연동 상태 (맨 위로 이동) */}
      <Card className="border border-sidebar-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            구글 캘린더
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleCalendarSettings?.isConnected ? (
            <div className="space-y-3">
              {/* 연결 상태 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">연결됨</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {googleCalendarSettings.googleEventsCount || 0}개 동기화
                </Badge>
              </div>

              {/* 마지막 동기화 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">마지막 동기화</span>
                <span className="font-medium">
                  {formatLastSync(googleCalendarSettings.lastSyncAt)}
                </span>
              </div>

              {/* 수동 동기화 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                <UpdateIcon className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                {isSyncing ? '동기화 중...' : '지금 동기화'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">연결 필요</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                구글 캘린더와 연동하여 양방향 동기화를 활성화하세요.
              </p>
              
              <Button variant="default" size="sm" className="w-full gap-2">
                <CalendarIcon className="h-4 w-4" />
                구글 계정 연결
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. 이번 주 성과 요약 (고도화) */}
      <Card className="border border-sidebar-border bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <TargetIcon className="h-5 w-5" />
            이번 주 성과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 핵심 지표 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-primary">{thisWeekMeetings.length}</div>
              <div className="text-xs text-muted-foreground">총 미팅</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-emerald-600">{todayMeetings.length}</div>
              <div className="text-xs text-muted-foreground">오늘</div>
            </div>
          </div>

          {/* 미팅 타입별 분석 */}
          {Object.keys(thisWeekByType).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">타입별 분석</h4>
              <div className="space-y-1">
                {Object.entries(thisWeekByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {meetingTypeDetails[type as keyof typeof meetingTypeDetails]?.icon || '📅'}
                      </span>
                      <span className="text-xs">
                        {meetingTypeKoreanMap[type as keyof typeof meetingTypeKoreanMap] || type}
                      </span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 목표 달성률 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">주간 목표 (10건)</span>
              <span className="font-semibold">{Math.min(100, Math.round((thisWeekMeetings.length / 10) * 100))}%</span>
            </div>
            <Progress 
              value={Math.min(100, (thisWeekMeetings.length / 10) * 100)} 
              className="h-2 bg-muted/30"
            />
            {thisWeekMeetings.length >= 10 && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircledIcon className="h-3 w-3" />
                <span>목표 달성!</span>
              </div>
            )}
          </div>

          {/* 주간 성과 요약 */}
          {thisWeekMeetings.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                이번 주 {thisWeekMeetings.length}건의 미팅으로 
                {thisWeekMeetings.length >= 10 ? ' 목표를 달성했습니다! 🎉' : ` ${10 - thisWeekMeetings.length}건 더 필요합니다.`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. 다음 예정 미팅 */}
      {upcomingMeetings.length > 0 && (
        <Card className="border border-sidebar-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-600" />
              다음 미팅
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={`${meeting.id}-${index}`}
                onClick={() => onMeetingClick(meeting)}
                className="p-3 rounded-lg border border-border/30 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm leading-tight">{meeting.title}</h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                      {meetingTypeKoreanMap[meeting.type as keyof typeof meetingTypeKoreanMap] || meeting.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(meeting.date), 'MM/dd (E)', { locale: ko })}
                    </div>
                    {meeting.time && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {meeting.time}
                      </div>
                    )}
                  </div>
                  
                  {meeting.client?.name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PersonIcon className="h-3 w-3" />
                      {meeting.client.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
