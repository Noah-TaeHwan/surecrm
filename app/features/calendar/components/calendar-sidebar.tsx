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
    <div className="space-y-6 p-1">
      {/* 🌐 Google Calendar 연동 상태 - SureCRM 톤앤매너 적용 */}
      <Card className="relative overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="text-lg flex items-center gap-3">
            <div
              className={`p-2 rounded-xl shadow-sm transition-all duration-300 ${
                googleCalendarSettings?.isConnected
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400'
                  : 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-700 dark:text-orange-400'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-foreground font-semibold">
              구글 캘린더 연동
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative pt-0 space-y-4">
          {googleCalendarSettings?.isConnected ? (
            // 연동된 상태 - 우아한 연결됨 표시
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/60 dark:border-green-800/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                    <CheckCircledIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
                      연결되었습니다
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      구글 캘린더와 동기화 중
                    </p>
                  </div>
                </div>

                {/* 동기화 통계 */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {googleCalendarSettings.googleEventsCount !== undefined && (
                    <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="font-semibold text-green-700 dark:text-green-300">
                        {googleCalendarSettings.googleEventsCount}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        구글 이벤트
                      </div>
                    </div>
                  )}
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="font-semibold text-green-700 dark:text-green-300">
                      {meetings.filter((m) => m.type === 'google').length}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      동기화됨
                    </div>
                  </div>
                </div>

                {googleCalendarSettings.lastSyncAt && (
                  <div className="mt-3 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <ReloadIcon className="h-3 w-3" />
                    마지막 동기화:{' '}
                    {new Date(googleCalendarSettings.lastSyncAt).toLocaleString(
                      'ko-KR',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </div>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => (window.location.href = '/settings')}
                >
                  <GearIcon className="h-4 w-4 mr-2" />
                  설정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-200"
                  onClick={() => window.location.reload()}
                >
                  <UpdateIcon className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
              </div>
            </div>
          ) : (
            // 연동되지 않은 상태 - 매력적인 연결 유도
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/60 dark:border-orange-800/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-orange-500/20 rounded-lg">
                    <InfoCircledIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                      구글 캘린더 연동 대기 중
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      구글 일정을 SureCRM에서 함께 관리하세요
                    </p>
                  </div>
                </div>

                {/* 연동 혜택 */}
                <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>구글 캘린더 일정 자동 동기화</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>SureCRM 통합 일정 관리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>실시간 양방향 업데이트</span>
                  </div>
                </div>
              </div>

              {/* 연동 버튼 */}
              <Button
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => (window.location.href = '/settings')}
              >
                <Link2Icon className="h-4 w-4 mr-2" />
                구글 캘린더 연결하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오늘의 일정 */}
      <Card className="border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl shadow-sm">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground font-semibold">오늘의 일정</span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {today.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {todayMeetings.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  총 {todayMeetings.length}개 미팅
                </span>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs font-medium px-3 py-1"
                >
                  진행 중
                </Badge>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {todayMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="p-4 border border-border/50 rounded-xl cursor-pointer hover:bg-accent/30 hover:shadow-md hover:border-accent/60 transition-all duration-300 group bg-card/60 backdrop-blur-sm transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInFromRight 0.5s ease-out forwards',
                    }}
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <ClockIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            {meeting.time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meeting.duration}분
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 🌐 Google Calendar 동기화 상태 표시 */}
                        {meeting.type === 'google' ? (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"
                            title="구글 캘린더 연동"
                          />
                        ) : meeting.syncInfo ? (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"
                            title="동기화됨"
                          />
                        ) : (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm"
                            title="로컬 전용"
                          />
                        )}
                        <Badge
                          className={cn(
                            'text-white text-xs group-hover:scale-105 transition-transform shadow-sm font-medium px-2 py-1',
                            meeting.type === 'google'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : meetingTypeColors[
                                  meeting.type as keyof typeof meetingTypeColors
                                ]
                          )}
                        >
                          {meeting.type === 'google' ? '📅 구글' : meeting.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <PersonIcon className="h-4 w-4 text-muted-foreground" />
                        {meeting.client.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        {meeting.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                <BellIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                오늘 예정된 미팅이 없습니다
              </p>
              <p className="text-xs text-muted-foreground/70">
                새로운 미팅을 예약해보세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이번 주 통계 */}
      <Card className="border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl shadow-sm">
              <BarChartIcon className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-foreground font-semibold">이번 주 통계</span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            총 {totalThisWeek}개 미팅 예정
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {meetingStats
              .filter((stat) => stat.count > 0)
              .map((stat) => (
                <div key={stat.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full shadow-sm border-2 border-white/50',
                          stat.color
                        )}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {stat.type}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {stat.count}개
                    </span>
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
                <ActivityLogIcon className="mx-auto h-6 w-6 text-muted-foreground mb-3" />
                <p className="text-xs text-muted-foreground">
                  이번 주 예정된 미팅이 없습니다
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 미팅 필터 */}
      <Card className="border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl shadow-sm">
                <MixerHorizontalIcon className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-foreground font-semibold">미팅 필터</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllFilters}
                className="text-xs h-7 px-3 hover:bg-primary/10"
              >
                전체
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-7 px-2 hover:bg-destructive/10"
              >
                <ResetIcon className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            보고 싶은 미팅 유형을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {allMeetingTypes.map((type) => {
              const isChecked =
                filteredTypes.length === 0 || filteredTypes.includes(type);
              const meetingCount = meetings.filter(
                (m) => m.type === type
              ).length;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/20 transition-all duration-200 group border border-transparent hover:border-border/50 cursor-pointer"
                  onClick={() => toggleFilter(type)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleFilter(type)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                  />
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full shadow-sm border-2 border-white/30 group-hover:scale-110 transition-transform',
                      meetingTypeColors[type as keyof typeof meetingTypeColors]
                    )}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {type}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full font-medium">
                      {meetingCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTypes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>필터 적용됨:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {filteredTypes.length}개 유형
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 애니메이션 스타일 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
