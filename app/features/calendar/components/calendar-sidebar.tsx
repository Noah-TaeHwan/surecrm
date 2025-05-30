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
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from '../types/types';

interface CalendarSidebarProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes: string[];
  onFilterChange: (types: string[]) => void;
}

export function CalendarSidebar({
  meetings,
  onMeetingClick,
  filteredTypes,
  onFilterChange,
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
    <div className="space-y-4">
      {/* 🌐 Google Calendar 연동 상태 */}
      <Card className="shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-orange-500" />
            </div>
            구글 캘린더 연동
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert className="border-orange-200 bg-orange-50/50">
            <InfoCircledIcon className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm text-orange-700">
              <div className="space-y-2">
                <p className="font-medium">
                  MVP에서는 구글 캘린더 연동이 제공되지 않습니다
                </p>
                <p className="text-xs">
                  현재 개발 중이며, 향후 업데이트에서 제공될 예정입니다.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="w-full mt-3" disabled>
            <CalendarIcon className="h-4 w-4 mr-2" />
            구글 캘린더 연결 (개발 중)
          </Button>
        </CardContent>
      </Card>

      {/* 오늘의 일정 */}
      <Card className="shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            오늘의 일정
          </CardTitle>
          <CardDescription className="text-sm">
            {today.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {todayMeetings.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  총 {todayMeetings.length}개 미팅
                </span>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs"
                >
                  진행 중
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {todayMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="p-3 border border-border/40 rounded-lg cursor-pointer hover:bg-accent/40 hover:shadow-md hover:border-accent/60 transition-all duration-300 group bg-card/50 backdrop-blur-sm transform hover:-translate-y-0.5"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInFromRight 0.5s ease-out forwards',
                    }}
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded group-hover:bg-primary/20 transition-colors">
                          <ClockIcon className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground">
                            {meeting.time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meeting.duration}분
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 🌐 Google Calendar 동기화 상태 표시 */}
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400"
                          title="로컬 전용 (동기화 미지원)"
                        />
                        <Badge
                          className={cn(
                            'text-white text-xs group-hover:scale-105 transition-transform shadow-sm',
                            meetingTypeColors[
                              meeting.type as keyof typeof meetingTypeColors
                            ]
                          )}
                        >
                          {meeting.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <PersonIcon className="h-3 w-3 text-muted-foreground" />
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
              <div className="p-3 bg-muted/30 rounded-full w-fit mx-auto mb-3">
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
      <Card className="shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <BarChartIcon className="h-4 w-4 text-blue-500" />
            </div>
            이번 주 통계
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
                <div key={stat.type} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full shadow-sm border-2 border-white/30',
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
                    className="h-1.5"
                  />
                </div>
              ))}
            {totalThisWeek === 0 && (
              <div className="text-center py-4">
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
      <Card className="shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 rounded-lg">
                <MixerHorizontalIcon className="h-4 w-4 text-purple-500" />
              </div>
              미팅 필터
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllFilters}
                className="text-xs h-6 px-2"
              >
                전체
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                <ResetIcon className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-sm">
            보고 싶은 미팅 유형을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {allMeetingTypes.map((type) => {
              const isChecked =
                filteredTypes.length === 0 || filteredTypes.includes(type);
              const meetingCount = meetings.filter(
                (m) => m.type === type
              ).length;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/20 transition-all duration-200 group border border-transparent hover:border-border/40 cursor-pointer"
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
                    <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                      {meetingCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTypes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
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

      {/* 구글 캘린더 연동 카드 */}
      <Card className="shadow-lg border border-blue-500/30 bg-gradient-to-br from-blue-950/10 to-indigo-950/20 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-blue-400" />
            </div>
            구글 캘린더
          </CardTitle>
          <CardDescription className="text-blue-200/80 text-sm">
            구글 캘린더와 동기화하여 일정을 통합 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 pt-0">
          <Button
            variant="outline"
            className="w-full border-blue-400/40 hover:bg-blue-500/10 hover:border-blue-400/60 text-blue-200 hover:text-blue-100 transition-all duration-300 h-10 text-sm font-medium hover:shadow-md"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            구글 캘린더 연동하기
          </Button>
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
