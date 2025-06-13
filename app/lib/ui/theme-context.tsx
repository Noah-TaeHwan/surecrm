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
  initialDarkMode = false,
}: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    // 초기 로드 시 사용자의 다크모드 설정 적용
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('surecrm-theme');
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        updateDocumentClass(isDark);
      } else if (initialDarkMode !== false) {
        // 서버에서 가져온 설정이 있는 경우
        setIsDarkMode(initialDarkMode);
        updateDocumentClass(initialDarkMode);
      }
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
