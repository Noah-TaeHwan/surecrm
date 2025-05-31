import type { Route } from '.react-router/types/app/features/pipeline/pages/+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState } from 'react';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { AddClientModal } from '~/features/pipeline/components/add-client-modal';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import type { Client } from '~/features/pipeline/types/types';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  getPipelineStages,
  getClientsByStage,
  createDefaultPipelineStages,
} from '~/features/pipeline/lib/supabase-pipeline-data';
import { getCurrentUserIdSync } from '~/lib/auth/helpers';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '영업 파이프라인 - SureCRM' },
    { name: 'description', content: '영업 단계별 고객 관리 파이프라인' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 현재 사용자 정보 가져오기
    const currentUserId = getCurrentUserIdSync(request);
    if (!currentUserId) {
      throw new Error('인증이 필요합니다.');
    }

    // 파이프라인 단계 조회
    let stages = await getPipelineStages(currentUserId);

    // 단계가 없으면 기본 단계 생성
    if (stages.length === 0) {
      stages = await createDefaultPipelineStages(currentUserId);
    }

    // 고객 데이터 조회
    const clients = await getClientsByStage(currentUserId);

    return {
      stages,
      clients,
      currentUserId,
    };
  } catch (error) {
    console.error('Pipeline loader error:', error);
    return {
      stages: [],
      clients: [],
      currentUserId: null,
      error:
        error instanceof Error
          ? error.message
          : '데이터를 불러오는데 실패했습니다.',
    };
  }
}

export default function PipelinePage({ loaderData }: Route.ComponentProps) {
  const { stages, clients } = loaderData;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(
    null
  );
  const [selectedImportance, setSelectedImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  // 필터링된 고객 목록
  const filteredClients = clients.filter((client) => {
    // 검색어 필터링
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    // 소개자 필터링
    const matchesReferrer =
      selectedReferrerId === null ||
      client.referredBy?.id === selectedReferrerId;

    // 중요도 필터링
    const matchesImportance =
      selectedImportance === 'all' || client.importance === selectedImportance;

    return matchesSearch && matchesReferrer && matchesImportance;
  });

  // 모든 소개자 목록 생성 (중복 제거)
  const referrers = clients
    .filter((client) => clients.some((c) => c.referredBy?.id === client.id))
    .map((client) => ({
      id: client.id,
      name: client.name,
    }));

  // 🎯 MVP용 전체 통계 계산
  const getTotalStats = () => {
    const totalClients = filteredClients.length;
    const highImportanceClients = filteredClients.filter(
      (client) => client.importance === 'high'
    ).length;
    const conversionRate =
      stages.length > 0
        ? Math.round(
            (filteredClients.filter(
              (client) =>
                stages.findIndex((s) => s.id === client.stageId) >=
                stages.length - 2
            ).length /
              Math.max(totalClients, 1)) *
              100
          )
        : 0;

    return { totalClients, highImportanceClients, conversionRate };
  };

  // 각 단계별 고객 수와 중요 고객 수 계산
  const getStageStats = (stageId: string) => {
    const stageClients = filteredClients.filter(
      (client) => client.stageId === stageId
    );
    const clientCount = stageClients.length;
    const highImportanceCount = stageClients.filter(
      (client) => client.importance === 'high'
    ).length;

    return { clientCount, highImportanceCount };
  };

  // 고객 이동 처리 함수
  const handleClientMove = (
    clientId: string,
    sourceStageId: string,
    destinationStageId: string
  ) => {
    // 실제 구현에서는 여기서 API 호출을 통해 DB 업데이트를 수행합니다
    console.log(
      `Move client ${clientId} from ${sourceStageId} to ${destinationStageId}`
    );
  };

  // 새 고객 추가 처리 함수
  const handleAddClient = (client: {
    name: string;
    phone: string;
    email?: string;
    stageId: string;
    importance: 'high' | 'medium' | 'low';
    referrerId?: string;
    note?: string;
  }) => {
    // 실제 구현에서는 여기서 API 호출을 통해 DB에 새 고객을 추가합니다
    console.log('Add new client:', client);

    // 성공적으로 추가 후 모달 닫기
    setAddClientOpen(false);
    setSelectedStageId(''); // 단계 선택 초기화
  };

  // 특정 단계에 고객 추가 함수
  const handleAddClientToStage = (stageId: string) => {
    setSelectedStageId(stageId);
    setAddClientOpen(true);
  };

  // 필터가 적용되었는지 확인
  const isFilterActive =
    selectedReferrerId !== null ||
    selectedImportance !== 'all' ||
    searchQuery !== '';

  const totalStats = getTotalStats();

  return (
    <MainLayout title="영업 파이프라인">
      <div className="space-y-6">
        {/* 🎯 MVP 통계 헤더 - sticky로 고정 */}
        <div className="sticky -top-8 z-20 bg-background border-b border-border pb-6">
          {/* 전체 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6">
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  전체 고객
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.totalClients}
                </p>
                <p className="text-xs text-muted-foreground">
                  중요 고객:{' '}
                  <span className="text-red-500 font-medium">
                    {totalStats.highImportanceClients}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  전환율
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.conversionRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  최종 단계 진입률
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  진행 단계
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stages.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  활성 파이프라인 단계
                </p>
              </div>
            </div>
          </div>

          {/* 필터 및 검색 섹션 */}
          <div className="flex items-center justify-between">
            <div className="flex w-full max-w-md items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="고객명, 전화번호 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 활성 필터 표시 */}
              {isFilterActive && (
                <div className="flex items-center gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      검색: {searchQuery}
                    </Badge>
                  )}
                  {selectedImportance !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      중요도:{' '}
                      {selectedImportance === 'high'
                        ? '높음'
                        : selectedImportance === 'medium'
                        ? '보통'
                        : '낮음'}
                    </Badge>
                  )}
                  {selectedReferrerId && (
                    <Badge variant="secondary" className="text-xs">
                      소개자:{' '}
                      {referrers.find((r) => r.id === selectedReferrerId)?.name}
                    </Badge>
                  )}
                </div>
              )}

              {/* 필터 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isFilterActive ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>필터</span>
                    {isFilterActive && (
                      <Badge
                        variant="destructive"
                        className="ml-1 px-1 text-xs"
                      >
                        ●
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[320px] p-4 bg-background"
                  align="end"
                  sideOffset={4}
                >
                  <PipelineFilters
                    referrers={referrers}
                    selectedReferrerId={selectedReferrerId}
                    onReferrerChange={setSelectedReferrerId}
                    selectedImportance={selectedImportance}
                    onImportanceChange={setSelectedImportance}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 고객 추가 버튼 */}
              <Button
                onClick={() => setAddClientOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>고객 추가</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 🎯 칸반보드 메인 콘텐츠 */}
        <div className="min-h-[600px]">
          <PipelineBoard
            stages={stages.map((stage) => ({
              ...stage,
              stats: getStageStats(stage.id),
            }))}
            clients={filteredClients}
            onClientMove={handleClientMove}
            onAddClientToStage={handleAddClientToStage}
          />
        </div>

        {/* 필터 결과 안내 */}
        {isFilterActive && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                필터 적용됨: {filteredClients.length}명의 고객이 표시되고
                있습니다
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedReferrerId(null);
                setSelectedImportance('all');
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      {/* 고객 추가 모달 */}
      <AddClientModal
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        stages={stages}
        referrers={referrers}
        initialStageId={selectedStageId}
        onAddClient={handleAddClient}
      />
    </MainLayout>
  );
}
