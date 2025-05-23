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

export function loader({ request, params }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  const client = {
    id: params.id,
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    telecomProvider: 'SK텔레콤',
    company: 'ABC 회사',
    position: '마케팅 팀장',
    address: '서울시 강남구 테헤란로 123',
    occupation: '마케팅 전문가 (10년 경력, 디지털 마케팅 전문)',
    height: 165,
    weight: 55,
    hasDrivingLicense: true,
    status: 'active' as const,
    stage: '첫 상담',
    importance: 'high' as const,
    referredBy: {
      id: '2',
      name: '박철수',
      phone: '010-9999-8888',
      relationship: '대학 동기',
    },
    tags: ['VIP', '기업', '잠재'],
    notes:
      '적극적으로 보험 가입을 고려하고 있음. 주변 지인들에게도 영향력이 큼.',
    contractAmount: 50000000,
    lastContactDate: '2024-01-15',
    nextMeeting: {
      date: '2024-01-20',
      time: '14:00',
      type: '상품 설명',
      location: '카페 스타벅스 강남점',
    },
    referralCount: 3,
    referralDepth: 1,
    profileImage: null,
    createdAt: '2023-03-15T09:30:00.000Z',
    updatedAt: '2023-04-02T14:15:00.000Z',
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

  // 보험 정보
  const insuranceInfo = [
    {
      id: '1',
      type: 'auto',
      status: 'active' as const,
      details: {
        vehicleNumber: '12가3456',
        ownerName: '김영희',
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
    {
      id: '2',
      type: 'health',
      status: 'reviewing' as const,
      details: {
        healthConditions: ['고혈압'],
        previousSurgeries: [],
        currentMedications: ['혈압약'],
        familyHistory: ['당뇨병 (부모)'],
        smokingStatus: 'never',
        drinkingStatus: 'occasionally',
      },
      documents: ['id_card', 'policy'],
      premium: 1800000,
      estimatedStartDate: '2024-02-01',
      createdAt: '2024-01-16',
    },
  ];

  const referralNetwork = {
    // 이 고객이 소개한 사람들
    referrals: [
      {
        id: '10',
        name: '이민수',
        stage: '니즈 분석',
        contractAmount: 30000000,
        relationship: '회사 동료',
        phone: '010-1111-2222',
        lastContact: '2024-01-10',
      },
      {
        id: '11',
        name: '정수연',
        stage: '계약 완료',
        contractAmount: 45000000,
        relationship: '친구',
        phone: '010-3333-4444',
        lastContact: '2024-01-08',
      },
    ],
    // 같은 소개자로부터 온 고객들
    siblingReferrals: [
      {
        id: '12',
        name: '최민호',
        stage: '첫 상담',
        contractAmount: 25000000,
        relationship: '대학 동기',
        lastContact: '2024-01-12',
      },
    ],
    stats: {
      totalReferred: 3,
      totalContracts: 1,
      totalValue: 75000000,
      conversionRate: 33,
    },
  };

  const meetings = [
    {
      id: '1',
      date: '2024-01-20',
      time: '14:00',
      type: '상품 설명',
      location: '카페 스타벅스 강남점',
      duration: 90,
      notes: '생명보험 상품에 높은 관심을 보임. 가족을 위한 보장에 집중.',
      status: 'scheduled' as const,
      attendees: ['김영희', '설계사'],
      outcome: '',
      nextAction: '',
      checklist: [
        { item: '상품 설명서 준비', completed: true },
        { item: '견적서 작성', completed: false },
        { item: '계약서 준비', completed: false },
      ],
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '10:00',
      type: '첫 상담',
      location: '고객 사무실',
      duration: 60,
      notes: '니즈 분석 완료. 생명보험과 건강보험에 관심.',
      status: 'completed' as const,
      attendees: ['김영희', '설계사'],
      outcome: '상품 설명 미팅 예약',
      nextAction: '상품 설명 준비',
      checklist: [
        { item: '니즈 분석지 작성', completed: true },
        { item: '상품 추천', completed: true },
      ],
    },
  ];

  const stageHistory = [
    {
      stage: '첫 상담',
      date: '2024-01-15',
      note: '니즈 분석 완료, 생명보험 관심도 높음',
      agent: '설계사',
    },
    {
      stage: '계약 검토',
      date: '2024-01-10',
      note: '초기 상담 진행',
      agent: '설계사',
    },
  ];

  const documents = [
    {
      id: '1',
      name: '신분증 사본',
      type: 'id_card',
      size: '1.2MB',
      uploadDate: '2024-01-15',
      description: '주민등록증 앞뒤면 스캔본',
      relatedInsurance: null,
      url: '/documents/1',
    },
    {
      id: '2',
      name: '보험증권',
      type: 'policy',
      size: '2.5MB',
      uploadDate: '2024-01-15',
      description: '기존 보험 증권 사본',
      relatedInsurance: 'health',
      url: '/documents/2',
    },
    {
      id: '3',
      name: '차량등록증',
      type: 'vehicle_registration',
      size: '0.8MB',
      uploadDate: '2024-01-16',
      description: '자동차 등록증 원본 스캔',
      relatedInsurance: 'auto',
      url: '/documents/3',
    },
    {
      id: '4',
      name: '차량사진',
      type: 'vehicle_photo',
      size: '3.1MB',
      uploadDate: '2024-01-16',
      description: '차량 외관 사진 (4면)',
      relatedInsurance: 'auto',
      url: '/documents/4',
    },
    {
      id: '5',
      name: '계기판사진',
      type: 'dashboard_photo',
      size: '1.5MB',
      uploadDate: '2024-01-16',
      description: '주행거리 확인용 계기판 사진',
      relatedInsurance: 'auto',
      url: '/documents/5',
    },
  ];

  return {
    client,
    clientDetail,
    insuranceInfo,
    referralNetwork,
    meetings,
    stageHistory,
    documents,
  };
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
