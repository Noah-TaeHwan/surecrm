import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { Separator } from '~/common/components/ui/separator';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Scale,
  Ruler,
  Car,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '~/lib/utils';

interface ResponsiveClientDetailProps {
  client: any;
  clientTags?: any[];
  isEditing?: boolean;
  editFormData?: any;
  setEditFormData?: (data: any) => void;
  onEditStart?: () => void;
  onSsnChange?: (ssnFront: string, ssnBack: string) => Promise<void>;
  onTagModalOpen?: () => void;
  onTagRemove?: (tagId: string) => void;
  availableReferrers?: any[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onDeleteClient?: () => void;
  onShowOpportunityModal?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveClientDetail - 모바일 반응형 고객 상세 뷰 컴포넌트
 * 
 * 주요 기능:
 * - 모바일 우선 반응형 레이아웃
 * - 터치 친화적 UI 요소
 * - 접근성 최적화
 * - tel/mailto 링크 통합
 */
export function ResponsiveClientDetail({
  client,
  clientTags = [],
  isEditing = false,
  editFormData,
  setEditFormData,
  onEditStart,
  onSsnChange,
  onTagModalOpen,
  onTagRemove,
  availableReferrers,
  activeTab,
  onTabChange,
  onDeleteClient,
  onShowOpportunityModal,
  children,
  className,
}: ResponsiveClientDetailProps) {
  const [activeTabState, setActiveTabState] = useState(activeTab || 'overview');
  const [showAllTabs, setShowAllTabs] = useState(false);

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">고객 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 중요도에 따른 색상 및 아이콘
  const getImportanceConfig = (importance: string) => {
    switch (importance) {
      case 'high':
        return { color: 'text-red-600', bg: 'bg-red-50', icon: '🔥', label: '높음' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⭐', label: '보통' };
      case 'low':
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📄', label: '낮음' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📄', label: '보통' };
    }
  };

  const importanceConfig = getImportanceConfig(client.importance);

  // 탭 목록 (모바일에서는 일부만 표시)
  const tabs = [
    { id: 'overview', label: '개요', icon: User },
    { id: 'contact', label: '연락처', icon: Phone },
    { id: 'personal', label: '개인정보', icon: Calendar },
    { id: 'notes', label: '메모', icon: Briefcase },
  ];

  const visibleTabs = showAllTabs ? tabs : tabs.slice(0, 3);

  return (
    <div className={cn('space-y-4 lg:space-y-6', className)}>
      {/* 중복된 모바일 프로필 카드 제거됨 */}
      
      {/* 자식 컴포넌트 렌더링 */}
      {children}
    </div>
  );
}

export default ResponsiveClientDetail;
