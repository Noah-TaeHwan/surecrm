import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
import { DeleteConfirmationModal } from '~/common/components/ui/delete-confirmation-modal';
import { EnhancedClientOverview } from '../components/enhanced-client-overview';
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  MapPin,
  User,
  Network,
  FileText,
  TrendingUp,
  Shield,
  Settings,
  MessageCircle,
  Trash2,
  Upload,
  Eye,
  Clock,
  Award,
  Target,
  Calendar,
  Plus,
  CheckCircle,
  Star,
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

interface LoaderData {
  client: Client | null;
  currentUserId: string | null;
  isEmpty: boolean;
  error?: string;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id: clientId } = params;

  console.log('🔍 고객 상세 페이지 loader 시작:', { clientId });

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

    // 🎯 16개 Supabase 테이블 기반 병렬 데이터 로딩 구조
    const [
      // 1. 기본 고객 정보 (현재 작동하는 API)
      clientDetail,

      // TODO: 2-16. 16개 테이블 확장 API 함수들 (순차 구현 예정)
      // clientExtendedDetails,     // app_client_details
      // clientAnalytics,           // app_client_analytics
      // clientContactHistory,      // app_client_contact_history
      // clientDocuments,           // app_client_documents
      // clientFamilyMembers,       // app_client_family_members
      // clientMilestones,          // app_client_milestones
      // clientPreferences,         // app_client_preferences
      // clientStageHistory,        // app_client_stage_history
      // clientTags,                // app_client_tags + app_client_tag_assignments
      // clientMeetings,            // app_client_meetings
      // clientInsurance,           // app_client_insurance (기존 insurance_info 연결)
      // clientReferrals,           // app_client_referrals
      // clientDataAccessLogs,      // app_client_data_access_logs
      // clientDataBackups,         // app_client_data_backups
    ] = await Promise.all([
      // 1. 기본 고객 정보 (현재 구현됨)
      import('~/api/shared/clients').then(({ getClientById }) =>
        getClientById(clientId, agentId)
      ),

      // TODO: 2-16. 확장 API 함수들 (미래 구현)
      // import('~/api/shared/client-details').then(({ getClientDetails }) =>
      //   getClientDetails(clientId, agentId)
      // ),
      // import('~/api/shared/client-analytics').then(({ getClientAnalytics }) =>
      //   getClientAnalytics(clientId, agentId)
      // ),
      // import('~/api/shared/client-contacts').then(({ getClientContactHistory }) =>
      //   getClientContactHistory(clientId, agentId)
      // ),
      // import('~/api/shared/client-documents').then(({ getClientDocuments }) =>
      //   getClientDocuments(clientId, agentId)
      // ),
      // import('~/api/shared/client-family').then(({ getClientFamilyMembers }) =>
      //   getClientFamilyMembers(clientId, agentId)
      // ),
      // import('~/api/shared/client-milestones').then(({ getClientMilestones }) =>
      //   getClientMilestones(clientId, agentId)
      // ),
      // import('~/api/shared/client-preferences').then(({ getClientPreferences }) =>
      //   getClientPreferences(clientId, agentId)
      // ),
      // import('~/api/shared/client-stages').then(({ getClientStageHistory }) =>
      //   getClientStageHistory(clientId, agentId)
      // ),
      // import('~/api/shared/client-tags').then(({ getClientTagsAndAssignments }) =>
      //   getClientTagsAndAssignments(clientId, agentId)
      // ),
      // import('~/api/shared/client-meetings').then(({ getClientMeetings }) =>
      //   getClientMeetings(clientId, agentId)
      // ),
      // import('~/api/shared/client-insurance').then(({ getClientInsurance }) =>
      //   getClientInsurance(clientId, agentId)
      // ),
      // import('~/api/shared/client-referrals').then(({ getClientReferrals }) =>
      //   getClientReferrals(clientId, agentId)
      // ),
      // import('~/api/shared/client-access-logs').then(({ getClientAccessLogs }) =>
      //   getClientAccessLogs(clientId, agentId)
      // ),
      // import('~/api/shared/client-backups').then(({ getClientBackups }) =>
      //   getClientBackups(clientId, agentId)
      // ),
    ]);

    if (!clientDetail) {
      console.log('⚠️ 고객을 찾을 수 없음, 빈 상태 처리');
      return {
        client: null,
        currentUserId: agentId,
        isEmpty: true,
      };
    }

    console.log('✅ 고객 기본 정보 로드 완료:', {
      clientName: clientDetail.fullName,
      // TODO: 확장 데이터 로그 추가 예정
      // hasExtendedDetails: !!clientExtendedDetails,
      // hasAnalytics: !!clientAnalytics,
      // contactsCount: clientContactHistory?.length || 0,
      // documentsCount: clientDocuments?.length || 0,
      // familyMembersCount: clientFamilyMembers?.length || 0,
      // milestonesCount: clientMilestones?.length || 0,
      // tagsCount: clientTags?.length || 0,
      // meetingsCount: clientMeetings?.length || 0,
      // insuranceCount: clientInsurance?.length || 0,
      // referralsCount: clientReferrals?.length || 0,
    });

    // 🎯 통합 고객 프로필 구성 (추후 확장 데이터 병합 예정)
    const enhancedClient = {
      // 기본 정보
      ...clientDetail,

      // TODO: 확장 정보 병합 (16개 테이블 연동 시 구현)
      // extendedDetails: clientExtendedDetails,
      // analytics: clientAnalytics,
      // contactHistory: clientContactHistory || [],
      // documents: clientDocuments || [],
      // familyMembers: clientFamilyMembers || [],
      // milestones: clientMilestones || [],
      // preferences: clientPreferences,
      // stageHistory: clientStageHistory || [],
      // tags: clientTags || [],
      // meetings: clientMeetings || [],
      // insurance: clientInsurance || [],
      // referrals: clientReferrals || [],
      // accessLogs: clientDataAccessLogs || [],
      // backups: clientDataBackups || [],

      // 계산된 필드들 (실제 데이터 기반으로 향후 대체)
      referralCount: 0, // clientReferrals?.length || 0,
      insuranceTypes: [], // clientInsurance?.map(i => i.productName) || [],
      totalPremium: 0, // clientInsurance?.reduce((sum, i) => sum + i.premium, 0) || 0,
      engagementScore: 5, // clientAnalytics?.engagementScore || 5,
      conversionProbability: 75, // clientAnalytics?.conversionProbability || 75,
      lifetimeValue: 5000000, // clientAnalytics?.lifetimeValue || 5000000,
      lastContactDate: clientDetail.updatedAt, // clientContactHistory?.[0]?.createdAt || clientDetail.updatedAt,
    };

    return {
      client: enhancedClient,
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
  const loaderData = data as any; // 임시 타입 우회
  const clientName = loaderData?.client?.fullName || '고객';
  return [
    { title: `${clientName} - 고객 상세 | SureCRM` },
    { name: 'description', content: `${clientName}의 상세 정보를 확인하세요.` },
  ];
}

