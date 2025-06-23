import { cn } from '~/lib/utils';

interface PipelineLoadingSkeletonProps {
  className?: string;
  stageCount?: number;
  itemsPerStage?: number;
  'aria-label'?: string;
}

// 🎯 접근성을 고려한 로딩 스켈레톤 컴포넌트
export function PipelineLoadingSkeleton({
  className,
  stageCount = 4,
  itemsPerStage = 3,
  'aria-label': ariaLabel = '영업 파이프라인 데이터를 불러오는 중입니다.',
}: PipelineLoadingSkeletonProps) {
  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {/* 🎯 데스크톱 레이아웃 */}
      <div className="hidden lg:block">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Array.from({ length: stageCount }).map((_, stageIndex) => (
            <div
              key={stageIndex}
              className="flex-shrink-0 w-80 min-h-96 bg-gray-50 rounded-lg p-4 animate-pulse"
            >
              {/* 스테이지 헤더 스켈레톤 */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded-md w-24 animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* 통계 스켈레톤 */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-12 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded-full w-8 animate-pulse" />
              </div>

              {/* 클라이언트 카드 스켈레톤 */}
              <div className="space-y-3">
                {Array.from({ length: itemsPerStage }).map((_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-white p-4 rounded-lg border animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 모바일 레이아웃 */}
      <div className="lg:hidden">
        {/* 스테이지 탭 스켈레톤 */}
        <div className="sticky top-0 z-20 bg-white border-b mb-4">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {Array.from({ length: stageCount }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-10 bg-gray-200 rounded-full w-20 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 모바일 카드 스켈레톤 */}
        <div className="px-4 space-y-3">
          {Array.from({ length: itemsPerStage * 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border animate-pulse"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-4/5 mb-3 animate-pulse" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 스크린 리더용 숨겨진 로딩 메시지 */}
      <div className="sr-only" aria-live="polite">
        영업 파이프라인 데이터를 불러오는 중입니다. 잠시만 기다려 주세요.
      </div>
    </div>
  );
}

// 🎯 개별 카드 로딩 스켈레톤 (부분 업데이트용)
export function ClientCardLoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn('bg-white p-4 rounded-lg border animate-pulse', className)}
      role="status"
      aria-label="고객 정보를 불러오는 중입니다."
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
    </div>
  );
}
