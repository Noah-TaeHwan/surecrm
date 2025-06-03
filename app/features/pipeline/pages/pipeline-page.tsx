import type { Route } from './+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { AddClientModal } from '~/features/clients/components/add-client-modal';
import { ExistingClientOpportunityModal } from '../components/existing-client-opportunity-modal';
import { RemoveClientModal } from '../components/remove-client-modal';
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
  try {
    // 🎯 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    // 🎯 파이프라인 단계 조회
    let stages: any[] = [];
    try {
      stages = await getPipelineStages(agentId);

      // 🎯 파이프라인 단계가 없으면 기본 단계 생성
      if (stages.length === 0) {
        stages = await createDefaultPipelineStages(agentId);
      }
    } catch (stageError) {
      // 빈 배열로 fallback
      stages = [];
    }

    // 🎯 모든 고객 조회
    let allClients: any[] = [];
    let totalAllClients = 0;
    try {
      allClients = await getClientsByStage(agentId);

      // 🎯 전체 고객 수 조회 (파이프라인에 없는 고객 포함)
      const { getClients } = await import('~/api/shared/clients');
      const allClientsResult = await getClients({
        agentId,
        limit: 1000, // 충분히 큰 숫자
      });
      totalAllClients = allClientsResult.total;
    } catch (clientError) {
      // 빈 배열로 fallback
      allClients = [];
      totalAllClients = 0;
    }

    return {
      stages,
      clients: allClients,
      totalAllClients, // 🎯 전체 고객 수 추가
      currentUserId: agentId,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0], // 이메일 앞부분을 이름으로 사용
      },
    };
  } catch (error) {
    // 🎯 더 상세한 에러 정보와 함께 안전한 fallback 반환
    return {
      stages: [],
      clients: [],
      totalAllClients: 0,
      currentUserId: null,
      currentUser: null,
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

    if (intent === 'removeFromPipeline') {
      // 영업 파이프라인에서 고객 제외
      const clientId = formData.get('clientId') as string;

      if (!clientId) {
        return {
          success: false,
          error: '고객 ID가 누락되었습니다.',
        };
      }

      // 🎯 "제외됨" 단계 찾기 또는 생성
      const stages = await getPipelineStages(user.id);
      let excludedStage = stages.find((s) => s.name === '제외됨');

      if (!excludedStage) {
        // "제외됨" 단계가 없으면 생성
        const { createPipelineStage } = await import(
          '~/features/pipeline/lib/supabase-pipeline-data'
        );
        excludedStage = await createPipelineStage({
          agentId: user.id,
          name: '제외됨',
          order: 999, // 맨 마지막 순서
          color: '#6b7280', // 회색
          isDefault: false,
        });
      }

      // 🎯 고객을 "제외됨" 단계로 이동
      const { updateClientStage } = await import('~/api/shared/clients');

      const result = await updateClientStage(
        clientId,
        excludedStage.id,
        user.id
      );

      if (result.success) {
        return {
          success: true,
          message: '고객이 영업 파이프라인에서 제외되었습니다.',
        };
      } else {
        return {
          success: false,
          error: result.message || '영업에서 제외하는데 실패했습니다.',
        };
      }
    }

    return { success: false, error: '알 수 없는 요청입니다.' };
  } catch (error) {
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
  const { stages, clients, totalAllClients, currentUser } = loaderData;

  // 🎯 각 액션별로 별도의 fetcher 사용
  const moveFetcher = useFetcher(); // 드래그 앤 드롭용
  const addClientFetcher = useFetcher(); // 신규 고객 추가용
  const opportunityFetcher = useFetcher(); // 기존 고객 영업 기회용
  const removeFetcher = useFetcher(); // 고객 제거용

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(
    null
  );
  const [selectedImportance, setSelectedImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [existingClientModalOpen, setExistingClientModalOpen] = useState(false);

  // 🗑️ 영업에서 제외 관련 상태
  const [removeClientModalOpen, setRemoveClientModalOpen] = useState(false);
  const [clientToRemove, setClientToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 🎯 fetcher 상태 기반으로 상태 관리
  const isSubmitting = addClientFetcher.state === 'submitting';
  const submitError = addClientFetcher.data?.error || null;

  // 필터링된 고객 목록
  const filteredClients = clients.filter((client) => {
    // "제외됨" 단계의 고객들은 칸반보드에 표시하지 않음
    const stage = stages.find((s) => s.id === client.stageId);
    if (stage && stage.name === '제외됨') {
      return false;
    }

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

  // 🎯 MVP용 전체 통계 계산 (확장)
  const getTotalStats = () => {
    // 1. 전체 고객 (고객 관리 페이지의 모든 고객)
    const totalAllClientsCount = totalAllClients; // 파이프라인에 없는 고객 포함

    // 2. 영업 파이프라인 관리 중인 고객 (제외됨 단계 제외)
    const pipelineClients = clients.filter((client) => {
      const stage = stages.find((s) => s.id === client.stageId);
      return stage && stage.name !== '제외됨';
    }).length;

    // 3. 계약 완료 고객 (실제 성과) - 제외됨 단계 제외
    const contractedClients = clients.filter((client) => {
      const stage = stages.find((s) => s.id === client.stageId);
      return stage && stage.name === '계약 완료';
    }).length;

    // 4. 고가치 고객 (VIP 고객) - 제외됨 단계 제외
    const highValueClients = clients.filter((client) => {
      const stage = stages.find((s) => s.id === client.stageId);
      return client.importance === 'high' && stage && stage.name !== '제외됨';
    }).length;

    // 5. 전환율 계산 (계약 완료 / 전체 파이프라인 고객)
    const conversionRate =
      pipelineClients > 0
        ? Math.round((contractedClients / pipelineClients) * 100)
        : 0;

    // 6. 활성 단계 수
    const activeStages = stages.length;

    return {
      totalAllClients: totalAllClientsCount,
      pipelineClients,
      contractedClients,
      highValueClients,
      conversionRate,
      activeStages,
    };
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
    moveFetcher.submit(formData, { method: 'post' });
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
    addClientFetcher.submit(formData, { method: 'post' });
  };

  // 기존 고객 새 영업 기회 처리 함수
  const handleExistingClientOpportunity = async (data: {
    clientId: string;
    clientName: string;
    insuranceType: string;
    notes: string;
  }) => {
    // 🎯 FormData 생성
    const formData = new FormData();
    formData.append('intent', 'existingClientOpportunity');
    formData.append('clientId', data.clientId);
    formData.append('clientName', data.clientName);
    formData.append('insuranceType', data.insuranceType);
    formData.append('notes', data.notes);

    // 🎯 action 함수 호출
    opportunityFetcher.submit(formData, { method: 'post' });
  };

  // 특정 단계에 고객 추가 함수
  const handleAddClientToStage = (stageId: string) => {
    setAddClientOpen(true);
  };

  // 🗑️ 영업에서 제외 핸들러
  const handleRemoveFromPipeline = (clientId: string, clientName: string) => {
    setClientToRemove({ id: clientId, name: clientName });
    setRemoveClientModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!clientToRemove) return;

    // 🎯 FormData 생성하여 서버로 전송
    const formData = new FormData();
    formData.append('intent', 'removeFromPipeline');
    formData.append('clientId', clientToRemove.id);

    // 🎯 action 함수 호출
    removeFetcher.submit(formData, { method: 'post' });

    // 모달 상태 초기화
    setRemoveClientModalOpen(false);
    setClientToRemove(null);
  };

  const handleCancelRemove = () => {
    setRemoveClientModalOpen(false);
    setClientToRemove(null);
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

  // 🎯 모달 제출 완료 후 모달 닫기 (성공한 새 제출에 대해서만)
  useEffect(() => {
    if (
      addClientFetcher.state === 'idle' &&
      addClientFetcher.data?.success === true
    ) {
      // 제출이 완료되고 성공했을 때, 모달이 열려있으면 닫기
      // 단, 약간의 지연을 두어 사용자가 성공을 인지할 수 있도록 함
      const timer = setTimeout(() => {
        if (addClientOpen) {
          setAddClientOpen(false);
        }
      }, 1000); // 1초 후 모달 닫기 (충분한 피드백 시간)

      return () => clearTimeout(timer);
    }
  }, [addClientFetcher.state, addClientFetcher.data?.success]);

  // 🎯 기존 고객 영업 기회 모달 제어
  useEffect(() => {
    if (
      opportunityFetcher.state === 'idle' &&
      opportunityFetcher.data?.success === true
    ) {
      const timer = setTimeout(() => {
        if (existingClientModalOpen) {
          setExistingClientModalOpen(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [opportunityFetcher.state, opportunityFetcher.data?.success]);

  // 🎯 고객 제거 모달 제어
  useEffect(() => {
    if (
      removeFetcher.state === 'idle' &&
      removeFetcher.data?.success === true
    ) {
      const timer = setTimeout(() => {
        if (removeClientModalOpen) {
          setRemoveClientModalOpen(false);
          setClientToRemove(null);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [removeFetcher.state, removeFetcher.data?.success]);

  return (
    <MainLayout title="영업 파이프라인">
      <div className="space-y-6">
        {/* 🎯 MVP 통계 헤더 - sticky로 고정 */}
        <div className="sticky -top-8 z-20 bg-background border-b border-border pb-6">
          {/* 전체 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 pt-6">
            {/* 1. 전체 고객 */}
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  전체 고객
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.totalAllClients}
                </p>
                <p className="text-xs text-muted-foreground">
                  고객 관리의 모든 고객
                </p>
              </div>
            </div>

            {/* 2. 영업 관리 중 */}
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  영업 관리 중
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.pipelineClients}
                </p>
                <p className="text-xs text-muted-foreground">
                  현재 파이프라인 진행 중
                </p>
              </div>
            </div>

            {/* 3. 계약 완료 */}
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  계약 완료
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.contractedClients}
                </p>
                <p className="text-xs text-muted-foreground">
                  실제 성과 달성 고객
                </p>
              </div>
            </div>

            {/* 4. VIP 고객 */}
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  VIP 고객
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStats.highValueClients}
                </p>
                <p className="text-xs text-muted-foreground">
                  고가치 중요 고객
                </p>
              </div>
            </div>

            {/* 5. 전환율 */}
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
                  계약 완료 성공률
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
            onRemoveFromPipeline={handleRemoveFromPipeline}
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
        isLoading={opportunityFetcher.state === 'submitting'}
      />

      {/* 🗑️ 영업에서 제외 모달 */}
      <RemoveClientModal
        isOpen={removeClientModalOpen}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        clientName={clientToRemove?.name || ''}
        isLoading={removeFetcher.state === 'submitting'}
      />
    </MainLayout>
  );
}
