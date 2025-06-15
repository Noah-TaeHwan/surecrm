/**
 * Device Detection Hooks 빠른 시작 가이드
 * 
 * 가장 일반적인 사용 패턴들을 보여주는 간단한 예제 모음입니다.
 */

import React from 'react';
import {
  useViewport,
  useDeviceType,
  useBreakpoint,
  useTouchDevice,
  useOrientation,
  useIsMobileLike,
} from '../index';

// 1. 기본적인 반응형 컴포넌트
export function BasicResponsiveComponent() {
  const deviceType = useDeviceType();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">기본 반응형 컴포넌트</h2>
      
      {deviceType === 'mobile' && (
        <div className="bg-green-100 p-4 rounded">
          📱 모바일 전용 콘텐츠
        </div>
      )}
      
      {deviceType === 'tablet' && (
        <div className="bg-blue-100 p-4 rounded">
          📱 태블릿 전용 콘텐츠
        </div>
      )}
      
      {deviceType === 'desktop' && (
        <div className="bg-purple-100 p-4 rounded">
          🖥️ 데스크톱 전용 콘텐츠
        </div>
      )}
    </div>
  );
}

// 2. 뷰포트 기반 조건부 렌더링
export function ViewportBasedComponent() {
  const { width, height } = useViewport();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">뷰포트 기반 컴포넌트</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>현재 뷰포트: {width} × {height}</p>
      </div>
      
      {width < 640 && (
        <div className="bg-red-100 p-4 rounded">
          📱 매우 작은 화면 (640px 미만)
        </div>
      )}
      
      {width >= 640 && width < 1024 && (
        <div className="bg-yellow-100 p-4 rounded">
          📱 중간 화면 (640px - 1024px)
        </div>
      )}
      
      {width >= 1024 && (
        <div className="bg-green-100 p-4 rounded">
          🖥️ 큰 화면 (1024px 이상)
        </div>
      )}
    </div>
  );
}

// 3. 브레이크포인트 활용
export function BreakpointComponent() {
  const breakpoint = useBreakpoint();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">브레이크포인트 활용</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>현재 브레이크포인트: <strong>{breakpoint.current}</strong></p>
      </div>
      
      <div className="space-y-2">
        <div className={`p-2 rounded ${breakpoint.matches('sm') ? 'bg-green-100' : 'bg-gray-100'}`}>
          SM 이상: {breakpoint.matches('sm') ? '✅' : '❌'}
        </div>
        <div className={`p-2 rounded ${breakpoint.matches('md') ? 'bg-green-100' : 'bg-gray-100'}`}>
          MD 이상: {breakpoint.matches('md') ? '✅' : '❌'}
        </div>
        <div className={`p-2 rounded ${breakpoint.matches('lg') ? 'bg-green-100' : 'bg-gray-100'}`}>
          LG 이상: {breakpoint.matches('lg') ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
}

// 4. 터치 디바이스 최적화
export function TouchOptimizedComponent() {
  const { hasTouch, isPrimaryTouch } = useTouchDevice();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">터치 최적화 컴포넌트</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>터치 지원: {hasTouch ? '✅' : '❌'}</p>
        <p>주요 입력: {isPrimaryTouch ? '터치' : '마우스/키보드'}</p>
      </div>
      
      <button
        className={`
          w-full rounded-lg bg-blue-500 text-white font-semibold
          ${isPrimaryTouch ? 'min-h-[48px] text-lg p-4' : 'min-h-[40px] text-base p-3'}
          ${isPrimaryTouch ? 'active:scale-95 transition-transform' : 'hover:bg-blue-600'}
        `}
      >
        {isPrimaryTouch ? '터치 최적화 버튼' : '마우스 최적화 버튼'}
      </button>
    </div>
  );
}

