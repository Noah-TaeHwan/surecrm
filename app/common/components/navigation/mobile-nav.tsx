import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
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

// 💡 타입 정의 강화
export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void; // Edge swipe를 위한 열기 함수 (선택사항)
  className?: string;
  ariaLabel?: string;
  gestureConfig?: {
    edgeSwipe?: Partial<EdgeSwipeConfig>;
    progressiveReveal?: Partial<ProgressiveRevealConfig>;
    velocityAnimation?: Partial<VelocityAnimationConfig>;
  };
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
type HapticType = 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationWarning' | 'notificationError';

const triggerHapticFeedback = (type: HapticType = 'selection') => {
  // 🎯 iOS Safari와 Chrome 보안 정책으로 인한 에러 방지를 위해 진동 기능 비활성화
  // 대신 시각적 피드백에만 의존
  return;
};

// 💡 최적화된 개별 네비게이션 아이템 컴포넌트 (메모이제이션)
const MobileNavItem = memo(function MobileNavItem({ item, isActive, index, onClick }: MobileNavItemProps) {
  const navigate = useNavigate();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Enhanced 햅틱 피드백
    triggerHapticFeedback('selection');
    
    // 애널리틱스 이벤트
    InsuranceAgentEvents.navigationClick(item.label, window.location.pathname);
    
    // 네비게이션
    navigate(item.href);
    
    // 모바일 메뉴 닫기
    onClick();
  }, [navigate, item.href, item.label, onClick]);

  // 💡 키보드 네비게이션 향상
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  }, [handleClick]);

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={item.href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles - 터치 친화적 디자인 (WCAG 2.5.5 AAA)
          'group flex items-center justify-between w-full min-h-[48px] px-4 py-3 rounded-xl text-left',
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
        <div className="flex items-center gap-4">
          {/* Icon with animation */}
          <motion.div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200',
              isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
            )}
            whileTap={{ scale: 0.9 }}
            aria-hidden="true"
          >
            {item.icon}
          </motion.div>
          
          {/* Label */}
          <span className={cn(
            'font-medium text-[15px] leading-6',
            isActive ? 'text-primary' : 'text-foreground'
          )}>
            {item.label}
          </span>
        </div>

        {/* Badge and Arrow */}
        <div className="flex items-center gap-2">
          {item.badge && (
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className="text-xs min-w-[20px] h-5 px-1.5"
              aria-label={`${item.badge}개의 알림`}
            >
              {item.badge}
            </Badge>
          )}
          
          {item.isNew && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-green-500 rounded-full"
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
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.div>
        </div>
      </Link>
    </motion.li>
  );
});

// 💡 고급 제스처 지원을 위한 타입 정의
interface EdgeSwipeConfig {
  enabled: boolean;
  edgeWidth: number;
  threshold: number;
  velocity: number;
}

interface ProgressiveRevealConfig {
  enabled: boolean;
  minOpacity: number;
  maxOpacity: number;
  scaleRange: [number, number];
}

interface VelocityAnimationConfig {
  slowVelocity: number;
  fastVelocity: number;
  slowDuration: number;
  fastDuration: number;
}

// 💡 Enhanced Gesture Configuration with Drawer Integration
const GESTURE_CONFIG = {
  edgeSwipe: {
    enabled: true,
    edgeWidth: 20, // Edge detection zone width
    threshold: 25, // Minimum distance to trigger
    velocity: 300, // Minimum velocity threshold
  },
  progressiveReveal: {
    enabled: true,
    minOpacity: 0.3,
    maxOpacity: 1.0,
    scaleRange: [0.9, 1.0] as [number, number],
  },
  velocityAnimation: {
    slowVelocity: 200,
    fastVelocity: 1000,
    slowDuration: 0.6,
    fastDuration: 0.2,
  },
  drawerIntegration: {
    momentum: {
      threshold: 0.5, // Threshold for momentum continuation
      dampingFactor: 0.8, // Damping for momentum animation
      maxVelocity: 2000, // Maximum velocity cap
    },
    interruption: {
      enabled: true,
      smoothTransition: true,
      interruptionThreshold: 50, // Threshold for gesture interruption
    },
    resistance: {
      enabled: true,
      factor: 0.3, // Resistance when dragging beyond boundaries
      threshold: 50, // Distance threshold for resistance
    }
  }
} as const;

