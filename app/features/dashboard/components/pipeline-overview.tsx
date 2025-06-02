import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { BarChartIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number; // 단위: 만원
  conversionRate?: number;
}

interface PipelineOverviewProps {
  stages: PipelineStage[];
  totalValue: number;
  monthlyTarget: number;
}

export function PipelineOverview({
  stages,
  totalValue,
  monthlyTarget,
}: PipelineOverviewProps) {
  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);

  // 파이프라인에 데이터가 있는지 확인
  const hasData = totalDeals > 0 || totalValue > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <BarChartIcon className="h-4 w-4 text-primary" />
            </div>
            영업 파이프라인
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link to="/pipeline">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                상세 보기
                <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* 파이프라인 단계별 현황 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground mb-3">
                단계별 현황
              </h4>
              {stages.map((stage, index) => {
                // 단계별 색상 매핑 (톤다운된 색상으로 통일)
                const stageColors = [
                  'bg-primary', // 첫 상담
                  'bg-muted', // 니즈 분석
                  'bg-muted-foreground/20', // 상품 설명
                  'bg-primary/80', // 계약 검토
                  'bg-muted-foreground/30', // 계약 체결
                ];
                const dotColor =
                  stageColors[index % stageColors.length] || 'bg-primary';

                return (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${dotColor} group-hover:scale-110 transition-transform`}
                      />
                      <span className="text-sm text-foreground font-medium">
                        {stage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {stage.count}건
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stage.value.toLocaleString()}만원
                        </div>
                      </div>
                      {stage.conversionRate && stage.conversionRate > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-muted text-muted-foreground border-border"
                        >
                          {stage.conversionRate}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/30">
              <div className="text-center p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="text-lg font-semibold text-foreground">
                  {totalDeals}
                </div>
                <div className="text-xs text-muted-foreground">
                  총 진행 건수
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                <div className="text-lg font-semibold text-primary">
                  {totalValue.toLocaleString()}
                </div>
                <div className="text-xs text-primary/80">예상 매출(만원)</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                <div className="text-lg font-semibold text-foreground">
                  {totalDeals > 0 ? (totalValue / totalDeals).toFixed(0) : '0'}
                </div>
                <div className="text-xs text-muted-foreground">
                  평균 건당(만원)
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 빈 상태 */
          <div className="text-center py-8">
            <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
              <BarChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              아직 파이프라인에 고객이 없습니다
            </p>
            <div className="flex flex-col gap-2 items-center">
              <Link to="/pipeline">
                <Button size="sm" variant="outline">
                  파이프라인 관리
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
