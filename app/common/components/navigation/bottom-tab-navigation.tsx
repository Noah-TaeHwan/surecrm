import { useLocation, Link } from 'react-router';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Network,
  PieChart,
  Users,
  Calendar,
} from 'lucide-react';

interface BottomTabNavigationProps {
  isMenuOpen: boolean;
}

const navigationItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: '대시보드',
  },
  {
    href: '/network',
    icon: Network,
    label: '네트워크',
  },
  {
    href: '/pipeline',
    icon: PieChart,
    label: '영업',
  },
  {
    href: '/clients',
    icon: Users,
    label: '고객',
  },
  {
    href: '/calendar',
    icon: Calendar,
    label: '일정',
  },
];

// 🎯 모바일 터치 피드백 - 진동 API 완전 비활성화 (iOS 호환성)
function safeVibrate(duration: number = 5) {
  // iOS Safari와 Chrome 보안 정책으로 인한 에러 방지를 위해 진동 기능 비활성화
  // 대신 시각적 피드백에만 의존
  return;
}

// 액티브 인덱스를 찾는 함수 - 주요 메뉴 외에는 -1 반환
function getActiveIndex(pathname: string): number {
  const activeItem = navigationItems.findIndex(item => {
    if (item.href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(item.href);
  });
  // 주요 메뉴에 해당하지 않으면 -1 반환 (하이라이트 없음)
  return activeItem >= 0 ? activeItem : -1;
}

// 스크롤 방향과 네비게이션 상태를 관리하는 커스텀 훅
function useScrollDirection() {
  const [isMinimized, setIsMinimized] = useState(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50; // 50px 이상 스크롤 시 반응

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      
      const currentScrollY = target.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // 스크롤 임계값을 넘었을 때만 상태 변경
      if (Math.abs(scrollDifference) > scrollThreshold) {
        if (scrollDifference > 0 && currentScrollY > 100) {
          // 아래로 스크롤: 최소화
          setIsMinimized(true);
        } else if (scrollDifference < 0) {
          // 위로 스크롤: 확장
          setIsMinimized(false);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    // 메인 콘텐츠 영역을 찾아서 스크롤 리스너 등록
    const mainElement = document.querySelector('main[class*="overflow-y-auto"]');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainElement.removeEventListener('scroll', handleScroll);
    } else {
      // 메인 요소를 찾지 못한 경우 window 스크롤을 대체로 사용
      const handleWindowScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollY.current;

        if (Math.abs(scrollDifference) > scrollThreshold) {
          if (scrollDifference > 0 && currentScrollY > 100) {
            setIsMinimized(true);
          } else if (scrollDifference < 0) {
            setIsMinimized(false);
          }
          lastScrollY.current = currentScrollY;
        }
      };

      window.addEventListener('scroll', handleWindowScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleWindowScroll);
    }
  }, []);

  return isMinimized;
}

function LiquidGlassButton({
  href,
  icon: Icon,
  label,
  isActive,
  isMinimized,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isMinimized: boolean;
}) {
  return (
    <Link
      to={href}
      className={`relative flex flex-col items-center justify-center transition-all duration-700 ease-in-out w-16 px-1 py-2 group ${
        isMinimized ? 'min-h-[48px]' : 'min-h-[64px]'
      }`}
      onTouchStart={() => {
        // 🎯 안전한 햅틱 피드백 - 사용자 상호작용 후에만 실행
        safeVibrate(5);
      }}
    >
      {/* 리퀴드글래스 액티브 백그라운드 - 플로팅 스타일 */}
      {isActive && (
        <motion.div
          className={`absolute liquid-glass-button ${
            isMinimized 
              ? 'w-8 h-8 rounded-full' 
              : 'left-0 right-0 top-1.5 bottom-1.5 rounded-2xl'
          }`}
          style={{
            ...(isMinimized && {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }),
            boxShadow: isMinimized 
              ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 6px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
          layoutId="liquidGlassIndicator"
          initial={false}
          animate={{
            scale: [0.9, 1.1, 1],
            opacity: [0.7, 1, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            mass: 0.5,
            duration: 0.7,
            layout: {
              type: "spring",
              stiffness: 250,
              damping: 20,
              mass: 0.4,
              duration: 0.7,
            },
            scale: {
              duration: 0.7,
              ease: [0.23, 1, 0.32, 1],
            },
            opacity: {
              duration: 0.4,
            },
          }}
        >
          {/* 리퀴드 하이라이트 효과 */}
          <motion.div 
            className={`absolute top-0 left-0 right-0 h-1/2 opacity-40 liquid-glass-highlight ${
              isMinimized ? 'rounded-t-full' : 'rounded-t-2xl'
            }`}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          {/* 물방울 중심 펄스 효과 */}
          <motion.div
            className={`absolute inset-0 ${
              isMinimized ? 'rounded-full' : 'rounded-2xl'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.15) 60%, transparent 100%)',
            }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          {/* 외곽 리플 효과 */}
          <motion.div
            className={`absolute ${
              isMinimized 
                ? '-inset-1 rounded-full' 
                : '-inset-0.5 rounded-3xl'
            }`}
            style={{
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="relative flex flex-col items-center justify-center z-10"
        whileTap={{ scale: 0.92 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <Icon 
          className={`transition-all duration-700 ease-in-out ${
            isMinimized ? 'h-4 w-4 mb-0' : 'h-5 w-5 mb-1'
          } ${
            isActive 
              ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          }`} 
        />
        <span 
          className={`text-[10px] font-medium transition-all duration-700 ease-in-out text-center leading-tight ${
            isMinimized ? 'opacity-0 scale-0 h-0' : 'opacity-100 scale-100'
          } ${
            isActive 
              ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          }`}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

export function BottomTabNavigation({ isMenuOpen }: BottomTabNavigationProps) {
  const location = useLocation();
  const activeIndex = getActiveIndex(location.pathname);
  const isMinimized = useScrollDirection();

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 ${
        isMenuOpen ? 'z-30' : 'z-40'
      } lg:hidden transition-all duration-700 ease-in-out ${
        isMinimized ? 'px-20 pb-4' : 'px-8 pb-4'
      }`}
    >
      {/* 향상된 백드롭 블러 - 자연스러운 페이드 효과 */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '180%',
          backdropFilter: 'blur(40px) saturate(180%)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 80%, transparent)',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
        }}
      />
      
      {/* 리퀴드글래스 메인 컨테이너 - 플로팅 스타일 */}
      <div 
        className="relative liquid-glass-backdrop rounded-3xl shadow-2xl shadow-black/40"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* 상단 글로우 라인 - 향상된 플로팅 효과 */}
        <div 
          className="absolute top-0 left-4 right-4 h-px opacity-60 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            filter: 'blur(0.5px)',
          }}
        />
        
        {/* 상단 하이라이트 - 부드러운 그라데이션 */}
        <div 
          className="absolute top-0 left-0 right-0 h-10 opacity-30 rounded-t-3xl"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent)',
          }}
        />
        
        {/* 향상된 플로팅 그림자 효과 */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4/5 h-3 opacity-40"
          style={{
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5), transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
        
        {/* 네비게이션 버튼들 */}
        <div className={`relative flex items-center justify-center gap-2 px-2 transition-all duration-700 ease-in-out pb-safe ${
          isMinimized ? 'min-h-[48px] px-4' : 'py-0 min-h-[64px]'
        }`}>
          {navigationItems.map((item, index) => {
            const isActive = activeIndex !== -1 && index === activeIndex;
            
            return (
              <LiquidGlassButton
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                isMinimized={isMinimized}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
} 