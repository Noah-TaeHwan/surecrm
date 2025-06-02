import type { Route } from './+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState, useEffect } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { AddClientModal } from '~/features/clients/components/add-client-modal';
import { ExistingClientOpportunityModal } from '../components/existing-client-opportunity-modal';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  TrendingUp,
  Target,
  UserPlus,
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
import { requireAuth } from '~/lib/auth/middleware';
import { redirect } from 'react-router';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '영업 파이프라인 - SureCRM' },
    { name: 'description', content: '영업 단계별 고객 관리 파이프라인' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  console.log('🎯 파이프라인 페이지 loader 시작');

  try {
    // 🎯 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // 🎯 파이프라인 단계 조회
    let stages: any[] = [];
    try {
      stages = await getPipelineStages(agentId);
      console.log('📋 파이프라인 단계 조회 결과:', {
        stagesCount: stages.length,
        stages: stages.map((s) => ({ id: s.id, name: s.name })),
      });

      // 🎯 파이프라인 단계가 없으면 기본 단계 생성
      if (stages.length === 0) {
        console.log('⚙️ 기본 파이프라인 단계 생성 중...');
        stages = await createDefaultPipelineStages(agentId);
        console.log('✅ 기본 파이프라인 단계 생성 완료:', stages.length);
      }
    } catch (stageError) {
      console.error('❌ 파이프라인 단계 조회/생성 실패:', stageError);
      // 빈 배열로 fallback
      stages = [];
    }

    // 🎯 모든 고객 조회
    let allClients: any[] = [];
    try {
      allClients = await getClientsByStage(agentId);
      console.log('👥 전체 고객 조회 결과:', {
        totalClients: allClients.length,
        clientsByStage: stages.map((stage) => ({
          stageName: stage.name,
          clientCount: allClients.filter(
            (client) => client.stageId === stage.id
          ).length,
        })),
      });
    } catch (clientError) {
      console.error('❌ 고객 조회 실패:', clientError);
      // 빈 배열로 fallback
      allClients = [];
    }

    return {
      stages,
      clients: allClients,
      currentUserId: agentId,
    };
  } catch (error) {
    console.error('❌ 파이프라인 데이터 로드 실패:', error);

    // 🎯 더 상세한 에러 정보와 함께 안전한 fallback 반환
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

// 🎯 새로운 action 함수 - 서버사이드에서 고객 추가 처리
export async function action({ request }: Route.ActionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'addClient') {
      // 폼 데이터 파싱
      const clientData = {
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        email: (formData.get('email') as string) || undefined,
        telecomProvider:
          (formData.get('telecomProvider') as string) || undefined,
        address: (formData.get('address') as string) || undefined,
        occupation: (formData.get('occupation') as string) || undefined,
        importance:
          (formData.get('importance') as 'high' | 'medium' | 'low') || 'medium',
        referredById: (formData.get('referredById') as string) || undefined,
        tags: formData.get('tags')
          ? (formData.get('tags') as string)
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        notes: (formData.get('notes') as string) || undefined,
      };

      console.log('🎯 서버사이드에서 새 고객 추가 시작:', clientData);

      // 첫 상담 단계 찾기
      const stages = await getPipelineStages(user.id);
      const firstStage = stages.find((s) => s.name === '첫 상담') || stages[0];

      if (!firstStage) {
        return {
          success: false,
          error:
            '첫 상담 단계를 찾을 수 없습니다. 파이프라인 설정을 확인해주세요.',
        };
      }

      // 🎯 실제 Supabase API 호출
      const { createClient } = await import('~/api/shared/clients');

      const newClientData = {
        fullName: clientData.fullName,
        phone: clientData.phone,
        email: clientData.email,
        telecomProvider: clientData.telecomProvider,
        address: clientData.address,
        occupation: clientData.occupation,
        importance: clientData.importance,
        referredById: clientData.referredById,
        tags: clientData.tags,
        notes: clientData.notes,
        currentStageId: firstStage.id, // 🎯 첫 상담 단계로 설정
      };

      const result = await createClient(newClientData, user.id);

      if (result.success && result.data) {
        console.log('✅ 새 고객 추가 성공:', result.data.fullName);
        // 🎯 성공 응답 반환 (redirect 대신)
        return {
          success: true,
          message: '고객이 성공적으로 추가되었습니다.',
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '고객 추가에 실패했습니다.',
        };
      }
    }

    if (intent === 'moveClient') {
      // 고객 단계 이동 데이터 파싱
      const clientId = formData.get('clientId') as string;
      const targetStageId = formData.get('targetStageId') as string;

      if (!clientId || !targetStageId) {
        return {
          success: false,
          error: '고객 ID 또는 대상 단계 ID가 누락되었습니다.',
        };
      }

      // 🎯 실제 Supabase API 호출
      const { updateClientStage } = await import('~/api/shared/clients');

      const result = await updateClientStage(clientId, targetStageId, user.id);

      if (result.success && result.data) {
        return {
          success: true,
          message: result.message,
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '고객 단계 이동에 실패했습니다.',
        };
      }
    }

    if (intent === 'existingClientOpportunity') {
      // 기존 고객 새 영업 기회 생성
      const clientId = formData.get('clientId') as string;
      const clientName = formData.get('clientName') as string;
      const insuranceType = formData.get('insuranceType') as string;
      const notes = formData.get('notes') as string;

      if (!clientId || !insuranceType) {
        return {
          success: false,
          error: '고객 ID 또는 보험 상품 타입이 누락되었습니다.',
        };
      }

      console.log('🚀 기존 고객 새 영업 기회 생성:', {
        clientId,
        clientName,
        insuranceType,
        notes,
      });

      // 첫 상담 단계 찾기
      const stages = await getPipelineStages(user.id);
      const firstStage = stages.find((s) => s.name === '첫 상담') || stages[0];

      if (!firstStage) {
        return {
          success: false,
          error: '첫 상담 단계를 찾을 수 없습니다.',
        };
      }

      // 고객 정보 업데이트 및 단계 이동
      const { updateClient, updateClientStage } = await import(
        '~/api/shared/clients'
      );

      // 영업 기회 메모 추가
      const getInsuranceTypeName = (type: string) => {
        const typeMap: Record<string, string> = {
          auto: '자동차보험',
          life: '생명보험',
          health: '건강보험',
          home: '주택보험',
          business: '사업자보험',
        };
        return typeMap[type] || type;
      };

      const opportunityNotes = `[${getInsuranceTypeName(
        insuranceType
      )} 영업] ${notes}`;

      // 현재 고객 정보 조회해서 기존 메모에 추가
      const { getClientById } = await import('~/api/shared/clients');
      const existingClient = await getClientById(clientId, user.id);

      const updateData = {
        notes: existingClient?.notes
          ? `${existingClient.notes}\n\n--- 새 영업 기회 ---\n${opportunityNotes}`
          : opportunityNotes,
      };

      await updateClient(clientId, updateData, user.id);

      // 고객을 첫 상담 단계로 이동
      const result = await updateClientStage(clientId, firstStage.id, user.id);

      if (result.success) {
        console.log('✅ 기존 고객 새 영업 기회 생성 완료');
        return {
          success: true,
          message: `${clientName} 고객의 새 영업 기회가 생성되었습니다.`,
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '영업 기회 생성에 실패했습니다.',
        };
      }
    }

    return { success: false, error: '알 수 없는 요청입니다.' };
  } catch (error) {
    console.error('❌ Action에서 고객 추가 실패:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

export default function PipelinePage({ loaderData }: Route.ComponentProps) {
  const { stages, clients } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(
    null
  );
  const [selectedImportance, setSelectedImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [existingClientModalOpen, setExistingClientModalOpen] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);

  // 🎯 fetcher 상태 기반으로 상태 관리
  const isSubmitting = fetcher.state === 'submitting';
  const submitError = fetcher.data?.error || null;

  // 🎯 성공 시 모달 닫기 및 데이터 새로고침 로직
  useEffect(() => {
    if (fetcher.data?.success === true) {
      // 고객 추가 성공 시 모달 닫기
      if (addClientOpen) {
        setAddClientOpen(false);
      }
      if (existingClientModalOpen) {
        setExistingClientModalOpen(false);
      }

      // 데이터 새로고침
      revalidator.revalidate();
    }
  }, [
    fetcher.data?.success,
    addClientOpen,
    existingClientModalOpen,
    revalidator,
  ]);

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

  // 소개자 후보 목록 생성 (모든 기존 고객이 소개자가 될 수 있음)
  const potentialReferrers = clients
    .map((client) => ({
      id: client.id,
      name: client.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬

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
    // 🎯 FormData 생성하여 서버로 전송
    const formData = new FormData();
    formData.append('intent', 'moveClient');
    formData.append('clientId', clientId);
    formData.append('targetStageId', destinationStageId);

    // 🎯 action 함수 호출
    fetcher.submit(formData, { method: 'post' });
  };

  // 새 고객 추가 처리 함수 (useFetcher 사용)
  const handleAddClient = async (clientData: {
    fullName: string;
    phone: string;
    email?: string;
    telecomProvider?: string;
    address?: string;
    occupation?: string;
    importance: 'high' | 'medium' | 'low';
    referredById?: string;
    tags?: string;
    notes?: string;
  }) => {
    // 🎯 FormData 생성
    const formData = new FormData();
    formData.append('intent', 'addClient');
    formData.append('fullName', clientData.fullName);
    formData.append('phone', clientData.phone);
    if (clientData.email) formData.append('email', clientData.email);
    if (clientData.telecomProvider)
      formData.append('telecomProvider', clientData.telecomProvider);
    if (clientData.address) formData.append('address', clientData.address);
    if (clientData.occupation)
      formData.append('occupation', clientData.occupation);
    formData.append('importance', clientData.importance);
    if (clientData.referredById)
      formData.append('referredById', clientData.referredById);
    if (clientData.tags) formData.append('tags', clientData.tags);
    if (clientData.notes) formData.append('notes', clientData.notes);

    // 🎯 action 함수 호출
    fetcher.submit(formData, { method: 'post' });
  };

  // 기존 고객 새 영업 기회 처리 함수
  const handleExistingClientOpportunity = async (data: {
    clientId: string;
    clientName: string;
    insuranceType: string;
    notes: string;
  }) => {
    setIsCreatingOpportunity(true);

    // 🎯 FormData 생성
    const formData = new FormData();
    formData.append('intent', 'existingClientOpportunity');
    formData.append('clientId', data.clientId);
    formData.append('clientName', data.clientName);
    formData.append('insuranceType', data.insuranceType);
    formData.append('notes', data.notes);

    // 🎯 action 함수 호출
    fetcher.submit(formData, { method: 'post' });

    setIsCreatingOpportunity(false);
  };

  // 특정 단계에 고객 추가 함수
  const handleAddClientToStage = (stageId: string) => {
    setAddClientOpen(true);
  };

  // 필터가 적용되었는지 확인
  const isFilterActive =
    selectedReferrerId !== null ||
    selectedImportance !== 'all' ||
    searchQuery !== '';

  const totalStats = getTotalStats();

  // 기존 고객 목록 (영업 기회 생성용)
  const existingClientsForOpportunity = clients.map((client) => ({
    id: client.id,
    name: client.name,
    phone: client.phone,
    currentStage: stages.find((s) => s.id === client.stageId)?.name,
  }));

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
                      {
                        potentialReferrers.find(
                          (r) => r.id === selectedReferrerId
                        )?.name
                      }
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
                    referrers={potentialReferrers}
                    selectedReferrerId={selectedReferrerId}
                    onReferrerChange={setSelectedReferrerId}
                    selectedImportance={selectedImportance}
                    onImportanceChange={setSelectedImportance}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 🚀 기존 고객 새 영업 기회 버튼 */}
              <Button
                variant="default"
                onClick={() => setExistingClientModalOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>기존 고객 영업 기회 추가</span>
              </Button>

              {/* 고객 추가 버튼 */}
              <Button
                onClick={() => {
                  setAddClientOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>신규 고객 추가</span>
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
            clients={filteredClients as unknown as Client[]}
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

      {/* 신규 고객 추가 모달 */}
      <AddClientModal
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onSubmit={handleAddClient}
        isSubmitting={isSubmitting}
        error={submitError}
        referrers={potentialReferrers}
      />

      {/* 🚀 기존 고객 새 영업 기회 모달 */}
      <ExistingClientOpportunityModal
        isOpen={existingClientModalOpen}
        onClose={() => setExistingClientModalOpen(false)}
        onConfirm={handleExistingClientOpportunity}
        clients={existingClientsForOpportunity}
        isLoading={isCreatingOpportunity}
      />
    </MainLayout>
  );
}
