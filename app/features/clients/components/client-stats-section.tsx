import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Users, Plus, Upload, Download } from 'lucide-react';

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
            <Plus className="h-5 w-5 text-green-600" />새 고객 등록
          </CardTitle>
          <p className="text-sm text-muted-foreground pb-6">
            새 고객을 빠르게 추가하고 관리를 시작하세요
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button onClick={onAddClient} className="w-full h-10">
              <Plus className="h-4 w-4 mr-2" />새 고객 추가
            </Button>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-10 opacity-60 cursor-not-allowed"
                disabled
              >
                <Upload className="h-4 w-4 mr-2" />
                엑셀로 가져오기
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                MVP에서는 제공되지 않는 기능입니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고객 관리 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            고객 현황 요약
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            현재 관리 중인 고객들의 핵심 지표
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">전체 고객</span>
              <Badge variant="outline">{stats?.totalClients || 0}명</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                활성 관리 중
              </span>
              <Badge variant="outline">{stats?.activeClients || 0}명</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">키맨 고객</span>
              <Badge variant="outline">{keyClients}명</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">계약 완료</span>
              <Badge variant="outline">{contractedClients}명</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">전환율</span>
              <Badge variant="outline">{stats?.conversionRate || 0}%</Badge>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full h-10 opacity-60 cursor-not-allowed"
                disabled
              >
                <Download className="h-4 w-4 mr-2" />
                고객 목록 내보내기
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                MVP에서는 제공되지 않는 기능입니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
