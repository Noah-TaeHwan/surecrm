import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';

interface ReferralDepthIndicatorProps {
  depth: number;
}

export function ReferralDepthIndicator({ depth }: ReferralDepthIndicatorProps) {
  const depthColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500',
  ];
  const depthLabels = ['직접', '1차', '2차', '3차+'];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                depthColors[Math.min(depth, 3)]
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {depthLabels[Math.min(depth, 3)]}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{depth === 0 ? '직접 개발한 고객' : `${depth}차 소개 고객`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
