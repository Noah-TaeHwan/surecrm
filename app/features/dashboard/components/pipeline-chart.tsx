import React from 'react';

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface PipelineChartProps {
  data: PipelineStage[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  // 실제 차트 라이브러리 구현 대신 간단한 시각화
  const total = data.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="my-4">
      <div className="flex h-8 w-full overflow-hidden rounded-md">
        {data.map((stage, index) => (
          <div
            key={index}
            className="h-full"
            style={{
              width: `${(stage.count / total) * 100}%`,
              backgroundColor: stage.color,
            }}
            title={`${stage.name}: ${stage.count}건`}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {data.map((stage, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="mr-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span>
              {stage.name}: {stage.count}건
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
