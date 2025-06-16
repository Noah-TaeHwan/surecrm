import { useLocation, Link } from 'react-router';
import { motion } from 'framer-motion';
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

// 액티브 인덱스를 찾는 함수
function getActiveIndex(pathname: string): number {
  const activeItem = navigationItems.findIndex(item => {
    if (item.href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(item.href);
  });
  return activeItem >= 0 ? activeItem : 0;
}

function LiquidGlassButton({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={href}
      className="relative flex flex-col items-center justify-center min-h-[64px] w-16 px-1 py-2 group"
      onTouchStart={() => {
        // 햅틱 피드백 - 안전하게 처리
        try {
          if ('vibrate' in navigator) {
            // 사용자 제스처 컨텍스트에서만 작동하도록 지연 실행
            setTimeout(() => {
              try {
                navigator.vibrate(5);
              } catch {
                // 진동 실패 시 무시
              }
            }, 0);
          }
        } catch {
          // 진동 API 실패 시 무시
        }
      }}
    >
      {/* 리퀴드글래스 액티브 백그라운드 - 플로팅 스타일 */}
      {isActive && (
        <motion.div
          className="absolute top-2 bottom-2 left-0.5 right-0.5 rounded-2xl liquid-glass-button"
          layoutId="liquidGlassIndicator"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
            duration: 0.4,
          }}
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* 리퀴드 하이라이트 효과 */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl opacity-50 liquid-glass-highlight"
          />
          {/* 바텀 글로우 제거 - 보더 바텀 효과 없애기 */}
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
          className={`h-5 w-5 mb-1 transition-all duration-300 ${
            isActive 
              ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          }`} 
        />
        <span 
          className={`text-[10px] font-medium transition-all duration-300 text-center leading-tight ${
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

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 ${
        isMenuOpen ? 'z-30' : 'z-40'
      } lg:hidden px-4 pb-4`}
    >
      {/* 확장된 백드롭 영역 - 주변 요소까지 고려한 블러 처리 */}
      <div 
        className="absolute inset-x-4 bottom-4 top-0 pointer-events-none rounded-3xl"
        style={{
          height: '200%',
          backdropFilter: 'blur(40px) saturate(180%)',
          maskImage: 'linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)',
        }}
      />
      
      {/* 리퀴드글래스 메인 컨테이너 - 플로팅 스타일 */}
      <div 
        className="relative liquid-glass-backdrop rounded-3xl shadow-2xl shadow-black/40"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* 상단 글로우 라인 - 플로팅 스타일 */}
        <div 
          className="absolute top-0 left-4 right-4 h-px opacity-60 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            filter: 'blur(0.5px)',
          }}
        />
        
        {/* 상단 하이라이트 - 플로팅 스타일 */}
        <div 
          className="absolute top-0 left-0 right-0 h-8 opacity-25 rounded-t-3xl"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
          }}
        />
        
        {/* 플로팅 효과를 위한 추가 그림자 */}
        <div 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-2 opacity-30"
          style={{
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.4), transparent)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* 네비게이션 버튼들 */}
        <div className="relative flex items-center justify-center gap-2 px-4 py-0 min-h-[64px] pb-safe">
          {navigationItems.map((item, index) => {
            const isActive = index === activeIndex;
            
            return (
              <LiquidGlassButton
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
} 