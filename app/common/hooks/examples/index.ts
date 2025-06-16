/**
 * Device Detection Hooks 예제 컴포넌트 Export
 *
 * 모든 예제 컴포넌트들을 중앙에서 관리하고 export합니다.
 */

// 종합 데모 컴포넌트
export { DeviceDetectionDemo } from './DeviceDetectionDemo';

// 빠른 시작 가이드 컴포넌트들
export {
  QuickStartGuide,
  BasicResponsiveComponent,
  ViewportBasedComponent,
  BreakpointComponent,
  TouchOptimizedComponent,
  OrientationComponent,
  MobileFirstComponent,
  AdaptiveNavigation,
} from './QuickStartGuide';

// 사용법 예제
export const USAGE_EXAMPLES = {
  // 기본 반응형 패턴
  basicResponsive: `
import { useDeviceType } from '~/common/hooks';

function MyComponent() {
  const deviceType = useDeviceType();
  
  return (
    <div>
      {deviceType === 'mobile' && <MobileView />}
      {deviceType === 'tablet' && <TabletView />}
      {deviceType === 'desktop' && <DesktopView />}
    </div>
  );
}`,

  // 뷰포트 기반 조건부 렌더링
  viewportBased: `
import { useViewport } from '~/common/hooks';

function ResponsiveGrid() {
  const { width } = useViewport();
  
  const columns = width < 640 ? 1 : width < 1024 ? 2 : 3;
  
  return (
    <div style={{ gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}>
      {/* 그리드 아이템들 */}
    </div>
  );
}`,

  // 브레이크포인트 활용
  breakpointUsage: `
import { useBreakpoint } from '~/common/hooks';

function BreakpointComponent() {
  const bp = useBreakpoint();
  
  return (
    <div>
      {bp.matches('md') && <TabletAndAboveContent />}
      {bp.isBelow('lg') && <MobileAndTabletOnly />}
      {bp.isExactly('sm') && <MobileLandscapeOnly />}
    </div>
  );
}`,

  // 터치 최적화
  touchOptimized: `
import { useTouchDevice, useTouchSpacing } from '~/common/hooks';

function TouchButton() {
  const { isPrimaryTouch } = useTouchDevice();
  const spacing = useTouchSpacing();
  
  return (
    <button
      style={{ minHeight: spacing.buttonMinHeight }}
      className={\`
        \${spacing.padding}
        \${isPrimaryTouch ? 'active:scale-95' : 'hover:bg-blue-600'}
      \`}
    >
      터치 최적화 버튼
    </button>
  );
}`,

  // 방향 감지
  orientationAware: `
import { useOrientation } from '~/common/hooks';

function OrientationLayout() {
  const { isPortrait } = useOrientation();
  
  return (
    <div className={\`flex \${isPortrait ? 'flex-col' : 'flex-row'}\`}>
      <Sidebar />
      <MainContent />
    </div>
  );
}`,

  // 모바일 우선 접근법
  mobileFirst: `
import { useIsMobileLike, useViewport } from '~/common/hooks';

function MobileFirstComponent() {
  const isMobileLike = useIsMobileLike();
  const { width } = useViewport();
  
  return (
    <div className={\`
      \${isMobileLike ? 'px-4 py-2' : 'px-8 py-4'}
      \${width < 640 ? 'text-sm' : 'text-base'}
    \`}>
      {/* 콘텐츠 */}
    </div>
  );
}`,

  // 종합 활용 예제
  comprehensive: `
import {
  useDeviceType,
  useTouchDevice,
  useOrientation,
  useBreakpoint
} from '~/common/hooks';

function AdaptiveInterface() {
  const deviceType = useDeviceType();
  const { hasTouch } = useTouchDevice();
  const { isPortrait } = useOrientation();
  const { current: breakpoint } = useBreakpoint();
  
  const getLayoutClass = () => {
    if (deviceType === 'mobile') {
      return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
    }
    return \`\${deviceType}-\${breakpoint}\`;
  };
  
  return (
    <div className={getLayoutClass()}>
      <Navigation touchOptimized={hasTouch} />
      <Content responsive={true} />
    </div>
  );
}`,
};

// 성능 최적화 팁
export const PERFORMANCE_TIPS = {
  memoization: `
// 복잡한 계산은 useMemo로 최적화
import { useMemo } from 'react';
import { useViewport, useDeviceType } from '~/common/hooks';

function OptimizedComponent() {
  const { width, height } = useViewport();
  const deviceType = useDeviceType();
  
  const layoutConfig = useMemo(() => {
    return calculateComplexLayout(width, height, deviceType);
  }, [width, height, deviceType]);
  
  return <Layout config={layoutConfig} />;
}`,

  conditionalRendering: `
// 불필요한 렌더링 방지
import { memo } from 'react';
import { useDeviceType } from '~/common/hooks';

const MobileOnlyComponent = memo(function MobileOnlyComponent() {
  const deviceType = useDeviceType();
  
  if (deviceType !== 'mobile') return null;
  
  return <ExpensiveMobileUI />;
});`,

  storeCleanup: `
// 테스트 후 스토어 정리
import { destroyAllStores } from '~/common/hooks';

afterEach(() => {
  destroyAllStores();
});`,
};

// 일반적인 패턴들
export const COMMON_PATTERNS = {
  responsiveGrid: 'useBreakpoint + CSS Grid로 반응형 그리드 구현',
  touchOptimization: 'useTouchDevice로 터치 친화적 인터페이스 구현',
  orientationLayout: 'useOrientation으로 방향별 레이아웃 변경',
  mobileFirst: 'useIsMobileLike로 모바일 우선 디자인 구현',
  adaptiveNavigation: '여러 hooks 조합으로 적응형 네비게이션 구현',
  performanceOptimization: 'useMemo + 조건부 렌더링으로 성능 최적화',
};
