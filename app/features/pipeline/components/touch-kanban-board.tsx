import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Smartphone,
  Vibrate,
  GripVertical,
} from 'lucide-react';
import { ClientCard } from './client-card';
import { PipelineStageFilter } from './pipeline-stage-filter';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';

interface TouchKanbanBoardProps {
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
  ) => void;
  onEditOpportunity?: (clientId: string, clientName: string) => void;
}

// 🎯 터치 제스처 상태 인터페이스
interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  draggedClientId: string | null;
  sourceStageId: string | null;
  targetStageId: string | null;
  dragDirection: 'horizontal' | 'vertical' | null;
  dragIntensity: number; // 0-1 범위의 드래그 강도
  isValidDropZone: boolean; // 현재 드롭존이 유효한지
  dragPlaceholderStage: string | null; // 플레이스홀더를 표시할 스테이지
  ghostPosition: { x: number; y: number }; // 고스트 카드 위치
  showDirectionHint: boolean; // 방향 힌트 표시 여부
}

// 🎯 햅틱 피드백 함수
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
};

export function TouchKanbanBoard({
  stages,
  clients,
  onClientMove,
  onAddClientToStage,
  onRemoveFromPipeline,
  onCreateContract,
  onEditOpportunity,
}: TouchKanbanBoardProps) {
  // 🎯 터치 상태 관리
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    draggedElement: null,
    draggedClientId: null,
    sourceStageId: null,
    targetStageId: null,
    dragDirection: null,
    dragIntensity: 0,
    isValidDropZone: false,
    dragPlaceholderStage: null,
    ghostPosition: { x: 0, y: 0 },
    showDirectionHint: false,
  });

  // 🎯 클라이언트 상태 관리 (낙관적 업데이트용)
  const [clientsState, setClientsState] = useState(clients);
  
  // 🎯 각 단계별 접기/펼치기 상태
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  
  // 🎯 모바일 수평 스크롤 상태
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 🎯 PipelineColumn 최적화 상태 추가
  const [verticalScrollPositions, setVerticalScrollPositions] = useState<Record<string, number>>({});
  const [visibleCardRanges, setVisibleCardRanges] = useState<Record<string, { start: number; end: number }>>({});
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 🎯 PipelineStageFilter 상태 관리
  const [stageFilterState, setStageFilterState] = useState({
    selectedStages: stages.map(stage => stage.id), // 기본적으로 모든 단계 선택
    viewMode: 'all' as 'all' | 'single' | 'custom',
    currentSingleStage: undefined as string | undefined,
  });

  // 🎯 필터링된 단계들
  const filteredStages = useMemo(() => {
    if (stageFilterState.viewMode === 'all') {
      return stages;
    } else if (stageFilterState.viewMode === 'single' && stageFilterState.currentSingleStage) {
      return stages.filter(stage => stage.id === stageFilterState.currentSingleStage);
    } else {
      return stages.filter(stage => stageFilterState.selectedStages.includes(stage.id));
    }
  }, [stages, stageFilterState]);

  // 🎯 가상화 설정
  const CARD_HEIGHT = 120; // 예상 카드 높이
  const VISIBLE_CARDS_BUFFER = 5; // 버퍼 카드 수
  const CONTAINER_HEIGHT = 400; // 컨테이너 높이

  // Props 변경 시 내부 상태 동기화
  useEffect(() => {
    setClientsState(clients);
  }, [clients]);

  // 🎯 단계별 클라이언트 그룹핑
  const clientsByStage = clientsState.reduce((acc, client) => {
    if (!acc[client.stageId]) {
      acc[client.stageId] = [];
    }
    acc[client.stageId].push(client);
    return acc;
  }, {} as Record<string, Client[]>);

  // 🎯 터치 시작 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent, clientId: string, stageId: string) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    
    // 햅틱 피드백
    triggerHapticFeedback('light');
    
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      draggedElement: element,
      draggedClientId: clientId,
      sourceStageId: stageId,
      targetStageId: null,
      dragDirection: null,
      dragIntensity: 0,
      isValidDropZone: false,
      dragPlaceholderStage: null,
      ghostPosition: { x: touch.clientX, y: touch.clientY },
      showDirectionHint: false,
    });

    // 드래그 시작 시각적 피드백
    element.style.transform = 'scale(1.05) rotate(2deg)';
    element.style.zIndex = '1000';
    element.style.opacity = '0.9';
  }, []);

  // 🎯 터치 이동 처리 (드래그 인디케이터 강화)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    // 🎯 드래그 방향 및 강도 계산
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 드래그 방향 결정 (임계값 30px 이상에서)
    let dragDirection: 'horizontal' | 'vertical' | null = null;
    if (distance > 30) {
      dragDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    }
    
    // 드래그 강도 계산 (0-1 범위, 최대 200px에서 1.0)
    const dragIntensity = Math.min(distance / 200, 1);
    
    // 방향 힌트 표시 조건 (50px 이상 드래그 시)
    const showDirectionHint = distance > 50;

    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      ghostPosition: { x: touch.clientX, y: touch.clientY },
      dragDirection,
      dragIntensity,
      showDirectionHint,
    }));
    
    // 🎯 드롭 영역 감지 및 유효성 검사
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-stage-id]') as HTMLElement;
    
    if (dropZone) {
      const stageId = dropZone.getAttribute('data-stage-id');
      const isValidDrop = stageId && stageId !== touchState.sourceStageId;
      
      if (isValidDrop) {
        setTouchState(prev => ({ 
          ...prev, 
          targetStageId: stageId, 
          isValidDropZone: true,
          dragPlaceholderStage: stageId,
        }));
        
        // 유효한 드롭존 진입 시 햅틱 피드백
        if (stageId !== touchState.targetStageId) {
          triggerHapticFeedback('light');
        }
      } else {
        setTouchState(prev => ({ 
          ...prev, 
          targetStageId: null, 
          isValidDropZone: false,
          dragPlaceholderStage: null,
        }));
      }
    } else {
      setTouchState(prev => ({ 
        ...prev, 
        targetStageId: null, 
        isValidDropZone: false,
        dragPlaceholderStage: null,
      }));
    }
    
    // 🎯 드래그 강도에 따른 햅틱 피드백
    if (dragIntensity > 0.7 && touchState.dragIntensity <= 0.7) {
      triggerHapticFeedback('medium');
    }
  }, [touchState.isDragging, touchState.startX, touchState.startY, touchState.sourceStageId, touchState.targetStageId, touchState.dragIntensity]);

  // 🎯 터치 종료 핸들러
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchState.isDragging || !touchState.draggedElement) return;
    
    e.preventDefault();
    
    const { draggedElement, draggedClientId, sourceStageId, targetStageId } = touchState;
    
    // 드래그 시각적 효과 리셋
    draggedElement.style.transform = '';
    draggedElement.style.zIndex = '';
    draggedElement.style.opacity = '';
    
    // 드롭 처리
    if (draggedClientId && sourceStageId && targetStageId && sourceStageId !== targetStageId) {
      // 성공 햅틱 피드백
      triggerHapticFeedback('medium');
      
      // 상위 컴포넌트에 이동 알림
      onClientMove(draggedClientId, sourceStageId, targetStageId);
      
      // 낙관적 UI 업데이트
      setClientsState(prevClients =>
        prevClients.map(client =>
          client.id === draggedClientId
            ? { ...client, stageId: targetStageId }
            : client
        )
      );
    } else {
      // 실패 햅틱 피드백
      triggerHapticFeedback('light');
    }
    
    // 터치 상태 리셋
    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      draggedElement: null,
      draggedClientId: null,
      sourceStageId: null,
      targetStageId: null,
      dragDirection: null,
      dragIntensity: 0,
      isValidDropZone: false,
      dragPlaceholderStage: null,
      ghostPosition: { x: 0, y: 0 },
      showDirectionHint: false,
    });
  }, [touchState, onClientMove]);

  // 🎯 단계별 카드들 토글 함수
  const toggleStageCards = (stageId: string) => {
    setCollapsedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  // 🎯 수평 스크롤 함수
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 300);
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + 300);
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
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

  // 🎯 PipelineColumn 가상화 함수들 추가
  
  // 수직 스크롤 핸들러
  const handleVerticalScroll = useCallback((stageId: string, scrollTop: number) => {
    setVerticalScrollPositions(prev => ({
      ...prev,
      [stageId]: scrollTop,
    }));

    // 가시 범위 계산
    const visibleStart = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT) - VISIBLE_CARDS_BUFFER);
    const visibleEnd = Math.min(
      clientsByStage[stageId]?.length || 0,
      Math.ceil((scrollTop + CONTAINER_HEIGHT) / CARD_HEIGHT) + VISIBLE_CARDS_BUFFER
    );

    setVisibleCardRanges(prev => ({
      ...prev,
      [stageId]: { start: visibleStart, end: visibleEnd },
    }));
  }, [clientsByStage, CARD_HEIGHT, VISIBLE_CARDS_BUFFER, CONTAINER_HEIGHT]);

  // 컬럼별 가시 카드 계산
  const getVisibleCards = useCallback((stageId: string, stageClients: Client[]) => {
    const range = visibleCardRanges[stageId];
    if (!range || stageClients.length <= 10) {
      // 카드가 적으면 가상화 비활성화
      return { visibleCards: stageClients, totalHeight: stageClients.length * CARD_HEIGHT };
    }

    const visibleCards = stageClients.slice(range.start, range.end);
    const totalHeight = stageClients.length * CARD_HEIGHT;
    return { visibleCards, totalHeight, offsetTop: range.start * CARD_HEIGHT };
  }, [visibleCardRanges, CARD_HEIGHT]);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback((stageId: string) => {
    const columnElement = columnRefs.current[stageId];
    const savedPosition = verticalScrollPositions[stageId];
    
    if (columnElement && savedPosition) {
      columnElement.scrollTop = savedPosition;
    }
  }, [verticalScrollPositions]);

  // 컬럼 ref 설정
  const setColumnRef = useCallback((stageId: string, element: HTMLDivElement | null) => {
    columnRefs.current[stageId] = element;
    if (element) {
      // 스크롤 이벤트 리스너 추가
      const handleScroll = () => {
        handleVerticalScroll(stageId, element.scrollTop);
      };
      
      element.addEventListener('scroll', handleScroll, { passive: true });
      
      // 초기 가시 범위 설정
      handleVerticalScroll(stageId, 0);
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleVerticalScroll]);

  return (
    <div className="w-full">
      {/* 🎯 PipelineStageFilter 통합 */}
      <div className="mb-4">
        <PipelineStageFilter
          stages={stages}
          clients={clientsState}
          selectedStages={stageFilterState.selectedStages}
          onStagesChange={(stageIds) => 
            setStageFilterState(prev => ({ ...prev, selectedStages: stageIds, viewMode: 'custom' }))
          }
          viewMode={stageFilterState.viewMode}
          onViewModeChange={(mode) => 
            setStageFilterState(prev => ({ ...prev, viewMode: mode }))
          }
          currentSingleStage={stageFilterState.currentSingleStage}
          onSingleStageChange={(stageId) => 
            setStageFilterState(prev => ({ ...prev, currentSingleStage: stageId }))
          }
          isMobile={true} // 모바일 우선 디자인
        />
      </div>

      {/* 🎯 드래그 인디케이터 오버레이 */}
      {touchState.isDragging && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* 🎯 고스트 카드 */}
          <div
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: `${touchState.ghostPosition.x - 150}px`,
              top: `${touchState.ghostPosition.y - 100}px`,
              transform: `scale(${0.9 + touchState.dragIntensity * 0.2}) rotate(${touchState.dragIntensity * 5}deg)`,
              opacity: 0.8,
            }}
          >
            <div className="w-[300px] h-[200px] bg-background/95 backdrop-blur-sm border-2 border-primary/50 rounded-lg shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-medium text-foreground">드래그 중...</div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• {touchState.dragDirection === 'horizontal' ? '좌우' : touchState.dragDirection === 'vertical' ? '상하' : '자유'} 드래그</div>
                <div>• 강도: {Math.round(touchState.dragIntensity * 100)}%</div>
                <div className={touchState.isValidDropZone ? 'text-green-600' : 'text-orange-600'}>
                  • {touchState.isValidDropZone ? '드롭 가능' : '드롭 불가'}
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 방향 힌트 화살표 */}
          {touchState.showDirectionHint && touchState.dragDirection && (
            <div
              className="absolute animate-bounce"
              style={{
                left: `${touchState.ghostPosition.x}px`,
                top: `${touchState.ghostPosition.y + 120}px`,
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary/90 text-primary-foreground rounded-full shadow-lg">
                {touchState.dragDirection === 'horizontal' ? (
                  <ChevronRight className="h-6 w-6" />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </div>
            </div>
          )}

          {/* 🎯 드래그 경로 트레일 효과 */}
          <div
            className="absolute w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full transition-all duration-300"
            style={{
              left: `${touchState.startX}px`,
              top: `${touchState.startY}px`,
              height: `${Math.sqrt(
                Math.pow(touchState.currentX - touchState.startX, 2) +
                Math.pow(touchState.currentY - touchState.startY, 2)
              )}px`,
              transformOrigin: 'top',
              transform: `rotate(${
                Math.atan2(
                  touchState.currentY - touchState.startY,
                  touchState.currentX - touchState.startX
                ) * 180 / Math.PI + 90
              }deg)`,
              opacity: touchState.dragIntensity,
            }}
          />
        </div>
      )}

      {/* 🎯 모바일 수평 스크롤 컨트롤 */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          disabled={scrollPosition <= 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <Smartphone className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Vibrate className="h-4 w-4" />
          터치로 드래그하세요
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          className="flex items-center gap-2"
        >
          <Smartphone className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 🎯 터치 최적화 칸반 보드 */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="min-w-max">
          {/* 단계 헤더 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {filteredStages.map(stage => {
              const isTargetStage = touchState.targetStageId === stage.id;
              const isDragSource = touchState.sourceStageId === stage.id;
              const stageClients = clientsByStage[stage.id] || [];
              const isCollapsed = collapsedStages[stage.id];

              return (
                <div
                  key={`header-${stage.id}`}
                  className={`min-w-[300px] transition-all duration-200 ${
                    isTargetStage ? 'transform scale-[1.02] ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-card-foreground">
                          {stage.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getStageDisplayText(stage)}
                        </p>
                      </div>
                      
                      {/* 접기/펼치기 버튼 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStageCards(stage.id)}
                        className="shrink-0"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* 통계 정보 */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">
                          총 {stage.stats.clientCount}명
                        </span>
                      </div>
                      {stage.stats.highImportanceCount > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600 font-medium">
                            중요 {stage.stats.highImportanceCount}명
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 고객 추가 버튼 */}
                    {onAddClientToStage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddClientToStage(stage.id)}
                        className="w-full mt-3 text-xs"
                      >
                        + 고객 추가
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 칸반보드 컨텐츠 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredStages.map(stage => {
              const isTargetStage = touchState.targetStageId === stage.id;
              const isDragSource = touchState.sourceStageId === stage.id;
              const stageClients = clientsByStage[stage.id] || [];
              const isCollapsed = collapsedStages[stage.id];

              // 🎯 PipelineColumn 최적화: 가시 카드 계산
              const { visibleCards, totalHeight, offsetTop = 0 } = getVisibleCards(stage.id, stageClients);

              return (
                <div
                  key={stage.id}
                  data-stage-id={stage.id}
                  className={`min-w-[300px] min-h-[400px] transition-all duration-200 ${
                    isTargetStage ? 'transform scale-[1.02]' : ''
                  }`}
                >
                  {/* 🎯 PipelineColumn 최적화: 수직 스크롤 컨테이너 */}
                  <div
                    ref={(el) => setColumnRef(stage.id, el)}
                    className={`relative overflow-y-auto p-2 rounded-lg transition-all duration-200 ${
                      isTargetStage
                        ? 'bg-primary/5 border-2 border-dashed border-primary'
                        : 'bg-transparent'
                    } ${
                      // 🎯 드래그 인디케이터: 드롭존 하이라이트
                      touchState.isDragging && touchState.isValidDropZone && isTargetStage
                        ? 'ring-2 ring-primary/50 ring-offset-2 bg-primary/10'
                        : ''
                    }`}
                    style={{
                      height: `${CONTAINER_HEIGHT}px`,
                      scrollBehavior: 'smooth',
                    }}
                  >
                    {isCollapsed ? (
                      /* 접힌 상태 */
                      <div className={`flex flex-col items-center justify-center h-32 bg-muted/20 border border-dashed border-border rounded-lg ${
                        // 🎯 드래그 인디케이터: 접힌 상태에서도 드롭존 표시
                        touchState.isDragging && isTargetStage && touchState.isValidDropZone
                          ? 'border-primary bg-primary/5 scale-105'
                          : ''
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {getStageDisplayText(stage)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          카드가 숨겨짐
                        </p>

                        {/* 접힌 상태에서도 드롭 지원 */}
                        {isTargetStage && touchState.isDragging && touchState.isValidDropZone && (
                          <div className="mt-2 text-xs text-primary font-medium animate-pulse">
                            ✓ {stage.name}로 이동
                          </div>
                        )}
                      </div>
                    ) : (
                      /* 🎯 PipelineColumn 최적화: 가상 스크롤링 렌더링 */
                      <div
                        style={{
                          height: `${totalHeight}px`,
                          position: 'relative',
                        }}
                      >
                        {stageClients.length > 0 ? (
                          <>
                            {/* 🎯 가상화된 카드 렌더링 */}
                            <div
                              style={{
                                transform: `translateY(${offsetTop}px)`,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                              }}
                            >
                              <div className="space-y-3">
                                {visibleCards.map((client, index) => (
                                  <div key={client.id} className="relative">
                                    {/* 🎯 드래그 플레이스홀더 */}
                                    {touchState.isDragging && 
                                     client.id === touchState.draggedClientId && 
                                     stage.id === touchState.sourceStageId && (
                                      <div className="mb-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 animate-pulse">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                          <GripVertical className="h-4 w-4" />
                                          <span className="text-sm">원래 위치 ({client.name})</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* 🎯 실제 카드 (드래그 중이 아닐 때만 표시) */}
                                    {!(touchState.isDragging && client.id === touchState.draggedClientId) && (
                                      <div
                                        className={`transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                          client.id === touchState.draggedClientId
                                            ? 'opacity-50 z-50'
                                            : 'hover:transform hover:scale-[1.02] hover:shadow-md'
                                        }`}
                                        style={{
                                          minHeight: `${CARD_HEIGHT}px`,
                                          touchAction: 'none', // 터치 이벤트 최적화
                                        }}
                                        onTouchStart={e => handleTouchStart(e, client.id, stage.id)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                      >
                                        <ClientCard
                                          id={client.id}
                                          name={client.name}
                                          phone={client.phone}
                                          importance={client.importance}
                                          tags={Array.isArray(client.tags) ? client.tags.join(', ') : client.tags}
                                          createdAt={client.createdAt || new Date().toISOString()}
                                          insuranceInfo={Array.isArray(client.insuranceInfo) ? client.insuranceInfo[0] : client.insuranceInfo}
                                          referredBy={client.referredBy || undefined}
                                          isDragging={client.id === touchState.draggedClientId}
                                          onRemoveFromPipeline={onRemoveFromPipeline}
                                          onCreateContract={onCreateContract}
                                          onEditOpportunity={onEditOpportunity}
                                          products={client.products}
                                          totalMonthlyPremium={client.totalMonthlyPremium}
                                          totalExpectedCommission={client.totalExpectedCommission}
                                        />
                                      </div>
                                    )}

                                    {/* 🎯 드롭 프리뷰 (다른 스테이지에서 드롭될 때) */}
                                    {touchState.isDragging && 
                                     touchState.draggedClientId &&
                                     stage.id === touchState.dragPlaceholderStage &&
                                     stage.id !== touchState.sourceStageId &&
                                     index === visibleCards.length - 1 && (
                                      <div className="mt-3 p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 animate-pulse">
                                        <div className="flex items-center justify-center gap-2 text-primary">
                                          <Users className="h-4 w-4" />
                                          <span className="text-sm font-medium">여기로 이동됩니다</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 🎯 스크롤 인디케이터 (대용량 카드용) */}
                            {stageClients.length > 10 && (
                              <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                {Math.floor((verticalScrollPositions[stage.id] || 0) / CARD_HEIGHT) + 1} / {stageClients.length}
                              </div>
                            )}
                          </>
                        ) : (
                          /* 빈 상태 */
                          <div className={`flex flex-col items-center justify-center h-32 bg-muted/10 border border-dashed border-border rounded-lg ${
                            // 🎯 드래그 인디케이터: 빈 컬럼에 드롭 가능 표시
                            touchState.isDragging && isTargetStage && touchState.isValidDropZone
                              ? 'border-primary bg-primary/5 scale-105'
                              : ''
                          }`}>
                            <Users className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">
                              {touchState.isDragging && isTargetStage && touchState.isValidDropZone
                                ? '여기로 드롭하세요!'
                                : '고객이 없습니다'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {touchState.isDragging && isTargetStage ? '' : '고객을 추가하거나 드래그하세요'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
