import { cn } from '~/lib/utils';
import { Card, CardContent } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { Separator } from '~/common/components/ui/separator';
import {
  Plus,
  UserPlus,
  Search,
  Users,
  BarChart3,
  Target,
  DollarSign,
  TrendingUp,
  Eye,
  Activity,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { ClientCard } from './client-card';
import type { PipelineStage } from '../types/types';
import type { Client } from '../types/types';

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const { t } = useHydrationSafeTranslation('pipeline');

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

  // 스테이지 이름을 번역 키로 매핑하는 헬퍼 함수
  const getStageTranslationKey = (stageName: string) => {
    switch (stageName) {
      case '첫 상담':
        return 'firstConsultation';
      case '니즈 분석':
        return 'needsAnalysis';
      case '상품 설명':
        return 'productExplanation';
      case '계약 검토':
        return 'contractReview';
      case '계약 완료':
        return 'contractCompleted';
      default:
        return stageName;
    }
  };

  const getTranslatedStageName = (stageName: string) => {
    const key = getStageTranslationKey(stageName);
    return key === stageName ? stageName : t(`stages.${key}`, stageName);
  };

  // 파이프라인 단계 탭 구성 (검색어 필터링 적용된 결과로 카운트)
  const pipelineTabs = [
    {
      id: 'all',
      label: t('labels.all'),
      icon: Users,
      count: searchFilteredClients.length,
    },
    ...stages.map(stage => ({
      id: stage.id,
      label: getTranslatedStageName(stage.name),
      icon: getStageIcon(stage.name),
      count: searchFilteredClients.filter(client => client.stageId === stage.id)
        .length,
    })),
  ];

  // 단계별 아이콘 매핑
  function getStageIcon(stageName: string) {
    // 영업 단계를 정규화 (한국어와 영어 모두 지원)
    const normalizedStage = stageName.toLowerCase();

    // 번역 키 또는 데이터베이스 값에 따른 매핑
    if (
      normalizedStage.includes('잠재') ||
      normalizedStage.includes('prospect') ||
      normalizedStage.includes('lead')
    ) {
      return Eye;
    } else if (
      normalizedStage.includes('접촉') ||
      normalizedStage.includes('contact') ||
      normalizedStage.includes('첫') ||
      normalizedStage.includes('consultation')
    ) {
      return Activity;
    } else if (
      normalizedStage.includes('상담') ||
      normalizedStage.includes('니즈') ||
      normalizedStage.includes('analysis')
    ) {
      return Users;
    } else if (
      normalizedStage.includes('제안') ||
      normalizedStage.includes('상품') ||
      normalizedStage.includes('proposal')
    ) {
      return Target;
    } else if (
      normalizedStage.includes('계약') ||
      normalizedStage.includes('contract') ||
      normalizedStage.includes('완료') ||
      normalizedStage.includes('closed')
    ) {
      return CheckCircle;
    } else {
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
      <div
        className="block lg:hidden"
        style={{
          // iOS Safari 최적화
          WebkitOverflowScrolling: 'touch',
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)',
          position: 'relative',
          minHeight: '100dvh', // 동적 viewport height 지원 (fallback: 100vh)
        }}
      >
        {/* 모바일 헤더 */}
        <div className="bg-background border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                {t('navigation.salesPipeline')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('labels.totalClients', {
                  count: stats.totalClients,
                })}
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
                {t('actions.existingClient', '기존고객')}
              </Button>
              <Button size="sm" onClick={onAddClient} className="h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                {t('actions.newClient', '신규고객')}
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
              <span className="text-sm font-medium">
                {t('labels.pipelineStats')}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {t('labels.clientCount', {
                count: stats.totalClients,
              })}
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
                        <p className="text-xs text-muted-foreground">
                          {t('labels.totalClients_short')}
                        </p>
                        <p className="text-sm font-semibold">
                          {t('labels.clientCount', {
                            count: stats.totalClients,
                          })}
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
                        <p className="text-xs text-muted-foreground">
                          {t('labels.keyPerson')}
                        </p>
                        <p className="text-sm font-semibold">
                          {t('labels.clientCount', {
                            count: stats.highImportanceClients,
                          })}
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
                          {t('labels.expectedCommission')}
                        </p>
                        <p className="text-sm font-semibold">
                          {stats.totalRevenue.toLocaleString()}
                          {t('labels.currency')}
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
                          {t('labels.monthlyPremium')}
                        </p>
                        <p className="text-sm font-semibold">
                          {stats.totalPremium.toLocaleString()}
                          {t('labels.currency')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 검색바 - iOS 최적화 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder={t('labels.searchByName')}
                  value={searchQuery}
                  onChange={e => onSearchChange?.(e.target.value)}
                  className="pl-9 h-10 text-base"
                  style={{
                    fontSize: '16px', // iOS 자동 줌 방지
                    transformOrigin: 'left',
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky 탭 메뉴 - iOS 최적화 */}
        <div
          className="sticky -top-3 z-40 bg-background border-b border-border/50 shadow-sm"
          style={{
            position: '-webkit-sticky',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
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

        {/* 모바일/태블릿 콘텐츠 영역 - iOS 최적화 */}
        <div
          className="p-4 pb-20"
          style={{
            // iOS 키보드 대응
            paddingBottom: 'env(keyboard-inset-height, 80px)',
            minHeight: 'calc(100vh - 200px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* 필터링된 고객 카드들 표시 */}
          <div className="space-y-3">
            {getFilteredClients().length > 0 ? (
              getFilteredClients().map(client => {
                const clientStage = stages.find(s => s.id === client.stageId);

                return (
                  <div key={client.id} className="space-y-3">
                    {/* 🎯 모바일 전용: 단계 표시 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: clientStage?.color || '#gray',
                          }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {getTranslatedStageName(
                            clientStage?.name || '알 수 없음'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 🎯 데스크톱과 동일한 ClientCard 사용 */}
                    <ClientCard
                      id={client.id}
                      name={client.name}
                      phone={client.phone}
                      email={client.email}
                      address={client.address}
                      occupation={client.occupation}
                      telecomProvider={client.telecomProvider}
                      height={client.height}
                      weight={client.weight}
                      hasDrivingLicense={client.hasDrivingLicense}
                      hasHealthIssues={(client as any).hasHealthIssues}
                      importance={client.importance}
                      tags={
                        Array.isArray(client.tags)
                          ? client.tags.join(', ')
                          : client.tags
                      }
                      notes={client.note}
                      createdAt={client.createdAt || new Date().toISOString()}
                      lastContactDate={client.lastContactDate}
                      referredBy={client.referredBy || undefined}
                      insuranceInfo={
                        Array.isArray(client.insuranceInfo)
                          ? client.insuranceInfo[0]
                          : client.insuranceInfo
                      }
                      interestCategories={client.interestCategories}
                      isDragging={false}
                      products={client.products}
                      totalMonthlyPremium={client.totalMonthlyPremium}
                      totalExpectedCommission={client.totalExpectedCommission}
                    />
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
