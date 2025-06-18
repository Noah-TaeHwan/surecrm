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
        // 고정 너비로 완전 균등 배치 - 네비게이션 영역 내 안전한 크기
        width: isMinimized ? '28px' : '48px',
        height: isMinimized ? '48px' : '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      onTouchStart={() => {
        safeVibrate(5);
      }}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center z-10"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
        whileTap={{ scale: 0.92 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        {/* 아이콘 - 완전 일관된 크기 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Icon 
            className={`transition-all duration-1000 ease-out ${
              isMinimized ? 'w-3 h-3 mb-0' : 'w-5 h-5 mb-1'
            } ${
              isActive 
                ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                : 'text-gray-400 group-hover:text-gray-300'
            }`}
          />
        </div>
        
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
        isMinimized ? 'px-24 pb-4' : 'px-8 pb-4'
      }`}
      style={{
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* iOS 26 리퀴드글래스 배경 효과 - 다층 백드롭 필터 */}
      
      {/* 레이어 1: 가장 멀리 퍼지는 대기 블러 (훨씬 더 위부터 시작) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '700%',
          transform: 'translateY(65%)',
          backdropFilter: 'blur(14px) saturate(105%) brightness(1.01)',
          background: 'radial-gradient(ellipse 200% 160% at 50% 100%, rgba(0,0,0,0.007) 0%, rgba(0,0,0,0.003) 45%, rgba(0,0,0,0.0015) 75%, transparent 98%)',
          maskImage: 'radial-gradient(ellipse 190% 150% at 50% 100%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.018) 70%, rgba(0,0,0,0.008) 83%, rgba(0,0,0,0.002) 92%, rgba(0,0,0,0.0005) 97%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 190% 150% at 50% 100%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.018) 70%, rgba(0,0,0,0.008) 83%, rgba(0,0,0,0.002) 92%, rgba(0,0,0,0.0005) 97%, transparent 100%)',
          filter: 'blur(0.08px)',
        }}
      />
      
      {/* 레이어 2: 중간 깊이 블러 (더욱 넓은 범위) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '520%',
          transform: 'translateY(48%)',
          backdropFilter: 'blur(7px) saturate(110%) brightness(1.005)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.004) 65%, rgba(0,0,0,0.001) 85%, transparent 98%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.22) 5%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.028) 75%, rgba(0,0,0,0.012) 85%, rgba(0,0,0,0.004) 92%, rgba(0,0,0,0.001) 96%, rgba(0,0,0,0.0002) 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.22) 5%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.028) 75%, rgba(0,0,0,0.012) 85%, rgba(0,0,0,0.004) 92%, rgba(0,0,0,0.001) 96%, rgba(0,0,0,0.0002) 98%, transparent 100%)',
        }}
      />
      
      {/* 레이어 3: 근접 블러 (바텀 네비게이션 위아래로 더 확장) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '340%',
          transform: 'translateY(28%)',
          backdropFilter: 'blur(4.5px) saturate(120%) brightness(1.0015)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.015) 50%, rgba(0,0,0,0.006) 75%, rgba(0,0,0,0.0015) 92%, transparent 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.24) 40%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.04) 80%, rgba(0,0,0,0.018) 87%, rgba(0,0,0,0.007) 92%, rgba(0,0,0,0.003) 95%, rgba(0,0,0,0.001) 97%, rgba(0,0,0,0.0002) 99%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.24) 40%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.04) 80%, rgba(0,0,0,0.018) 87%, rgba(0,0,0,0.007) 92%, rgba(0,0,0,0.003) 95%, rgba(0,0,0,0.001) 97%, rgba(0,0,0,0.0002) 99%, transparent 100%)',
        }}
      />
      
      {/* 레이어 4: 바텀 네비게이션 직접 경계 블러 (매우 약한 시작) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '190%',
          transform: 'translateY(2%)',
          backdropFilter: 'blur(2px) saturate(115%) brightness(1.0006)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.018) 0%, rgba(0,0,0,0.008) 45%, rgba(0,0,0,0.003) 70%, rgba(0,0,0,0.0008) 90%, transparent 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0.09) 60%, rgba(0,0,0,0.05) 72%, rgba(0,0,0,0.025) 80%, rgba(0,0,0,0.012) 86%, rgba(0,0,0,0.005) 91%, rgba(0,0,0,0.002) 94%, rgba(0,0,0,0.0008) 96%, rgba(0,0,0,0.0002) 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0.09) 60%, rgba(0,0,0,0.05) 72%, rgba(0,0,0,0.025) 80%, rgba(0,0,0,0.012) 86%, rgba(0,0,0,0.005) 91%, rgba(0,0,0,0.002) 94%, rgba(0,0,0,0.0008) 96%, rgba(0,0,0,0.0002) 98%, transparent 100%)',
        }}
      />
      
      {/* 레이어 5: 최상단 미세 블러 (경계를 더욱 모호하게) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '170%',
          transform: 'translateY(-12%)',
          backdropFilter: 'blur(0.8px) saturate(108%) brightness(1.0001)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.004) 50%, rgba(0,0,0,0.0015) 80%, rgba(0,0,0,0.0003) 95%, transparent 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.09) 50%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.025) 77%, rgba(0,0,0,0.012) 85%, rgba(0,0,0,0.005) 90%, rgba(0,0,0,0.002) 94%, rgba(0,0,0,0.0008) 96%, rgba(0,0,0,0.0003) 98%, rgba(0,0,0,0.00008) 99%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.09) 50%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.025) 77%, rgba(0,0,0,0.012) 85%, rgba(0,0,0,0.005) 90%, rgba(0,0,0,0.002) 94%, rgba(0,0,0,0.0008) 96%, rgba(0,0,0,0.0003) 98%, rgba(0,0,0,0.00008) 99%, transparent 100%)',
        }}
      />
      
      {/* 메인 리퀴드글래스 컨테이너 */}
      <div 
        className="relative rounded-[28px] overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.5),
            0 16px 32px rgba(0, 0, 0, 0.25),
            0 8px 16px rgba(0, 0, 0, 0.15),
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          backdropFilter: 'blur(20px) saturate(160%) brightness(1.08)',
          transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* 유기적인 상단 하이라이트 그라데이션 */}
        <div 
          className="absolute top-0 left-0 right-0 rounded-t-[28px] overflow-hidden"
          style={{
            height: '50%',
            background: `
              radial-gradient(ellipse 300% 120% at 50% -20%, 
                rgba(255, 255, 255, 0.20) 0%, 
                rgba(255, 255, 255, 0.12) 20%, 
                rgba(255, 255, 255, 0.06) 40%, 
                rgba(255, 255, 255, 0.025) 60%, 
                transparent 80%
              ),
              linear-gradient(to bottom, 
                rgba(255, 255, 255, 0.08) 0%, 
                rgba(255, 255, 255, 0.04) 30%, 
                rgba(255, 255, 255, 0.015) 60%, 
                transparent 100%
              )
            `,
            opacity: 0.6,
          }}
        />
        
        {/* 리퀴드 동적 글로우 라인 */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 15%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.1) 85%, transparent 100%)',
            filter: 'blur(0.5px)',
            opacity: 0.8,
          }}
          animate={{
            scaleX: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 유기적인 측면 글로우 */}
        <div 
          className="absolute top-4 bottom-4 left-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 80%, transparent 100%)',
            filter: 'blur(1px)',
            opacity: 0.6,
          }}
        />
        <div 
          className="absolute top-4 bottom-4 right-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 80%, transparent 100%)',
            filter: 'blur(1px)',
            opacity: 0.6,
          }}
        />
        
        {/* 플로팅 그림자 - 더 유기적이고 자연스럽게 */}
        <motion.div 
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
          style={{
            width: '85%',
            height: '12px',
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={{
            scaleX: [1, 1.02, 1],
            opacity: [0.4, 0.5, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 네비게이션 버튼들 - 5개 버튼 완전 균등 배치 */}
        <div 
          className={`relative pb-safe ${
            isMinimized ? 'min-h-[48px]' : 'min-h-[64px]'
          }`}
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            width: '100%',
            padding: '0 4px',
            margin: '0',
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