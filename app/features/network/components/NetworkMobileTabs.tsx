import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Info, Search, Grid } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 햅틱 피드백 함수
function safeVibrate(duration: number = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // iOS나 다른 환경에서 에러 발생 시 무시
    }
  }
}

export type NetworkMobileTabType = 'graph' | 'filter' | 'search' | 'details';

interface NetworkMobileTabsProps {
  activeTab: NetworkMobileTabType;
  onTabChange: (tab: NetworkMobileTabType) => void;
  hasSelectedNode: boolean;
  searchResultsCount?: number;
}

interface TabItem {
  id: NetworkMobileTabType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

export function NetworkMobileTabs({
  activeTab,
  onTabChange,
  hasSelectedNode,
  searchResultsCount = 0,
}: NetworkMobileTabsProps) {
  // 🌍 다국어 번역 훅
  const { t } = useHydrationSafeTranslation('network');

  const [isVisible, setIsVisible] = useState(true);

  // 스크롤 시 탭바 숨김/표시 로직
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = currentScrollY - lastScrollY;

          // 스크롤이 50px 이상 변화했을 때만 반응
          if (Math.abs(scrollDifference) > 50) {
            if (scrollDifference > 0 && currentScrollY > 100) {
              setIsVisible(false); // 아래로 스크롤 → 숨김
            } else if (scrollDifference < 0) {
              setIsVisible(true); // 위로 스크롤 → 표시
            }
            lastScrollY = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs: TabItem[] = [
    {
      id: 'graph',
      icon: Grid,
      label: t('mobileTabs.graph', '네트워크'),
    },
    {
      id: 'filter',
      icon: Filter,
      label: t('mobileTabs.filter', '필터'),
    },
    {
      id: 'search',
      icon: Search,
      label: t('mobileTabs.search', '검색'),
      badge: searchResultsCount > 0 ? searchResultsCount : undefined,
    },
    {
      id: 'details',
      icon: Info,
      label: t('mobileTabs.details', '상세정보'),
    },
  ];

  const handleTabClick = (tabId: NetworkMobileTabType) => {
    safeVibrate(12); // 햅틱 피드백
    onTabChange(tabId);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            mass: 0.8,
          }}
          className="fixed left-0 right-0 z-40 lg:hidden bottom-nav-offset"
          style={{
            bottom: 'var(--total-bottom-padding)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* 백드롭 블러 */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: '150%',
              backdropFilter: 'blur(20px) saturate(150%)',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 70%, transparent)',
              maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to top, black 50%, transparent 100%)',
            }}
          />

          {/* 메인 탭바 컨테이너 */}
          <div className="relative mx-4 mb-4">
            <div
              className="relative bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl"
              style={{
                boxShadow:
                  '0 16px 32px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* 활성 탭 배경 */}
              <motion.div
                className="absolute top-1 bottom-1 bg-white/15 backdrop-blur-sm rounded-xl"
                initial={false}
                animate={{
                  left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`,
                  width: `${100 / tabs.length}%`,
                }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 400,
                  mass: 0.6,
                }}
                style={{
                  margin: '2px',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              />

              {/* 탭 버튼들 */}
              <div className="relative flex items-center">
                {tabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  const isDisabled = tab.id === 'details' && !hasSelectedNode;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isDisabled && handleTabClick(tab.id)}
                      disabled={isDisabled}
                      className={`
                        relative flex-1 flex flex-col items-center justify-center py-3 px-2
                        transition-all duration-300 ease-out
                        ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'active:scale-95 hover:scale-105'
                        }
                      `}
                      style={{
                        minHeight: '56px',
                      }}
                    >
                      {/* 아이콘 */}
                      <div className="relative flex items-center justify-center mb-1">
                        <tab.icon
                          className={`
                            w-5 h-5 transition-all duration-300
                            ${
                              isActive
                                ? 'text-white scale-110'
                                : isDisabled
                                  ? 'text-white/30'
                                  : 'text-white/70'
                            }
                          `}
                        />

                        {/* 배지 */}
                        {tab.badge && tab.badge > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1"
                          >
                            <span className="text-white text-xs font-medium leading-none">
                              {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      {/* 라벨 */}
                      <span
                        className={`
                          text-xs font-medium leading-none transition-all duration-300
                          ${
                            isActive
                              ? 'text-white'
                              : isDisabled
                                ? 'text-white/30'
                                : 'text-white/60'
                          }
                        `}
                      >
                        {tab.label}
                      </span>

                      {/* 비활성화 오버레이 */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-black/20 rounded-xl" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
