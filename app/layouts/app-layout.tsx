import { Outlet, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import {
  FlexibleSidebar,
  MobileSidebarContent,
} from '~/common/components/navigation/flexible-sidebar';
import { Header } from '~/common/components/navigation/header';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '~/common/components/ui/sheet';
import { MobileOnly } from '~/common/components/ui/responsive-layout';
import { requireAuth } from '~/lib/auth/middleware';

// 임시 타입 정의 (React Router v7 타입 생성 전까지)
interface LoaderArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    currentUser: {
      id: string;
      email: string;
      name?: string;
      profileImage?: string;
    };
  };
}

interface MetaArgs {
  data: any;
}

/**
 * 앱 전체 공통 레이아웃 loader
 * 인증된 사용자 정보를 제공
 */
export async function loader({ request }: LoaderArgs) {
  try {
    const user = await requireAuth(request);

    // API를 통해 실제 사용자 프로필 정보 가져오기
    try {
      const apiUrl = new URL('/api/auth/me', request.url);
      const response = await fetch(apiUrl.toString(), {
        headers: {
          Cookie: request.headers.get('Cookie') || '',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          currentUser: {
            id: userData.id,
            email: userData.email,
            name:
              userData.fullName || userData.name || user.email.split('@')[0],
            profileImage: (user as any).user_metadata?.avatar_url,
          },
        };
      }
    } catch (apiError) {
      console.warn('API 호출 실패, 기본 정보 사용:', apiError);
    }

    // API 실패 시 기본 정보 사용
    return {
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0],
        profileImage: (user as any).user_metadata?.avatar_url,
      },
    };
  } catch (error) {
    // 인증 실패 시 로그인 페이지로 리다이렉트
    throw new Response(null, {
      status: 302,
      headers: {
        Location: '/auth/login',
      },
    });
  }
}

/**
 * 앱 전체 공통 레이아웃 컴포넌트
 * - FlexibleSidebar 시스템 통합
 * - 반응형 네비게이션 제공
 * - 모바일 하단 탭 + 데스크톱 사이드바
 */
export default function AppLayout({ loaderData }: ComponentProps) {
  const { currentUser } = loaderData;
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL 기반 페이지 제목 추론 (Hydration 안전)
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      '/dashboard': '대시보드',
      '/clients': '고객 관리',
      '/pipeline': '영업 파이프라인',
      '/calendar': '일정 관리',
      '/reports': '보고서',
      '/team': '팀 관리',
      '/network': '소개 네트워크',
      '/influencers': '핵심 소개자',
      '/notifications': '알림',
      '/settings': '설정',
      '/billing/subscribe': '구독 관리',
      '/invitations': '초대장 관리',
    };

    // 하위 경로도 처리 (예: /clients/123 -> '고객 관리')
    let title = titleMap[path];
    if (!title) {
      for (const [route, routeTitle] of Object.entries(titleMap)) {
        if (path.startsWith(route + '/')) {
          title = routeTitle;
          break;
        }
      }
    }

    setPageTitle(title || '');
  }, [location.pathname]);

  // 모바일 메뉴 닫기 핸들러
  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // 모바일 메뉴 토글 핸들러
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 키보드 이벤트 처리 (Escape로 모바일 메뉴 닫기)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen bg-background">
      {/* FlexibleSidebar 시스템 */}
      <FlexibleSidebar />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <Header
          title={pageTitle}
          currentUser={currentUser}
          showMenuButton={true}
          onMenuButtonClick={handleMobileMenuToggle}
        />

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-auto bg-background p-3 md:p-4 lg:p-6 pb-20 md:pb-3">
          <Outlet />
        </main>
      </div>

      {/* 모바일 사이드바 Sheet */}
      <MobileOnly>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0 bg-background">
            <SheetHeader className="sr-only">
              <SheetTitle>모바일 네비게이션 메뉴</SheetTitle>
              <SheetDescription>
                사이드바 메뉴를 통해 다양한 페이지로 이동할 수 있습니다.
              </SheetDescription>
            </SheetHeader>
            <MobileSidebarContent onClose={handleMobileMenuClose} />
          </SheetContent>
        </Sheet>
      </MobileOnly>
    </div>
  );
}

/**
 * 메타 정보 설정
 */
export function meta({ data }: MetaArgs) {
  return [
    { title: 'SureCRM - 보험설계사를 위한 통합 CRM' },
    {
      name: 'description',
      content:
        '보험설계사를 위한 고객 관리, 영업 파이프라인, 일정 관리 통합 솔루션',
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ];
}
