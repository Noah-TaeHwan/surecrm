/**
 * Device Detection Hooks 종합 데모 컴포넌트
 *
 * 모든 Device Detection Hooks의 실제 동작을 확인할 수 있는
 * 인터랙티브 데모 페이지입니다.
 */

import React from 'react';
import {
  useViewport,
  useDeviceType,
  useBreakpoint,
  useTouchDevice,
  useOrientation,
  useIsMobileLike,
  useTouchSpacing,
  BREAKPOINTS,
} from '../index';

export function DeviceDetectionDemo() {
  const viewport = useViewport();
  const deviceType = useDeviceType();
  const breakpoint = useBreakpoint();
  const touchDevice = useTouchDevice();
  const orientation = useOrientation();
  const isMobileLike = useIsMobileLike();
  const touchSpacing = useTouchSpacing();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Device Detection Hooks Demo
          </h1>
          <p className="text-gray-600">
            실시간으로 디바이스 정보를 확인해보세요
          </p>
        </header>

        {/* 실시간 정보 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Viewport 정보 */}
          <InfoCard title="🖥️ Viewport">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Width:</span>
                <span className="font-mono">{viewport.width}px</span>
              </div>
              <div className="flex justify-between">
                <span>Height:</span>
                <span className="font-mono">{viewport.height}px</span>
              </div>
              <div className="flex justify-between">
                <span>Ratio:</span>
                <span className="font-mono">
                  {(viewport.width / viewport.height).toFixed(2)}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Device Type 정보 */}
          <InfoCard title="📱 Device Type">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Type:</span>
                <span
                  className={`font-semibold ${getDeviceTypeColor(deviceType)}`}
                >
                  {deviceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mobile-like:</span>
                <span
                  className={isMobileLike ? 'text-green-600' : 'text-gray-600'}
                >
                  {isMobileLike ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Breakpoint 정보 */}
          <InfoCard title="📏 Breakpoint">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-semibold text-blue-600">
                  {breakpoint.current}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Width:</span>
                <span className="font-mono">
                  {BREAKPOINTS[breakpoint.current]}px
                </span>
              </div>
              <div className="flex justify-between">
                <span>Above MD:</span>
                <span
                  className={
                    breakpoint.isAbove('md') ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {breakpoint.isAbove('md') ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Touch Device 정보 */}
          <InfoCard title="👆 Touch Device">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Has Touch:</span>
                <span
                  className={
                    touchDevice.hasTouch ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  {touchDevice.hasTouch ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Primary Touch:</span>
                <span
                  className={
                    touchDevice.isPrimaryTouch
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {touchDevice.isPrimaryTouch ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coarse Pointer:</span>
                <span
                  className={
                    touchDevice.supportsCoarsePointer
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {touchDevice.supportsCoarsePointer ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fine Pointer:</span>
                <span
                  className={
                    touchDevice.supportsFinePointer
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {touchDevice.supportsFinePointer ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Orientation 정보 */}
          <InfoCard title="🔄 Orientation">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-semibold text-purple-600">
                  {orientation.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Angle:</span>
                <span className="font-mono">{orientation.angle}°</span>
              </div>
              <div className="flex justify-between">
                <span>Portrait:</span>
                <span
                  className={
                    orientation.isPortrait ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  {orientation.isPortrait ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Landscape:</span>
                <span
                  className={
                    orientation.isLandscape ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  {orientation.isLandscape ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Touch Spacing 정보 */}
          <InfoCard title="📐 Touch Spacing">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Button Height:</span>
                <span className="font-mono">
                  {touchSpacing.buttonMinHeight}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Touch Target:</span>
                <span className="font-mono">{touchSpacing.touchTarget}</span>
              </div>
              <div className="flex justify-between">
                <span>Spacing:</span>
                <span className="font-mono">{touchSpacing.spacing}</span>
              </div>
              <div className="flex justify-between">
                <span>Padding:</span>
                <span className="font-mono">{touchSpacing.padding}</span>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* 인터랙티브 예제들 */}
        <div className="space-y-8">
          {/* 반응형 그리드 예제 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">반응형 그리드 예제</h2>
            <ResponsiveGridExample />
          </section>

          {/* 터치 최적화 버튼 예제 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">터치 최적화 버튼 예제</h2>
            <TouchOptimizedButtonsExample />
          </section>

          {/* 방향 감지 레이아웃 예제 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">방향 감지 레이아웃 예제</h2>
            <OrientationAwareLayoutExample />
          </section>
        </div>

        {/* 사용법 안내 */}
        <footer className="text-center py-8 text-gray-600">
          <p>화면 크기를 조정하거나 디바이스를 회전시켜 변화를 확인해보세요!</p>
        </footer>
      </div>
    </div>
  );
}

// 정보 카드 컴포넌트
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

// 디바이스 타입별 색상
function getDeviceTypeColor(deviceType: string) {
  switch (deviceType) {
    case 'mobile':
      return 'text-green-600';
    case 'tablet':
      return 'text-blue-600';
    case 'desktop':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}

// 반응형 그리드 예제
function ResponsiveGridExample() {
  const { current } = useBreakpoint();

  const getColumns = () => {
    switch (current) {
      case 'xs':
        return 1;
      case 'sm':
        return 1;
      case 'md':
        return 2;
      case 'lg':
        return 3;
      case 'xl':
        return 4;
      case '2xl':
        return 5;
      default:
        return 1;
    }
  };

  const columns = getColumns();
  const items = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-lg p-6">
      <p className="mb-4 text-gray-600">
        현재 브레이크포인트: <span className="font-semibold">{current}</span>(
        {columns}열 그리드)
      </p>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map(item => (
          <div
            key={item}
            className="bg-blue-100 rounded-lg p-4 text-center text-blue-800 font-semibold"
          >
            Item {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// 터치 최적화 버튼 예제
function TouchOptimizedButtonsExample() {
  const { isPrimaryTouch } = useTouchDevice();
  const touchSpacing = useTouchSpacing();

  return (
    <div className="bg-white rounded-lg p-6">
      <p className="mb-4 text-gray-600">
        터치 디바이스:{' '}
        <span className="font-semibold">{isPrimaryTouch ? 'Yes' : 'No'}</span>
      </p>
      <div className={touchSpacing.spacing}>
        <button
          style={{ minHeight: touchSpacing.buttonMinHeight }}
          className={`
            w-full rounded-lg bg-blue-500 text-white font-semibold
            ${touchSpacing.padding}
            ${isPrimaryTouch ? 'active:scale-95 transition-transform' : 'hover:bg-blue-600'}
          `}
        >
          Primary Button ({touchSpacing.buttonMinHeight})
        </button>

        <button
          style={{ minHeight: touchSpacing.touchTarget }}
          className={`
            w-full rounded-lg bg-green-500 text-white font-semibold
            ${touchSpacing.padding}
            ${isPrimaryTouch ? 'active:scale-95 transition-transform' : 'hover:bg-green-600'}
          `}
        >
          Touch Target ({touchSpacing.touchTarget})
        </button>

        <button
          className={`
            w-full rounded-lg bg-purple-500 text-white font-semibold
            px-4 py-2 min-h-[32px]
            ${isPrimaryTouch ? 'active:scale-95 transition-transform' : 'hover:bg-purple-600'}
          `}
        >
          Standard Button (32px)
        </button>
      </div>
    </div>
  );
}

// 방향 감지 레이아웃 예제
function OrientationAwareLayoutExample() {
  const { isPortrait, isLandscape, type, angle } = useOrientation();
  const { width, height } = useViewport();

  return (
    <div className="bg-white rounded-lg p-6">
      <p className="mb-4 text-gray-600">
        현재 방향: <span className="font-semibold">{type}</span> ({angle}°)
      </p>

      <div
        className={`
        border-2 border-dashed border-gray-300 rounded-lg p-4
        ${isPortrait ? 'flex flex-col' : 'flex flex-row'}
        min-h-[200px]
      `}
      >
        <div
          className={`
          bg-blue-100 rounded p-4 text-blue-800
          ${isPortrait ? 'mb-4' : 'mr-4 flex-1'}
        `}
        >
          <h4 className="font-semibold mb-2">Sidebar</h4>
          <p className="text-sm">
            {isPortrait ? '세로 모드: 상단 배치' : '가로 모드: 좌측 배치'}
          </p>
        </div>

        <div
          className={`
          bg-green-100 rounded p-4 text-green-800
          ${isPortrait ? 'flex-1' : 'flex-1'}
        `}
        >
          <h4 className="font-semibold mb-2">Main Content</h4>
          <p className="text-sm">
            뷰포트: {width} × {height}
          </p>
          <p className="text-sm">
            비율: {(width / height).toFixed(2)}(
            {isLandscape ? '가로가 더 김' : '세로가 더 김'})
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetectionDemo;
