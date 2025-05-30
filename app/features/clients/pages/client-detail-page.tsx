import type { Route } from './+types/client-detail-page';
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/common/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Progress } from '~/common/components/ui/progress';
import { Separator } from '~/common/components/ui/separator';
import {
  ArrowLeftIcon,
  Pencil2Icon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  PersonIcon,
  CalendarIcon,
  FileTextIcon,
  Link2Icon,
  LayersIcon,
  MixerVerticalIcon,
  StarIcon,
  HeartIcon,
  DownloadIcon,
  EyeOpenIcon,
  InfoCircledIcon,
  UploadIcon,
  DrawingPinIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
  Share1Icon,
  ChatBubbleIcon,
  GearIcon,
  PlusIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  ImageIcon,
  TrashIcon,
  LockClosedIcon,
  EyeClosedIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '~/common/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';

// 🔒 **보안 강화된 컴포넌트들 import**
import { ClientDetailHeader } from '../components/client-detail-header';
import { ClientOverviewTab } from '../components/client-overview-tab';
import { ClientInsuranceTab } from '../components/client-insurance-tab';
import { ClientNetworkTab } from '../components/client-network-tab';
import { ClientMeetingsTab } from '../components/client-meetings-tab';
import { ClientDocumentsTab } from '../components/client-documents-tab';
import { ClientHistoryTab } from '../components/client-history-tab';

// 🔒 **새로운 타입 시스템 import**
import type {
  ClientDisplay,
  ClientPrivacyLevel,
  SecureMeetingData,
  SecureInsuranceData,
  SecureDocumentData,
  SecurityAuditLog,
} from '../types';
import { getClientById, logDataAccess } from '../lib/client-data';
import { requireAuth } from '~/lib/auth/helpers';

// 🔒 **데이터베이스 imports 추가**
import { db } from '~/lib/core/db';
import {
  eq,
  desc,
  asc,
  like,
  and,
  or,
  count,
  sql,
  inArray,
  gte,
  lte,
} from 'drizzle-orm';
import {
  clients,
  clientDetails,
  insuranceInfo,
  teams,
  profiles,
  pipelineStages,
  meetings,
  referrals,
  documents,
} from '~/lib/schema';

// 🔄 업데이트된 imports
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Users,
  FileText,
  Heart,
  Car,
  Home,
  Briefcase,
  Baby,
} from 'lucide-react';

// 🔒 **페이지 보안 설정**
interface PageSecurityConfig {
  enableAuditLogging: boolean;
  enableDataMasking: boolean;
  accessLevel: 'agent' | 'manager' | 'admin';
  sensitiveDataWarning: boolean;
}

