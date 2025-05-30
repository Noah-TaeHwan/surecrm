/**
 * 🔒 Admin 백오피스 통계 카드 컴포넌트
 * 백오피스 단순함: 기능적이고 명확한 통계 표시
 * 재사용성: 다양한 Admin 페이지에서 사용 가능
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  borderColor?: string;
  titleColor?: string;
  valueColor?: string;
  icon?: string;
}

interface AdminStatsCardsProps {
  stats: StatCardProps[];
  columns?: number;
}

export function AdminStatsCards({ stats, columns = 4 }: AdminStatsCardsProps) {
  const gridCols =
    {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-5',
    }[columns] || 'grid-cols-1 md:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <AdminStatCard key={index} {...stat} />
      ))}
    </div>
  );
}

export function AdminStatCard({
  title,
  value,
  borderColor = 'border-gray-200',
  titleColor = 'text-gray-700',
  valueColor = 'text-gray-900',
  icon,
}: StatCardProps) {
  return (
    <Card className={borderColor}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium ${titleColor}`}>
          {icon && <span className="mr-1">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  );
}

// 미리 정의된 Admin 통계 카드 타입들
export const AdminStatTypes = {
  invitations: (stats: any) => [
    {
      title: '전체 초대장',
      value: stats.total || 0,
      borderColor: 'border-gray-200',
      titleColor: 'text-gray-700',
      valueColor: 'text-gray-900',
      icon: '🎫',
    },
    {
      title: '대기중',
      value: stats.pending || 0,
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-600',
      icon: '⏳',
    },
    {
      title: '사용됨',
      value: stats.used || 0,
      borderColor: 'border-green-200',
      titleColor: 'text-green-700',
      valueColor: 'text-green-600',
      icon: '✅',
    },
    {
      title: '만료됨',
      value: stats.expired || 0,
      borderColor: 'border-red-200',
      titleColor: 'text-red-700',
      valueColor: 'text-red-600',
      icon: '❌',
    },
  ],

  users: (stats: any) => [
    {
      title: '전체 사용자',
      value: stats.total || 0,
      borderColor: 'border-purple-200',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-600',
      icon: '👥',
    },
    {
      title: '활성 사용자',
      value: stats.active || 0,
      borderColor: 'border-green-200',
      titleColor: 'text-green-700',
      valueColor: 'text-green-600',
      icon: '🟢',
    },
    {
      title: '비활성 사용자',
      value: stats.inactive || 0,
      borderColor: 'border-gray-200',
      titleColor: 'text-gray-700',
      valueColor: 'text-gray-600',
      icon: '⭕',
    },
    {
      title: 'Admin 사용자',
      value: stats.admins || 0,
      borderColor: 'border-orange-200',
      titleColor: 'text-orange-700',
      valueColor: 'text-orange-600',
      icon: '👑',
    },
  ],

  system: (stats: any) => [
    {
      title: '총 데이터 레코드',
      value: stats.totalRecords || 0,
      borderColor: 'border-indigo-200',
      titleColor: 'text-indigo-700',
      valueColor: 'text-indigo-600',
      icon: '📊',
    },
    {
      title: '활성 세션',
      value: stats.activeSessions || 0,
      borderColor: 'border-teal-200',
      titleColor: 'text-teal-700',
      valueColor: 'text-teal-600',
      icon: '🔗',
    },
    {
      title: '오늘 로그인',
      value: stats.todayLogins || 0,
      borderColor: 'border-cyan-200',
      titleColor: 'text-cyan-700',
      valueColor: 'text-cyan-600',
      icon: '��',
    },
  ],
};
