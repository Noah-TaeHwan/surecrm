import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import { Plus, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { ClientCard } from './client-card';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';

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
}

export function PipelineBoard({
  stages,
  clients,
  onClientMove,
  onAddClientToStage,
}: PipelineBoardProps) {
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const dragSourceStageId = useRef<string | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // 컴포넌트 마운트 시 클라이언트 상태 업데이트를 위한 효과
  const [clientsState, setClientsState] = useState<Client[]>(clients);

  useEffect(() => {
    setClientsState(clients);
  }, [clients]);

  // 단계별로 고객을 그룹화
  const clientsByStage = stages.reduce<Record<string, Client[]>>(
    (acc, stage) => {
      acc[stage.id] = clientsState.filter(
        (client) => client.stageId === stage.id
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
      setClientsState((prevClients) =>
        prevClients.map((client) =>
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

  return (
    <div className="w-full overflow-x-auto">
      {/* 🎯 MVP 칸반보드 헤더와 콘텐츠 */}
      <div className="min-w-max">
        {/* 단계 헤더 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {stages.map((stage) => {
            const isDragTarget = draggingOver === stage.id;
            const canDrop =
              draggedClientId && dragSourceStageId.current !== stage.id;

            return (
              <div
                key={`header-${stage.id}`}
                className={`min-w-[300px] transition-all duration-200 ${
                  isDragTarget && canDrop ? 'transform scale-[1.02]' : ''
                }`}
              >
                <div
                  className={`flex flex-col p-4 rounded-lg border bg-card transition-all duration-200 ${
                    isDragTarget && canDrop
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border'
                  }`}
                >
                  {/* 단계 제목과 추가 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-semibold text-foreground text-base truncate">
                        {stage.name}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 flex-shrink-0"
                      onClick={() => onAddClientToStage?.(stage.id)}
                      title={`${stage.name} 단계에 고객 추가`}
                    >
                      <Plus className="h-4 w-4" />
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

                  {/* 드래그 타겟 인디케이터 */}
                  {isDragTarget && canDrop && (
                    <div className="mt-2 p-2 border-2 border-dashed border-primary rounded-md bg-primary/10">
                      <div className="flex items-center justify-center text-primary text-sm font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        여기에 고객을 이동하세요
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 칸반보드 컨텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const isDragTarget = draggingOver === stage.id;
            const canDrop =
              draggedClientId && dragSourceStageId.current !== stage.id;
            const stageClients = clientsByStage[stage.id] || [];

            return (
              <div
                key={stage.id}
                className={`min-w-[300px] min-h-[400px] transition-all duration-200 ${
                  isDragTarget && canDrop ? 'transform scale-[1.02]' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* 고객 카드 컨테이너 */}
                <div
                  className={`space-y-3 p-2 rounded-lg min-h-[350px] transition-all duration-200 ${
                    isDragTarget && canDrop
                      ? 'bg-primary/5 border-2 border-dashed border-primary'
                      : 'bg-transparent'
                  }`}
                >
                  {stageClients.length > 0 ? (
                    stageClients.map((client) => (
                      <div
                        key={client.id}
                        id={`client-card-${client.id}`}
                        draggable
                        onDragStart={(e) =>
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
                          isDragging={client.id === draggedClientId}
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
                          <p className="text-sm text-muted-foreground mb-1">
                            고객이 없습니다
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onAddClientToStage?.(stage.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            고객 추가
                          </Button>
                        </>
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
  );
}