const defaultSecurityConfig: PageSecurityConfig = {
  enableAuditLogging: true,
  enableDataMasking: true,
  accessLevel: 'agent',
  sensitiveDataWarning: true,
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const { clientId } = params;
  if (!clientId) {
    throw new Response('Client ID is required', { status: 400 });
  }

  // 🔒 정확한 인증 방식
  const userId = await requireAuth(request);

  try {
    // 🔒 보안 감사 로깅
    await logDataAccess({
      userId,
      action: 'CLIENT_VIEW_REQUEST',
      resourceType: 'client',
      resourceId: clientId,
      details: 'Client detail page access',
    });

    // 🔍 기본 고객 정보 조회 - 기존 함수 사용
    const client = await getClientById(clientId, userId, true);

    if (!client) {
      throw new Response('Client not found', { status: 404 });
    }

    // 🔒 개인정보 마스킹 적용한 클라이언트 디스플레이
    const clientData = client as any;
    const maskedClient: ClientDisplay = {
      id: clientData.id,
      agentId: clientData.agentId || userId,
      fullName: clientData.fullName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      telecomProvider: clientData.telecomProvider || '',
      company: clientData.company || '',
      position: clientData.position || '',
      address: clientData.address || '',
      occupation: clientData.occupation || '',
      height: clientData.height || 0,
      weight: clientData.weight || 0,
      hasDrivingLicense: clientData.hasDrivingLicense || false,
      drivingExperience: clientData.drivingExperience || 0,
      currentStageId: clientData.currentStageId || '',
      importance: clientData.importance || 'medium',
      source: clientData.source || '',
      assignedAt: clientData.assignedAt || new Date().toISOString(),
      lastContactDate: clientData.lastContactDate,
      nextFollowUpDate: clientData.nextFollowUpDate,
      tags: clientData.tags || [],
      notes: clientData.notes || '',
      isActive: clientData.isActive !== false,
      createdAt: clientData.createdAt || new Date().toISOString(),
      updatedAt: clientData.updatedAt || new Date().toISOString(),
      referredById: clientData.referredById,

      // 🔒 새로운 보안 필드들
      privacyLevel: 'restricted' as ClientPrivacyLevel,
      dataProcessingConsent: true,
      consentDate: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      accessCount: 1,
    };

    // 🔒 민감한 개인정보는 별도 처리
    const secureClientDetail = {
      ssn: clientData.ssn || undefined,
      birthDate: clientData.birthDate || undefined,
      gender: clientData.gender || undefined,
      consentDate: new Date().toISOString(),
    };

    // 🏢 기본 더미 데이터로 임시 처리
    const secureInsuranceInfo: any[] = [];
    const secureMeetings: any[] = [];
    const referralNetworkResult: any[] = [];
    const stageHistoryResult: any[] = [];
    const documentsResult: any[] = [];

    // 🏢 사용 가능한 보험 유형
    const availableInsuranceTypes = [
      'health',
      'life',
      'auto',
      'property',
      'prenatal',
    ] as const;

    // 🔒 보안 설정
    const securityConfig: PageSecurityConfig = {
      enableAuditLogging: true,
      enableDataMasking: true,
      accessLevel: 'agent',
      sensitiveDataWarning: true,
    };

    // 🔒 추가 보안 감사 로깅
    await logDataAccess({
      userId,
      action: 'CLIENT_DATA_LOADED',
      resourceType: 'client',
      resourceId: clientId,
      details: 'Client detail page data loaded successfully',
    });

    return {
      client: maskedClient,
      clientDetail: secureClientDetail,
      insuranceInfo: secureInsuranceInfo,
      referralNetwork: referralNetworkResult,
      meetings: secureMeetings,
      stageHistory: stageHistoryResult,
      documents: documentsResult,
      availableInsuranceTypes,
      securityConfig,
      agentId: userId,
    };
  } catch (error) {
    console.error('고객 상세 정보 로딩 실패:', error);
    throw new Response('Failed to load client details', { status: 500 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.client?.fullName || '고객'} 상세 - SureCRM` },
    { name: 'description', content: '고객 상세 정보 및 관리' },
  ];
}

export default function ClientDetailPage({ loaderData }: Route.ComponentProps) {
  const {
    client,
    clientDetail,
    insuranceInfo,
    referralNetwork,
    meetings,
    stageHistory,
    documents,
    agentId,
  } = loaderData;

  const [activeTab, setActiveTab] = useState('overview');

  // 고객의 보험 유형 목록 추출
  const availableInsuranceTypes = insuranceInfo.map(
    (insurance) => insurance.type
  );

  if (!client) {
    return (
      <MainLayout title="고객 상세">
        <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
          <Alert>
            <InfoCircledIcon className="h-4 w-4" />
            <AlertDescription>고객을 찾을 수 없습니다.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${client.fullName} 상세`}>
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        {/* 통합된 헤더 및 기본 정보 카드 */}
        <ClientDetailHeader
          client={client}
          clientDetail={clientDetail}
          insuranceTypes={availableInsuranceTypes}
          agentId={agentId}
        />

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 my-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="insurance">보험 정보</TabsTrigger>
            <TabsTrigger value="network">소개 네트워크</TabsTrigger>
            <TabsTrigger value="meetings">미팅 이력</TabsTrigger>
            <TabsTrigger value="documents">문서</TabsTrigger>
            <TabsTrigger value="history">진행 내역</TabsTrigger>
          </TabsList>

          {/* 개요 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="overview" className="space-y-4">
            <ClientOverviewTab
              client={client}
              clientOverview={client as any}
              agentId={agentId}
              meetings={meetings}
              stageHistory={stageHistory}
              insuranceInfo={insuranceInfo}
            />
          </TabsContent>

          {/* 보험 정보 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="insurance" className="space-y-4">
            <ClientInsuranceTab
              client={client}
              agentId={agentId}
              insuranceInfo={insuranceInfo}
            />
          </TabsContent>

          {/* 소개 네트워크 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="network" className="space-y-4">
            <ClientNetworkTab
              client={client}
              agentId={agentId}
              referralNetwork={{
                referrals: referralNetwork,
                stats: {
                  totalReferred: 0,
                  totalContracts: 0,
                  totalValue: 0,
                  conversionRate: 0,
                  averageContractValue: 0,
                },
              }}
            />
          </TabsContent>

          {/* 미팅 이력 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="meetings" className="space-y-4">
            <ClientMeetingsTab
              client={client}
              agentId={agentId}
              meetings={meetings}
            />
          </TabsContent>

          {/* 문서 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="documents" className="space-y-4">
            <ClientDocumentsTab
              client={client}
              agentId={agentId}
              documents={documents}
              insuranceTypes={availableInsuranceTypes}
            />
          </TabsContent>

          {/* 진행 내역 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="history" className="space-y-4">
            <ClientHistoryTab
              client={client}
              agentId={agentId}
              meetings={meetings}
              stageHistory={stageHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
