import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Separator } from '~/common/components/ui/separator';
import {
  ResponsiveNavWrapper,
  NavigationProvider,
  useNavigation,
} from '../components/navigation/responsive-nav-wrapper';
import type {
  NavigationState,
  NavigationMode,
} from '../components/navigation/responsive-nav-wrapper';
import { useViewport } from '~/common/hooks/useViewport';
import {
  Monitor,
  Tablet,
  Smartphone,
  Menu,
  X,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BottomTabNavigation } from '../components/navigation/bottom-tab-navigation';

/**
 * 네비게이션 상태 정보를 표시하는 컴포넌트
 */
function NavigationStateDisplay() {
  const { state } = useNavigation();
  const { width, height } = useViewport();

  const getModeIcon = (mode: NavigationMode) => {
    switch (mode) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: NavigationMode) => {
    switch (mode) {
      case 'desktop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tablet':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mobile':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          네비게이션 상태 정보
        </CardTitle>
        <CardDescription>
          현재 화면 크기와 네비게이션 모드를 실시간으로 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 화면 크기 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              화면 크기
            </h4>
            <div className="text-lg font-mono">
              {width} × {height}px
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              네비게이션 모드
            </h4>
            <Badge
              variant="outline"
              className={`${getModeColor(state.mode)} font-medium`}
            >
              {getModeIcon(state.mode)}
              <span className="ml-2 capitalize">{state.mode}</span>
            </Badge>
          </div>
        </div>

        <Separator />

        {/* 네비게이션 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <span className="text-sm font-medium">사이드바 표시</span>
            {state.isSidebarVisible ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <span className="text-sm font-medium">모바일 메뉴 열림</span>
            {state.isMobileNavOpen ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <span className="text-sm font-medium">하단 탭 표시</span>
            {state.isBottomNavVisible ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 테스트 기능을 제공하는 컨트롤 패널
 */
function TestControlPanel() {
  const { state, openMobileNav, closeMobileNav } = useNavigation();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="h-5 w-5 text-purple-500" />
          테스트 컨트롤
        </CardTitle>
        <CardDescription>
          네비게이션 기능을 직접 테스트해보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={openMobileNav}
            disabled={state.mode === 'desktop' || state.isMobileNavOpen}
            variant="outline"
            size="sm"
          >
            <Menu className="h-4 w-4 mr-2" />
            모바일 메뉴 열기
          </Button>

          <Button
            onClick={closeMobileNav}
            disabled={!state.isMobileNavOpen}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            모바일 메뉴 닫기
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            페이지 새로고침
          </Button>
        </div>

        {state.mode !== 'desktop' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>테스트 팁:</strong> 브라우저 개발자 도구의 디바이스
                시뮬레이터를 사용하여 다양한 화면 크기에서 네비게이션 동작을
                테스트해보세요.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 반응형 브레이크포인트 가이드
 */
function BreakpointGuide() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>반응형 브레이크포인트 가이드</CardTitle>
        <CardDescription>
          각 화면 크기에 따른 네비게이션 모드 변경 기준입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">데스크톱</div>
                <div className="text-sm text-blue-600">≥ 1024px</div>
              </div>
            </div>
            <div className="text-sm text-blue-700">고정 사이드바</div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <Tablet className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">태블릿</div>
                <div className="text-sm text-orange-600">768px - 1023px</div>
              </div>
            </div>
            <div className="text-sm text-orange-700">햄버거 메뉴</div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">모바일</div>
                <div className="text-sm text-green-600">&lt; 768px</div>
              </div>
            </div>
            <div className="text-sm text-green-700">햄버거 메뉴 + 하단 탭</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 메인 테스트 컨텐츠
 */
function TestPageContent() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          반응형 네비게이션 래퍼 테스트
        </h1>
        <p className="text-muted-foreground">
          화면 크기에 따라 자동으로 네비게이션 모드가 변경되는 것을
          확인해보세요.
        </p>
      </div>

      <NavigationStateDisplay />
      <TestControlPanel />
      <BreakpointGuide />

      {/* 추가 컨텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>구현된 기능</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              자동 화면 크기 감지 및 네비게이션 모드 전환
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              SSR/SSG 환경에서 hydration mismatch 방지
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              라우트 변경 시 모바일 메뉴 자동 닫기
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Framer Motion 애니메이션 통합
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Context API를 통한 상태 관리
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              TypeScript 타입 안전성 보장
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 반응형 네비게이션 테스트 페이지
 */
export default function TestResponsiveNav() {
  const [navigationState, setNavigationState] =
    useState<NavigationState | null>(null);

  const handleNavigationStateChange = useCallback((state: NavigationState) => {
    setNavigationState(state);
    console.log('🔄 네비게이션 상태 변경:', state);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* 리퀴드글래스 효과 테스트를 위한 다채로운 배경 */}
      <div className="relative p-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            iOS26 리퀴드글래스 UX/UI
          </h1>
          <p className="text-xl text-white/80">
            투명한 글래스 효과와 액체같은 움직임
          </p>
        </div>

        {/* 컬러풀한 카드들 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500 h-32 rounded-2xl shadow-lg flex items-center justify-center">
            <span className="text-white font-semibold">빨간색 카드</span>
          </div>
          <div className="bg-green-500 h-32 rounded-2xl shadow-lg flex items-center justify-center">
            <span className="text-white font-semibold">초록색 카드</span>
          </div>
          <div className="bg-yellow-500 h-32 rounded-2xl shadow-lg flex items-center justify-center">
            <span className="text-white font-semibold">노란색 카드</span>
          </div>
          <div className="bg-indigo-500 h-32 rounded-2xl shadow-lg flex items-center justify-center">
            <span className="text-white font-semibold">남색 카드</span>
          </div>
        </div>

        {/* 스크롤 가능한 콘텐츠 */}
        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
            >
              <h3 className="text-white font-semibold mb-2">
                콘텐츠 아이템 {i + 1}
              </h3>
              <p className="text-white/80 text-sm">
                리퀴드글래스 효과가 이 콘텐츠들과 어떻게 상호작용하는지
                확인해보세요. 바텀네비게이션의 투명한 글래스 효과가 배경 색상을
                자연스럽게 반영합니다.
              </p>
            </div>
          ))}
        </div>

        {/* 바텀 패딩 (네비게이션 여유 공간) */}
        <div className="h-24" />
      </div>

      {/* 리퀴드글래스 바텀네비게이션 */}
      <BottomTabNavigation isMenuOpen={false} />
    </div>
  );
}
