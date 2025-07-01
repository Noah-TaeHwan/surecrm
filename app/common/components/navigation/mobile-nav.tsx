import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useMobileNavAnimation,
  useAnimationOptimization,
} from '~/common/hooks/use-mobile-animation';
import {
  LayoutDashboard,
  Network,
  PieChart,
  Users,
  Calendar,
  Mail,
  Settings,
  Bell,
  FileText,
  CreditCard,
  X,
  ChevronRight,
  Home,
  Search,
  Menu,
  TrendingUp,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/common/components/ui/button';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';
import { VersionDisplay } from '~/common/components/navigation/version-display';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 💡 타입 정의 강화
export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void; // Edge swipe를 위한 열기 함수 (선택사항)
  className?: string;
  ariaLabel?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
  ariaLabel?: string;
}

export interface MobileNavItemProps {
  item: NavItem;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

// 💡 Enhanced 햅틱 피드백 (타입 안전성 향상)
type HapticType =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError';

const triggerHapticFeedback = (type: HapticType = 'selection') => {
  // 🎯 iOS Safari와 Chrome 보안 정책으로 인한 에러 방지를 위해 진동 기능 비활성화
  // 대신 시각적 피드백에만 의존
  return;
};

// 💡 최적화된 개별 네비게이션 아이템 컴포넌트 (메모이제이션)
const MobileNavItem = memo(function MobileNavItem({
  item,
  isActive,
  index,
  onClick,
}: MobileNavItemProps) {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Enhanced 햅틱 피드백
      triggerHapticFeedback('selection');

      // 애널리틱스 이벤트
      InsuranceAgentEvents.navigationClick(
        item.label,
        window.location.pathname
      );

      // 네비게이션
      navigate(item.href);

      // 모바일 메뉴 닫기
      onClick();
    },
    [navigate, item.href, item.label, onClick]
  );

  // 💡 키보드 네비게이션 향상
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as unknown as React.MouseEvent);
      }
    },
    [handleClick]
  );

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={item.href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles - 터치 친화적 디자인 (WCAG 2.5.5 AAA) - 균형잡힌 레이아웃
          'group flex items-center justify-between w-full min-h-[40px] px-3 py-2.5 rounded-lg text-left',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          // Active state styles
          isActive
            ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
            : 'text-foreground hover:bg-muted/80 active:bg-muted/90',
          // Touch feedback
          'active:scale-[0.98] touch-manipulation'
        )}
        aria-label={item.ariaLabel || `${item.label} 페이지로 이동`}
        aria-current={isActive ? 'page' : undefined}
        tabIndex={0}
      >
        <div className="flex items-center gap-2.5">
          {/* Icon with animation - 크기 최적화 및 정렬 개선 */}
          <motion.div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-200 flex-shrink-0',
              isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
            )}
            whileTap={{ scale: 0.9 }}
            aria-hidden="true"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              {item.icon}
            </div>
          </motion.div>

          {/* Label - 수직 정렬 개선 */}
          <span
            className={cn(
              'font-medium text-[13px] leading-4 flex-1',
              isActive ? 'text-primary' : 'text-foreground'
            )}
          >
            {item.label}
          </span>
        </div>

        {/* Badge and Arrow */}
        <div className="flex items-center gap-1.5">
          {item.badge && (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="text-[10px] min-w-[16px] h-3.5 px-1.5 flex items-center justify-center"
              aria-label={`${item.badge}개의 알림`}
            >
              {item.badge}
            </Badge>
          )}

          {item.isNew && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
              aria-label="새로운 기능"
            />
          )}

          <motion.div
            className={cn(
              'opacity-0 transition-opacity duration-200',
              isActive && 'opacity-100'
            )}
            initial={false}
            animate={{ opacity: isActive ? 1 : 0 }}
            aria-hidden="true"
          >
            <ChevronRight className="w-3 h-3 text-primary" />
          </motion.div>
        </div>
      </Link>
    </motion.li>
  );
});

// 💡 Edge Swipe 관련 인터페이스 (간소화)
interface EdgeSwipeConfig {
  enabled: boolean;
  edgeWidth: number;
  threshold: number;
  velocity: number;
}

