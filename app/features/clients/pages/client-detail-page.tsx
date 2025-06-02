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
import { NewOpportunityModal } from '../components/new-opportunity-modal';
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
  Save,
  X,
} from 'lucide-react';
import type {
  Client,
  ClientOverview,
  AppClientContactHistory,
  AppClientAnalytics,
} from '~/features/clients/lib/schema';
import { requireAuth } from '~/lib/auth/middleware';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';

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

    // 🎯 핵심 4개 테이블 + 기본 정보 병렬 로딩
    const [
      // 1. 기본 고객 정보 (현재 작동하는 API)
      clientDetail,

      // 2-5. 핵심 4개 테이블 실제 API 호출
      clientExtendedDetails, // app_client_details
      clientInsuranceList, // app_client_insurance
      clientFamilyMembers, // app_client_family_members
      clientContactHistory, // app_client_contact_history (최근 10건)
    ] = await Promise.all([
      // 1. 기본 고객 정보
      import('~/api/shared/clients').then(({ getClientById }) =>
        getClientById(clientId, agentId)
      ),

      // 2. 고객 상세 정보 (app_client_details)
      import('~/api/shared/client-extended-data').then(({ getClientDetails }) =>
        getClientDetails(clientId, agentId).catch(() => null)
      ),

      // 3. 고객 보험 정보 (app_client_insurance)
      import('~/api/shared/client-extended-data').then(
        ({ getClientInsurance }) =>
          getClientInsurance(clientId, agentId).catch(() => [])
      ),

      // 4. 고객 가족 구성원 (app_client_family_members)
      import('~/api/shared/client-extended-data').then(
        ({ getClientFamilyMembers }) =>
          getClientFamilyMembers(clientId, agentId).catch(() => [])
      ),

      // 5. 고객 연락 이력 (app_client_contact_history) - 최근 10건
      import('~/api/shared/client-extended-data').then(
        ({ getClientContactHistory }) =>
          getClientContactHistory(clientId, agentId, 10).catch(() => [])
      ),
    ]);

    if (!clientDetail) {
      console.log('⚠️ 고객을 찾을 수 없음, 빈 상태 처리');
      return {
        client: null,
        currentUserId: agentId,
        isEmpty: true,
      };
    }

    console.log('✅ 고객 전체 정보 로드 완료:', {
      clientName: clientDetail.fullName,
      hasExtendedDetails: !!clientExtendedDetails,
      insuranceCount: clientInsuranceList?.length || 0,
      familyMembersCount: clientFamilyMembers?.length || 0,
      contactHistoryCount: clientContactHistory?.length || 0,
    });

    // 🎯 통합 고객 프로필 구성 (실제 데이터 병합)
    const enhancedClient = {
      // 기본 정보
      ...clientDetail,

      // 실제 확장 정보 병합
      extendedDetails: clientExtendedDetails,
      insurance: clientInsuranceList || [],
      familyMembers: clientFamilyMembers || [],
      contactHistory: clientContactHistory || [],

      // 계산된 필드들 (실제 데이터 기반)
      referralCount: 0, // TODO: app_client_referrals 연동 시 구현
      insuranceTypes:
        clientInsuranceList?.map((insurance) => insurance.insuranceType) || [],
      totalPremium:
        clientInsuranceList?.reduce(
          (sum, insurance) => sum + parseFloat(insurance.premium || '0'),
          0
        ) || 0,
      engagementScore: 5, // TODO: app_client_analytics 연동 시 구현
      conversionProbability: 75, // TODO: app_client_analytics 연동 시 구현
      lifetimeValue: 5000000, // TODO: app_client_analytics 연동 시 구현
      lastContactDate:
        clientContactHistory?.[0]?.createdAt || clientDetail.updatedAt,
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
  const [isEditing, setIsEditing] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    importance: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  });
  const navigate = useNavigate();

  // 수정 모드 진입
  const handleEditStart = () => {
    setEditFormData({
      fullName: client?.fullName || '',
      phone: client?.phone || '',
      email: client?.email || '',
      address: client?.address || '',
      occupation: client?.occupation || '',
      importance: client?.importance || 'medium',
      notes: client?.notes || '',
    });
    setIsEditing(true);
  };

  // 수정 취소
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      importance: 'medium',
      notes: '',
    });
  };

  // 수정 저장
  const handleEditSave = async () => {
    try {
      // TODO: 실제 API 호출로 고객 정보 업데이트
      const { updateClient } = await import('~/api/shared/clients');

      const result = await updateClient(
        client.id,
        editFormData,
        client.agentId
      );

      if (result.success) {
        console.log('✅ 고객 정보 업데이트 완료');
        alert('고객 정보가 성공적으로 업데이트되었습니다.');
        setIsEditing(false);
        // TODO: 페이지 새로고침 또는 데이터 다시 로드
        window.location.reload();
      } else {
        throw new Error(result.message || '업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 고객 정보 업데이트 실패:', error);
      alert(
        `고객 정보 업데이트에 실패했습니다.\n\n${
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.'
        }`
      );
    }
  };

  // 새 영업 기회 생성 핸들러
  const handleCreateOpportunity = async (data: {
    insuranceType: string;
    notes: string;
  }) => {
    setIsCreatingOpportunity(true);

    try {
      console.log('🚀 새 영업 기회 생성 시작:', {
        clientId: client.id,
        clientName: client.fullName,
        insuranceType: data.insuranceType,
        notes: data.notes,
      });

      // TODO: 실제 API 호출로 영업 파이프라인에 추가
      // 1. 파이프라인 단계 조회
      const { getPipelineStages } = await import(
        '~/features/pipeline/lib/supabase-pipeline-data'
      );
      const stages = await getPipelineStages(client.agentId);
      const firstStage = stages.find((s) => s.name === '첫 상담') || stages[0];

      if (!firstStage) {
        throw new Error('첫 상담 단계를 찾을 수 없습니다.');
      }

      // 2. 고객을 영업 파이프라인에 추가 (새로운 영업 기회)
      const { updateClientStage, updateClient } = await import(
        '~/api/shared/clients'
      );

      // 영업 기회 메모 업데이트
      const opportunityNotes = `[${data.insuranceType} 영업] ${data.notes}`;
      const updateData = {
        notes: client.notes
          ? `${client.notes}\n\n--- 새 영업 기회 ---\n${opportunityNotes}`
          : opportunityNotes,
      };

      await updateClient(client.id, updateData, client.agentId);

      // 3. 고객 단계를 첫 상담으로 변경
      const result = await updateClientStage(
        client.id,
        firstStage.id,
        client.agentId
      );

      if (result.success) {
        console.log('✅ 새 영업 기회 생성 완료');
        alert(
          `${client.fullName} 고객의 새 영업 기회가 생성되었습니다!\n\n` +
            `상품: ${getInsuranceTypeName(data.insuranceType)}\n` +
            `상태: 영업 파이프라인 '첫 상담' 단계에 추가됨\n\n` +
            `영업 파이프라인 페이지에서 확인할 수 있습니다.`
        );
        setShowOpportunityModal(false);
      } else {
        throw new Error(result.message || '영업 기회 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 영업 기회 생성 실패:', error);
      alert(
        `영업 기회 생성에 실패했습니다.\n\n${
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.'
        }`
      );
    } finally {
      setIsCreatingOpportunity(false);
    }
  };

  // 보험 타입 이름 변환 함수
  const getInsuranceTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      auto: '자동차보험',
      life: '생명보험',
      health: '건강보험',
      home: '주택보험',
      business: '사업자보험',
    };
    return typeMap[type] || type;
  };

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

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            VIP 고객
          </Badge>
        );
      case 'medium':
        return <Badge variant="secondary">일반 고객</Badge>;
      case 'low':
        return <Badge variant="outline">일반 고객</Badge>;
      default:
        return <Badge variant="outline">{importance}</Badge>;
    }
  };

  return (
    <MainLayout title={`${client.fullName} - 고객 상세`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🎯 헤더 섹션 */}
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
              variant="outline"
              onClick={() => setShowOpportunityModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />새 영업 기회
            </Button>

            {!isEditing ? (
              <Button variant="outline" onClick={handleEditStart}>
                <Edit2 className="h-4 w-4 mr-2" />
                수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEditCancel}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button onClick={handleEditSave}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleDeleteClient}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>

        {/* 🎯 메인 컨텐츠 - 이력서 스타일 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 - 기본 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                {isEditing ? (
                  <Input
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="text-center text-lg font-semibold"
                    placeholder="고객명"
                  />
                ) : (
                  <CardTitle className="text-xl">{client.fullName}</CardTitle>
                )}
                <div className="flex justify-center">
                  {getImportanceBadge(client.importance)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 연락처 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="전화번호"
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-sm">{client.phone}</span>
                    )}
                  </div>

                  {(client.email || isEditing) && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData.email}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                          placeholder="이메일"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">{client.email}</span>
                      )}
                    </div>
                  )}

                  {(client.address || isEditing) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      {isEditing ? (
                        <Input
                          value={editFormData.address}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              address: e.target.value,
                            })
                          }
                          placeholder="주소"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm leading-relaxed">
                          {client.address}
                        </span>
                      )}
                    </div>
                  )}

                  {(client.occupation || isEditing) && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editFormData.occupation}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              occupation: e.target.value,
                            })
                          }
                          placeholder="직업"
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm">{client.occupation}</span>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* 고객 단계 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">현재 단계</h4>
                  <Badge
                    variant="outline"
                    className="w-full justify-center h-10 text-md font-semibold"
                  >
                    {client.currentStage?.name || '미설정'}
                  </Badge>
                </div>

                {isEditing && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">중요도</h4>
                      <Select
                        value={editFormData.importance}
                        onValueChange={(value: 'high' | 'medium' | 'low') =>
                          setEditFormData({
                            ...editFormData,
                            importance: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="중요도 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">VIP 고객</SelectItem>
                          <SelectItem value="medium">일반 고객</SelectItem>
                          <SelectItem value="low">일반 고객</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* KPI 요약 */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">성과 요약</h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="text-sm font-medium">500만원</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">소개</p>
                      <p className="text-sm font-medium">
                        {client.referralCount || 0}건
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="insurance">보험</TabsTrigger>
                <TabsTrigger value="family">가족</TabsTrigger>
                <TabsTrigger value="history">이력</TabsTrigger>
              </TabsList>

              {/* 개요 탭 */}
              <TabsContent value="overview" className="space-y-6">
                {/* 메모 섹션 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      메모 및 특이사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editFormData.notes}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="고객에 대한 메모를 입력하세요..."
                        className="min-h-[120px] resize-none"
                      />
                    ) : client.notes ? (
                      <div className="p-4 bg-muted/20 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {client.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          메모가 없습니다
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditStart}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          메모 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 태그 섹션 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      태그
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {client.tags && client.tags.length > 0 ? (
                        client.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-center py-6 w-full">
                          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
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
              </TabsContent>

              {/* 보험 탭 */}
              <TabsContent value="insurance" className="space-y-6">
                {/* 계약 완료된 보험 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      계약 완료 보험 (
                      {client.insurance?.filter((ins: any) => ins.isActive)
                        .length || 0}
                      건)
                    </CardTitle>
                    <CardDescription>
                      현재 유효한 보험 계약 목록
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {client.insurance &&
                    client.insurance.filter((ins: any) => ins.isActive).length >
                      0 ? (
                      <div className="space-y-4">
                        {client.insurance
                          .filter((ins: any) => ins.isActive)
                          .map((insurance: any) => (
                            <Card
                              key={insurance.id}
                              className="border-l-4 border-l-green-500"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-green-600" />
                                      <h4 className="font-medium">
                                        {insurance.insuranceType}
                                      </h4>
                                      {insurance.policyNumber && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {insurance.policyNumber}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      {insurance.insurer && (
                                        <p>
                                          <strong>보험사:</strong>{' '}
                                          {insurance.insurer}
                                        </p>
                                      )}
                                      {insurance.premium && (
                                        <p>
                                          <strong>보험료:</strong>{' '}
                                          {Number(
                                            insurance.premium
                                          ).toLocaleString()}
                                          원
                                        </p>
                                      )}
                                      {insurance.coverageAmount && (
                                        <p>
                                          <strong>보장금액:</strong>{' '}
                                          {Number(
                                            insurance.coverageAmount
                                          ).toLocaleString()}
                                          원
                                        </p>
                                      )}
                                      {insurance.startDate &&
                                        insurance.endDate && (
                                          <p>
                                            <strong>보장기간:</strong>{' '}
                                            {insurance.startDate} ~{' '}
                                            {insurance.endDate}
                                          </p>
                                        )}
                                      {insurance.beneficiary && (
                                        <p>
                                          <strong>수익자:</strong>{' '}
                                          {insurance.beneficiary}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <Edit2 className="h-3 w-3 mr-1" />
                                      수정
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          계약 완료된 보험이 없습니다
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          보험 정보 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 진행 중인 영업 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      진행 중인 영업 ({0}건)
                    </CardTitle>
                    <CardDescription>
                      현재 영업 파이프라인에서 진행 중인 상품들
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        진행 중인 영업 기회가 없습니다
                      </p>
                      <Button onClick={() => setShowOpportunityModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />첫 번째 영업 기회 생성
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 가족 탭 */}
              <TabsContent value="family" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      가족 구성원 ({client.familyMembers?.length || 0}명)
                    </CardTitle>
                    <CardDescription>
                      가족 단위 보험 설계를 위한 구성원 정보
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {client.familyMembers && client.familyMembers.length > 0 ? (
                      <div className="space-y-4">
                        {client.familyMembers.map((member: any) => (
                          <Card
                            key={member.id}
                            className="border-l-4 border-l-purple-500"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium">
                                      {member.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.relationship}
                                    </Badge>
                                    {member.hasInsurance && (
                                      <Badge className="text-xs bg-green-100 text-green-700">
                                        보험 가입
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    {member.birthDate && (
                                      <p>
                                        <strong>생년월일:</strong>{' '}
                                        {new Date(
                                          member.birthDate
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                    {member.gender && (
                                      <p>
                                        <strong>성별:</strong>{' '}
                                        {member.gender === 'male'
                                          ? '남성'
                                          : '여성'}
                                      </p>
                                    )}
                                    {member.occupation && (
                                      <p>
                                        <strong>직업:</strong>{' '}
                                        {member.occupation}
                                      </p>
                                    )}
                                    {member.phone && (
                                      <p>
                                        <strong>연락처:</strong> {member.phone}
                                      </p>
                                    )}
                                    {member.notes && (
                                      <p>
                                        <strong>메모:</strong> {member.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit2 className="h-3 w-3 mr-1" />
                                    수정
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          등록된 가족 구성원이 없습니다
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          가족 구성원 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 이력 탭 */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      연락 이력 ({client.contactHistory?.length || 0}건)
                    </CardTitle>
                    <CardDescription>
                      고객과의 모든 상담 및 연락 기록
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {client.contactHistory &&
                    client.contactHistory.length > 0 ? (
                      <div className="space-y-4">
                        {client.contactHistory.map((contact: any) => (
                          <Card
                            key={contact.id}
                            className="border-l-4 border-l-blue-500"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium">
                                      {contact.subject || contact.contactMethod}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {contact.contactMethod}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        contact.createdAt
                                      ).toLocaleDateString()}{' '}
                                      {new Date(
                                        contact.createdAt
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    {contact.content && (
                                      <p>
                                        <strong>내용:</strong> {contact.content}
                                      </p>
                                    )}
                                    {contact.duration && (
                                      <p>
                                        <strong>통화시간:</strong>{' '}
                                        {contact.duration}분
                                      </p>
                                    )}
                                    {contact.outcome && (
                                      <p>
                                        <strong>결과:</strong> {contact.outcome}
                                      </p>
                                    )}
                                    {contact.nextAction && (
                                      <p>
                                        <strong>다음 액션:</strong>{' '}
                                        {contact.nextAction}
                                      </p>
                                    )}
                                    {contact.nextActionDate && (
                                      <p>
                                        <strong>다음 액션 예정일:</strong>{' '}
                                        {new Date(
                                          contact.nextActionDate
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit2 className="h-3 w-3 mr-1" />
                                    수정
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {client.contactHistory.length >= 10 && (
                          <div className="text-center">
                            <Button variant="outline" size="sm">
                              더 많은 이력 보기
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          연락 이력이 없습니다
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          연락 기록 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 🚀 새 영업 기회 모달 */}
        <NewOpportunityModal
          isOpen={showOpportunityModal}
          onClose={() => setShowOpportunityModal(false)}
          onConfirm={handleCreateOpportunity}
          clientName={client.fullName}
          isLoading={isCreatingOpportunity}
        />

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
      </div>
    </MainLayout>
  );
}
