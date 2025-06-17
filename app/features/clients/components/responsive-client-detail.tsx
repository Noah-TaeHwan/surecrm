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
      {/* 모바일: 상단 프로필 카드 / 데스크톱: 기존 레이아웃 유지 */}
      <Card className="lg:hidden">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* 아바타 */}
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={client.avatar} alt={client.fullName} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {client.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* 기본 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {client.fullName}
                </h1>
                <Badge 
                  variant="secondary" 
                  className={cn(importanceConfig.bg, importanceConfig.color)}
                >
                  {importanceConfig.icon} {importanceConfig.label}
                </Badge>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-1 mb-3">
                {client.phone && (
                  <a 
                    href={`tel:${client.phone}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </a>
                )}
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                )}
              </div>

              {/* 태그 */}
              {clientTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {clientTags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {clientTags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{clientTags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex flex-wrap gap-2">
                {onEditStart && (
                  <Button size="sm" variant="outline" onClick={onEditStart}>
                    수정
                  </Button>
                )}
                {onShowOpportunityModal && (
                  <Button size="sm" onClick={onShowOpportunityModal}>
                    영업기회
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 반응형 탭 시스템 */}
      <Card>
        <Tabs value={activeTabState} onValueChange={setActiveTabState} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-3 lg:grid-cols-4">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center gap-1 text-xs lg:text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* 모바일에서 추가 탭 표시 토글 */}
              {tabs.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTabs(!showAllTabs)}
                  className="lg:hidden"
                >
                  {showAllTabs ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">기본 정보</h3>
                  <div className="space-y-2 text-sm">
                    {client.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{client.occupation}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-2">{client.address}</span>
                      </div>
                    )}
                    {client.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(client.birthDate).toLocaleDateString('ko-KR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">신체 정보</h3>
                  <div className="space-y-2 text-sm">
                    {(client.height || client.weight) && (
                      <div className="grid grid-cols-2 gap-2">
                        {client.height && (
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <span>{client.height}cm</span>
                          </div>
                        )}
                        {client.weight && (
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span>{client.weight}kg</span>
                          </div>
                        )}
                      </div>
                    )}
                    {client.hasDrivingLicense && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>운전면허 보유</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 연락처 탭 */}
            <TabsContent value="contact" className="space-y-4 mt-0">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">연락처 정보</h3>
                <div className="space-y-3">
                  {client.phone && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{client.phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.telecomProvider && client.telecomProvider !== 'none' 
                                ? `${client.telecomProvider} 통신사` 
                                : '휴대폰'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`tel:${client.phone}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          통화
                        </a>
                      </div>
                    </Card>
                  )}

                  {client.email && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{client.email}</p>
                            <p className="text-sm text-muted-foreground">이메일</p>
                          </div>
                        </div>
                        <a
                          href={`mailto:${client.email}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          메일
                        </a>
                      </div>
                    </Card>
                  )}

                  {client.address && (
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">주소</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {client.address}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 개인정보 탭 */}
            <TabsContent value="personal" className="space-y-4 mt-0">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">개인 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {client.birthDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">생년월일</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(client.birthDate).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {client.gender && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">성별</p>
                        <p className="text-sm text-muted-foreground">
                          {client.gender === 'male' ? '남성' : '여성'}
                        </p>
                      </div>
                    </div>
                  )}

                  {client.importance && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">중요도</p>
                        <Badge className={cn(importanceConfig.bg, importanceConfig.color)}>
                          {importanceConfig.icon} {importanceConfig.label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 메모 탭 */}
            <TabsContent value="notes" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">메모</h3>
                  {onEditStart && (
                    <Button size="sm" variant="outline" onClick={onEditStart}>
                      편집
                    </Button>
                  )}
                </div>
                
                {client.notes ? (
                  <Card className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {client.notes}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">메모가 없습니다.</p>
                    {onEditStart && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={onEditStart}
                      >
                        메모 추가
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* 추가 컨텐츠 영역 */}
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default ResponsiveClientDetail;
