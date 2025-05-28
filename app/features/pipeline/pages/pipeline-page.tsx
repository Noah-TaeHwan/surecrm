import type { Route } from '.react-router/types/app/features/pipeline/pages/+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState } from 'react';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { AddClientModal } from '~/features/pipeline/components/add-client-modal';
import { Plus, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import type { Client } from '~/features/pipeline/types';
import { Separator } from '~/common/components/ui/separator';
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
import { getCurrentUserId } from '~/features/clients/lib/auth-utils';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '영업 파이프라인 - SureCRM' },
    { name: 'description', content: '영업 단계별 고객 관리 파이프라인' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 현재 사용자 정보 가져오기
    const currentUserId = await getCurrentUserId(request);
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

  // 각 단계별 고객 수와 총 가치 계산
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
    selectedReferrerId !== null || selectedImportance !== 'all';

  return (
    <MainLayout title="영업 파이프라인">
      <div className="space-y-6">
        {/* 전체 상단 영역 - sticky로 고정 */}
        <div className="sticky -top-8 z-20 bg-background border-b border-border pb-6">
          {/* 필터 및 검색 섹션 */}
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="고객명, 전화번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
                autoComplete="off"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* 필터 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isFilterActive ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>필터 {isFilterActive ? '적용됨' : ''}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[320px] p-4 bg-background"
                  align="end"
                  sideOffset={4}
                >
                  <div className="space-y-4">
                    <h3 className="font-medium">필터 설정</h3>
                    <PipelineFilters
                      referrers={referrers}
                      selectedReferrerId={selectedReferrerId}
                      onReferrerChange={setSelectedReferrerId}
                      selectedImportance={selectedImportance}
                      onImportanceChange={setSelectedImportance}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedStageId('');
                  setAddClientOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                <span>고객 추가</span>
              </Button>
            </div>
          </div>

          {/* 활성화된 필터 표시 */}
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
              {selectedReferrerId && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span className="mr-1">소개자:</span>
                  <span className="font-semibold mr-1">
                    {referrers.find((r) => r.id === selectedReferrerId)?.name}
                  </span>
                  <button
                    onClick={() => setSelectedReferrerId(null)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 w-4 h-4 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedImportance !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span className="mr-1">중요도:</span>
                  <span className="font-semibold mr-1">
                    {selectedImportance === 'high'
                      ? '높음'
                      : selectedImportance === 'medium'
                      ? '중간'
                      : '낮음'}
                  </span>
                  <button
                    onClick={() => setSelectedImportance('all')}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 w-4 h-4 inline-flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setSelectedReferrerId(null);
                  setSelectedImportance('all');
                }}
              >
                필터 초기화
              </Button>
            </div>
          )}

          {/* 칸반보드 헤더 - sticky 영역에 포함 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stages.map((stage) => {
              const stats = getStageStats(stage.id);

              return (
                <div key={`header-${stage.id}`} className="min-w-[300px]">
                  <div className="flex flex-col p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-foreground text-base">
                          {stage.name}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddClientToStage(stage.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">
                          {stats.clientCount}명
                        </span>
                      </div>
                      {stats.highImportanceCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs text-red-600 font-medium">
                            중요 {stats.highImportanceCount}명
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 칸반보드 섹션 */}
        <PipelineBoard
          stages={stages}
          clients={filteredClients as Client[]}
          onClientMove={handleClientMove}
          onAddClientToStage={handleAddClientToStage}
        />

        {/* 고객 추가 모달 */}
        <AddClientModal
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          stages={stages}
          referrers={referrers}
          initialStageId={selectedStageId}
          onAddClient={handleAddClient}
        />
      </div>
    </MainLayout>
  );
}
