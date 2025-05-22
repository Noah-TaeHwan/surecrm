import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientCard } from './client-card';
import type { PipelineStage, Client } from '../pages/+types/pipeline-page';

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

    // 필요한 경우 드래그 이미지 설정
    // const dragElement = document.getElementById(`client-card-${clientId}`);
    // if (dragElement) {
    //   e.dataTransfer.setDragImage(dragElement, 20, 20);
    // }
  };

  // 드래그 오버 핸들러 (드롭 영역에 들어왔을 때)
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    stageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDraggingOver(stageId);
  };

  // 드래그 리브 핸들러 (드롭 영역에서 나갈 때)
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(null);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto min-h-[calc(100vh-230px)]">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={`flex flex-col h-full min-w-[280px] ${
            draggingOver === stage.id ? 'ring-2 ring-primary/50 rounded-lg' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          {/* 단계 헤더 */}
          <div
            className="flex justify-between items-center p-2 rounded-t-lg mb-2"
            style={{ backgroundColor: `${stage.color}20` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              ></div>
              <h3 className="font-medium text-sm">{stage.name}</h3>
              <span className="text-xs text-muted-foreground">
                ({clientsByStage[stage.id]?.length || 0})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground"
              onClick={() => onAddClientToStage?.(stage.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 고객 카드 컨테이너 */}
          <div className="bg-muted/30 p-2 rounded-lg flex-1 overflow-y-auto space-y-2">
            {clientsByStage[stage.id]?.length > 0 ? (
              clientsByStage[stage.id].map((client) => (
                <div
                  key={client.id}
                  id={`client-card-${client.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, client.id, stage.id)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <ClientCard
                    {...client}
                    isDragging={client.id === draggedClientId}
                  />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-lg text-muted-foreground text-sm">
                <p>이 단계에 고객이 없습니다</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => onAddClientToStage?.(stage.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  고객 추가
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