// 💡 Enhanced Edge Swipe Detection (모바일 네이티브 앱 스타일)
function useEdgeSwipeDetection(
  onSwipeStart: () => void,
  config: EdgeSwipeConfig
) {
  useEffect(() => {
    if (!config.enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX <= config.edgeWidth) {
        let startY = touch.clientY;
        let moved = false;

        const handleTouchMove = (moveEvent: TouchEvent) => {
          const moveTouch = moveEvent.touches[0];
          const deltaX = moveTouch.clientX - touch.clientX;
          const deltaY = Math.abs(moveTouch.clientY - startY);

          // 가로 스와이프가 세로 스와이프보다 클 때만
          if (deltaX > config.threshold && deltaX > deltaY && !moved) {
            moved = true;
            onSwipeStart();
          }
        };

        const handleTouchEnd = () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove, {
          passive: true,
        });
        document.addEventListener('touchend', handleTouchEnd, {
          passive: true,
        });
      }
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onSwipeStart, config]);
}

// Focus Trap 구현을 위한 새로운 훅
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstElementRef = useRef<HTMLElement | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      firstElementRef.current = focusableElements[0] as HTMLElement;
      lastElementRef.current = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // 첫 번째 요소에 포커스
      firstElementRef.current?.focus();
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab (역방향)
        if (document.activeElement === firstElementRef.current) {
          event.preventDefault();
          lastElementRef.current?.focus();
        }
      } else {
        // Tab (정방향)
        if (document.activeElement === lastElementRef.current) {
          event.preventDefault();
          firstElementRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// Skip Link 컴포넌트
const SkipLink = memo(function SkipLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={e => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );
});

// Live Region for 동적 콘텐츠 알림
const LiveRegion = memo(function LiveRegion({
  message,
  politeness = 'polite',
}: {
  message: string;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
});

// 💡 Body Scroll Lock Hook - iOS Safari 완전 대응
function useBodyScrollLock() {
  const scrollPositionRef = useRef<number>(0);
  const bodyOriginalStyleRef = useRef<string>('');
  const htmlOriginalStyleRef = useRef<string>('');

  const lockScroll = useCallback(() => {
    // 현재 스크롤 위치 저장
    scrollPositionRef.current = window.pageYOffset;

    // 원본 스타일 저장
    bodyOriginalStyleRef.current = document.body.getAttribute('style') || '';
    htmlOriginalStyleRef.current =
      document.documentElement.getAttribute('style') || '';

    // iOS Safari 특화 스크롤 잠금
    const bodyStyle = document.body.style as any;
    const htmlStyle = document.documentElement.style as any;

    // body 스타일 적용
    bodyStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollPositionRef.current}px`;
    bodyStyle.left = '0';
    bodyStyle.right = '0';
    bodyStyle.width = '100%';
    bodyStyle.height = '100%';
    bodyStyle.touchAction = 'none';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.webkitOverflowScrolling = 'none';
    bodyStyle.webkitTouchCallout = 'none';
    bodyStyle.webkitTapHighlightColor = 'transparent';

    // HTML 스타일 적용
    htmlStyle.touchAction = 'none';
    htmlStyle.overscrollBehavior = 'none';
    htmlStyle.webkitTouchCallout = 'none';

    // CSS 클래스도 추가 (fallback)
    document.body.classList.add('mobile-scroll-lock', 'body-scroll-locked');
    document.documentElement.classList.add('mobile-scroll-lock');

    // viewport meta 태그 수정으로 줌 방지
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute(
        'data-original-content',
        viewport.getAttribute('content') || ''
      );
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }, []);

  const unlockScroll = useCallback(() => {
    // 스타일 복원
    if (bodyOriginalStyleRef.current) {
      document.body.setAttribute('style', bodyOriginalStyleRef.current);
    } else {
      document.body.removeAttribute('style');
    }

    if (htmlOriginalStyleRef.current) {
      document.documentElement.setAttribute(
        'style',
        htmlOriginalStyleRef.current
      );
    } else {
      document.documentElement.removeAttribute('style');
    }

    // 클래스 제거
    document.body.classList.remove('mobile-scroll-lock', 'body-scroll-locked');
    document.documentElement.classList.remove('mobile-scroll-lock');

    // 스크롤 위치 복원
    window.scrollTo(0, scrollPositionRef.current);

    // viewport meta 태그 복원
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      const originalContent = viewport.getAttribute('data-original-content');
      if (originalContent) {
        viewport.setAttribute('content', originalContent);
        viewport.removeAttribute('data-original-content');
      }
    }
  }, []);

  return { lockScroll, unlockScroll };
}

export function MobileNav({
  isOpen,
  onClose,
  onOpen,
  className,
  ariaLabel,
}: MobileNavProps) {
  const location = useLocation();
  const { isMobile } = useViewport();
  const [isClosing, setIsClosing] = useState(false);

  // 🌍 다국어 번역 훅
  const { t } = useHydrationSafeTranslation('navigation');

  // 🚀 모바일 애니메이션 최적화
  const navAnimations = useMobileNavAnimation();
  const overlayRef = useAnimationOptimization<HTMLDivElement>();
  const contentRef = useAnimationOptimization<HTMLDivElement>();

  // 💡 Body Scroll Lock 적용
  const { lockScroll, unlockScroll } = useBodyScrollLock();

  // Enhanced Focus Trap
  const focusTrapRef = useFocusTrap(isOpen);

  // Live Region 메시지 상태
  const [liveMessage, setLiveMessage] = useState('');

  // 기본 네비게이션 항목들 (언어 변경 시 재계산)
  const mainNavItems: NavItem[] = useMemo(
    () => [
      {
        label: t('sidebar.main.dashboard', '대시보드'),
        href: '/dashboard',
        icon: <LayoutDashboard className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.main.dashboard', '대시보드')} 페이지로 이동`,
      },
      {
        label: t('sidebar.tools.network', '소개 네트워크'),
        href: '/network',
        icon: <Network className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.tools.network', '소개 네트워크')} 페이지로 이동`,
      },
      {
        label: t('sidebar.main.pipeline', '영업 파이프라인'),
        href: '/pipeline',
        icon: <PieChart className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.main.pipeline', '영업 파이프라인')} 페이지로 이동`,
      },
      {
        label: t('sidebar.main.clients', '고객 관리'),
        href: '/clients',
        icon: <Users className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.main.clients', '고객 관리')} 페이지로 이동`,
      },
      {
        label: t('sidebar.main.calendar', '일정 관리'),
        href: '/calendar',
        icon: <Calendar className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.main.calendar', '일정 관리')} 페이지로 이동`,
      },
    ],
    [t]
  );

  // 추가 기능 메뉴들 (언어 변경 시 재계산)
  const additionalNavItems: NavItem[] = useMemo(
    () => [
      {
        label: t('sidebar.management.invitations', '초대장 관리'),
        href: '/invitations',
        icon: <Mail className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.management.invitations', '초대장 관리')} 페이지로 이동`,
      },
      {
        label: t('sidebar.tools.notifications', '알림'),
        href: '/notifications',
        icon: <Bell className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.tools.notifications', '알림')} 페이지로 이동`,
      },
      {
        label: t('sidebar.main.reports', '보고서'),
        href: '/reports',
        icon: <FileText className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.main.reports', '보고서')} 페이지로 이동`,
      },
      {
        label: t('sidebar.management.billing', '구독 관리'),
        href: '/billing',
        icon: <CreditCard className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.management.billing', '구독 관리')} 페이지로 이동`,
      },
      {
        label: t('sidebar.management.settings', '설정'),
        href: '/settings',
        icon: <Settings className="w-6 h-6" />,
        ariaLabel: `${t('sidebar.management.settings', '설정')} 페이지로 이동`,
      },
    ],
    [t]
  );

  // 💡 메모이제이션된 활성 라우트 확인 함수
  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return location.pathname === href || location.pathname === '/';
      }
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  // 💡 Enhanced close handler with accessibility feedback
  const handleClose = useCallback(() => {
    setIsClosing(true);
    onClose();
    setLiveMessage(t('header.menu_closed', '메뉴가 닫혔습니다.'));

    // 메뉴를 연 버튼에 포커스 반환
    setTimeout(() => {
      const menuButton = document.querySelector(
        '[data-mobile-nav-button]'
      ) as HTMLElement;
      menuButton?.focus();
    }, 100);
  }, [onClose, t]);

  // Enhanced navigation handler with accessibility feedback
  const handleNavigation = useCallback(
    (item: NavItem) => {
      triggerHapticFeedback('selection');
      setLiveMessage(
        `${item.label} ${t('header.navigating_to', '페이지로 이동합니다.')}`
      );
      handleClose();
    },
    [handleClose, t]
  );

  // 💡 Scroll Lock Effect - 사이드바 열림/닫힘에 따른 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    // cleanup function
    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen, lockScroll, unlockScroll]);

  // 💡 Enhanced 키보드 이벤트 핸들러 with Focus Management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        handleClose();
      }

      // Focus trap 개선
      if (event.key === 'Tab' && isOpen) {
        const focusableElements = document.querySelectorAll(
          '[data-mobile-nav] a, [data-mobile-nav] button'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-mobile-nav]')) {
        target.style.outline = 'none';
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('focusin', handleFocus);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isOpen, handleClose]);

  // 모바일에서만 렌더링
  if (!isMobile) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Live Region for Screen Readers */}
          <LiveRegion message={liveMessage} />

          {/* Skip Link for Accessibility */}
          <SkipLink targetId="mobile-nav-main">
            {t('header.skip_to_nav', '모바일 네비게이션으로 이동')}
          </SkipLink>

          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 mobile-sidebar-backdrop"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Mobile Navigation Panel */}
          <motion.div
            ref={focusTrapRef}
            initial={{ x: '-100%' }}
            animate={{
              x: 0,
              transition: {
                type: 'tween',
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
            exit={{
              x: '-100%',
              opacity: 0,
              transition: {
                type: 'tween',
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
            style={{
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            className={cn(
              'fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-r border-border z-50',
              'flex flex-col shadow-2xl h-full',
              'mobile-sidebar-container no-focus-outline',
              className
            )}
            data-mobile-nav
            role="navigation"
            aria-label={ariaLabel || t('header.mobile_menu', '모바일 메뉴')}
            aria-modal="true"
            id="mobile-nav-main"
            onFocus={e => e.target.blur()}
            tabIndex={-1}
          >
            {/* 🎯 고정된 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  delay: isOpen ? 0.1 : 0,
                  duration: 0.3,
                }}
              >
                <Link
                  to="/dashboard"
                  onClick={() => {
                    triggerHapticFeedback('selection');
                    handleClose();
                  }}
                  className="text-xl font-bold text-primary hover:text-primary/80 transition-colors rounded"
                  aria-label={`SureCRM ${t('sidebar.main.dashboard', '대시보드')}로 이동`}
                  onFocus={e => e.target.blur()}
                  tabIndex={-1}
                  style={{
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                  }}
                >
                  SureCRM
                </Link>
              </motion.div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={t('header.close_menu', '메뉴 닫기')}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 🎯 스크롤 가능한 네비게이션 영역 - iOS Safari 최적화 */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea
                className="h-full w-full"
                style={{
                  height: 'calc(100vh - 140px)', // 헤더와 푸터 높이 제외
                  minHeight: '200px',
                }}
              >
                <div
                  className="h-full"
                  style={{
                    paddingBottom: '20px', // 하단 여백으로 스크롤 끝 표시
                  }}
                >
                  <nav
                    className="p-3"
                    role="navigation"
                    aria-label="주요 네비게이션"
                  >
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: {
                          opacity: 0,
                          transition: {
                            staggerChildren: 0.02,
                            staggerDirection: -1,
                            when: 'afterChildren',
                          },
                        },
                        visible: {
                          opacity: 1,
                          transition: {
                            delayChildren: 0.1,
                            staggerChildren: 0.05,
                            when: 'beforeChildren',
                          },
                        },
                      }}
                      className="space-y-1"
                      role="list"
                    >
                      {/* 메인 네비게이션 */}
                      {mainNavItems.map((item, index) => {
                        const isActive = isActiveRoute(item.href);
                        return (
                          <MobileNavItem
                            key={item.href}
                            item={item}
                            isActive={isActive}
                            index={index}
                            onClick={() => handleNavigation(item)}
                          />
                        );
                      })}

                      {/* 구분선 */}
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{
                          delay: isOpen ? 0.4 : 0,
                          duration: 0.3,
                        }}
                        className="h-px bg-border mx-3 my-3"
                      />

                      {/* 추가 기능 */}
                      {additionalNavItems.map((item, index) => {
                        const isActive = isActiveRoute(item.href);
                        return (
                          <MobileNavItem
                            key={item.href}
                            item={item}
                            isActive={isActive}
                            index={index + mainNavItems.length + 1}
                            onClick={() => handleNavigation(item)}
                          />
                        );
                      })}
                    </motion.ul>
                  </nav>
                </div>
              </ScrollArea>
            </div>

            {/* 🎯 고정된 푸터 */}
            <div className="p-3 border-t border-border bg-muted/30 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  delay: isOpen ? 0.3 : 0,
                  duration: 0.3,
                }}
                className="text-center"
              >
                <VersionDisplay />
                <p className="text-xs text-muted-foreground mt-1">
                  © {new Date().getFullYear()} SureCRM. All rights reserved.
                </p>
              </motion.div>
            </div>

            {/* 접근성 안내 (드래그 기능 제거) */}
            <div className="sr-only">
              <p>
                {t(
                  'header.accessibility_escape',
                  '이 메뉴는 Escape 키를 눌러 닫을 수 있습니다.'
                )}
              </p>
              <p>
                {t(
                  'header.accessibility_tab',
                  'Tab 키를 사용하여 메뉴 항목들을 탐색할 수 있습니다.'
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 💡 Enhanced 햄버거 메뉴 버튼 컴포넌트
export interface MobileNavButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  ariaLabel?: string;
  id?: string;
}

export const MobileNavButton = memo(function MobileNavButton({
  onClick,
  isOpen,
  className,
  ariaLabel,
  id,
}: MobileNavButtonProps) {
  const { t } = useHydrationSafeTranslation('navigation');

  const handleClick = useCallback(() => {
    triggerHapticFeedback('selection');
    onClick();
  }, [onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <Button
      id={id}
      variant="ghost"
      size="icon"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative h-10 w-10 rounded-lg transition-all duration-200',
        'hover:bg-muted/80 active:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'touch-manipulation', // 터치 최적화
        className
      )}
      aria-label={
        ariaLabel ||
        (isOpen
          ? t('header.close_menu', '메뉴 닫기')
          : t('header.open_menu', '메뉴 열기'))
      }
      aria-expanded={isOpen}
      aria-controls="mobile-nav-main"
      aria-haspopup="true"
      data-mobile-nav-button
      type="button"
    >
      <motion.div
        className="relative"
        animate={isOpen ? 'open' : 'closed'}
        initial={false}
      >
        {/* 첫 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current rounded-sm"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 6 },
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />

        {/* 두 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current mt-1.5 rounded-sm"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.1 }}
        />

        {/* 세 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current mt-1.5 rounded-sm"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -6 },
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Screen reader only text */}
      <span className="sr-only">
        {isOpen ? '네비게이션 메뉴 닫기' : '네비게이션 메뉴 열기'}
      </span>
    </Button>
  );
});

// 💡 Enhanced 하단 네비게이션 바 (선택사항)
export interface BottomNavProps {
  className?: string;
}

export const BottomNav = memo(function BottomNav({
  className,
}: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const quickNavItems = useMemo(
    () => [
      {
        label: '홈',
        href: '/dashboard',
        icon: <Home className="h-5 w-5" />,
        ariaLabel: '홈 페이지로 이동',
      },
      {
        label: '네트워크',
        href: '/network',
        icon: <Network className="h-5 w-5" />,
        ariaLabel: '네트워크 페이지로 이동',
      },
      {
        label: '고객',
        href: '/clients',
        icon: <Users className="h-5 w-5" />,
        ariaLabel: '고객 관리 페이지로 이동',
      },
      {
        label: '알림',
        href: '/notifications',
        icon: <Bell className="h-5 w-5" />,
        ariaLabel: '알림 페이지로 이동',
      },
      {
        label: '더보기',
        href: '/menu',
        icon: <Menu className="h-5 w-5" />,
        ariaLabel: '더보기 메뉴 페이지로 이동',
      },
    ],
    []
  );

  const handleNavClick = useCallback(
    (href: string, label: string) => {
      triggerHapticFeedback('selection');
      InsuranceAgentEvents.navigationClick(label, location.pathname);
      navigate(href);
    },
    [navigate, location.pathname]
  );

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return location.pathname === href || location.pathname === '/';
      }
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md',
        'border-t border-border shadow-lg',
        'lg:hidden', // 데스크톱에서는 숨김
        'pb-safe', // iOS Safe Area 지원
        className
      )}
      role="navigation"
      aria-label="하단 빠른 네비게이션"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {quickNavItems.map((item, index) => {
          const isActive = isActiveRoute(item.href);

          return (
            <motion.button
              key={item.href}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(item.href, item.label)}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-h-[48px] px-3 py-2 rounded-xl',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className="mb-1"
                aria-hidden="true"
              >
                {item.icon}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium leading-none',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
});
