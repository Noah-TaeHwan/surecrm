import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialDarkMode?: boolean;
}

export function ThemeProvider({
  children,
  initialDarkMode = true,
}: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true); // 기본값 다크모드

  useEffect(() => {
    // 초기 로드 시 사용자의 다크모드 설정 적용
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('surecrm-theme');
      // 강제로 다크모드 기본값 적용 (테스트용)
      console.log('🌙 현재 저장된 테마:', savedTheme);
      
      // 임시: 무조건 다크모드로 설정
      const isDark = true; // savedTheme ? savedTheme === 'dark' : true;
      setIsDarkMode(isDark);
      updateDocumentClass(isDark);
      
      // 로컬스토리지도 다크모드로 업데이트
      localStorage.setItem('surecrm-theme', 'dark');
      console.log('🌙 테마를 다크모드로 강제 설정');
    }
  }, [initialDarkMode]);

  useEffect(() => {
    // 다크모드 상태가 변경될 때마다 DOM과 localStorage 업데이트
    updateDocumentClass(isDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('surecrm-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  const updateDocumentClass = (isDark: boolean) => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
