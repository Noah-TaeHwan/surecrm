import type { Route } from '.react-router/types/app/features/notifications/pages/+types/notifications-page';
import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Checkbox } from '~/common/components/ui/checkbox';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Bell,
  Check,
  CheckCheck,
  Eye,
  Archive,
  User,
  Filter,
  Search,
  Trash2,
  Star,
  Clock,
  Calendar,
  Users,
} from 'lucide-react';
import { cn } from '~/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timeAgo: string;
  isRead: boolean;
  type: string;
  priority: string;
  category: string;
}

interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  urgentCount: number;
  todayCount: number;
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '알림 센터 - SureCRM' },
    { name: 'description', content: '모든 알림을 관리하고 확인합니다' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 알림 데이터 가져오기
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: '새로운 고객 등록',
      message: '이영희님이 김철수님의 소개로 등록되었습니다.',
      time: '2024-01-20 14:30',
      timeAgo: '5분 전',
      isRead: false,
      type: 'client',
      priority: 'normal',
      category: '고객 관리',
    },
    {
      id: '2',
      title: '미팅 알림',
      message: '박지성님과의 계약 검토 미팅이 30분 후 시작됩니다.',
      time: '2024-01-20 14:05',
      timeAgo: '25분 전',
      isRead: false,
      type: 'meeting',
      priority: 'urgent',
      category: '일정 관리',
    },
    {
      id: '3',
      title: '계약 체결 완료',
      message: '최민수님의 보험 계약이 성공적으로 체결되었습니다.',
      time: '2024-01-20 13:30',
      timeAgo: '1시간 전',
      isRead: true,
      type: 'contract',
      priority: 'normal',
      category: '영업 관리',
    },
    {
      id: '4',
      title: '핵심 소개자 업데이트',
      message: '김철수님이 이번 달 소개 건수 1위를 달성했습니다.',
      time: '2024-01-20 12:30',
      timeAgo: '2시간 전',
      isRead: true,
      type: 'influencer',
      priority: 'normal',
      category: '소개 네트워크',
    },
    {
      id: '5',
      title: '시스템 점검 예정',
      message: '오늘 밤 12시부터 2시간 동안 시스템 점검이 예정되어 있습니다.',
      time: '2024-01-20 10:00',
      timeAgo: '4시간 전',
      isRead: false,
      type: 'system',
      priority: 'normal',
      category: '시스템',
    },
    {
      id: '6',
      title: '주간 보고서 준비',
      message: '이번 주 성과 보고서가 준비되었습니다.',
      time: '2024-01-20 09:00',
      timeAgo: '5시간 전',
      isRead: true,
      type: 'report',
      priority: 'low',
      category: '보고서',
    },
  ];

  const stats: NotificationStats = {
    totalCount: notifications.length,
    unreadCount: notifications.filter((n: NotificationItem) => !n.isRead)
      .length,
    urgentCount: notifications.filter(
      (n: NotificationItem) => n.priority === 'urgent'
    ).length,
    todayCount: notifications.filter((n: NotificationItem) =>
      n.time.startsWith('2024-01-20')
    ).length,
  };

  return { notifications, stats };
}

export default function NotificationsPage({
  loaderData,
}: Route.ComponentProps) {
  const { notifications, stats } = loaderData || {
    notifications: [],
    stats: { totalCount: 0, unreadCount: 0, urgentCount: 0, todayCount: 0 },
  };

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'meeting':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'contract':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'influencer':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      case 'report':
        return <Archive className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="text-xs">
            긴급
          </Badge>
        );
      case 'normal':
        return (
          <Badge variant="secondary" className="text-xs">
            일반
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-xs">
            낮음
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter(
    (notification: NotificationItem) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === 'all' || notification.type === filterType;
      const matchesPriority =
        filterPriority === 'all' || notification.priority === filterPriority;
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'unread' && !notification.isRead) ||
        (activeTab === 'urgent' && notification.priority === 'urgent') ||
        (activeTab === 'read' && notification.isRead);

      return matchesSearch && matchesType && matchesPriority && matchesTab;
    }
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(
        filteredNotifications.map((n: NotificationItem) => n.id)
      );
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications((prev) => [...prev, id]);
    } else {
      setSelectedNotifications((prev) => prev.filter((nId) => nId !== id));
    }
  };

  const handleMarkAsRead = (ids: string[]) => {
    console.log('알림 읽음 처리:', ids);
    // TODO: API 호출
  };

  const handleDeleteNotifications = (ids: string[]) => {
    console.log('알림 삭제:', ids);
    // TODO: API 호출
  };

  return (
    <MainLayout title="알림 센터">
      <div className="container mx-auto max-w-6xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">알림 센터</h1>
            <p className="text-muted-foreground">
              모든 알림을 한 곳에서 관리하세요
            </p>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>전체 알림</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>읽지 않음</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.unreadCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>긴급</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.urgentCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>오늘</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.todayCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>필터 및 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="알림 제목 또는 내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>유형</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 유형</SelectItem>
                    <SelectItem value="client">고객 관리</SelectItem>
                    <SelectItem value="meeting">일정 관리</SelectItem>
                    <SelectItem value="contract">영업 관리</SelectItem>
                    <SelectItem value="influencer">소개 네트워크</SelectItem>
                    <SelectItem value="system">시스템</SelectItem>
                    <SelectItem value="report">보고서</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>우선순위</Label>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 우선순위</SelectItem>
                    <SelectItem value="urgent">긴급</SelectItem>
                    <SelectItem value="normal">일반</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterPriority('all');
                  }}
                  className="w-full"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  필터 초기화
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">
                전체 ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                읽지 않음 ({stats.unreadCount})
              </TabsTrigger>
              <TabsTrigger value="urgent">
                긴급 ({stats.urgentCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                읽음 (
                {notifications.filter((n: NotificationItem) => n.isRead).length}
                )
              </TabsTrigger>
            </TabsList>

            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedNotifications.length}개 선택됨
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAsRead(selectedNotifications)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  읽음 처리
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDeleteNotifications(selectedNotifications)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            )}
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>알림 목록</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={
                        selectedNotifications.length ===
                          filteredNotifications.length &&
                        filteredNotifications.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="모든 알림 선택"
                    />
                    <Label className="text-sm text-muted-foreground">
                      전체 선택
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {filteredNotifications.map(
                      (notification: NotificationItem) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'flex items-start p-4 border rounded-lg transition-colors hover:bg-accent/50',
                            !notification.isRead &&
                              'bg-blue-50/50 border-blue-200',
                            selectedNotifications.includes(notification.id) &&
                              'ring-2 ring-primary'
                          )}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedNotifications.includes(
                                notification.id
                              )}
                              onCheckedChange={(checked) =>
                                handleSelectNotification(
                                  notification.id,
                                  checked as boolean
                                )
                              }
                              className="mt-1"
                            />

                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">
                                    {notification.title}
                                  </p>
                                  {getPriorityBadge(notification.priority)}
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {notification.timeAgo}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>

                                <div className="flex items-center gap-1">
                                  {!notification.isRead && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleMarkAsRead([notification.id])
                                      }
                                      className="h-6 px-2 text-xs"
                                    >
                                      읽음
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteNotifications([
                                        notification.id,
                                      ])
                                    }
                                    className="h-6 px-2 text-xs"
                                  >
                                    삭제
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium mb-2">알림이 없습니다</p>
                    <p className="text-muted-foreground">
                      {searchTerm ||
                      filterType !== 'all' ||
                      filterPriority !== 'all'
                        ? '검색 조건에 맞는 알림이 없습니다.'
                        : '새로운 알림이 도착하면 여기에 표시됩니다.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
