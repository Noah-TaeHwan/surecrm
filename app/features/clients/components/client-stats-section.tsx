import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Users, Plus, Upload, Download } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface ClientStatsData {
  totalClients: number;
  activeClients: number;
  conversionRate: number;
}

interface ClientStatsProps {
  stats: ClientStatsData;
  clients: any[];
  onAddClient: () => void;
}

export function ClientStatsSection({
  stats,
  clients,
  onAddClient,
}: ClientStatsProps) {
  const { t, isHydrated } = useHydrationSafeTranslation('clients');

  // 키맨 고객 계산
  const keyClients =
    clients?.filter((c: any) => c.importance === 'high').length || 0;

  // 계약 완료 고객 계산
  const contractedClients =
    clients?.filter((c: any) => c.currentStage?.name === '계약 완료').length ||
    0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 빠른 고객 등록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            {t('stats.newClientRegistration', '새 고객 등록')}
          </CardTitle>
          <p className="text-sm text-muted-foreground pb-6">
            {t(
              'stats.quickAddDescription',
              '새 고객을 빠르게 추가하고 관리를 시작하세요'
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button onClick={onAddClient} className="w-full h-10">
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.addClient', '새 고객 추가')}
            </Button>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-10 opacity-60 cursor-not-allowed"
                disabled
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('actions.import', '엑셀로 가져오기')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t(
                  'stats.mvpNotAvailable',
                  'MVP에서는 제공되지 않는 기능입니다'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고객 관리 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 pb-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t('stats.clientStatusSummary', '고객 현황 요약')}
          </CardTitle>
          <p className="text-sm text-muted-foreground pb-4">
            {t(
              'stats.keyMetricsDescription',
              '현재 관리 중인 고객들의 핵심 지표'
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.totalClients', '전체 고객')}
              </span>
              <Badge variant="outline">
                {t('list.totalCount', '총 {{count}}명', {
                  count: stats?.totalClients || 0,
                })}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.activeManagement', '활성 관리 중')}
              </span>
              <Badge variant="outline">
                {t('list.totalCount', '총 {{count}}명', {
                  count: stats?.activeClients || 0,
                })}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.keyClients', '키맨 고객')}
              </span>
              <Badge variant="outline">
                {t('list.totalCount', '총 {{count}}명', { count: keyClients })}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.contractCompleted', '계약 완료')}
              </span>
              <Badge variant="outline">
                {t('list.totalCount', '총 {{count}}명', {
                  count: contractedClients,
                })}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('stats.conversionRate', '전환율')}
              </span>
              <Badge variant="outline">{stats?.conversionRate || 0}%</Badge>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full h-10 opacity-60 cursor-not-allowed"
                disabled
              >
                <Download className="h-4 w-4 mr-2" />
                {t('actions.export', '고객 목록 내보내기')}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {t(
                  'stats.mvpNotAvailable',
                  'MVP에서는 제공되지 않는 기능입니다'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
