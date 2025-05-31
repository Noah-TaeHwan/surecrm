'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import type { NetworkGraphProps } from '../types';

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center">
    <div className="text-center">
      <p className="mb-2">그래프 로딩 중...</p>
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
    </div>
  </div>
);

export default function NetworkGraph(props: NetworkGraphProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [NetworkGraphClient, setNetworkGraphClient] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    // 클라이언트 사이드에서만 dynamic import
    import('./NetworkGraphClient').then((module) => {
      setNetworkGraphClient(() => module.default);
    });
  }, []);

  if (!isMounted || !NetworkGraphClient) {
    return <LoadingFallback />;
  }

  return <NetworkGraphClient {...props} />;
}
