import { useTranslation } from 'react-i18next';
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
  PersonIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@radix-ui/react-icons';
import {
  formatCurrencyTable,
  type SupportedLocale,
} from '~/lib/utils/currency';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  status: 'prospect' | 'contacted' | 'proposal' | 'contracted' | 'completed';
  lastContactDate: string;
  potentialValue: number;
  referredBy?: string;
  stage: string;
}

interface RecentClientsProps {
  recentClients: Client[];
  totalClients: number;
}

export function RecentClients({
  recentClients,
  totalClients,
}: RecentClientsProps) {
  const { t, i18n } = useTranslation('dashboard');
  const [isHydrated, setIsHydrated] = useState(false);

  // hydration 완료 후에만 번역된 텍스트 렌더링
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const locale = (
    i18n.language === 'ko' ? 'ko' : i18n.language === 'ja' ? 'ja' : 'en'
  ) as SupportedLocale;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'prospect':
        return 'bg-muted/20 text-muted-foreground border-border/30';
      case 'contacted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'proposal':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'contracted':
        return 'bg-foreground/10 text-foreground border-border/50';
      case 'completed':
        return 'bg-foreground/20 text-foreground border-border/60';
      default:
        return 'bg-muted/20 text-muted-foreground border-border/30';
    }
  };

  // hydration-safe 상태 텍스트
  const getStatusText = (status: string) => {
    if (!isHydrated) {
      const defaultStatus: Record<string, string> = {
        prospect: '잠재고객',
        contacted: '연락됨',
        proposal: '제안',
        contracted: '계약',
        completed: '완료',
      };
      return defaultStatus[status] || status;
    }
    return t(`stages.${status}`, { defaultValue: status });
  };

  // hydration-safe 단계 텍스트
  const getStageText = (stage: string) => {
    if (!isHydrated) {
      return stage; // hydration 전에는 원본 텍스트 반환
    }

    const translatedStage = t(`pipelineStages.${stage}`, { defaultValue: '' });
    if (translatedStage && translatedStage !== stage) {
      return translatedStage;
    }

    const translatedStatus = t(`stages.${stage}`, { defaultValue: '' });
    if (translatedStatus && translatedStatus !== stage) {
      return translatedStatus;
    }

    return stage;
  };

  // hydration-safe 날짜 포맷
  const formatDate = (dateStr: string) => {
    if (!isHydrated) {
      // hydration 전에는 간단한 형식으로 반환
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    const locale =
      i18n.language === 'ko'
        ? 'ko-KR'
        : i18n.language === 'ja'
          ? 'ja-JP'
          : 'en-US';

    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <PersonIcon className="h-4 w-4 text-primary" />
            </div>
            {isHydrated ? t('recentClients.title') : '최근 고객 현황'}
          </CardTitle>
          <Link to="/clients">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              {isHydrated ? t('recentClients.viewAll') : '전체 보기'}
              <ChevronRightIcon className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 고객 현황 요약 */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {totalClients}
            </div>
            <div className="text-sm text-muted-foreground">
              {isHydrated ? t('recentClients.totalClients') : '총 고객'}
            </div>
          </div>
        </div>

        {/* 최근 고객 목록 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-2">
            {isHydrated ? t('recentClients.recentActivity') : '최근 활동'}
          </h4>
          {recentClients.length > 0 ? (
            <>
              {recentClients.slice(0, 5).map(client => (
                <Link
                  to={`/clients/${client.id}`}
                  key={client.id}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer hover:border-primary/30 hover:shadow-sm">
                    <Avatar className="w-8 h-8 border border-primary/20">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-foreground">
                          {client.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getStatusBadge(client.status)}`}
                        >
                          {getStatusText(client.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getStageText(client.stage)}</span>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(client.lastContactDate)}</span>
                        </div>
                      </div>

                      {client.referredBy && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {isHydrated
                              ? t('recentClients.referredBy')
                              : '추천인'}{' '}
                            <span className="font-medium">
                              {client.referredBy}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          {isHydrated
                            ? t('recentClients.expectedValue')
                            : '예상 가치'}{' '}
                          <span className="font-medium text-primary">
                            {formatCurrencyTable(client.potentialValue, locale)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 🔧 추가: 클릭 가능함을 나타내는 화살표 아이콘 */}
                    <div className="flex-shrink-0">
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}

              {recentClients.length > 5 && (
                <div className="text-center pt-2">
                  <Link to="/clients">
                    <Button variant="outline" size="sm" className="text-xs">
                      {isHydrated
                        ? t('recentClients.moreClients', {
                            count: recentClients.length - 5,
                          })
                        : `${recentClients.length - 5}명 더 보기`}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
                <PersonIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isHydrated ? t('recentClients.noClients') : '고객이 없습니다.'}
              </p>
              <Link to="/clients">
                <Button size="sm" variant="outline">
                  {isHydrated ? t('recentClients.addClient') : '고객 추가'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
