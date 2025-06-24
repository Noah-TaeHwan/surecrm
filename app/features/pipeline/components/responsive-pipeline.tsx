import { useState, useRef } from 'react';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Separator } from '~/common/components/ui/separator';
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  Target,
  UserPlus,
  Eye,
  Clock,
  CheckCircle,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Input } from '~/common/components/ui/input';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';

interface ResponsivePipelineProps {
  stages: (PipelineStage & {
    stats: { clientCount: number; highImportanceCount: number };
  })[];
  clients: Client[];
  totalAllClients: number;
  onAddClient?: () => void;
  onAddExistingClient?: () => void;
  onStageFilter?: (stageId: string) => void;
  activeStageFilter?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ResponsivePipeline - 영업 파이프라인 모바일 우선 반응형 컴포넌트
 *
 * 고객 상세 페이지와 동일한 디자인 패턴 적용:
 * - 상단 헤더 (타이틀, 액션 버튼)
 * - 기본정보 섹션 (파이프라인 통계)
 * - Sticky 탭 메뉴 (단계별 필터링, 캐러셀)
 * - 하단 콘텐츠 영역
 */
export function ResponsivePipeline({
  stages,
  clients,
  onAddClient,
  onAddExistingClient,
  onStageFilter,
  activeStageFilter,
  searchQuery = '',
  onSearchChange,
  children,
  className,
}: ResponsivePipelineProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  // 캐러셀 스크롤 제어를 위한 ref
  const carouselRef = useRef<HTMLDivElement>(null);

  // 향후 스크롤 리스너 확장 가능

  // 검색어 필터링된 클라이언트 (단계 필터 적용 전)
  const searchFilteredClients =
    searchQuery && searchQuery.trim()
      ? clients.filter(client => {
          const query = searchQuery.toLowerCase().trim();
          return (
            client.name?.toLowerCase().includes(query) ||
            client.phone?.toLowerCase().includes(query) ||
            client.email?.toLowerCase().includes(query)
          );
        })
      : clients;

  // 파이프라인 단계 탭 구성 (검색어 필터링 적용된 결과로 카운트)
  const pipelineTabs = [
    {
      id: 'all',
      label: '전체',
      icon: Users,
      count: searchFilteredClients.length,
    },
    ...stages.map(stage => ({
      id: stage.id,
      label: stage.name,
      icon: getStageIcon(stage.name),
      count: searchFilteredClients.filter(client => client.stageId === stage.id)
        .length,
    })),
  ];

  // 단계별 아이콘 매핑
  function getStageIcon(stageName: string) {
    switch (stageName.toLowerCase()) {
      case '잠재고객':
      case 'lead':
        return Eye;
      case '접촉':
      case 'contact':
        return Activity;
      case '상담':
      case 'consultation':
        return Users;
      case '제안':
      case 'proposal':
        return Target;
      case '계약':
      case 'contract':
        return CheckCircle;
      default:
        return Clock;
    }
  }

  // 통계 계산
  const getTotalStats = () => {
    const totalClients = clients.length;
    const highImportanceClients = clients.filter(
      client => client.importance === 'high'
    ).length;
    const totalRevenue = clients.reduce(
      (sum, client) => sum + (client.totalExpectedCommission || 0),
      0
    );
    const totalPremium = clients.reduce(
      (sum, client) => sum + (client.totalMonthlyPremium || 0),
      0
    );

    return {
      totalClients,
      highImportanceClients,
      totalRevenue,
      totalPremium,
    };
  };

  const stats = getTotalStats();

  // 탭 필터링에 따른 고객 필터링
  const getFilteredClients = () => {
    let filtered = searchFilteredClients; // 이미 검색어 필터링된 결과 사용

    // 단계별 필터링
    if (
      activeStageFilter &&
      activeStageFilter !== '' &&
      activeStageFilter !== 'all'
    ) {
      filtered = filtered.filter(
        client => client.stageId === activeStageFilter
      );
    }

    return filtered;
  };

  // 탭 변경 시 캐러셀 자동 스크롤 (향후 구현 예정)

  return (
    <div className={cn('min-h-screen', className)}>
      {/* 🎯 모바일/태블릿 레이아웃 (lg 미만에서만 표시) */}
      <div className="block lg:hidden">
        {/* 모바일 헤더 */}
        <div className="bg-background border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">영업 파이프라인</h1>
              <p className="text-xs text-muted-foreground">
                총 {stats.totalClients}명의 고객
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddExistingClient}
                className="h-8 text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                기존고객
              </Button>
              <Button size="sm" onClick={onAddClient} className="h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                신규고객
              </Button>
            </div>
          </div>
        </div>

        {/* 기본정보 섹션 */}
        <div className="bg-background border-b border-border/20 px-4 py-3">
          <div
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">파이프라인 통계</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.totalClients}명
            </Badge>
          </div>

          {isStatsExpanded && (
            <div className="mt-3 space-y-3">
              <Separator />

              {/* 통계 카드들 */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded-md">
                        <Users className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">총 고객</p>
                        <p className="text-sm font-semibold">
                          {stats.totalClients}명
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-50 rounded-md">
                        <Target className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">키맨</p>
                        <p className="text-sm font-semibold">
                          {stats.highImportanceClients}명
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-50 rounded-md">
                        <DollarSign className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          예상수수료
                        </p>
                        <p className="text-sm font-semibold">
                          {stats.totalRevenue.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-50 rounded-md">
                        <TrendingUp className="h-3 w-3 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          월 보험료
                        </p>
                        <p className="text-sm font-semibold">
                          {stats.totalPremium.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 검색바 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="고객 이름으로 검색..."
                  value={searchQuery}
                  onChange={e => onSearchChange?.(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky 탭 메뉴 */}
        <div className="sticky -top-3 z-40 bg-background border-b border-border/50 shadow-sm">
          <div className="relative">
            <div className="relative overflow-hidden">
              <div
                ref={carouselRef}
                className="flex gap-3 px-4 py-2.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide scrollbar-none"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {pipelineTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive =
                    activeStageFilter === tab.id ||
                    (!activeStageFilter && tab.id === 'all');

                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        onStageFilter?.(tab.id === 'all' ? '' : tab.id)
                      }
                      className={cn(
                        'relative flex-shrink-0 flex items-center gap-1.5 text-xs font-medium',
                        'snap-center border min-w-fit overflow-hidden',
                        'transform-gpu will-change-transform backface-hidden',
                        isActive
                          ? [
                              'px-3.5 py-1.5 rounded-lg',
                              'bg-primary text-white',
                              'shadow-sm shadow-primary/20 border-primary/30',
                              'translate-y-0 z-10',
                            ]
                          : [
                              'px-3 py-1.5 rounded-lg',
                              'bg-muted/30 text-muted-foreground border-border/30',
                              'hover:bg-muted/50 hover:text-foreground/80',
                              'hover:shadow-sm hover:border-border/50',
                              'translate-y-0 z-0',
                            ]
                      )}
                      style={{
                        transition:
                          'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    >
                      <div
                        className={cn(
                          'transition-all duration-300 ease-out flex-shrink-0',
                          isActive ? 'scale-105' : 'scale-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'transition-all duration-300 ease-out',
                            isActive ? 'h-3.5 w-3.5 text-white' : 'h-3 w-3'
                          )}
                        />
                      </div>

                      <span
                        className={cn(
                          'text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out',
                          isActive
                            ? 'font-medium tracking-normal text-white'
                            : 'font-normal tracking-normal'
                        )}
                      >
                        {tab.label}
                      </span>

                      <Badge
                        variant={isActive ? 'secondary' : 'outline'}
                        className={cn(
                          'text-xs h-4 px-1.5 min-w-0',
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-muted text-muted-foreground border-border/50'
                        )}
                      >
                        {tab.count}
                      </Badge>

                      {!isActive && (
                        <div
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/5 to-accent/10 opacity-0 hover:opacity-100 transition-all duration-300 ease-out -z-20"
                          style={{
                            transform: 'translate3d(0, 0, 0)',
                            transition:
                              'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 모바일/태블릿 콘텐츠 영역 */}
        <div className="p-4 pb-20">
          {/* 필터링된 고객 카드들 표시 */}
          <div className="space-y-3">
            {getFilteredClients().length > 0 ? (
              getFilteredClients().map(client => {
                const clientStage = stages.find(s => s.id === client.stageId);
                return (
                  <div
                    key={client.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* 클라이언트 카드 위에 단계 표시 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: clientStage?.color || '#gray',
                          }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {clientStage?.name || '알 수 없음'}
                        </span>
                      </div>
                    </div>

                    {/* 고객 기본 정보 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base">
                          {client.name}
                        </h3>
                        {client.importance === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            중요
                          </Badge>
                        )}
                      </div>

                      {client.phone && (
                        <p className="text-sm text-muted-foreground">
                          {client.phone}
                        </p>
                      )}

                      {client.email && (
                        <p className="text-sm text-muted-foreground">
                          {client.email}
                        </p>
                      )}

                      {client.occupation && (
                        <p className="text-sm text-muted-foreground">
                          직업: {client.occupation}
                        </p>
                      )}

                      {/* 보험 정보 */}
                      {client.totalMonthlyPremium &&
                        client.totalMonthlyPremium > 0 && (
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              월 보험료
                            </span>
                            <span className="text-sm font-medium">
                              {client.totalMonthlyPremium.toLocaleString()}원
                            </span>
                          </div>
                        )}

                      {client.totalExpectedCommission &&
                        client.totalExpectedCommission > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              예상 수수료
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {client.totalExpectedCommission.toLocaleString()}
                              원
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  고객이 없습니다
                </h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  선택한 조건에 맞는 고객이 없습니다. 다른 단계를 선택하거나 새
                  고객을 추가해보세요.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddClient}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  고객 추가
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 데스크톱 레이아웃 (lg 이상에서만 표시) */}
      <div className="hidden lg:block">{children}</div>
    </div>
  );
}
