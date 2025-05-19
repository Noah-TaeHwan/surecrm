import { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { Button } from './button';
import { Link } from 'react-router';
import { ArrowUp } from 'lucide-react';

interface FloatingNavbarProps {
  items: {
    label: string;
    href: string;
  }[];
  showScrollTop?: boolean;
}

export function FloatingNavbar({
  items,
  showScrollTop = true,
}: FloatingNavbarProps) {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // 300px 이상 스크롤되면 플로팅 내비게이션 표시
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      // 현재 활성 섹션 확인
      const sections = items
        .map((item) => {
          const element = document.getElementById(item.href.substring(1));
          if (element) {
            const rect = element.getBoundingClientRect();
            return {
              id: item.href.substring(1),
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
            };
          }
          return null;
        })
        .filter(
          (
            section
          ): section is {
            id: string;
            top: number;
            bottom: number;
            height: number;
          } => section !== null
        );

      if (sections.length > 0) {
        // 화면 끝부분에 도달했는지 확인
        const isAtBottom =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100;

        if (isAtBottom) {
          // 맨 아래에 도달했을 때 마지막 섹션을 활성화
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            setActiveSection(lastSection.id);
          }
        } else {
          // 일반적인 경우: 현재 화면에 보이는 섹션 중 가장 위에 있는 섹션 찾기
          const visibleSections = sections.filter(
            (section) => section && section.top < 200 && section.bottom > 0
          );

          if (visibleSections.length > 0) {
            setActiveSection(visibleSections[0].id);
          } else {
            // 화면에 보이는 섹션이 없으면 가장 가까운 섹션 선택
            const closestSection = sections.reduce((prev, current) => {
              if (!prev) return current;
              if (!current) return prev;
              return Math.abs(current.top) < Math.abs(prev.top)
                ? current
                : prev;
            });

            if (closestSection) {
              setActiveSection(closestSection.id);
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 초기 로드 시에도 실행
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-background/80 backdrop-blur-lg rounded-full border border-border shadow-lg">
      <div className="flex items-center px-2 h-12">
        <ul className="flex space-x-1">
          {items.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-full px-3 text-sm font-medium',
                  activeSection === item.href.substring(1) &&
                    'bg-primary/10 text-primary'
                )}
                asChild
              >
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(
                      item.href.substring(1)
                    );
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {item.label}
                </a>
              </Button>
            </li>
          ))}
          {showScrollTop && (
            <li>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full ml-2 h-8 w-8 bg-primary/10 hover:bg-primary/20"
                onClick={scrollToTop}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">상단으로 이동</span>
              </Button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
