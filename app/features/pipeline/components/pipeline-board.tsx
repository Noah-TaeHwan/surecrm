import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Users,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClientCard } from './client-card';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '~/common/components/ui/carousel';
import { triggerHapticFeedback } from '../utils/haptic-feedback';

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

  // 🎯 각 단계별 고객 카드들 접기/펼치기 상태 (단계 ID를 키로 사용)
  const [collapsedStages, setCollapsedStages] = useState<
    Record<string, boolean>
  >({});

  // 🎯 모바일 Sticky 네비게이션을 위한 스크롤 상태
  const [isScrolled, setIsScrolled] = useState(false);

  // 🎯 터치 상태 관리 (터치 최적화)
  const [touchState, setTouchState] = useState({
    isDragging: false,
    startCoords: { x: 0, y: 0 },
    currentCoords: { x: 0, y: 0 },
  });

  // 🎯 애니메이션 상태 관리 (성능 최적화)
  const [animationStates, setAnimationStates] = useState<
    Record<
      string,
      {
        isAnimating: boolean;
        transform: string;
        opacity: number;
        scale: number;
      }
    >
  >({});

  // 🎯 모바일 스크롤 이벤트 리스너 (고객 상세 패턴)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50); // 50px 이상 스크롤시 헤더 최소화
    };

    // 모바일/태블릿에서만 스크롤 리스너 적용
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    if (mediaQuery.matches) {
      window.addEventListener('scroll', handleScroll);
    }

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.addEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
        setIsScrolled(false);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

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

  // 🎯 애니메이션 유틸리티 함수들 (하드웨어 가속 최적화)
  const setCardAnimation = (
    clientId: string,
    transform: string = 'translateX(0) translateY(0) scale(1)',
    opacity: number = 1,
    scale: number = 1
  ) => {
    setAnimationStates(prev => ({
      ...prev,
      [clientId]: {
        isAnimating: true,
        transform,
        opacity,
        scale,
      },
    }));

    // 애니메이션 완료 후 상태 정리
    setTimeout(() => {
      setAnimationStates(prev => ({
        ...prev,
        [clientId]: {
          ...prev[clientId],
          isAnimating: false,
        },
      }));
    }, 300); // 애니메이션 지속시간과 일치
  };

  const resetCardAnimation = (clientId: string) => {
    setAnimationStates(prev => {
      const newState = { ...prev };
      delete newState[clientId];
      return newState;
    });
  };

  // 🎯 터치 시작 핸들러 (터치 최적화 + 애니메이션)
  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    clientId: string,
    stageId: string
  ) => {
    const touch = e.touches[0];
    setTouchState({
      isDragging: true,
      startCoords: { x: touch.clientX, y: touch.clientY },
      currentCoords: { x: touch.clientX, y: touch.clientY },
    });

    // 🎯 햅틱 피드백: 드래그 시작
    triggerHapticFeedback('DRAG_START');

    // 🎯 애니메이션: 드래그 시작 (하드웨어 가속)
    setCardAnimation(
      clientId,
      'translateX(0) translateY(0) scale(0.95)',
      0.8,
      0.95
    );

    setDraggedClientId(clientId);
    dragSourceStageId.current = stageId;

    // 🎯 성능 최적화: will-change 힌트
    const cardElement = document.getElementById(`client-card-${clientId}`);
    if (cardElement) {
      cardElement.style.willChange = 'transform, opacity';
    }
  };

  // 🎯 터치 이동 핸들러 (실시간 애니메이션)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchState.isDragging || !draggedClientId) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startCoords.x;
    const deltaY = touch.clientY - touchState.startCoords.y;

    setTouchState(prev => ({
      ...prev,
      currentCoords: { x: touch.clientX, y: touch.clientY },
    }));

    // 🎯 실시간 애니메이션: 드래그 중 (하드웨어 가속)
    setCardAnimation(
      draggedClientId,
      `translateX(${deltaX}px) translateY(${deltaY}px) scale(0.95)`,
      0.8,
      0.95
    );

    // 드래그 중 스크롤 방지
    e.preventDefault();
  };

  // 🎯 터치 종료 핸들러 (애니메이션 완료)
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchState.isDragging || !draggedClientId) return;

    // 터치 끝점에서 요소 찾기
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    // 드롭 존 찾기
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    const targetStageId = dropZone?.getAttribute('data-stage-id');

    if (
      targetStageId &&
      targetStageId !== dragSourceStageId.current &&
      draggedClientId
    ) {
      // 🎯 햅틱 피드백: 드롭 성공
      triggerHapticFeedback('DRAG_DROP_SUCCESS');

      // 🎯 애니메이션: 드롭 성공 (부드러운 복귀)
      setCardAnimation(
        draggedClientId,
        'translateX(0) translateY(0) scale(1.05)',
        1,
        1.05
      );

      onClientMove(draggedClientId, dragSourceStageId.current!, targetStageId);

      // UI 상태 즉시 업데이트
      setClientsState(prevClients =>
        prevClients.map(client =>
          client.id === draggedClientId
            ? { ...client, stageId: targetStageId }
            : client
        )
      );

      // 🎯 성공 애니메이션 후 정리
      setTimeout(() => {
        resetCardAnimation(draggedClientId);
      }, 400);
    } else if (touchState.isDragging) {
      // 🎯 햅틱 피드백: 드롭 실패
      triggerHapticFeedback('DRAG_DROP_FAILED');

      // 🎯 애니메이션: 드롭 실패 (원래 위치로 복귀)
      setCardAnimation(
        draggedClientId,
        'translateX(0) translateY(0) scale(1)',
        1,
        1
      );

      setTimeout(() => {
        resetCardAnimation(draggedClientId);
      }, 300);
    }

    // 🎯 성능 최적화: will-change 제거
    const cardElement = document.getElementById(
      `client-card-${draggedClientId}`
    );
    if (cardElement) {
      cardElement.style.willChange = 'auto';
    }

    // 상태 리셋
    setTouchState({
      isDragging: false,
      startCoords: { x: 0, y: 0 },
      currentCoords: { x: 0, y: 0 },
    });
    setDraggedClientId(null);
    dragSourceStageId.current = null;
    setDraggingOver(null);
  };

  // 드래그 시작 핸들러 (데스크톱용 + 애니메이션)
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    clientId: string,
    stageId: string
  ) => {
    // 🎯 햅틱 피드백: 드래그 시작 (데스크톱에서도)
    triggerHapticFeedback('DRAG_START');

    // 🎯 애니메이션: 드래그 시작 (하드웨어 가속)
    setCardAnimation(
      clientId,
      'translateX(0) translateY(0) scale(0.95)',
      0.8,
      0.95
    );

    setDraggedClientId(clientId);
    dragSourceStageId.current = stageId;
    e.dataTransfer.setData('text/plain', clientId);
    e.dataTransfer.effectAllowed = 'move';

    // 드래그 이미지 커스터마이징
    const dragElement = e.currentTarget;
    e.dataTransfer.setDragImage(dragElement, dragElement.offsetWidth / 2, 20);

    // 🎯 성능 최적화: will-change 힌트
    const cardElement = document.getElementById(`client-card-${clientId}`);
    if (cardElement) {
      cardElement.style.willChange = 'transform, opacity';
    }
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
      // 🎯 햅틱 피드백: 드롭 존 호버
      triggerHapticFeedback('DRAG_HOVER');
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

  // 드롭 핸들러 (애니메이션 완료)
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
      // 🎯 햅틱 피드백: 드롭 성공
      triggerHapticFeedback('DRAG_DROP_SUCCESS');

      // 🎯 애니메이션: 드롭 성공 (부드러운 복귀)
      setCardAnimation(
        clientId,
        'translateX(0) translateY(0) scale(1.05)',
        1,
        1.05
      );

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

      // 🎯 성공 애니메이션 후 정리
      setTimeout(() => {
        resetCardAnimation(clientId);
      }, 400);
    }

    // 🎯 성능 최적화: will-change 제거
    const cardElement = document.getElementById(`client-card-${clientId}`);
    if (cardElement) {
      cardElement.style.willChange = 'auto';
    }

    setDraggedClientId(null);
    dragSourceStageId.current = null;
  };

  // 드래그 종료 핸들러 (정리)
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (draggedClientId) {
      // 🎯 애니메이션: 드래그 종료 (원래 상태로 복귀)
      resetCardAnimation(draggedClientId);

      // 🎯 성능 최적화: will-change 제거
      const cardElement = document.getElementById(
        `client-card-${draggedClientId}`
      );
      if (cardElement) {
        cardElement.style.willChange = 'auto';
      }
    }

    setDraggedClientId(null);
    dragSourceStageId.current = null;
    setDraggingOver(null);
  };

  // 🎯 단계별 카드들 토글 함수 (햅틱 피드백 + 애니메이션)
  const toggleStageCards = (stageId: string) => {
    // 🎯 햅틱 피드백: 스테이지 변경
    triggerHapticFeedback('STAGE_CHANGE');

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

  // 🎯 카드 스타일 계산 함수 (하드웨어 가속 최적화)
  const getCardStyle = (clientId: string) => {
    const animationState = animationStates[clientId];
    if (!animationState) {
      return {
        // 🎯 기본 상태: GPU 레이어 힌트
        transform: 'translateZ(0)',
        transition:
          'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
      };
    }

    return {
      // 🎯 애니메이션 상태: 하드웨어 가속 transform 사용
      transform: `${animationState.transform} translateZ(0)`,
      opacity: animationState.opacity,
      transition: animationState.isAnimating
        ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out'
        : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
      // 🎯 성능 최적화: 애니메이션 중에만 will-change 적용
      willChange: animationState.isAnimating ? 'transform, opacity' : 'auto',
    };
  };

  return (
    <div
      className="h-full flex flex-col pipeline-board"
      role="region"
      aria-label="영업 파이프라인 관리"
      aria-describedby="pipeline-description"
    >
      {/* 🎯 스크린 리더용 설명 */}
      <div id="pipeline-description" className="sr-only">
        영업 파이프라인에서 고객을 단계별로 관리할 수 있습니다. 드래그 앤 드롭
        또는 키보드를 사용하여 고객을 다른 단계로 이동할 수 있습니다. 총{' '}
        {stages.length}개의 단계가 있으며, {clients.length}명의 고객이 있습니다.
      </div>

      {/* 🎯 모바일/태블릿 레이아웃은 ResponsivePipeline 컴포넌트에 위임 */}
      <div className="lg:hidden">
        {/* ResponsivePipeline 컴포넌트가 모바일 레이아웃을 처리함 */}
      </div>

      {/* 🎯 데스크톱 레이아웃 (기존 코드 그대로 유지) */}
      <div className="hidden lg:block">
        <div
          className="flex-1 overflow-hidden flex flex-col"
          role="group"
          aria-label="데스크톱 파이프라인 보드"
        >
          {/* 🎯 컬럼 제목들 고정 영역 */}
          <div className="flex-shrink-0 bg-background border-b border-border pb-4">
            <div className="min-w-max overflow-x-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ">
                {stages.map(stage => (
                  <div key={`header-${stage.id}`} className="min-w-[300px]">
                    <div
                      className="flex flex-col p-4 rounded-lg border bg-card transition-all duration-200"
                      style={{
                        // 🎯 성능 최적화: GPU 레이어 힌트
                        transform: 'translateZ(0)',
                      }}
                    >
                      {/* 단계 제목과 버튼들 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: stage.color,
                              transform: 'translateZ(0)',
                            }}
                          />
                          <h3 className="font-semibold text-foreground text-base truncate">
                            {stage.name}
                          </h3>
                        </div>

                        {/* 🎯 카드 접기/펼치기 버튼 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStageCards(stage.id)}
                          className="h-8 w-8 p-0 hover:bg-muted transition-all duration-200"
                          style={{
                            // 🎯 성능 최적화: 버튼 호버 애니메이션
                            transform: 'translateZ(0)',
                          }}
                          title={
                            collapsedStages[stage.id]
                              ? '고객 카드 보기'
                              : '고객 카드 숨기기'
                          }
                        >
                          {collapsedStages[stage.id] ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          )}
                        </Button>
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
                ))}
              </div>
            </div>
          </div>

          {/* 🎯 컬럼 내용들 스크롤 영역 */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-hidden">
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4"
                style={{ height: 'calc(100vh - 20rem)' }}
              >
                {stages.map(stage => {
                  const isDragTarget = draggingOver === stage.id;
                  const canDrop =
                    draggedClientId && dragSourceStageId.current !== stage.id;
                  const stageClients = clientsByStage[stage.id] || [];
                  const isCollapsed = collapsedStages[stage.id];

                  return (
                    <div
                      key={`content-${stage.id}`}
                      className="min-w-[300px] flex flex-col"
                      style={{ height: 'calc(100vh - 20rem)' }}
                      onDragOver={e => handleDragOver(e, stage.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={e => handleDrop(e, stage.id)}
                    >
                      {/* 🎯 개별 컬럼 스크롤 가능한 카드 컨테이너 */}
                      <div
                        className="overflow-y-auto scrollbar-hide"
                        style={{ height: 'calc(100vh - 20rem)' }}
                      >
                        <div
                          className={`space-y-3 p-4 pb-16 rounded-lg transition-all duration-200 ${
                            isDragTarget && canDrop
                              ? 'bg-primary/5 border-2 border-dashed border-primary'
                              : 'bg-transparent'
                          }`}
                          style={{
                            // 🎯 성능 최적화: 드롭 존 애니메이션
                            transform:
                              isDragTarget && canDrop
                                ? 'scale(1.02) translateZ(0)'
                                : 'scale(1) translateZ(0)',
                            transition:
                              'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease-out',
                          }}
                        >
                          {isCollapsed ? (
                            /* 🎯 카드들이 접힌 상태 */
                            <div
                              className="flex flex-col items-center justify-center h-32 bg-muted/20 border border-border rounded-lg transition-all duration-300"
                              style={{
                                transform: 'translateZ(0)',
                              }}
                            >
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
                                className="cursor-grab active:cursor-grabbing hover:shadow-md"
                                style={{
                                  // 🎯 하드웨어 가속 애니메이션 적용
                                  ...getCardStyle(client.id),
                                }}
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
                                  totalMonthlyPremium={
                                    client.totalMonthlyPremium
                                  }
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
                              style={{
                                // 🎯 성능 최적화: 빈 상태 애니메이션
                                transform: 'translateZ(0)',
                              }}
                            >
                              {isDragTarget && canDrop ? (
                                <>
                                  <div
                                    className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2 transition-transform duration-200"
                                    style={{
                                      transform: 'scale(1.1) translateZ(0)',
                                    }}
                                  >
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
