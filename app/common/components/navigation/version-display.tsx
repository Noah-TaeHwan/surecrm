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
import packageJson from '../../../../package.json';

export function VersionDisplay() {
  // package.json의 정적 버전을 fallback으로 사용
  const staticVersion = packageJson.version;
  const [version, setVersion] = useState(staticVersion);
  const [detailedInfo, setDetailedInfo] = useState(`버전: ${staticVersion}`);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 동적 버전 정보 로드
    setVersion(getFormattedVersion());
    setDetailedInfo(getDetailedVersionInfo());
    setIsHydrated(true);
  }, []);

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
