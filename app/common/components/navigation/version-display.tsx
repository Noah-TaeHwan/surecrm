/**
 * 🏷️ SSR 안전한 버전 표시 컴포넌트
 * 하이드레이션 문제를 방지하기 위해 클라이언트 사이드에서만 동적 버전 정보를 로드
 */

import { useState, useEffect } from 'react';
import {
  getFormattedVersion,
  getDetailedVersionInfo,
} from '~/lib/utils/version';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';

export function VersionDisplay() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 클라이언트에서만 렌더링 (SSR 스킵)
  if (!mounted) {
    return null;
  }

  // 클라이언트에서만 동적 버전 정보 직접 사용
  const version = getFormattedVersion();
  const detailedInfo = getDetailedVersionInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-xs text-sidebar-foreground/60 cursor-help hover:text-sidebar-foreground/80 transition-colors">
            {version}
          </p>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <pre className="text-xs whitespace-pre-line">{detailedInfo}</pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
