import { Link, useLocation } from "react-router";
import { Calendar, ChartPie, LayoutDashboard, Network, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface BottomTabNavigationProps {
  isMenuOpen: boolean;
}

const navigationItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/network", icon: Network, label: "네트워크" },
  { href: "/pipeline", icon: ChartPie, label: "영업" },
  { href: "/clients", icon: Users, label: "고객" },  
  { href: "/calendar", icon: Calendar, label: "일정" },
];

// 안전한 햅틱 피드백
function safeVibrate(duration: number = 5) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // iOS나 다른 환경에서 에러 발생 시 무시
    }
  }
}

// 스크롤 방향 감지 훅
function useScrollDirection() {
  const [isMinimized, setIsMinimized] = useState(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      
      const currentScrollY = target.scrollTop;
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

    const mainElement = document.querySelector('main[class*="overflow-y-auto"]');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return isMinimized;
}

function getActiveIndex(pathname: string): number {
  const index = navigationItems.findIndex(item => pathname === item.href);
  return index >= 0 ? index : -1;
}

function LiquidGlassButton({
  href,
  icon: Icon,
  label,
  isActive,
  isMinimized,
  onRef,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isMinimized: boolean;
  onRef?: (el: HTMLAnchorElement | null) => void;
}) {
  return (
    <Link
      ref={onRef}
      to={href}
      className="relative flex flex-col items-center justify-center group"
      style={{
        // 완전히 동일한 크기 강제 - CSS로 고정
        width: isMinimized ? '48px' : '64px',
        height: isMinimized ? '48px' : '64px',
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      onTouchStart={() => {
        safeVibrate(5);
      }}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center z-10"
        whileTap={{ scale: 0.92 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        {/* 아이콘 - 완전 일관된 크기 */}
        <Icon 
          className={`transition-all duration-1000 ease-out ${
            isMinimized ? 'w-4 h-4 mb-0' : 'w-5 h-5 mb-1'
          } ${
            isActive 
              ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          }`} 
        />
        
        {/* 라벨 - 부드러운 나타남/사라짐 */}
        <span 
          className={`text-[10px] font-medium text-center leading-tight whitespace-nowrap overflow-hidden transition-all duration-1000 ease-in-out ${
            isActive 
              ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          } ${
            isMinimized ? 'opacity-0 h-0' : 'opacity-100 h-auto'
          }`}
          style={{
            maxWidth: '60px',
          }}
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

  // 실제 DOM 요소들을 참조하여 정확한 위치 측정
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [bubblePosition, setBubblePosition] = useState({ left: 0, width: 0 });

  // 활성 버튼 위치 실시간 계산
  useEffect(() => {
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      const activeButton = buttonRefs.current[activeIndex];
      if (activeButton) {
        const rect = activeButton.getBoundingClientRect();
        const containerRect = activeButton.parentElement?.getBoundingClientRect();
        
        if (containerRect) {
          setBubblePosition({
            left: rect.left - containerRect.left + rect.width / 2,
            width: isMinimized ? 32 : 40, // 물방울 크기
          });
        }
      }
    }
  }, [activeIndex, isMinimized]);

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 ${
        isMenuOpen ? 'z-30' : 'z-40'
      } lg:hidden ${
        isMinimized ? 'px-20 pb-4' : 'px-8 pb-4'
      }`}
      style={{
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* 향상된 백드롭 블러 */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: isMinimized ? '180%' : '120%',
          backdropFilter: isMinimized ? 'blur(60px) saturate(200%)' : 'blur(25px) saturate(150%)',
          background: isMinimized 
            ? 'linear-gradient(to top, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 65%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.015) 85%, rgba(0,0,0,0.005) 92%, transparent)'
            : 'linear-gradient(to top, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.025) 72%, rgba(0,0,0,0.012) 82%, rgba(0,0,0,0.006) 88%, rgba(0,0,0,0.003) 94%, transparent)',
          maskImage: isMinimized 
            ? 'linear-gradient(to top, black 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0.1) 92%, transparent 100%)'
            : 'linear-gradient(to top, black 60%, rgba(0,0,0,0.6) 72%, rgba(0,0,0,0.3) 82%, rgba(0,0,0,0.15) 88%, rgba(0,0,0,0.08) 94%, rgba(0,0,0,0.03) 97%, transparent 100%)',
          WebkitMaskImage: isMinimized 
            ? 'linear-gradient(to top, black 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0.1) 92%, transparent 100%)'
            : 'linear-gradient(to top, black 60%, rgba(0,0,0,0.6) 72%, rgba(0,0,0,0.3) 82%, rgba(0,0,0,0.15) 88%, rgba(0,0,0,0.08) 94%, rgba(0,0,0,0.03) 97%, transparent 100%)',
          WebkitBackdropFilter: isMinimized ? 'blur(60px) saturate(200%)' : 'blur(25px) saturate(150%)', // iOS Safari 지원
          transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />
      
      {/* 리퀴드글래스 메인 컨테이너 */}
      <div 
        className="relative liquid-glass-backdrop rounded-3xl shadow-2xl shadow-black/40"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: isMinimized ? 'blur(40px) saturate(180%)' : 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: isMinimized ? 'blur(40px) saturate(180%)' : 'blur(20px) saturate(150%)', // iOS Safari 지원
          transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* 상단 글로우 라인 */}
        <div 
          className="absolute top-0 left-4 right-4 h-px opacity-60 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            filter: 'blur(0.5px)',
          }}
        />
        
        {/* 상단 하이라이트 */}
        <div 
          className="absolute top-0 left-0 right-0 h-10 opacity-30 rounded-t-3xl"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent)',
          }}
        />
        
        {/* 플로팅 그림자 */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4/5 h-3 opacity-40"
          style={{
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5), transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
        
        {/* 네비게이션 버튼들 - 고정 크기로 완전 균등 배치 */}
        <div 
          className={`relative pb-safe ${
            isMinimized ? 'min-h-[48px] px-4' : 'min-h-[64px] px-2'
          }`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* 버튼들 */}
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
                onRef={(el) => {
                  buttonRefs.current[index] = el;
                }}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}