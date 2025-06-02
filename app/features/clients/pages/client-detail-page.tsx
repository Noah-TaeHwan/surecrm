import { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/client-detail-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Separator } from '~/common/components/ui/separator';
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  Network,
  FileText,
  TrendingUp,
  Shield,
  Settings,
  MessageCircle,
  Trash2,
  Download,
  Upload,
  Eye,
  Clock,
  Award,
  Target,
} from 'lucide-react';
import type {
  Client,
  ClientOverview,
  AppClientContactHistory,
  AppClientAnalytics,
} from '~/features/clients/lib/schema';
import { requireAuth } from '~/lib/auth/middleware';

// 🎯 확장된 고객 프로필 타입 (상세 페이지용)
interface ClientDetailProfile extends Client {
  // 계산 필드들
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  // 상세 데이터
  recentContacts: AppClientContactHistory[];
  analytics: AppClientAnalytics | null;
  familyMembers: any[];
  milestones: any[];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id: clientId } = params;

  console.log('🔍 클라이언트 상세 페이지 loader 시작:', { clientId });

  if (!clientId) {
    console.error('❌ 클라이언트 ID가 없음');
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🎯 실제 로그인된 보험설계사 정보 가져오기
    const user = await requireAuth(request);
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // 🎯 실제 API 호출로 고객 상세 정보 조회
    const { getClientById } = await import('~/api/shared/clients');

    console.log('📞 API 호출 시작:', { clientId, agentId });

    const clientDetail = await getClientById(clientId, agentId);

    console.log('📞 API 호출 결과:', { clientDetail: !!clientDetail });

    if (!clientDetail) {
      console.log('⚠️ 고객을 찾을 수 없음, 빈 상태 처리');

      // 🎯 고객이 없을 때 빈 상태 데이터 반환 (404 대신)
      return {
        client: null,
        currentUserId: agentId,
        isEmpty: true,
      };
    }

    console.log('✅ 고객 상세 정보 로드 완료:', clientDetail.fullName);

    return {
      client: clientDetail,
      currentUserId: agentId,
      isEmpty: false,
    };
  } catch (error) {
    console.error('❌ 고객 상세 정보 조회 실패:', error);

    // 🎯 에러 상태 반환 (서버 에러 대신)
    return {
      client: null,
      currentUserId: null,
      isEmpty: true,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const clientName = data?.client?.fullName || '고객';
  return [
    { title: `${clientName} - 고객 상세 | SureCRM` },
    { name: 'description', content: `${clientName}의 상세 정보를 확인하세요.` },
  ];
}

export default function ClientDetailPage({ loaderData }: Route.ComponentProps) {
  const { client, isEmpty, error } = loaderData;
  const [activeTab, setActiveTab] = useState('overview');

  // 🎯 빈 상태 처리
  if (isEmpty || !client) {
    return (
      <MainLayout title="고객 상세">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-6xl">🔍</div>
          {error ? (
            <>
              <h2 className="text-2xl font-semibold">오류가 발생했습니다</h2>
              <p className="text-muted-foreground text-center max-w-md">
                {error}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">
                고객을 찾을 수 없습니다
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                요청하신 고객 정보가 존재하지 않거나 접근 권한이 없습니다.
              </p>
            </>
          )}
          <Link to="/clients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              고객 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // 🎯 액션 핸들러들 (client가 확실히 존재할 때만 실행)
  const handleEditClient = () => {
    // TODO: Phase 3에서 편집 페이지로 라우팅
    alert('고객 편집 페이지로 이동합니다. (Phase 3에서 구현 예정)');
  };

  const handleDeleteClient = () => {
    // TODO: Phase 3에서 삭제 확인 및 처리
    alert('고객 삭제 기능은 Phase 3에서 구현 예정입니다.');
  };

  const handleAddContact = () => {
    alert('연락 이력 추가 기능은 Phase 3에서 구현 예정입니다.');
  };

  const handleScheduleMeeting = () => {
    alert('미팅 일정 등록 기능은 Phase 3에서 구현 예정입니다.');
  };

  return (
    <MainLayout title={`${client.fullName} - 고객 상세`}>
      <div className="space-y-6">
        {/* 🎯 헤더 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                고객 목록
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{client.fullName}</h1>
              <p className="text-muted-foreground">
                {client.occupation} • {client.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEditClient}>
              <Edit2 className="h-4 w-4 mr-2" />
              수정
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClient}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>
        </div>

        {/* 🎯 기본 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 고객 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.address}</span>
              </div>
              <div className="pt-2">
                <Badge
                  variant={
                    client.importance === 'high'
                      ? 'destructive'
                      : client.importance === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {client.importance === 'high'
                    ? 'VIP 고객'
                    : client.importance === 'medium'
                    ? '일반 고객'
                    : '일반 고객'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 영업 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                영업 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">현재 단계</span>
                <Badge
                  variant="outline"
                  style={{ color: client.currentStage.color }}
                >
                  {client.currentStage.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">전환 확률</span>
                <span className="font-medium">
                  {client.conversionProbability}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">월 보험료</span>
                <span className="font-medium">
                  {(client.totalPremium / 10000).toFixed(0)}만원
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">예상 LTV</span>
                <span className="font-medium">
                  {(client.lifetimeValue / 10000).toFixed(0)}만원
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 네트워크 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                네트워크
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.referredBy && (
                <div>
                  <span className="text-sm text-muted-foreground">소개자</span>
                  <p className="font-medium">{client.referredBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ({client.referredBy.relationship})
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">소개 고객 수</span>
                <span className="font-medium">{client.referralCount}명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">참여도 점수</span>
                <span className="font-medium">{client.engagementScore}/10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 상세 탭 섹션 */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="insurance">보험</TabsTrigger>
                <TabsTrigger value="family">가족</TabsTrigger>
                <TabsTrigger value="contacts">연락 이력</TabsTrigger>
                <TabsTrigger value="milestones">마일스톤</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* 개요 탭 */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">보험 유형</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.insuranceTypes.map(
                        (type: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {type}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">메모</h3>
                  <p className="text-muted-foreground">
                    {client.notes || '메모가 없습니다.'}
                  </p>
                </div>

                {client.customFields &&
                  Object.keys(client.customFields).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          추가 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(client.customFields).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="text-sm font-medium">
                                  {key}:{' '}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {Array.isArray(value)
                                    ? value.join(', ')
                                    : String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </TabsContent>

              {/* 보험 탭 */}
              <TabsContent value="insurance">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">보험 정보</h3>
                  <p className="text-muted-foreground mb-4">
                    Phase 3에서 상세한 보험 정보를 구현할 예정입니다.
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    보험 정보 추가
                  </Button>
                </div>
              </TabsContent>

              {/* 가족 탭 */}
              <TabsContent value="family">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">가족 구성원</h3>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      구성원 추가
                    </Button>
                  </div>

                  {client.familyMembers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>관계</TableHead>
                          <TableHead>생년월일</TableHead>
                          <TableHead>보험 가입</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {client.familyMembers.map((member: any) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.name}
                            </TableCell>
                            <TableCell>{member.relationship}</TableCell>
                            <TableCell>{member.birthDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  member.hasInsurance ? 'default' : 'outline'
                                }
                              >
                                {member.hasInsurance ? '가입' : '미가입'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      등록된 가족 구성원이 없습니다.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 연락 이력 탭 */}
              <TabsContent value="contacts">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">연락 이력</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddContact}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      연락 이력 추가
                    </Button>
                  </div>

                  <div className="text-center py-8 text-muted-foreground">
                    연락 이력이 없습니다. (Phase 3에서 구현 예정)
                  </div>
                </div>
              </TabsContent>

              {/* 마일스톤 탭 */}
              <TabsContent value="milestones">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">마일스톤</h3>
                    <Button variant="outline" size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      마일스톤 추가
                    </Button>
                  </div>

                  {client.milestones.length > 0 ? (
                    <div className="space-y-4">
                      {client.milestones.map((milestone: any) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {milestone.date}
                            </p>
                          </div>
                          <Badge variant="outline">{milestone.type}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      마일스톤이 없습니다.
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* 🎯 액션 버튼들 */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleScheduleMeeting}>
            <Calendar className="h-4 w-4 mr-2" />
            미팅 일정 등록
          </Button>
          <Button variant="outline" onClick={handleAddContact}>
            <MessageCircle className="h-4 w-4 mr-2" />
            연락 이력 추가
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            정보 내보내기
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
