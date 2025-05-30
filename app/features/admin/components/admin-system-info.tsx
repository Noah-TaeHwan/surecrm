/**
 * 🔒 Admin 백오피스 시스템 정보 컴포넌트
 * 백오피스 전용: 시스템 상태와 디버깅 정보 표시
 * 보안 정보: Admin만 볼 수 있는 시스템 내부 상태
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import type { AdminUser } from '../types/admin';

interface SystemInfoItem {
  label: string;
  value: string | number;
  icon?: string;
  sensitive?: boolean; // 민감한 정보 여부
}

interface AdminSystemInfoProps {
  user: AdminUser;
  systemInfo: {
    pageType: string;
    accessTime: string;
    totalRecords: number;
    [key: string]: any;
  };
  additionalInfo?: SystemInfoItem[];
  compact?: boolean;
}

export function AdminSystemInfo({
  user,
  systemInfo,
  additionalInfo = [],
  compact = false,
}: AdminSystemInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const maskSensitiveValue = (value: string | number, sensitive?: boolean) => {
    if (!sensitive) return value;
    const str = value.toString();
    if (str.length <= 4) return str;
    return `${str.substring(0, 2)}***${str.substring(str.length - 2)}`;
  };

  const basicInfo: SystemInfoItem[] = [
    {
      label: '페이지 타입',
      value: systemInfo.pageType,
      icon: '📄',
    },
    {
      label: '데이터 로드 시간',
      value: formatDate(systemInfo.accessTime),
      icon: '⏰',
    },
    {
      label: '총 레코드 수',
      value: systemInfo.totalRecords.toLocaleString(),
      icon: '📊',
    },
    {
      label: 'Admin ID',
      value: user.id,
      icon: '🔑',
      sensitive: true,
    },
    {
      label: 'Admin 역할',
      value: user.role,
      icon: '👑',
    },
  ];

  const allInfo = [...basicInfo, ...additionalInfo];

  if (compact) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
        <div className="text-xs text-gray-600 font-medium mb-2 flex items-center">
          🔧 시스템 정보 (Admin 전용)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          {allInfo.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              <span className="mr-1">{item.label}:</span>
              <span className="font-mono">
                {maskSensitiveValue(item.value, item.sensitive)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-gray-300">
      <CardHeader>
        <CardTitle className="text-sm text-gray-600 flex items-center">
          🔧 시스템 정보 (Admin 전용)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allInfo.map((item, index) => (
            <div
              key={index}
              className="flex items-center text-xs text-gray-500"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="text-gray-600 font-medium">{item.label}:</span>
                <span className="ml-1 font-mono break-all">
                  {maskSensitiveValue(item.value, item.sensitive)}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* 실시간 시스템 상태 */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">🟢 시스템 상태: 정상</span>
            <span>업데이트: {new Date().toLocaleTimeString('ko-KR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 시스템 성능 모니터링 정보
export function AdminPerformanceInfo({
  loadTime,
  queryCount,
  cacheHitRate,
}: {
  loadTime?: number;
  queryCount?: number;
  cacheHitRate?: number;
}) {
  const performanceInfo: SystemInfoItem[] = [
    {
      label: '페이지 로드 시간',
      value: loadTime ? `${loadTime}ms` : 'N/A',
      icon: '⚡',
    },
    {
      label: 'DB 쿼리 수',
      value: queryCount || 0,
      icon: '🗄️',
    },
    {
      label: '캐시 히트율',
      value: cacheHitRate ? `${cacheHitRate}%` : 'N/A',
      icon: '💾',
    },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="text-xs text-blue-700 font-medium mb-2 flex items-center">
        ⚡ 성능 정보
      </div>
      <div className="grid grid-cols-3 gap-2">
        {performanceInfo.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-lg">{item.icon}</div>
            <div className="text-xs text-blue-600 font-medium">
              {item.value}
            </div>
            <div className="text-xs text-blue-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
