import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  ChevronRightIcon,
  BellIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';

interface TodayMeeting {
  id: string;
  clientName: string;
  time: string;
  duration: number;
  type: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  reminderSent: boolean;
}

interface TodayAgendaProps {
  meetings: TodayMeeting[];
}

export function TodayAgenda({ meetings }: TodayAgendaProps) {
  const [isClient, setIsClient] = useState(false);
  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case '첫 상담':
        return 'bg-primary/10 text-primary border-primary/20';
      case '니즈 분석':
      case '상품 설명':
      case '계약 검토':
      case '계약 체결':
        return 'bg-muted/20 text-muted-foreground border-border/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border/30';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '📅';
      case 'document':
        return '📄';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      case 'low':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border/20';
    }
  };

  const formatTime = (time: string) => {
    // Hydration 오류 방지: 클라이언트에서만 포맷팅
    if (!isClient) {
      return time; // 서버에서는 원본 시간 반환
    }

    try {
      return new Date(`2024-01-01 ${time}`).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return time; // 오류 시 원본 반환
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            오늘의 일정
          </CardTitle>
          {/* MVP: 캘린더 기능 비활성화 */}
          {/* <Link to="/calendar">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              전체 보기
              <ChevronRightIcon className="h-3 w-3 ml-1" />
            </Button>
          </Link> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingMeetings.length > 0 ? (
          <>
            {upcomingMeetings.slice(0, 4).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start gap-3 p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-all duration-200"
              >
                <Avatar className="w-9 h-9 border border-primary/20">
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    {meeting.clientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-medium text-sm text-foreground">
                      {meeting.clientName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="h-3 w-3" />
                      <span className="font-medium">
                        {formatTime(meeting.time)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getMeetingTypeColor(meeting.type)}`}
                    >
                      {meeting.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {meeting.duration}분
                    </span>
                    {!meeting.reminderSent && (
                      <Badge
                        variant="outline"
                        className="text-xs border-muted text-muted-foreground"
                      >
                        <BellIcon className="h-3 w-3 mr-1" />
                        알림 대기
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    📍 {meeting.location}
                  </p>
                </div>
              </div>
            ))}

            {upcomingMeetings.length > 4 && (
              <div className="text-center pt-2">
                {/* MVP: 캘린더 기능 비활성화 */}
                {/* <Link to="/calendar">
                  <Button variant="outline" size="sm" className="text-xs">
                    +{upcomingMeetings.length - 4}개 더 보기
                  </Button>
                </Link> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled
                >
                  +{upcomingMeetings.length - 4}개 더 보기 (준비 중)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              오늘 예정된 미팅이 없습니다
            </p>
            {/* MVP: 캘린더 기능 비활성화 */}
            {/* <Link to="/calendar">
              <Button size="sm" variant="outline">
                미팅 예약
              </Button>
            </Link> */}
            <Button size="sm" variant="outline" disabled>
              미팅 예약 (준비 중)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
