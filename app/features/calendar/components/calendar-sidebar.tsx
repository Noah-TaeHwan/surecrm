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

        <CardContent className="relative pt-0 pb-5 space-y-4">
          {googleCalendarSettings?.isConnected ? (
            // 연동된 상태 - 심플한 성공 표시
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <CheckCircledIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      연결되었습니다
                    </p>
                    <p className="text-xs text-muted-foreground">
                      구글 캘린더와 동기화 중
                    </p>
                  </div>
                </div>

                {/* 동기화 통계 카드 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {googleCalendarSettings.googleEventsCount !== undefined && (
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-lg font-semibold text-foreground">
                        {googleCalendarSettings.googleEventsCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        구글 이벤트
                      </div>
                    </div>
                  )}
                  <div className="text-center p-3 bg-background rounded-lg border">
                    <div className="text-lg font-semibold text-foreground">
                      {meetings.filter((m) => m.type === 'google').length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      동기화됨
                    </div>
                  </div>
                </div>

                {googleCalendarSettings.lastSyncAt && (
                  <div className="mt-3 p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <ReloadIcon className="h-3 w-3" />
                      <span>
                        마지막 동기화:{' '}
                        {new Date(
                          googleCalendarSettings.lastSyncAt
                        ).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 액션 버튼들 - 2컬럼 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/settings')}
                >
                  <GearIcon className="h-4 w-4 mr-2" />
                  설정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <UpdateIcon className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
              </div>
            </div>
          ) : (
            // 연동되지 않은 상태 - 단순한 CTA
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      구글 캘린더 연동 대기 중
                    </p>
                    <p className="text-xs text-muted-foreground">
                      구글 일정을 SureCRM에서 함께 관리하세요
                    </p>
                  </div>
                </div>

                {/* 연동 혜택 목록 */}
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>구글 캘린더 일정 자동 동기화</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>SureCRM 통합 일정 관리</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>실시간 양방향 업데이트</span>
                  </div>
                </div>
              </div>

              {/* 단순한 연동 버튼 */}
              <Button
                className="w-full"
                onClick={() => (window.location.href = '/settings')}
              >
                <Link2Icon className="h-4 w-4 mr-3" />
                구글 캘린더 연결하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오늘의 일정 - 개선된 버전 */}
      <Card className="border border-border/50 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 via-primary/15 to-blue-500/20 rounded-xl shadow-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground font-bold tracking-tight">
              오늘의 일정
            </span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            {today.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 pb-5">
          {todayMeetings.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl border border-primary/10">
                <span className="text-sm font-bold text-foreground">
                  📅 총 {todayMeetings.length}개 미팅
                </span>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary text-xs font-bold px-3 py-1.5 shadow-sm"
                >
                  진행 중
                </Badge>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {todayMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="p-4 border border-border/40 rounded-xl cursor-pointer hover:bg-accent/40 hover:shadow-lg hover:border-accent/70 transition-all duration-400 group bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm transform hover:-translate-y-1 hover:scale-[1.02]"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'slideInFromRight 0.6s ease-out forwards',
                    }}
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/15 to-blue-500/15 rounded-xl group-hover:from-primary/25 group-hover:to-blue-500/25 transition-all duration-300 shadow-sm">
                          <ClockIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {meeting.time}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {meeting.duration}분
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 🌐 동기화 상태 표시 */}
                        {meeting.type === 'google' ? (
                          <div
                            className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                            title="구글 캘린더 연동"
                          />
                        ) : meeting.syncInfo ? (
                          <div
                            className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg"
                            title="동기화됨"
                          />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-sm"
                            title="로컬 전용"
                          />
                        )}
                        <Badge
                          className={cn(
                            'text-white text-xs group-hover:scale-110 transition-transform shadow-lg font-bold px-3 py-1.5',
                            meeting.type === 'google'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : meetingTypeColors[
                                  meeting.type as keyof typeof meetingTypeColors
                                ]
                          )}
                        >
                          {meeting.type === 'google'
                            ? '📅 구글'
                            : meetingTypeKoreanMap[
                                meeting.type as keyof typeof meetingTypeKoreanMap
                              ] || meeting.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-sm text-foreground flex items-center gap-2">
                        <PersonIcon className="h-4 w-4 text-muted-foreground" />
                        {meeting.client.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-accent/80" />
                        {meeting.location || '장소 미정'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <BellIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-bold mb-1">
                오늘 예정된 미팅이 없습니다
              </p>
              <p className="text-xs text-muted-foreground/80 font-medium">
                새로운 미팅을 예약해보세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이번 주 통계 - 개선된 버전 */}
      <Card className="border border-border/50 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 via-blue-500/15 to-purple-500/20 rounded-xl shadow-lg">
              <BarChartIcon className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-foreground font-bold tracking-tight">
              이번 주 통계
            </span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            📊 총 {totalThisWeek}개 미팅 예정
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          <div className="space-y-4">
            {meetingStats
              .filter((stat) => stat.count > 0)
              .map((stat) => (
                <div
                  key={stat.type}
                  className="space-y-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full shadow-lg border-2 border-white/60',
                          stat.color
                        )}
                      />
                      <span className="text-sm font-bold text-foreground">
                        {stat.koreanName}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground bg-gradient-to-r from-primary/10 to-blue-500/10 px-3 py-1 rounded-full border border-primary/20">
                      {stat.count}개
                    </span>
                  </div>
                  <Progress
                    value={
                      totalThisWeek > 0 ? (stat.count / totalThisWeek) * 100 : 0
                    }
                    className="h-2.5 bg-muted/40"
                  />
                </div>
              ))}
            {totalThisWeek === 0 && (
              <div className="text-center py-8">
                <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <ActivityLogIcon className="mx-auto h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  이번 주 예정된 미팅이 없습니다
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 미팅 필터 - 개선된 한국어 버전 */}
      <Card className="border border-border/50 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 via-purple-500/15 to-pink-500/20 rounded-xl shadow-lg">
                <MixerHorizontalIcon className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-foreground font-bold tracking-tight">
                미팅 필터
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllFilters}
                className="text-xs h-8 px-3 hover:bg-primary/10 font-bold"
              >
                전체
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-8 px-2 hover:bg-destructive/10"
              >
                <ResetIcon className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            보고 싶은 미팅 유형을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          <div className="space-y-3">
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
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 transition-all duration-300 group border border-transparent hover:border-border/60 cursor-pointer bg-gradient-to-r from-muted/10 to-transparent hover:from-accent/20 hover:to-accent/10"
                  onClick={() => toggleFilter(type)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleFilter(type)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none shadow-sm"
                  />
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full shadow-lg border-2 border-white/40 group-hover:scale-110 transition-transform duration-300',
                      meetingTypeColors[type as keyof typeof meetingTypeColors]
                    )}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {koreanName}
                    </span>
                    <span className="text-xs text-muted-foreground bg-gradient-to-r from-muted/50 to-muted/30 px-3 py-1.5 rounded-full font-bold border border-muted/50">
                      {meetingCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTypes.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/40">
              <div className="flex items-center gap-3 text-xs text-muted-foreground p-3 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl border border-primary/10">
                <span className="font-bold">필터 적용됨:</span>
                <Badge
                  variant="secondary"
                  className="text-xs font-bold bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary px-3 py-1"
                >
                  {filteredTypes.length}개 유형
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 애니메이션 스타일 - 개선된 버전 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4));
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
