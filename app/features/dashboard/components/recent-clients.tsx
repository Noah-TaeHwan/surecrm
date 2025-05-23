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
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
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
              {recentClients.slice(0, 5).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-colors"
                >
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
                </div>
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
            <div className="text-center py-6">
              <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
                <PersonIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
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
