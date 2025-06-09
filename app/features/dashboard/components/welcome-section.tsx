import { useState, useEffect } from 'react';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { CalendarIcon, SunIcon, MoonIcon } from '@radix-ui/react-icons';

interface WelcomeSectionProps {
  userName: string;
  todayStats: {
    totalClients: number;
    totalReferrals: number;
    monthlyNewClients: number;
  };
}

export function WelcomeSection({ userName, todayStats }: WelcomeSectionProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 시간 설정 (Hydration 오류 방지)
    setIsClient(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    if (!currentTime) return '안녕하세요';
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  const getTimeIcon = () => {
    if (!currentTime) return <SunIcon className="h-5 w-5 text-primary" />;
    const hour = currentTime.getHours();
    if (hour < 6 || hour >= 19)
      return <MoonIcon className="h-5 w-5 text-muted-foreground" />;
    return <SunIcon className="h-5 w-5 text-primary" />;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '로딩 중...';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Card className="border-border/50 bg-gradient-to-r from-background to-muted/20">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              {getTimeIcon()}
              <h1 className="text-2xl font-semibold text-foreground">
                {getGreeting()},{' '}
                <span className="text-primary">{userName}</span>님
              </h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">{formatDate(currentTime)}</span>
              <span className="text-sm">•</span>
              <span className="text-sm font-medium">
                {currentTime
                  ? currentTime.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-0.5">
                {todayStats.totalClients}
              </div>
              <div className="text-xs text-muted-foreground">총 고객</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {todayStats.totalReferrals}
              </div>
              <div className="text-xs text-muted-foreground">소개 건수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {todayStats.monthlyNewClients}
              </div>
              <div className="text-xs text-muted-foreground">
                이번 달 신규 고객
              </div>
            </div>
          </div>
        </div>

        {(todayStats.totalClients > 0 ||
          todayStats.totalReferrals > 0 ||
          todayStats.monthlyNewClients > 0) && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {todayStats.totalClients > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                >
                  👤 총 고객 {todayStats.totalClients}명
                </Badge>
              )}
              {todayStats.totalReferrals > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-muted/20 text-muted-foreground border-border/30 text-xs"
                >
                  🔗 소개 건수 {todayStats.totalReferrals}건
                </Badge>
              )}
              {todayStats.monthlyNewClients > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-foreground/10 text-foreground border-border/50 text-xs"
                >
                  👤 이번 달 신규 고객 {todayStats.monthlyNewClients}명
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
