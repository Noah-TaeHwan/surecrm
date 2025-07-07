import { useState, useEffect } from 'react';

/**
 * 컴포넌트가 클라이언트에서 성공적으로 하이드레이션되었는지 여부를 반환하는 훅.
 * 서버 사이드 렌더링(SSR) 환경에서는 항상 `false`를 반환하고,
 * 클라이언트에서 컴포넌트가 마운트된 후에 `true`로 변경됩니다.
 *
 * @returns {boolean} 컴포넌트가 하이드레이션되었으면 `true`, 그렇지 않으면 `false`.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
