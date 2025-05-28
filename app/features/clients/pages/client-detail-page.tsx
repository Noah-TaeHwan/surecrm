import type { Route } from '.react-router/types/app/features/clients/pages/+types/client-detail-page';
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

// 분리된 컴포넌트들 import
import { ClientDetailHeader } from '../components/client-detail-header';
import { ClientOverviewTab } from '../components/client-overview-tab';
import { ClientInsuranceTab } from '../components/client-insurance-tab';
import { ClientNetworkTab } from '../components/client-network-tab';
import { ClientMeetingsTab } from '../components/client-meetings-tab';
import { ClientDocumentsTab } from '../components/client-documents-tab';
import { ClientHistoryTab } from '../components/client-history-tab';
import type {
  Client,
  Meeting,
  InsuranceInfo,
  Document,
  StageHistory,
  ReferralNetwork,
} from '../components/types';
import { getClientById } from '../lib/client-data';
import { requireAuth } from '../lib/auth-utils';

export async function loader({ request, params }: Route.LoaderArgs) {
  // 인증 확인
  const userId = await requireAuth(request);

  if (!params.id) {
    throw new Response('고객 ID가 필요합니다', { status: 400 });
  }

  try {
    // 고객 정보 조회
    const clientData = await getClientById(params.id, userId);

    if (!clientData) {
      throw new Response('고객을 찾을 수 없습니다', { status: 404 });
    }

    // TODO: 실제 데이터베이스에서 가져올 데이터들
    // 현재는 더미 데이터로 대체
    const baseClient = clientData as any; // 타입 단언으로 임시 해결

    const client = {
      id: baseClient.id,
      name: baseClient.name,
      email: baseClient.email,
      phone: baseClient.phone,
      company: baseClient.company,
      status: baseClient.status,
      stage: baseClient.stage,
      importance: baseClient.importance,
      tags: baseClient.tags,
      notes: baseClient.notes,
      createdAt: baseClient.createdAt,
      updatedAt: baseClient.updatedAt,
      telecomProvider: 'SK텔레콤',
      position: baseClient.position || '마케팅 팀장',
      address: baseClient.address || '서울시 강남구 테헤란로 123',
      occupation: '마케팅 전문가 (10년 경력, 디지털 마케팅 전문)',
      height: 165,
      weight: 55,
      hasDrivingLicense: true,
      referredBy: {
        id: '2',
        name: '박철수',
        phone: '010-9999-8888',
        relationship: '대학 동기',
      },
      contractAmount: baseClient.contractAmount || 50000000,
      lastContactDate: baseClient.lastContactDate || '2024-01-15',
      nextMeeting: {
        date: '2024-01-20',
        time: '14:00',
        type: '상품 설명',
        location: '카페 스타벅스 강남점',
      },
      referralCount: baseClient.referralCount || 3,
      referralDepth: baseClient.referralDepth || 1,
      profileImage: null,
    };

    // 민감 정보 (암호화되어 저장)
    const clientDetail = {
      ssn: '******-1234567', // 마스킹된 주민등록번호
      birthDate: '1990-05-15',
      gender: 'female' as const,
      consentDate: '2024-01-15T10:30:00Z',
      consentDetails: {
        personalInfo: true,
        marketing: true,
        thirdPartySharing: false,
      },
    };

    // TODO: 실제 보험 정보, 미팅, 문서 등은 별도 함수로 조회
    const insuranceInfo = [
      {
        id: '1',
        type: 'auto',
        status: 'active' as const,
        details: {
          vehicleNumber: '12가3456',
          ownerName: client.name,
          vehicleType: '승용차',
          manufacturer: '현대',
          model: '아반떼',
          year: 2022,
          engineType: '가솔린',
          displacement: 1600,
        },
        documents: ['vehicle_registration', 'vehicle_photo', 'dashboard_photo'],
        premium: 2400000,
        startDate: '2024-01-20',
        endDate: '2025-01-19',
        createdAt: '2024-01-15',
      },
    ];

    const referralNetwork = {
      referrals: [],
      siblingReferrals: [],
      stats: {
        totalReferred: 0,
        totalContracts: 0,
        totalValue: 0,
        conversionRate: 0,
      },
    };

    const meetings: any[] = [];
    const stageHistory: any[] = [];
    const documents: any[] = [];

    return {
      client,
      clientDetail,
      insuranceInfo,
      referralNetwork,
      meetings,
      stageHistory,
      documents,
    };
  } catch (error) {
    console.error('Client Detail 페이지 로더 오류:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw new Response('서버 오류가 발생했습니다', { status: 500 });
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: `${data?.client?.name || '고객'} 상세 - SureCRM` },
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
    <MainLayout title={`${client.name} 상세`}>
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        {/* 통합된 헤더 및 기본 정보 카드 */}
        <ClientDetailHeader
          client={client}
          clientDetail={clientDetail}
          insuranceTypes={availableInsuranceTypes}
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
              referralNetwork={referralNetwork}
              meetings={meetings}
              stageHistory={stageHistory}
              insuranceInfo={insuranceInfo}
            />
          </TabsContent>

          {/* 보험 정보 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="insurance" className="space-y-4">
            <ClientInsuranceTab
              insuranceInfo={insuranceInfo}
              clientId={client.id}
            />
          </TabsContent>

          {/* 소개 네트워크 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="network" className="space-y-4">
            <ClientNetworkTab
              client={client}
              referralNetwork={referralNetwork}
            />
          </TabsContent>

          {/* 미팅 이력 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="meetings" className="space-y-4">
            <ClientMeetingsTab
              meetings={meetings}
              clientId={client.id}
              clientName={client.name}
            />
          </TabsContent>

          {/* 문서 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="documents" className="space-y-4">
            <ClientDocumentsTab
              documents={documents}
              clientId={client.id}
              clientName={client.name}
              insuranceTypes={availableInsuranceTypes}
            />
          </TabsContent>

          {/* 진행 내역 탭 - 분리된 컴포넌트 사용 */}
          <TabsContent value="history" className="space-y-4">
            <ClientHistoryTab meetings={meetings} stageHistory={stageHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
