/**
 * 🔒 Admin 백오피스 헤더 컴포넌트
 * 보안 최우선: Admin 전용 브랜딩과 보안 표시
 * 백오피스 단순함: 필요한 정보만 표시
 */

import { Badge } from '~/common/components/ui/badge';
import type { AdminUser } from '../types/admin';

interface AdminHeaderProps {
  user: AdminUser;
  title: string;
  description?: string;
  accessTime?: string;
  totalRecords?: number;
  extraInfo?: React.ReactNode;
}

export function AdminHeader({
  user,
  title,
  description,
  accessTime,
  totalRecords,
  extraInfo,
}: AdminHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex justify-between items-center border-b border-red-200 pb-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🔒 {title}</h1>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          시스템 관리자: {user.fullName}
          {accessTime && ` | 접근시간: ${formatDate(accessTime)}`}
        </p>
      </div>
      <div className="text-right">
        <Badge variant="destructive" className="mb-2">
          ADMIN ONLY
        </Badge>
        {totalRecords !== undefined && (
          <p className="text-xs text-gray-500">총 {totalRecords}개 레코드</p>
        )}
        {extraInfo}
      </div>
    </div>
  );
}
