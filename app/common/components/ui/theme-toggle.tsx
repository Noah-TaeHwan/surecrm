import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../../lib/utils';

export interface ThemeToggleProps {
  /**
   * 컴팩트 모드 (아이콘만 표시)
   */
  compact?: boolean;
  /**
   * 크기 설정
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * 변형 스타일
   */
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  /**
   * 로그인된 사용자 (서버 저장 시)
   */
  isAuthenticated?: boolean;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 🌙 테마 토글 컴포넌트
 * - 로컬스토리지 + 서버 동기화
 * - 즉시 반영 (FOUC 없음)
 * - 다크모드 기본값
 */
export function ThemeToggle({
  compact = false,
  size = 'default',
  variant = 'ghost',
  isAuthenticated = false,
  className,
}: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true); // 기본값: 다크모드
  const [isLoading, setIsLoading] = useState(false);

  // 클라이언트에서 테마 상태 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('surecrm-theme');
      const currentIsDark = savedTheme ? savedTheme === 'dark' : true;
      setIsDark(currentIsDark);
    }
  }, []);

  // 테마 변경 처리
  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsLoading(true);

    try {
      // 1. 즉시 DOM 업데이트 (사용자 경험 향상)
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 2. 로컬스토리지 저장
      localStorage.setItem('surecrm-theme', newIsDark ? 'dark' : 'light');

      // 3. 상태 업데이트
      setIsDark(newIsDark);

      // 4. 로그인된 사용자는 서버에도 저장 (백그라운드에서 처리)
      if (isAuthenticated) {
        // 서버 저장을 백그라운드에서 처리하여 UI가 차단되지 않도록 함
        fetch('/api/user/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-theme',
            theme: newIsDark ? 'dark' : 'light',
          }),
        }).catch((error) => {
          console.warn('서버 테마 저장 실패 (로컬스토리지는 유지됨):', error);
        });
      }
    } catch (error) {
      console.error('테마 변경 중 오류:', error);
      // 오류 발생 시에도 기본 동작은 유지
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        'relative transition-all duration-200',
        isLoading && 'animate-pulse',
        className
      )}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {/* 테마 아이콘 애니메이션 */}
      <div className="relative flex items-center justify-center">
        <Sun
          className={cn(
            'h-4 w-4 transition-all duration-300',
            isDark
              ? 'scale-0 rotate-90 opacity-0'
              : 'scale-100 rotate-0 opacity-100'
          )}
        />
        <Moon
          className={cn(
            'absolute h-4 w-4 transition-all duration-300',
            isDark
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-0 -rotate-90 opacity-0'
          )}
        />
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}

      {/* 컴팩트 모드가 아닐 때 텍스트 표시 */}
      {!compact && (
        <span className="sr-only">
          {isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        </span>
      )}
    </Button>
  );
}

/**
 * 🌙 간단한 테마 토글 (헤더용)
 */
export function HeaderThemeToggle({
  isAuthenticated = false,
  className,
}: {
  isAuthenticated?: boolean;
  className?: string;
}) {
  return (
    <ThemeToggle
      compact
      size="default"
      variant="ghost"
      isAuthenticated={isAuthenticated}
      className={className}
    />
  );
}
