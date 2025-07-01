import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TranslationProvider({
  children,
  fallback,
}: TranslationProviderProps) {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsReady(true);
    }
  }, [ready]);

  // 서버 사이드에서는 즉시 렌더링
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // 클라이언트에서는 번역이 준비될 때까지 대기
  if (!isReady) {
    return <>{fallback || <div className="animate-pulse">Loading...</div>}</>;
  }

  return <>{children}</>;
}
