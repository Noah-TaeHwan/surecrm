import React from 'react';
import { Sidebar } from './sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import {
  DesktopOnly,
  MobileOnly,
} from '~/common/components/ui/responsive-layout';
import { cn } from '~/lib/utils';

interface FlexibleSidebarProps {
  className?: string;
  /**
   * 모바일 메뉴 닫기 콜백 (Sheet 컴포넌트에서 사용)
   */
  onClose?: () => void;
  /**
   * 사이드바 접힘 상태 (태블릿에서 사용)
   */
  isCollapsed?: boolean;
  /**
   * 사이드바 접힘 토글 함수
   */
  onToggleCollapse?: () => void;
}

/**
 * 반응형 사이드바 시스템
 *
 * 화면 크기별 동작:
 * - 데스크톱 (lg+): 고정 사이드바 표시
 * - 태블릿 (md-lg): 접이식 사이드바 (향후 구현)
 * - 모바일 (<md): 하단 탭 네비게이션 + Sheet 사이드바
 */
export function FlexibleSidebar({
  className,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: FlexibleSidebarProps) {
  return (
    <>
      {/* 데스크톱 고정 사이드바 (md 이상) */}
      <DesktopOnly className="md:block hidden">
        <div className={cn('w-64 flex-shrink-0', className)}>
          <Sidebar />
        </div>
      </DesktopOnly>

      {/* 태블릿 접이식 사이드바 (md-lg) - 향후 구현 */}
      {/* TODO: 태블릿용 접이식 사이드바 구현 - 현재는 데스크톱과 동일하게 처리 */}

      {/* 모바일 하단 탭 네비게이션 (md 미만) */}
      <MobileOnly>
        <MobileBottomNav />
      </MobileOnly>

      {/* 모바일 Sheet용 사이드바 (별도 렌더링) */}
      {/* 이 부분은 MainLayout에서 Sheet으로 감싸서 사용 */}
    </>
  );
}

/**
 * Sheet 내부에서 사용할 모바일 사이드바
 * MainLayout의 Sheet 컴포넌트 내부에서 사용
 */
export function MobileSidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* 모바일 전용 헤더 - X 버튼 제거 (SheetContent에서 제공) */}
      <div className="flex items-center p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
      </div>

      {/* 사이드바 컨텐츠 */}
      <div className="flex-1">
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
}

/**
 * 태블릿용 접이식 사이드바 (향후 구현)
 */
export function CollapsibleSidebar({
  isCollapsed,
  onToggle,
  className,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  // TODO: 태블릿용 접이식 사이드바 구현
  // - 아이콘만 표시하는 축소 모드
  // - 호버 시 확장되는 기능
  // - 토글 버튼

  return (
    <div className={cn('transition-all duration-300', className)}>
      {isCollapsed ? (
        // 축소된 사이드바 (아이콘만)
        <div className="w-16">{/* 축소된 네비게이션 */}</div>
      ) : (
        // 전체 사이드바
        <div className="w-64">
          <Sidebar />
        </div>
      )}
    </div>
  );
}