// 💡 Edge Swipe Detection Hook
function useEdgeSwipeDetection(onSwipeStart: () => void, config: EdgeSwipeConfig) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwipingRef = useRef(false);

  useEffect(() => {
    if (!config.enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      // 화면 가장자리에서 시작하는지 확인
      const isEdgeSwipe = touch.clientX <= config.edgeWidth;
      
      if (isEdgeSwipe) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        isSwipingRef.current = true;
        
        // 햅틱 피드백
        triggerHapticFeedback('impactLight');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipingRef.current || !touchStartRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // 수평 스와이프인지 확인 (세로 스크롤과 구분)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const velocity = Math.abs(deltaX) / deltaTime * 1000;
      
      if (isHorizontalSwipe && (deltaX > config.threshold || velocity > config.velocity)) {
        onSwipeStart();
        isSwipingRef.current = false;
        touchStartRef.current = null;
        
        // 성공 햅틱 피드백
        triggerHapticFeedback('notificationSuccess');
      }
    };

    const handleTouchEnd = () => {
      isSwipingRef.current = false;
      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeStart, config]);
}

// 💡 Progressive Reveal Hook
function useProgressiveReveal(dragX: any, config: ProgressiveRevealConfig) {
  const opacity = useTransform(
    dragX,
    [-300, 0],
    [config.minOpacity, config.maxOpacity]
  );
  
  const scale = useTransform(
    dragX,
    [-300, 0],
    config.scaleRange
  );
  
  const backdropOpacity = useTransform(
    dragX,
    [-300, 0],
    [0, 0.6]
  );

  return {
    opacity: config.enabled ? opacity : 1,
    scale: config.enabled ? scale : 1,
    backdropOpacity: config.enabled ? backdropOpacity : 0.6,
  };
}

// 💡 Velocity-based Animation Duration Calculator
function calculateAnimationDuration(velocity: number, config: VelocityAnimationConfig): number {
  const absVelocity = Math.abs(velocity);
  
  if (absVelocity < config.slowVelocity) {
    return config.slowDuration;
  } else if (absVelocity > config.fastVelocity) {
    return config.fastDuration;
  } else {
    // 선형 보간
    const ratio = (absVelocity - config.slowVelocity) / (config.fastVelocity - config.slowVelocity);
    return config.slowDuration - (config.slowDuration - config.fastDuration) * ratio;
  }
}

