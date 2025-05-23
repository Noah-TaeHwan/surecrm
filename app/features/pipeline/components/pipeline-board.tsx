import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { ClientCard } from './client-card';
import type { PipelineStage, Client } from '~/features/pipeline/types';

interface PipelineBoardProps {
  stages: PipelineStage[];
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
    <div className="w-full">
      {/* 칸반보드 컨텐츠 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const isDragTarget = draggingOver === stage.id;
          const canDrop =
            draggedClientId && dragSourceStageId.current !== stage.id;

          return (
            <div
              key={stage.id}
              className={`min-w-[300px] transition-all duration-200 ${
                isDragTarget && canDrop
                  ? 'transform scale-[1.02] drop-shadow-lg'
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* 고객 카드 컨테이너 */}
              <div
                className={`space-y-3 p-1 transition-all duration-200 ${
                  isDragTarget && canDrop
                    ? 'bg-accent/20 border-2 border-dashed border-accent rounded-lg p-3'
                    : ''
                }`}
              >
                {clientsByStage[stage.id]?.length > 0 ? (
                  clientsByStage[stage.id].map((client) => (
                    <div
                      key={client.id}
                      id={`client-card-${client.id}`}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, client.id, stage.id)
                      }
                      onDragEnd={handleDragEnd}
                      className={`transition-all duration-200 ${
                        client.id === draggedClientId
                          ? 'cursor-grabbing opacity-50 transform rotate-1 scale-95'
                          : 'cursor-grab hover:transform hover:scale-[1.02]'
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
                    className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg transition-all duration-200 ${
                      isDragTarget && canDrop
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-border/60 hover:bg-muted/20'
                    }`}
                  >
                    {isDragTarget && canDrop ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium">
                          여기에 고객을 놓으세요
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          이 단계에 고객이 없습니다
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
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
  );
}
