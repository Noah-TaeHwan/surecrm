import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Users,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClientCard } from './client-card';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/common/components/ui/carousel';
import { useViewport } from '~/common/hooks/useViewport';

interface PipelineBoardProps {
  stages: (PipelineStage & {
    stats: { clientCount: number; highImportanceCount: number };
  })[];
  clients: Client[];
  onClientMove: (
    clientId: string,
    sourceStageId: string,
    destinationStageId: string
  ) => void;
  onAddClientToStage?: (stageId: string) => void;
  onRemoveFromPipeline?: (clientId: string, clientName: string) => void;
  onCreateContract?: (
    clientId: string,
    clientName: string,
    products: any[]
  ) => void; // 🏢 계약 전환 핸들러
  onEditOpportunity?: (clientId: string, clientName: string) => void; // 🏢 영업 기회 편집 핸들러
}

export function PipelineBoard({
  stages,
  clients,
  onClientMove,
  onAddClientToStage,
  onRemoveFromPipeline,
  onCreateContract, // 🏢 계약 전환 핸들러
  onEditOpportunity, // 🏢 영업 기회 편집 핸들러
}: PipelineBoardProps) {
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const dragSourceStageId = useRef<string | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // 🎯 반응형 처리를 위한 뷰포트 훅
  const { width } = useViewport();
  const isMobile = width < 768; // md 브레이크포인트

  // 🎯 각 단계별 고객 카드들 접기/펼치기 상태 (단계 ID를 키로 사용)
  const [collapsedStages, setCollapsedStages] = useState<
    Record<string, boolean>
  >({});

  // 컴포넌트 마운트 시 클라이언트 상태 업데이트를 위한 효과
  const [clientsState, setClientsState] = useState<Client[]>(clients);

  useEffect(() => {
    setClientsState(clients);
  }, [clients]);

  // 단계별로 고객을 그룹화
  const clientsByStage = stages.reduce<Record<string, Client[]>>(
    (acc, stage) => {
      acc[stage.id] = clientsState.filter(
        client => client.stageId === stage.id
      );
      return acc;
    },
    {}
  );

  // 드래그 시작 핸들러
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    clientId: string,
    stageId: string
  ) => {
    setDraggedClientId(clientId);
    dragSourceStageId.current = stageId;
    e.dataTransfer.setData('text/plain', clientId);
    e.dataTransfer.effectAllowed = 'move';

    // 드래그 이미지 커스터마이징
    const dragElement = e.currentTarget;
    e.dataTransfer.setDragImage(dragElement, dragElement.offsetWidth / 2, 20);
  };

  // 드래그 오버 핸들러 (드롭 영역에 들어왔을 때)
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    stageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // 같은 단계로의 드롭은 허용하지 않음
    if (dragSourceStageId.current !== stageId) {
      setDraggingOver(stageId);
    }
  };

  // 드래그 리브 핸들러 (드롭 영역에서 나갈 때)
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 자식 요소로 이동하는 경우 드래그 오버 상태를 유지
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggingOver(null);
    }
  };

  // 드롭 핸들러
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(null);

    const clientId = e.dataTransfer.getData('text/plain');
    const sourceStageId = dragSourceStageId.current;

    if (clientId && sourceStageId && sourceStageId !== targetStageId) {
      // 상위 컴포넌트에 알림
      onClientMove(clientId, sourceStageId, targetStageId);

      // UI 상태 즉시 업데이트 (실제로는 API 호출 후 응답으로 처리해야 함)
      setClientsState(prevClients =>
        prevClients.map(client =>
          client.id === clientId
            ? { ...client, stageId: targetStageId }
            : client
        )
      );
    }

    setDraggedClientId(null);
    dragSourceStageId.current = null;
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggedClientId(null);
    dragSourceStageId.current = null;
    setDraggingOver(null);
  };

  // 🎯 단계별 카드들 토글 함수
  const toggleStageCards = (stageId: string) => {
    setCollapsedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  // 🎯 단계별 표시 텍스트 생성
  const getStageDisplayText = (stage: PipelineStage) => {
    const stageClients = clientsByStage[stage.id] || [];
    switch (stage.name) {
      case '첫 상담':
        return `${stageClients.length}명 상담 대기`;
      case '니즈 분석':
        return `${stageClients.length}명 분석 중`;
      case '상품 설명':
        return `${stageClients.length}명 설명 중`;
      case '계약 검토':
        return `${stageClients.length}명 검토 중`;
      case '계약 완료':
        return `${stageClients.length}명 완료`;
      default:
        return `${stageClients.length}명`;
    }
  };

  // 🎯 개별 칸반 컬럼 렌더링 함수
  const renderKanbanColumn = (stage: PipelineStage & {
    stats: { clientCount: number; highImportanceCount: number };
  }) => {
    const isDragTarget = draggingOver === stage.id;
    const canDrop = draggedClientId && dragSourceStageId.current !== stage.id;
    const stageClients = clientsByStage[stage.id] || [];
    const isCollapsed = collapsedStages[stage.id];

    return (
      <div
        key={stage.id}
        className={`flex flex-col h-full transition-all duration-200 ${
          isMobile 
            ? 'w-full px-4' // 모바일: 전체 폭 + 좌우 패딩
            : 'min-w-[300px]' // 데스크톱: 최소 폭
        } ${isDragTarget && canDrop ? 'transform scale-[1.02]' : ''}`}
        onDragOver={e => handleDragOver(e, stage.id)}
        onDragLeave={handleDragLeave}
        onDrop={e => handleDrop(e, stage.id)}
      >
        {/* 🎯 Sticky 단계 헤더 (모바일에서만 sticky) */}
        <div className={`flex-shrink-0 mb-4 ${
          isMobile 
            ? 'sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-4' 
            : ''
        }`}>
          <div
            className={`flex flex-col p-4 rounded-lg border bg-card transition-all duration-200 ${
              isDragTarget && canDrop
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border'
            }`}
          >
            {/* 단계 제목과 버튼들 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <h3 className="font-semibold text-foreground text-base truncate">
                  {stage.name}
                </h3>
              </div>

              {/* 🎯 카드 접기/펼치기 버튼 (데스크톱에서만) */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStageCards(stage.id)}
                  className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
                  title={
                    isCollapsed ? '고객 카드 보기' : '고객 카드 숨기기'
                  }
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>

            {/* 단계별 통계 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="font-medium">
                  {stage.stats.clientCount}명
                </span>
              </div>
              {stage.stats.highImportanceCount > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">
                    중요 {stage.stats.highImportanceCount}명
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🎯 스크롤 가능한 고객 카드 컨테이너 */}
        <div className={`flex-1 ${
          isMobile 
            ? 'overflow-y-auto overflow-x-hidden' // 모바일: 세로 스크롤만 허용
            : 'overflow-hidden' // 데스크톱: 기존 동작 유지
        }`}>
          <div
            className={`space-y-3 p-2 rounded-lg transition-all duration-200 ${
              isMobile 
                ? 'min-h-full pb-6' // 모바일: 최소 높이 + 하단 패딩
                : 'h-full overflow-y-auto scrollbar-hide' // 데스크톱: 기존 스크롤
            } ${
              isDragTarget && canDrop
                ? 'bg-primary/5 border-2 border-dashed border-primary'
                : 'bg-transparent'
            }`}
          >
            {isCollapsed && !isMobile ? (
              /* 🎯 데스크톱에서 카드들이 접힌 상태 */
              <div className="flex flex-col items-center justify-center h-32 bg-muted/20 border border-border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {getStageDisplayText(stage)}
                </p>
                <p className="text-xs text-muted-foreground">
                  카드가 숨겨짐
                </p>

                {/* 접힌 상태에서도 드래그 앤 드롭 지원 */}
                {isDragTarget && canDrop && (
                  <div className="mt-2 text-xs text-primary font-medium">
                    {stage.name}로 이동
                  </div>
                )}
              </div>
            ) : /* 🎯 일반 상태: 모든 고객 카드들 표시 */
            stageClients.length > 0 ? (
              stageClients.map(client => (
                <div
                  key={client.id}
                  id={`client-card-${client.id}`}
                  draggable
                  onDragStart={e =>
                    handleDragStart(e, client.id, stage.id)
                  }
                  onDragEnd={handleDragEnd}
                  className={`transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    client.id === draggedClientId
                      ? 'opacity-50 transform rotate-1 scale-95 z-50'
                      : 'hover:transform hover:scale-[1.02] hover:shadow-md'
                  }`}
                >
                  <ClientCard
                    {...client}
                    tags={
                      Array.isArray(client.tags)
                        ? client.tags.join(', ')
                        : client.tags
                    }
                    createdAt={
                      client.createdAt || new Date().toISOString()
                    }
                    insuranceInfo={
                      Array.isArray(client.insuranceInfo)
                        ? client.insuranceInfo[0]
                        : client.insuranceInfo
                    }
                    referredBy={client.referredBy || undefined}
                    isDragging={client.id === draggedClientId}
                    onRemoveFromPipeline={onRemoveFromPipeline}
                    onCreateContract={onCreateContract}
                    onEditOpportunity={onEditOpportunity}
                    products={client.products}
                    totalMonthlyPremium={client.totalMonthlyPremium}
                    totalExpectedCommission={
                      client.totalExpectedCommission
                    }
                  />
                </div>
              ))
            ) : (
              <div
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isDragTarget && canDrop
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60 hover:bg-muted/20'
                }`}
              >
                {isDragTarget && canDrop ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      여기에 고객을 놓으세요
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      고객이 없습니다
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col pipeline-board">
      {isMobile ? (
        /* 🎯 모바일: 칸반 컬럼 캐러셀 - 스냅 스크롤 */
        <div className="flex-1 overflow-hidden">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps", // 🎯 스냅 포인트 최적화
              dragFree: false, // 🎯 자유 드래그 비활성화로 스냅 강제
              skipSnaps: false, // 🎯 스냅 건너뛰기 비활성화
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full -ml-1">
              {stages.map((stage) => (
                <CarouselItem key={stage.id} className="pl-1 basis-full h-full">
                  {renderKanbanColumn(stage)}
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* 🎯 캐러셀 네비게이션 버튼 */}
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
        </div>
      ) : (
        /* 🎯 데스크톱: 기존 그리드 레이아웃 */
        <div className="flex-1 overflow-hidden">
          <div className="min-w-max overflow-x-auto h-full scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 h-full">
              {stages.map(renderKanbanColumn)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