// 💡 Multi-touch Gesture Detection
function useMultiTouchGesture() {
  const [touchCount, setTouchCount] = useState(0);
  const [gestureType, setGestureType] = useState<'none' | 'single' | 'multi'>('none');

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const count = e.touches.length;
      setTouchCount(count);
      setGestureType(count === 1 ? 'single' : count > 1 ? 'multi' : 'none');
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const count = e.touches.length;
      setTouchCount(count);
      
      if (count === 0) {
        setGestureType('none');
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { touchCount, gestureType };
}

// 💡 Enhanced Momentum-based Animation Hook
function useMomentumAnimation(dragX: any, config: typeof GESTURE_CONFIG.drawerIntegration.momentum) {
  const [momentum, setMomentum] = useState({ x: 0, velocity: 0 });
  
  const applyMomentum = useCallback((velocity: number, currentX: number) => {
    if (Math.abs(velocity) > config.threshold) {
      const targetX = currentX + (velocity * config.dampingFactor);
      const clampedTarget = Math.max(-320, Math.min(0, targetX));
      
      dragX.set(clampedTarget, {
        type: 'spring',
        damping: 30,
        stiffness: 300,
        velocity: Math.min(Math.abs(velocity), config.maxVelocity) * Math.sign(velocity)
      });
      
      setMomentum({ x: clampedTarget, velocity });
    }
  }, [dragX, config]);
  
  return { momentum, applyMomentum };
}

// 💡 Enhanced Resistance Animation Hook
function useResistanceAnimation(dragX: any, config: typeof GESTURE_CONFIG.drawerIntegration.resistance) {
  const applyResistance = useCallback((offset: number, resistance: number = config.factor) => {
    if (config.enabled && Math.abs(offset) > config.threshold) {
      const resistedOffset = offset * resistance;
      return resistedOffset;
    }
    return offset;
  }, [config]);
  
  const resetResistance = useCallback(() => {
    dragX.set(0, {
      type: 'spring',
      damping: 25,
      stiffness: 400,
      duration: 0.3
    });
  }, [dragX]);
  
  return { applyResistance, resetResistance };
}

// 💡 Enhanced Gesture Interruption Handler
function useGestureInterruption(
  dragX: any,
  config: typeof GESTURE_CONFIG.drawerIntegration.interruption
) {
  const [isInterrupted, setIsInterrupted] = useState(false);
  const lastTouchRef = useRef<number>(Date.now());
  
  const handleInterruption = useCallback((newGesture: boolean) => {
    const now = Date.now();
    const timeSinceLastTouch = now - lastTouchRef.current;
    
    if (config.enabled && timeSinceLastTouch < config.interruptionThreshold) {
      setIsInterrupted(true);
      
      if (config.smoothTransition) {
        // Smooth transition to new gesture
        dragX.set(dragX.get(), {
          type: 'spring',
          damping: 35,
          stiffness: 400,
          duration: 0.2
        });
      }
      
      // Reset interruption state
      setTimeout(() => setIsInterrupted(false), 100);
    }
    
    lastTouchRef.current = now;
  }, [dragX, config, isInterrupted]);
  
  return { isInterrupted, handleInterruption };
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
      lastElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
      
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
const SkipLink = memo(function SkipLink({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={(e) => {
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
  politeness = 'polite' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive' 
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

export function MobileNav({ 
  isOpen, 
  onClose, 
  onOpen,
  className, 
  ariaLabel = '모바일 메뉴',
  gestureConfig = {}
}: MobileNavProps) {
  const location = useLocation();
  const { isMobile } = useViewport();
  const [isClosing, setIsClosing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(0.4);
  
  // 💡 고급 제스처 지원을 위한 motion values
  const dragX = useMotionValue(0);
  
  // 💡 최종 제스처 설정 (prop으로 전달된 설정과 기본 설정 병합)
  const finalGestureConfig = useMemo(() => ({
    edgeSwipe: { ...GESTURE_CONFIG.edgeSwipe, ...gestureConfig.edgeSwipe },
    progressiveReveal: { ...GESTURE_CONFIG.progressiveReveal, ...gestureConfig.progressiveReveal },
    velocityAnimation: { ...GESTURE_CONFIG.velocityAnimation, ...gestureConfig.velocityAnimation },
    drawerIntegration: { ...GESTURE_CONFIG.drawerIntegration }
  }), [gestureConfig]);

  // 💡 Enhanced Hooks for Drawer Integration
  const { momentum, applyMomentum } = useMomentumAnimation(dragX, finalGestureConfig.drawerIntegration.momentum);
  const { applyResistance, resetResistance } = useResistanceAnimation(dragX, finalGestureConfig.drawerIntegration.resistance);
  const { isInterrupted, handleInterruption } = useGestureInterruption(dragX, finalGestureConfig.drawerIntegration.interruption);

  // 💡 Progressive Reveal 기능
  const progressiveReveal = useProgressiveReveal(dragX, finalGestureConfig.progressiveReveal);
  
  // 💡 Multi-touch 제스처 감지
  const { touchCount, gestureType } = useMultiTouchGesture();

  // Enhanced Focus Trap
  const focusTrapRef = useFocusTrap(isOpen);
  
  // Live Region 메시지 상태
  const [liveMessage, setLiveMessage] = useState('');
  
  // 기본 네비게이션 항목들 (bottom navigation과 동일)
  const mainNavItems: NavItem[] = [
    { 
      label: '대시보드', 
      href: '/dashboard', 
      icon: <LayoutDashboard className="w-6 h-6" />,
      ariaLabel: '대시보드 페이지로 이동'
    },
    { 
      label: '소개 네트워크', 
      href: '/network', 
      icon: <Network className="w-6 h-6" />,
      ariaLabel: '소개 네트워크 페이지로 이동'
    },
    { 
      label: '영업 파이프라인', 
      href: '/pipeline', 
      icon: <PieChart className="w-6 h-6" />,
      ariaLabel: '영업 파이프라인 페이지로 이동'
    },
    { 
      label: '고객 관리', 
      href: '/clients', 
      icon: <Users className="w-6 h-6" />,
      ariaLabel: '고객 관리 페이지로 이동'
    },
    { 
      label: '일정 관리', 
      href: '/calendar', 
      icon: <Calendar className="w-6 h-6" />,
      ariaLabel: '일정 관리 페이지로 이동'
    },
  ];

  // 추가 기능 메뉴들
  const additionalNavItems: NavItem[] = [
    { 
      label: '초대장 관리', 
      href: '/invitations', 
      icon: <Mail className="w-6 h-6" />,
      ariaLabel: '초대장 관리 페이지로 이동'
    },
    { 
      label: '알림', 
      href: '/notifications', 
      icon: <Bell className="w-6 h-6" />,
      ariaLabel: '알림 페이지로 이동'
    },
    { 
      label: '보고서', 
      href: '/reports', 
      icon: <FileText className="w-6 h-6" />,
      ariaLabel: '보고서 페이지로 이동'
    },
    { 
      label: '설정', 
      href: '/settings', 
      icon: <Settings className="w-6 h-6" />,
      ariaLabel: '설정 페이지로 이동'
    },
  ];

  // 💡 메모이제이션된 활성 라우트 확인 함수
  const isActiveRoute = useCallback((href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // 💡 Enhanced 드래그 핸들러 with Drawer Integration
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    // Gesture interruption handling
    handleInterruption(true);
    
    if (isInterrupted) return;
    
    // Apply resistance for over-drag
    const resistedOffset = applyResistance(info.offset.x);
    
    // Set drag position with resistance
    dragX.set(resistedOffset);
    
    // Enhanced haptic feedback based on position
    const position = Math.abs(resistedOffset);
    if (position > 160 && position < 170) {
      triggerHapticFeedback('impactLight');
    } else if (position > 240 && position < 250) {
      triggerHapticFeedback('impactMedium');
    }
  }, [dragX, applyResistance, handleInterruption, isInterrupted]);

  // 💡 Enhanced 드래그 종료 핸들러 with Momentum
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const shouldClose = info.offset.x < -120 || info.velocity.x < -800;
    
    if (shouldClose) {
      // Apply momentum if velocity is high enough
      if (Math.abs(info.velocity.x) > finalGestureConfig.drawerIntegration.momentum.threshold) {
        applyMomentum(info.velocity.x, info.offset.x);
      }
      
      // 속도 기반 애니메이션 지속시간 계산
      const duration = calculateAnimationDuration(info.velocity.x, finalGestureConfig.velocityAnimation);
      setAnimationDuration(duration);
      
      triggerHapticFeedback('impactMedium');
      setIsClosing(true);
      onClose();
    } else {
      // Reset with resistance animation
      resetResistance();
      triggerHapticFeedback('impactLight');
    }
  }, [onClose, applyMomentum, resetResistance, finalGestureConfig]);
  
  // 💡 고급 멀티터치 제스처 핸들러
  const handleDragStart = useCallback(() => {
    if (gestureType === 'multi') {
      // 멀티터치시 특별한 햅틱 패턴
      triggerHapticFeedback('notificationWarning');
      return false; // 멀티터치시 드래그 비활성화
    }
    return true;
  }, [gestureType]);

  // 💡 Enhanced close handler with accessibility feedback
  const handleClose = useCallback(() => {
    // 🎯 닫기 애니메이션 전에 dragX 초기화
    dragX.set(0);
    setIsClosing(true);
    
    onClose();
    setLiveMessage('메뉴가 닫혔습니다.');
    
    // 메뉴를 연 버튼에 포커스 반환
    setTimeout(() => {
      const menuButton = document.querySelector('[data-mobile-nav-button]') as HTMLElement;
      menuButton?.focus();
    }, 100);
  }, [onClose, dragX]);

  // Enhanced navigation handler with accessibility feedback
  const handleNavigation = useCallback((item: NavItem) => {
    triggerHapticFeedback('selection');
    setLiveMessage(`${item.label} 페이지로 이동합니다.`);
    handleClose();
  }, [handleClose]);

  // 💡 Edge Swipe 감지 및 메뉴 열기 핸들러
  const handleEdgeSwipeOpen = useCallback(() => {
    if (!isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  // 💡 Edge Swipe Detection Hook 적용
  useEdgeSwipeDetection(handleEdgeSwipeOpen, finalGestureConfig.edgeSwipe);

  // 💡 Enhanced 키보드 이벤트 핸들러
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
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // 포커스 설정 (접근성)
      setTimeout(() => {
        const firstFocusable = document.querySelector('[data-mobile-nav] a') as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  // 💡 컴포넌트 언마운트 시 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      // 🎯 즉시 dragX 리셋 (AnimatePresence 지연 때문에 바로 실행)
      dragX.set(0);
      setIsClosing(false);
    }
  }, [isOpen, dragX]);

  // 🎯 컴포넌트 마운트 시 dragX 강제 초기화 (두 번째 열기 문제 해결)
  useEffect(() => {
    if (isOpen) {
      dragX.set(0);
    }
  }, [isOpen, dragX]);

  return (
    <>
      {/* Skip Link */}
      <SkipLink targetId="mobile-nav-main">
        메인 네비게이션으로 건너뛰기
      </SkipLink>

      {/* Live Region for dynamic announcements */}
      <LiveRegion message={liveMessage} />

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }}
        exit={{ 
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
            // 🎯 열기: 부드러운 easing으로 일관성 유지
            type: "tween",
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
          }
        }}
        exit={{ 
          x: '-100%',
          opacity: 0,
          transition: {
            // 🎯 닫기: 동일한 easing과 유사한 duration으로 일관성 유지
            type: "tween",
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
          }
        }}
        drag="x"
        dragConstraints={{ left: -800, right: 0 }}
        dragElastic={0.05} // 🎯 Context7 권장: elastic 값 감소로 이상한 움직임 방지
        dragMomentum={false} // 🎯 관성 비활성화로 예측 가능한 동작
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        whileDrag={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        style={{ 
          x: isOpen ? dragX : undefined, // 🎯 닫힐 때는 dragX 비활성화
          opacity: progressiveReveal.opacity,
          scale: progressiveReveal.scale,
          // 🎯 iOS Safari 포커스 문제 해결
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        className={cn(
          'fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-r border-border z-50',
          'flex flex-col shadow-2xl',
          // 🎯 터치 스크롤 비활성화 (Context7 권장사항)  
          'mobile-sidebar-container no-focus-outline', // 전용 CSS 클래스 적용
          // Enhanced visual feedback for gesture states
          isInterrupted && 'ring-2 ring-primary/50',
          touchCount > 1 && 'ring-2 ring-warning/50',
          className
        )}
        data-mobile-nav
        role="navigation"
        aria-label={ariaLabel}
        aria-modal="true"
        id="mobile-nav-main"
        // 🎯 포커스 이벤트 완전 차단
        onFocus={e => e.target.blur()}
        tabIndex={-1}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              delay: isOpen ? 0.1 : 0,
              duration: 0.3
            }}
          >
            <Link
              to="/dashboard"
              onClick={() => {
                triggerHapticFeedback('selection');
                handleNavigation({ label: '대시보드', href: '/', icon: null, ariaLabel: '대시보드로 이동' });
              }}
              className="text-xl font-bold text-primary hover:text-primary/80 transition-colors rounded"
              aria-label="SureCRM 대시보드로 이동"
              // 🎯 iOS Safari 포커스 완전 차단
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
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <nav 
          className="flex-1 overflow-y-auto p-4"
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
                  when: "afterChildren"
                }
              },
              visible: {
                opacity: 1,
                transition: {
                  delayChildren: 0.1,
                  staggerChildren: 0.05,
                  when: "beforeChildren"
                }
              }
            }}
            className="space-y-2"
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
                duration: 0.3 
              }}
              className="h-px bg-border mx-4 my-4"
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

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ 
              delay: isOpen ? 0.3 : 0,
              duration: 0.3
            }}
            className="text-center"
          >
            <VersionDisplay />
            <p className="text-xs text-muted-foreground mt-1">
              © 2024 SureCRM. All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* Gesture Instruction (for accessibility) */}
        <div className="sr-only">
          <p>이 메뉴는 왼쪽으로 드래그하거나 Escape 키를 눌러 닫을 수 있습니다.</p>
          <p>Tab 키를 사용하여 메뉴 항목들을 탐색할 수 있습니다.</p>
        </div>
      </motion.div>
    </>
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
  id
}: MobileNavButtonProps) {
  const handleClick = useCallback(() => {
    triggerHapticFeedback('selection');
    onClick();
  }, [onClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

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
      aria-label={ariaLabel || (isOpen ? '메뉴 닫기' : '메뉴 열기')}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-main"
      aria-haspopup="true"
      data-mobile-nav-button
      type="button"
    >
      <motion.div
        className="relative"
        animate={isOpen ? "open" : "closed"}
        initial={false}
      >
        {/* 첫 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current rounded-sm"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 6 }
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        
        {/* 두 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current mt-1.5 rounded-sm"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 }
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* 세 번째 라인 */}
        <motion.span
          className="block h-0.5 w-5 bg-current mt-1.5 rounded-sm"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -6 }
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

export const BottomNav = memo(function BottomNav({ className }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const quickNavItems = useMemo(() => [
    { label: '홈', href: '/dashboard', icon: <Home className="h-5 w-5" />, ariaLabel: '홈 페이지로 이동' },
    { label: '네트워크', href: '/network', icon: <Network className="h-5 w-5" />, ariaLabel: '네트워크 페이지로 이동' },
    { label: '고객', href: '/clients', icon: <Users className="h-5 w-5" />, ariaLabel: '고객 관리 페이지로 이동' },
    { label: '알림', href: '/notifications', icon: <Bell className="h-5 w-5" />, ariaLabel: '알림 페이지로 이동' },
    { label: '더보기', href: '/menu', icon: <Menu className="h-5 w-5" />, ariaLabel: '더보기 메뉴 페이지로 이동' },
  ], []);

  const handleNavClick = useCallback((href: string, label: string) => {
    triggerHapticFeedback('selection');
    InsuranceAgentEvents.navigationClick(label, location.pathname);
    navigate(href);
  }, [navigate, location.pathname]);

  const isActiveRoute = useCallback((href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

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
              <span className={cn(
                'text-xs font-medium leading-none',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}); 