import React from 'react';
import { useViewport } from '~/common/hooks/useViewport';

interface BottomNavVisualizerProps {
  enabled?: boolean;
}

/**
 * 🔧 하단 네비게이션 영역 시각화 컴포넌트 (개발 환경 전용)
 *
 * 메인 콘텐츠의 하단 패딩이 올바르게 설정되었는지 확인하는 디버깅 도구
 */
export function BottomNavVisualizer({
  enabled = false,
}: BottomNavVisualizerProps) {
  const { isMobile } = useViewport();

  // 개발 환경이 아니거나 비활성화된 경우 렌더링하지 않음
  if (process.env.NODE_ENV !== 'development' || !enabled || !isMobile) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-[9999]"
      style={{
        height: 'var(--total-bottom-padding)',
        background: 'rgba(255, 0, 0, 0.1)',
        borderTop: '2px dashed rgba(255, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="bg-red-500 text-white px-3 py-1 rounded text-xs font-mono"
        style={{ pointerEvents: 'auto' }}
      >
        하단 네비게이션 보호 영역
      </div>
    </div>
  );
}

export default BottomNavVisualizer;
