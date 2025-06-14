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
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import { Sparkles } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  status: 'prospect' | 'contacted' | 'proposal' | 'contracted' | 'completed';
  lastContactDate: string;
  potentialValue: number;
  referredBy?: string;
  stage: string;
  importance?: string;
}

interface RecentClientsProps {
  recentClients: Client[];
  totalClients: number;
}

export function RecentClients({
  recentClients,
  totalClients,
}: RecentClientsProps) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'prospect':
        return '잠재고객';
      case 'contacted':
        return '접촉완료';
      case 'proposal':
        return '제안중';
      case 'contracted':
        return '계약체결';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitialsBg = (initial: string) => {
    // Implement the logic to determine the background color based on the initial
    // This is a placeholder and should be replaced with the actual implementation
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <PersonIcon className="h-4 w-4 text-primary" />
            </div>
            최근 고객 현황
          </CardTitle>
          <Link to="/clients">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              전체 보기
              <ChevronRightIcon className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 고객 현황 요약 */}
        <div className="p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {totalClients}
            </div>
            <div className="text-sm text-muted-foreground">총 고객 수</div>
          </div>
        </div>

        {/* 최근 고객 목록 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-2">
            최근 활동
          </h4>
          {recentClients.length > 0 ? (
            <>
              {recentClients.slice(0, 5).map(client => (
                <Link
                  to={`/clients/${client.id}`}
                  key={client.id}
                  className="block"
                >
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer hover:border-primary/30 hover:shadow-sm min-touch-target">
                    <div className="relative">
                      <div
                        className={cn(
                          'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium',
                          getInitialsBg(client.name[0])
                        )}
                      >
                        {client.name[0]}
                      </div>
                      {client.importance === '키맨' && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>

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
                        <span>{client.stage}</span>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(client.lastContactDate)}</span>
                        </div>
                      </div>

                      {client.referredBy && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            소개:{' '}
                            <span className="font-medium">
                              {client.referredBy}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          예상가치:{' '}
                          <span className="font-medium text-primary">
                            {client.potentialValue.toLocaleString()}만원
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
                      +{recentClients.length - 5}명 더 보기
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 sm:py-6">
              <div className="p-2 sm:p-3 bg-muted/20 rounded-full w-fit mx-auto mb-2 sm:mb-3">
                <PersonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                등록된 고객이 없습니다
              </p>
              <Link to="/clients">
                <Button size="sm" variant="outline">
                  고객 추가
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
