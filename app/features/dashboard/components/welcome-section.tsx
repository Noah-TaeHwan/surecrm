import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('dashboard');
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
    // Hydration 오류 방지: 클라이언트에서만 시간 기반 인사말 표시
    if (!isClient || !currentTime) {
      return '안녕하세요'; // 직접 하드코딩된 기본값
    }

    // i18next 안전성 체크
    if (!i18n || !i18n.isInitialized) {
      return '안녕하세요'; // 기본값 반환
    }

    // 네임스페이스 로딩 체크를 더 안전하게
    try {
      if (!i18n.hasLoadedNamespace || !i18n.hasLoadedNamespace('dashboard')) {
        return '안녕하세요'; // 기본값 반환
      }
    } catch (error) {
      return '안녕하세요'; // 에러 발생 시 기본값 반환
    }

    const hour = currentTime.getHours();
    if (hour < 12)
      return t('welcome.morningGreeting', { defaultValue: '좋은 아침입니다' });
    if (hour < 18)
      return t('welcome.afternoonGreeting', { defaultValue: '안녕하세요' });
    return t('welcome.eveningGreeting', { defaultValue: '좋은 저녁입니다' });
  };

  const getTimeIcon = () => {
    // Hydration 오류 방지: 클라이언트에서만 시간 기반 아이콘 표시
    if (!isClient || !currentTime)
      return <SunIcon className="h-5 w-5 text-primary" />;
    const hour = currentTime.getHours();
    if (hour < 6 || hour >= 19)
      return <MoonIcon className="h-5 w-5 text-muted-foreground" />;
    return <SunIcon className="h-5 w-5 text-primary" />;
  };

  const formatDate = (date: Date | null) => {
    // Hydration 오류 방지: 클라이언트에서만 실제 날짜 표시
    if (!isClient || !date) return '로딩 중...'; // 직접 하드코딩된 기본값

    // 현재 언어에 따라 로케일 설정
    const locale =
      i18n.language === 'ko'
        ? 'ko-KR'
        : i18n.language === 'ja'
          ? 'ja-JP'
          : 'en-US';

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date | null) => {
    // Hydration 오류 방지: 클라이언트에서만 실제 시간 표시
    if (!isClient || !date) return '--:--';

    const locale =
      i18n.language === 'ko'
        ? 'ko-KR'
        : i18n.language === 'ja'
          ? 'ja-JP'
          : 'en-US';

    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 사용자 접미사를 안전하게 가져오는 함수
  const getUserSuffix = () => {
    if (!isClient) return '님'; // 서버에서는 항상 기본값

    // i18next 안전성 체크
    if (!i18n || !i18n.isInitialized) {
      return '님'; // 기본값 반환
    }

    try {
      if (!i18n.hasLoadedNamespace || !i18n.hasLoadedNamespace('dashboard')) {
        return '님'; // 기본값 반환
      }
      return t('welcome.userSuffix', { defaultValue: '님' });
    } catch (error) {
      return '님'; // 에러 발생 시 기본값 반환
    }
  };

  // Badge 텍스트를 안전하게 가져오는 함수 (Hydration 오류 방지)
  const getBadgeText = (key: string, count: number, fallback: string) => {
    // 서버에서는 항상 하드코딩된 기본값 반환
    if (!isClient) return fallback;

    // i18next 안전성 체크
    if (!i18n || !i18n.isInitialized) {
      return fallback;
    }

    try {
      if (!i18n.hasLoadedNamespace || !i18n.hasLoadedNamespace('dashboard')) {
        return fallback;
      }
      return t(key, { count, defaultValue: fallback });
    } catch (error) {
      return fallback;
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-to-r from-background to-muted/20">
      <CardContent className="px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              {getTimeIcon()}
              <h1 className="text-2xl font-semibold text-foreground">
                {getGreeting()},{' '}
                <span className="text-primary">{userName}</span>
                {getUserSuffix()}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">{formatDate(currentTime)}</span>
              <span className="text-sm">•</span>
              <span className="text-sm font-medium">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {(todayStats.totalClients > 0 ||
          todayStats.totalReferrals > 0 ||
          todayStats.monthlyNewClients > 0) && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex flex-wrap gap-2 ">
              {todayStats.totalClients > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                >
                  👤{' '}
                  {getBadgeText(
                    'welcome.totalClientsLabel',
                    todayStats.totalClients,
                    `총 고객 ${todayStats.totalClients}명`
                  )}
                </Badge>
              )}
              {todayStats.totalReferrals > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-muted/20 text-muted-foreground border-border/30 text-xs"
                >
                  🔗{' '}
                  {getBadgeText(
                    'welcome.referralsLabel',
                    todayStats.totalReferrals,
                    `소개 ${todayStats.totalReferrals}건`
                  )}
                </Badge>
              )}
              {todayStats.monthlyNewClients > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-foreground/10 text-foreground border-border/50 text-xs"
                >
                  👤{' '}
                  {getBadgeText(
                    'welcome.monthlyNewClientsLabel',
                    todayStats.monthlyNewClients,
                    `이번 달 신규 ${todayStats.monthlyNewClients}명`
                  )}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
