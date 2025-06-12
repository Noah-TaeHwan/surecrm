import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  BellIcon,
  BarChartIcon,
  ActivityLogIcon,
  MixerHorizontalIcon,
  ResetIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  GearIcon,
  UpdateIcon,
  Link2Icon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from '../types/types';

// 🌍 한국어 미팅 타입 매핑 (MVP 한국어 UI)
const meetingTypeKoreanMap = {
  consultation: '상담',
  follow_up: '후속 상담',
  presentation: '설명회',
  contract_signing: '계약 체결',
  claim_support: '보험금 청구',
  renewal: '갱신 상담',
  other: '기타',
  google: '구글 일정',
} as const;

interface CalendarSidebarProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes: string[];
  onFilterChange: (types: string[]) => void;
  // 구글 캘린더 연동 상태 정보 추가
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
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const todayMeetings = meetings.filter((m) => m.date === formatDate(today));

  // 이번 주 통계
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const thisWeekMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    return meetingDate >= weekStart && meetingDate <= weekEnd;
  });

  const meetingStats = Object.entries(meetingTypeColors).map(
    ([type, color]) => ({
      type,
      koreanName:
        meetingTypeKoreanMap[type as keyof typeof meetingTypeKoreanMap] || type,
      color,
      count: thisWeekMeetings.filter((m) => m.type === type).length,
    })
  );

  const totalThisWeek = thisWeekMeetings.length;

  // 필터 관련 함수
  const allMeetingTypes = Object.keys(meetingTypeColors);

  const toggleFilter = (type: string) => {
    if (filteredTypes.includes(type)) {
      onFilterChange(filteredTypes.filter((t) => t !== type));
    } else {
      onFilterChange([...filteredTypes, type]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const selectAllFilters = () => {
    onFilterChange(allMeetingTypes);
  };

  return (
    <div className="space-y-4 px-1">
      {/* 🌐 Google Calendar 연동 상태 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>구글 캘린더</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {googleCalendarSettings?.isConnected ? (
            // 연동된 상태
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircledIcon className="h-4 w-4 text-primary" />
                <span>연결됨</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {googleCalendarSettings.googleEventsCount !== undefined && (
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">
                      {googleCalendarSettings.googleEventsCount}
                    </div>
                    <div className="text-muted-foreground">구글 일정</div>
                  </div>
                )}
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-medium">
                    {meetings.filter((m) => m.type === 'google').length}
                  </div>
                  <div className="text-muted-foreground">동기화</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/settings')}
                >
                  <GearIcon className="h-3 w-3 mr-1" />
                  설정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <UpdateIcon className="h-3 w-3 mr-1" />
                  새로고침
                </Button>
              </div>
            </div>
          ) : (
            // 연동되지 않은 상태
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                구글 캘린더와 연동하여 일정을 통합 관리하세요
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => (window.location.href = '/settings')}
              >
                <Link2Icon className="h-3 w-3 mr-2" />
                연결하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오늘의 일정 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>오늘의 일정</span>
          </CardTitle>
          <CardDescription className="text-sm">
            {today.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {todayMeetings.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span>총 {todayMeetings.length}개 미팅</span>
                <Badge variant="secondary" className="text-xs">
                  진행 중
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todayMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3 w-3 text-primary" />
                        <span className="font-medium text-sm">
                          {meeting.time}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {meeting.type === 'google'
                          ? '구글'
                          : meetingTypeKoreanMap[
                              meeting.type as keyof typeof meetingTypeKoreanMap
                            ] || meeting.type}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {meeting.client.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {meeting.duration}분 • {meeting.location || '장소 미정'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <BellIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                오늘 예정된 미팅이 없습니다
              </p>
              <p className="text-xs text-muted-foreground">
                새로운 미팅을 예약해보세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이번 주 통계 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChartIcon className="h-4 w-4 text-primary" />
            <span>이번 주 통계</span>
          </CardTitle>
          <CardDescription className="text-sm">
            총 {totalThisWeek}개 미팅 예정
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {meetingStats
              .filter((stat) => stat.count > 0)
              .map((stat) => (
                <div key={stat.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stat.color)} />
                      <span className="text-sm">{stat.koreanName}</span>
                    </div>
                    <span className="text-sm font-medium">{stat.count}개</span>
                  </div>
                  <Progress
                    value={
                      totalThisWeek > 0 ? (stat.count / totalThisWeek) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              ))}
            {totalThisWeek === 0 && (
              <div className="text-center py-6">
                <ActivityLogIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  이번 주 예정된 미팅이 없습니다
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 미팅 필터 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MixerHorizontalIcon className="h-4 w-4 text-primary" />
              <span>미팅 필터</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllFilters}
                className="text-xs h-7 px-2"
              >
                전체
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-7 px-2"
              >
                초기화
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {allMeetingTypes.map((type) => {
              const isChecked =
                filteredTypes.length === 0 || filteredTypes.includes(type);
              const meetingCount = meetings.filter(
                (m) => m.type === type
              ).length;
              const koreanName =
                meetingTypeKoreanMap[
                  type as keyof typeof meetingTypeKoreanMap
                ] || type;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => toggleFilter(type)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleFilter(type)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{koreanName}</span>
                    <span className="text-xs text-muted-foreground">
                      {meetingCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTypes.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>필터 적용됨:</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredTypes.length}개 유형
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