// 5. 방향 감지 레이아웃
export function OrientationComponent() {
  const { isPortrait, isLandscape, type } = useOrientation();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">방향 감지 컴포넌트</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>현재 방향: <strong>{type}</strong></p>
        <p>세로 모드: {isPortrait ? '✅' : '❌'}</p>
        <p>가로 모드: {isLandscape ? '✅' : '❌'}</p>
      </div>
      
      <div className={`
        border-2 border-dashed border-gray-300 rounded p-4
        ${isPortrait ? 'flex flex-col space-y-4' : 'flex flex-row space-x-4'}
      `}>
        <div className="bg-blue-100 p-4 rounded flex-1">
          <h3 className="font-semibold">사이드바</h3>
          <p className="text-sm">
            {isPortrait ? '세로: 상단 배치' : '가로: 좌측 배치'}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded flex-1">
          <h3 className="font-semibold">메인 콘텐츠</h3>
          <p className="text-sm">
            방향에 따라 레이아웃이 변경됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

// 6. 모바일 우선 접근법
export function MobileFirstComponent() {
  const isMobileLike = useIsMobileLike();
  const { width } = useViewport();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">모바일 우선 컴포넌트</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>모바일 계열: {isMobileLike ? '✅' : '❌'}</p>
        <p>화면 너비: {width}px</p>
      </div>
      
      {/* 모바일 우선 스타일링 */}
      <div className={`
        rounded-lg p-4
        ${isMobileLike ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
        ${isMobileLike ? 'text-center' : 'text-left'}
        ${width < 640 ? 'text-sm' : 'text-base'}
      `}>
        <h3 className={`font-semibold ${width < 640 ? 'text-lg' : 'text-xl'}`}>
          {isMobileLike ? '📱 모바일 최적화' : '🖥️ 데스크톱 최적화'}
        </h3>
        <p className="mt-2">
          {isMobileLike 
            ? '터치 친화적인 인터페이스로 표시됩니다'
            : '마우스와 키보드에 최적화된 인터페이스입니다'
          }
        </p>
      </div>
    </div>
  );
}

// 7. 종합 예제 - 적응형 네비게이션
export function AdaptiveNavigation() {
  const deviceType = useDeviceType();
  const { hasTouch } = useTouchDevice();
  const { isPortrait } = useOrientation();
  const { current: breakpoint } = useBreakpoint();
  
  const getNavStyle = () => {
    if (deviceType === 'mobile') {
      return isPortrait 
        ? 'flex flex-col space-y-2 p-4' 
        : 'flex flex-row space-x-2 p-2';
    }
    
    if (deviceType === 'tablet') {
      return 'flex flex-row space-x-4 p-3';
    }
    
    return 'flex flex-row space-x-6 p-4';
  };
  
  const getButtonStyle = () => {
    const baseStyle = 'rounded-lg font-semibold transition-colors';
    const touchStyle = hasTouch 
      ? 'min-h-[44px] px-4 py-3 active:scale-95' 
      : 'min-h-[36px] px-3 py-2 hover:bg-opacity-80';
    
    return `${baseStyle} ${touchStyle}`;
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">적응형 네비게이션</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
        <p>디바이스: {deviceType} | 브레이크포인트: {breakpoint}</p>
        <p>터치: {hasTouch ? 'Yes' : 'No'} | 방향: {isPortrait ? 'Portrait' : 'Landscape'}</p>
      </div>
      
      <nav className={`bg-white rounded-lg shadow-md ${getNavStyle()}`}>
        <button className={`${getButtonStyle()} bg-blue-500 text-white`}>
          홈
        </button>
        <button className={`${getButtonStyle()} bg-gray-200 text-gray-800`}>
          제품
        </button>
        <button className={`${getButtonStyle()} bg-gray-200 text-gray-800`}>
          서비스
        </button>
        <button className={`${getButtonStyle()} bg-gray-200 text-gray-800`}>
          연락처
        </button>
      </nav>
    </div>
  );
}

// 모든 예제를 포함하는 메인 컴포넌트
export function QuickStartGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Device Detection Hooks 빠른 시작
          </h1>
          <p className="text-gray-600">
            일반적인 사용 패턴들을 확인해보세요
          </p>
        </header>
        
        <div className="space-y-8">
          <BasicResponsiveComponent />
          <ViewportBasedComponent />
          <BreakpointComponent />
          <TouchOptimizedComponent />
          <OrientationComponent />
          <MobileFirstComponent />
          <AdaptiveNavigation />
        </div>
      </div>
    </div>
  );
}

export default QuickStartGuide; 