export default function ClientDetailPage({ loaderData }: Route.ComponentProps) {
  // 안전한 타입 체크와 기본값 설정
  const data = loaderData as any;
  const client = data?.client || null;
  const isEmpty = data?.isEmpty || false;
  const error = data?.error || null;
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

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
    navigate(`/clients/edit/${client.id}`);
  };

  const handleDeleteClient = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteClient = async () => {
    setIsDeleting(true);
    try {
      // 🎯 실제 API 호출로 고객 삭제
      const { deleteClient } = await import('~/api/shared/clients');

      console.log('📞 고객 삭제 API 호출 시작:', {
        clientId: client.id,
        agentId: client.agentId,
      });

      const result = await deleteClient(client.id, client.agentId);

      if (result.success) {
        console.log('✅ 고객 삭제 완료');
        alert('고객이 성공적으로 삭제되었습니다.');
        navigate('/clients');
      } else {
        throw new Error(result.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 고객 삭제 실패:', error);
      alert(
        `고객 삭제에 실패했습니다.\n\n${
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.'
        }`
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <MainLayout title={`${client.fullName} - 고객 상세`}>
      <div className="space-y-8">
        {/* 🎯 헤더 섹션 - 심플하게 유지 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                고객 목록
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* 🚀 새 영업 기회 추가 (핵심 기능) */}
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onClick={() => {
                // TODO: 영업 파이프라인에 새 기회 추가 기능
                alert(
                  `${client.fullName} 고객에게 새로운 보험 상품 영업 기회를 생성합니다.\n\n영업 파이프라인 페이지로 이동하거나 여기서 바로 설정할 수 있습니다.`
                );
              }}
            >
              <Plus className="h-4 w-4 mr-2" />새 영업 기회
            </Button>
            <Button variant="outline" onClick={handleEditClient}>
              <Edit2 className="h-4 w-4 mr-2" />
              수정
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClient}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>

        {/* 🎯 향상된 고객 개요 - 새로운 컴포넌트 사용 */}
        <EnhancedClientOverview
          client={{
            id: client.id,
            fullName: client.fullName,
            phone: client.phone,
            email: client.email,
            address: client.address,
            occupation: client.occupation,
            importance: client.importance,
            currentStage: client.currentStage,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            notes: client.notes,
            // 추후 실제 데이터로 교체 예정
            referralCount: 0,
            insuranceTypes: [],
            totalPremium: 0,
            engagementScore: 5,
            conversionProbability: 75,
            lifetimeValue: 5000000,
            lastContactDate: client.updatedAt,
          }}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onScheduleMeeting={() => {
            // 🎯 미팅 스케줄링 기능 구현
            const meetingDate = prompt(
              '미팅 일정을 입력하세요 (예: 2024-12-20 14:00)',
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16)
            );

            if (meetingDate) {
              // TODO: 실제 미팅 API 연동 시 구현
              alert(
                `${client.fullName} 고객과의 미팅이 ${meetingDate}에 예약되었습니다.\n\n캘린더 페이지에서 상세 정보를 확인할 수 있습니다.`
              );
              console.log('📅 미팅 예약:', {
                clientId: client.id,
                clientName: client.fullName,
                scheduledAt: meetingDate,
              });
            }
          }}
          onAddNote={() => {
            // 🎯 노트 추가 기능 구현
            const noteContent = prompt(
              `${client.fullName} 고객에 대한 노트를 추가하세요:`,
              ''
            );

            if (noteContent && noteContent.trim()) {
              // TODO: 실제 노트 API 연동 시 구현
              const timestamp = new Date().toLocaleString('ko-KR');
              alert(
                `노트가 추가되었습니다!\n\n"${noteContent.trim()}"\n\n추가일시: ${timestamp}`
              );
              console.log('📝 노트 추가:', {
                clientId: client.id,
                clientName: client.fullName,
                note: noteContent.trim(),
                timestamp: new Date().toISOString(),
              });
            }
          }}
        />

        {/* 🎯 상세 탭 섹션 - 기존 구조 유지하되 개선 */}
        <Card className="border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">상세 정보</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  정보 추가
                </Button>
              </div>
              <TabsList className="grid w-full grid-cols-5 bg-muted/30">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-background"
                >
                  개요
                </TabsTrigger>
                <TabsTrigger
                  value="insurance"
                  className="data-[state=active]:bg-background"
                >
                  보험
                </TabsTrigger>
                <TabsTrigger
                  value="family"
                  className="data-[state=active]:bg-background"
                >
                  가족
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="data-[state=active]:bg-background"
                >
                  연락 이력
                </TabsTrigger>
                <TabsTrigger
                  value="milestones"
                  className="data-[state=active]:bg-background"
                >
                  마일스톤
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-0">
              {/* 개요 탭 - 개선된 버전 */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 태그 섹션 */}
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        태그
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {client.tags && client.tags.length > 0 ? (
                          client.tags.map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-300"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">
                              태그가 없습니다
                            </p>
                            <Button variant="outline" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              태그 추가
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 보험 유형 섹션 */}
                  <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        보험 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          등록된 보험이 없습니다
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          보험 추가
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* 메모 섹션 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      메모 및 특이사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.notes ? (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {client.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          메모가 없습니다
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          메모 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 추가 정보 */}
                {client.customFields &&
                  Object.keys(client.customFields).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">추가 정보</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(client.customFields).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between p-3 bg-muted/20 rounded-lg"
                              >
                                <span className="text-sm font-medium text-muted-foreground">
                                  {key}
                                </span>
                                <span className="text-sm">
                                  {Array.isArray(value)
                                    ? value.join(', ')
                                    : String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              {/* 보험 탭 - 개선된 버전 */}
              <TabsContent value="insurance" className="space-y-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      보험 포트폴리오
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      계약 완료 및 진행 중인 보험 상품 현황
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      alert('새로운 보험 상품 추가 기능은 곧 구현됩니다.');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    보험 추가
                  </Button>
                </div>

                {/* 🎯 계약 완료된 보험 섹션 */}
                <Card className="border-muted bg-gradient-to-br from-muted/30 to-muted/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      계약 완료 보험 ({0}건)
                    </CardTitle>
                    <CardDescription>
                      현재 유효한 보험 계약 목록
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* TODO: 실제 보험 계약 데이터 연동 */}
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        계약 완료된 보험이 없습니다
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground">
                        💡 첫 번째 보험 계약을 성사시켜 보세요!
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 🎯 진행 중인 영업 기회 섹션 */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      진행 중인 영업 ({0}건)
                    </CardTitle>
                    <CardDescription>
                      현재 영업 파이프라인에서 진행 중인 상품들
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* TODO: 실제 영업 파이프라인 데이터 연동 */}
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        진행 중인 영업 기회가 없습니다
                      </p>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => {
                          alert(
                            `${client.fullName} 고객에게 새로운 보험 상품 영업을 시작합니다.`
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />첫 번째 영업 기회 생성
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 🎯 보험 분석 및 추천 섹션 */}
                <Card className="border-border bg-gradient-to-br from-secondary to-background">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      AI 분석 및 추천
                    </CardTitle>
                    <CardDescription>
                      고객 프로필 기반 맞춤 보험 상품 추천
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                          <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                          <span className="font-medium">추천 상품</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          고객의 직업({client.occupation || '미등록'})과
                          연령대를 고려한 맞춤 상품 분석 중...
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">
                            보험료 적정성
                          </p>
                          <p className="text-sm font-medium">분석 예정</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">
                            보장 공백 분석
                          </p>
                          <p className="text-sm font-medium">분석 예정</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" disabled>
                        <Settings className="h-4 w-4 mr-2" />
                        상세 분석 보고서 생성 (곧 출시)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 가족 탭 - 개선된 버전 */}
              <TabsContent value="family" className="space-y-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      가족 구성원
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      가족 단위 보험 설계를 위한 구성원 정보
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    구성원 추가
                  </Button>
                </div>

                {client.familyMembers && client.familyMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.familyMembers.map((member: any) => (
                      <Card
                        key={member.id}
                        className="border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.relationship}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.birthDate}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                member.hasInsurance ? 'default' : 'outline'
                              }
                            >
                              {member.hasInsurance ? '가입' : '미가입'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl border border-purple-200 dark:border-purple-800 max-w-md mx-auto">
                      <User className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">
                        가족 정보
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                        가족 구성원 정보를 등록하여
                        <br />
                        종합적인 보험 설계를 제공하세요.
                      </p>
                      <Button
                        variant="outline"
                        className="border-purple-300"
                        disabled
                      >
                        <Plus className="h-4 w-4 mr-2" />첫 번째 구성원 추가
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 연락 이력 탭 - 개선된 버전 */}
              <TabsContent value="contacts" className="space-y-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      연락 이력
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      고객과의 모든 상담 및 연락 기록
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    연락 기록 추가
                  </Button>
                </div>

                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 max-w-md mx-auto">
                    <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
                      연락 이력 관리
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      상담 내용, 통화 기록, 미팅 내용을
                      <br />
                      체계적으로 관리하고 추적하세요.
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-blue-300"
                        disabled
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />첫 번째 기록
                        추가
                      </Button>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        개발 중
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 마일스톤 탭 - 개선된 버전 */}
              <TabsContent value="milestones" className="space-y-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      마일스톤
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      고객 관계의 중요한 순간들을 기록
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    마일스톤 추가
                  </Button>
                </div>

                {client.milestones && client.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {client.milestones.map((milestone: any) => (
                      <Card
                        key={milestone.id}
                        className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                              <Award className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {milestone.date}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-amber-300 text-amber-700"
                            >
                              {milestone.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 max-w-md mx-auto">
                      <Award className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
                        마일스톤 추적
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        첫 상담, 계약 체결, 갱신 등<br />
                        중요한 순간들을 기록하고 축하하세요.
                      </p>
                      <Button
                        variant="outline"
                        className="border-amber-300"
                        disabled
                      >
                        <Award className="h-4 w-4 mr-2" />첫 번째 마일스톤 추가
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* 🗑️ 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteClient}
        title="고객 삭제 확인"
        description={`정말로 "${client?.fullName}" 고객을 삭제하시겠습니까?`}
        itemName={client?.fullName}
        itemType="고객"
        warningMessage="이 고객과 관련된 모든 데이터(보험 정보, 미팅 기록, 연락 이력 등)가 함께 삭제됩니다."
        isLoading={isDeleting}
      />
    </MainLayout>
  );
}
