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
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
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
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';

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
    status: 'active',
    stage: '첫 상담',
    importance: 'high',
    referredBy: {
      id: '2',
      name: '박철수',
      phone: '010-9999-8888',
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
    createdAt: '2023-03-15T09:30:00.000Z',
    updatedAt: '2023-04-02T14:15:00.000Z',
  };

  // 민감 정보 (암호화되어 저장)
  const clientDetail = {
    ssn: '******-1234567', // 마스킹된 주민등록번호
    birthDate: '1990-05-15',
    gender: 'female',
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
      status: 'active',
      details: {
        vehicleNumber: '12가3456',
        ownerName: '김영희',
        vehicleType: '승용차',
        manufacturer: '현대',
        model: '아반떼',
        year: 2022,
      },
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      type: 'health',
      status: 'reviewing',
      details: {
        healthConditions: ['고혈압'],
        previousSurgeries: [],
        currentMedications: ['혈압약'],
        familyHistory: ['당뇨병 (부모)'],
      },
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
        relationship: '대학 동기',
      },
      {
        id: '11',
        name: '최지영',
        stage: '상품 설명',
        contractAmount: 25000000,
        relationship: '직장 동료',
      },
      {
        id: '12',
        name: '한성호',
        stage: '계약 완료',
        contractAmount: 40000000,
        relationship: '친척',
      },
    ],
    // 이 고객을 소개한 사람의 다른 소개
    siblingReferrals: [
      { id: '20', name: '강미선', stage: '첫 상담', contractAmount: 20000000 },
      {
        id: '21',
        name: '윤태경',
        stage: '계약 검토',
        contractAmount: 35000000,
      },
    ],
  };

  const meetings = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:00',
      type: '첫 상담',
      location: '고객 사무실',
      duration: 60,
      notes: '보험 필요성에 대해 긍정적 반응. 다음 미팅에서 상품 제안 예정',
      status: 'completed',
      checklist: [
        { item: '니즈 파악', completed: true },
        { item: '현재 보험 현황 확인', completed: true },
        { item: '예산 범위 논의', completed: false },
      ],
    },
    {
      id: '2',
      date: '2024-01-20',
      time: '14:00',
      type: '상품 설명',
      location: '카페 스타벅스 강남점',
      duration: 90,
      notes: '',
      status: 'scheduled',
      checklist: [
        { item: '상품 자료 준비', completed: true },
        { item: '견적서 작성', completed: false },
        { item: '약관 설명', completed: false },
      ],
    },
  ];

  const stageHistory = [
    {
      stage: '첫 상담',
      date: '2024-01-15',
      note: '초기 상담 완료',
      agent: '김설계사',
    },
    {
      stage: '리드 생성',
      date: '2024-01-10',
      note: '박철수님 소개로 연락',
      agent: '김설계사',
    },
  ];

  const documents = [
    {
      id: '1',
      name: '신분증 사본.pdf',
      type: 'id_card',
      size: '2.3MB',
      uploadDate: '2024-01-15',
      description: '주민등록증 앞뒤 스캔본',
    },
    {
      id: '2',
      name: '회사 재직증명서.pdf',
      type: 'employment',
      size: '1.8MB',
      uploadDate: '2024-01-15',
      description: '소득 확인용 재직증명서',
    },
    {
      id: '3',
      name: '차량등록증.jpg',
      type: 'vehicle_registration',
      size: '1.2MB',
      uploadDate: '2024-01-16',
      description: '자동차보험 가입용 차량등록증',
      relatedInsurance: 'auto',
    },
    {
      id: '4',
      name: '차량사진_정면.jpg',
      type: 'vehicle_photo',
      size: '3.5MB',
      uploadDate: '2024-01-16',
      description: '번호판이 보이는 차량 정면 사진',
      relatedInsurance: 'auto',
    },
    {
      id: '5',
      name: '계기판사진.jpg',
      type: 'dashboard_photo',
      size: '2.1MB',
      uploadDate: '2024-01-16',
      description: '주행거리 확인용 계기판 사진',
      relatedInsurance: 'auto',
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

  const [activeTab, setActiveTab] = useState('basic');

  if (!client) {
    return (
      <MainLayout title="고객 상세">
        <div className="container p-6 mx-auto">
          <p>고객을 찾을 수 없습니다.</p>
        </div>
      </MainLayout>
    );
  }

  // 중요도별 배지 색상
  const importanceBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  };

  const importanceText: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  // 영업 단계별 배지 색상
  const stageBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
  };

  // 보험 유형별 아이콘과 라벨
  const insuranceTypes: Record<
    string,
    { icon: React.ReactNode; label: string; color: string }
  > = {
    life: {
      icon: <HeartIcon className="h-4 w-4" />,
      label: '생명보험',
      color: 'bg-red-500',
    },
    health: {
      icon: <HeartIcon className="h-4 w-4" />,
      label: '건강보험',
      color: 'bg-green-500',
    },
    auto: {
      icon: <MixerVerticalIcon className="h-4 w-4" />,
      label: '자동차보험',
      color: 'bg-blue-500',
    },
    prenatal: {
      icon: <StarIcon className="h-4 w-4" />,
      label: '태아보험',
      color: 'bg-pink-500',
    },
    property: {
      icon: <LayersIcon className="h-4 w-4" />,
      label: '재산보험',
      color: 'bg-yellow-500',
    },
  };

  // 문서 유형별 아이콘
  const documentTypes: Record<
    string,
    { icon: React.ReactNode; label: string }
  > = {
    id_card: { icon: <PersonIcon className="h-4 w-4" />, label: '신분증' },
    employment: {
      icon: <FileTextIcon className="h-4 w-4" />,
      label: '재직증명서',
    },
    vehicle_registration: {
      icon: <MixerVerticalIcon className="h-4 w-4" />,
      label: '차량등록증',
    },
    vehicle_photo: {
      icon: <MixerVerticalIcon className="h-4 w-4" />,
      label: '차량사진',
    },
    dashboard_photo: {
      icon: <MixerVerticalIcon className="h-4 w-4" />,
      label: '계기판사진',
    },
    blackbox_photo: {
      icon: <MixerVerticalIcon className="h-4 w-4" />,
      label: '블랙박스사진',
    },
    policy: { icon: <LayersIcon className="h-4 w-4" />, label: '보험증권' },
    other: { icon: <FileTextIcon className="h-4 w-4" />, label: '기타문서' },
  };

  return (
    <MainLayout title={`${client.name} 상세`}>
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="text-muted-foreground">
                {client.company} • {client.position}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stageBadgeVariant[client.stage]}>
              {client.stage}
            </Badge>
            <Badge variant={importanceBadgeVariant[client.importance]}>
              {importanceText[client.importance]}
            </Badge>
            <Link to={`/clients/edit/${client.id}`}>
              <Button>
                <Pencil2Icon className="mr-2 h-4 w-4" />
                편집
              </Button>
            </Link>
          </div>
        </div>

        {/* 기본 정보 카드 - 확장된 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {client.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  <p className="text-muted-foreground">{client.position}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {clientDetail.gender === 'female' ? '여성' : '남성'} •{' '}
                      {new Date().getFullYear() -
                        new Date(clientDetail.birthDate).getFullYear()}
                      세
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MobileIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span>{client.phone}</span>
                    <p className="text-xs text-muted-foreground">
                      {client.telecomProvider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span>{client.company}</span>
                    <p className="text-xs text-muted-foreground">
                      {client.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">직업 상세:</span>
                  <p className="text-sm text-muted-foreground">
                    {client.occupation}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">신체 정보:</span>
                  <p className="text-sm text-muted-foreground">
                    키 {client.height}cm, 몸무게 {client.weight}kg
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">운전면허:</span>
                  <Badge
                    variant={client.hasDrivingLicense ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {client.hasDrivingLicense ? '있음' : '없음'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">소개자:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <PersonIcon className="h-4 w-4 text-muted-foreground" />
                    <Link
                      to={`/clients/${client.referredBy.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {client.referredBy.name}
                    </Link>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">최근 접촉:</span>
                  <p className="text-muted-foreground">
                    {client.lastContactDate}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">예상 계약금액:</span>
                  <p className="font-semibold">
                    {client.contractAmount.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* 개인정보 동의 현황 */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <InfoCircledIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  개인정보 처리 동의 현황
                </span>
                <span className="text-xs text-muted-foreground">
                  (동의일:{' '}
                  {new Date(clientDetail.consentDate).toLocaleDateString()})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      clientDetail.consentDetails.personalInfo
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>개인정보 수집·이용</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      clientDetail.consentDetails.marketing
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>마케팅 활용</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      clientDetail.consentDetails.thirdPartySharing
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>제3자 제공</span>
                </div>
              </div>
            </div>

            {/* 태그 */}
            <div className="mt-4">
              <span className="text-sm font-medium mb-2 block">태그:</span>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 메모 */}
            {client.notes && (
              <div className="mt-4">
                <span className="text-sm font-medium mb-2 block">메모:</span>
                <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {client.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 다음 미팅 정보 */}
        {client.nextMeeting && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                다음 미팅
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">날짜</div>
                  <p>{client.nextMeeting.date}</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">시간</div>
                  <p>{client.nextMeeting.time}</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">유형</div>
                  <Badge className="text-sm" variant="outline">
                    {client.nextMeeting.type}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">장소</div>
                  <p>{client.nextMeeting.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 탭 섹션 - 보험정보 탭 추가 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">소개 관계</TabsTrigger>
            <TabsTrigger value="insurance">보험 정보</TabsTrigger>
            <TabsTrigger value="history">영업 히스토리</TabsTrigger>
            <TabsTrigger value="meetings">미팅 기록</TabsTrigger>
            <TabsTrigger value="documents">문서 관리</TabsTrigger>
            <TabsTrigger value="network">네트워크 뷰</TabsTrigger>
          </TabsList>

          {/* 소개 관계 탭 */}
          <TabsContent value="basic" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>이 고객이 소개한 사람들</CardTitle>
                  <CardDescription>
                    총 {referralNetwork.referrals.length}명
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralNetwork.referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <Link
                            to={`/clients/${referral.id}`}
                            className="font-medium hover:underline"
                          >
                            {referral.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {referral.contractAmount.toLocaleString()}원
                          </p>
                        </div>
                        <Badge variant={stageBadgeVariant[referral.stage]}>
                          {referral.stage}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>같은 소개자의 다른 고객들</CardTitle>
                  <CardDescription>
                    {client.referredBy.name}님이 소개한 다른 고객들
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralNetwork.siblingReferrals.map((sibling) => (
                      <div
                        key={sibling.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <Link
                            to={`/clients/${sibling.id}`}
                            className="font-medium hover:underline"
                          >
                            {sibling.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {sibling.contractAmount.toLocaleString()}원
                          </p>
                        </div>
                        <Badge variant={stageBadgeVariant[sibling.stage]}>
                          {sibling.stage}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 보험 정보 탭 */}
          <TabsContent value="insurance" className="mt-6">
            <div className="space-y-6">
              {/* 현재 보험 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayersIcon className="h-5 w-5" />
                    현재 보험 정보
                  </CardTitle>
                  <CardDescription>
                    고객이 가입 중이거나 검토 중인 보험 정보
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insuranceInfo.map((info) => (
                      <div key={info.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {insuranceTypes[info.type].icon}
                            <h4 className="font-medium">
                              {insuranceTypes[info.type].label}
                            </h4>
                          </div>
                          <Badge
                            variant={
                              info.status === 'active' ? 'default' : 'outline'
                            }
                          >
                            {info.status === 'active' ? '가입완료' : '검토중'}
                          </Badge>
                        </div>

                        {info.type === 'auto' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">차량번호:</span>
                              <p className="text-muted-foreground">
                                {info.details.vehicleNumber}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">소유자:</span>
                              <p className="text-muted-foreground">
                                {info.details.ownerName}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">제조사:</span>
                              <p className="text-muted-foreground">
                                {info.details.manufacturer} {info.details.model}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">연식:</span>
                              <p className="text-muted-foreground">
                                {info.details.year}년
                              </p>
                            </div>
                          </div>
                        )}

                        {info.type === 'health' && (
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium">기존 질환:</span>
                              <p className="text-muted-foreground">
                                {info.details.healthConditions &&
                                info.details.healthConditions.length > 0
                                  ? info.details.healthConditions.join(', ')
                                  : '없음'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">
                                복용 중인 약물:
                              </span>
                              <p className="text-muted-foreground">
                                {info.details.currentMedications &&
                                info.details.currentMedications.length > 0
                                  ? info.details.currentMedications.join(', ')
                                  : '없음'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">가족력:</span>
                              <p className="text-muted-foreground">
                                {info.details.familyHistory &&
                                info.details.familyHistory.length > 0
                                  ? info.details.familyHistory.join(', ')
                                  : '없음'}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-muted-foreground">
                          등록일: {info.createdAt}
                        </div>
                      </div>
                    ))}

                    {insuranceInfo.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <LayersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>등록된 보험 정보가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 보험 상품 추천 */}
              <Card>
                <CardHeader>
                  <CardTitle>보험 상품 추천</CardTitle>
                  <CardDescription>
                    고객 프로필을 바탕으로 한 맞춤 상품 추천
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <InfoCircledIcon className="h-4 w-4" />
                    <AlertDescription>
                      고객의 나이(
                      {new Date().getFullYear() -
                        new Date(clientDetail.birthDate).getFullYear()}
                      세), 성별(
                      {clientDetail.gender === 'female' ? '여성' : '남성'}),
                      직업({client.occupation}), 운전면허 보유 여부를 고려한
                      상품을 추천해드립니다.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 영업 히스토리 탭 */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>영업 단계 히스토리</CardTitle>
                <CardDescription>
                  고객의 영업 진행 과정과 주요 이벤트
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stageHistory.map((history, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={stageBadgeVariant[history.stage]}>
                            {history.stage}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {history.date}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {history.agent}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {history.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 미팅 기록 탭 */}
          <TabsContent value="meetings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>미팅 기록</CardTitle>
                <CardDescription>총 {meetings.length}회 미팅</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">{meeting.type}</h4>
                        </div>
                        <Badge
                          variant={
                            meeting.status === 'completed'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {meeting.status === 'completed' ? '완료' : '예정'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="font-medium">날짜:</span>
                          <p className="text-muted-foreground">
                            {meeting.date}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">시간:</span>
                          <p className="text-muted-foreground">
                            {meeting.time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">소요시간:</span>
                          <p className="text-muted-foreground">
                            {meeting.duration}분
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">장소:</span>
                          <p className="text-muted-foreground">
                            {meeting.location}
                          </p>
                        </div>
                      </div>

                      {meeting.notes && (
                        <div className="mb-3">
                          <span className="text-sm font-medium">
                            미팅 노트:
                          </span>
                          <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                            {meeting.notes}
                          </p>
                        </div>
                      )}

                      {meeting.checklist && meeting.checklist.length > 0 && (
                        <div>
                          <span className="text-sm font-medium mb-2 block">
                            체크리스트:
                          </span>
                          <div className="space-y-1">
                            {meeting.checklist.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    item.completed
                                      ? 'bg-primary border-primary'
                                      : 'border-muted-foreground'
                                  }`}
                                >
                                  {item.completed && (
                                    <span className="text-primary-foreground text-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={
                                    item.completed
                                      ? 'line-through text-muted-foreground'
                                      : ''
                                  }
                                >
                                  {item.item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 문서 관리 탭 */}
          <TabsContent value="documents" className="mt-6">
            <div className="space-y-6">
              {/* 문서 업로드 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5" />
                    문서 업로드
                  </CardTitle>
                  <CardDescription>
                    고객 관련 문서를 업로드하고 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <Button variant="outline" size="sm">
                      파일 선택
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 문서 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle>업로드된 문서</CardTitle>
                  <CardDescription>
                    총 {documents.length}개 문서
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {documentTypes[doc.type]?.icon || (
                            <FileTextIcon className="h-4 w-4" />
                          )}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {documentTypes[doc.type]?.label || '기타'}
                              </span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.uploadDate}</span>
                              {doc.relatedInsurance && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {
                                      insuranceTypes[doc.relatedInsurance]
                                        ?.label
                                    }
                                  </Badge>
                                </>
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <EyeOpenIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileTextIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>업로드된 문서가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 필요 문서 체크리스트 */}
              <Card>
                <CardHeader>
                  <CardTitle>필요 문서 체크리스트</CardTitle>
                  <CardDescription>
                    보험 유형별 필요한 문서들을 확인하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 기본 문서 */}
                    <div>
                      <h4 className="font-medium mb-2">기본 문서</h4>
                      <div className="space-y-2 text-sm">
                        {['신분증 사본', '재직증명서'].map((docName) => {
                          const hasDoc = documents.some(
                            (doc) =>
                              (doc.type === 'id_card' &&
                                docName.includes('신분증')) ||
                              (doc.type === 'employment' &&
                                docName.includes('재직증명서'))
                          );
                          return (
                            <div
                              key={docName}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  hasDoc
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-muted-foreground'
                                }`}
                              >
                                {hasDoc && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <span className={hasDoc ? 'text-green-600' : ''}>
                                {docName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 자동차보험 관련 문서 */}
                    {insuranceInfo.some((info) => info.type === 'auto') && (
                      <div>
                        <h4 className="font-medium mb-2">
                          자동차보험 관련 문서
                        </h4>
                        <div className="space-y-2 text-sm">
                          {[
                            {
                              name: '차량등록증',
                              type: 'vehicle_registration',
                            },
                            { name: '차량 정면 사진', type: 'vehicle_photo' },
                            { name: '계기판 사진', type: 'dashboard_photo' },
                            { name: '블랙박스 사진', type: 'blackbox_photo' },
                          ].map((docInfo) => {
                            const hasDoc = documents.some(
                              (doc) => doc.type === docInfo.type
                            );
                            return (
                              <div
                                key={docInfo.name}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    hasDoc
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-muted-foreground'
                                  }`}
                                >
                                  {hasDoc && (
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={hasDoc ? 'text-green-600' : ''}
                                >
                                  {docInfo.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 네트워크 뷰 탭 */}
          <TabsContent value="network" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2Icon className="h-5 w-5" />
                  {client.name} 중심 소개 네트워크
                </CardTitle>
                <CardDescription>
                  이 고객을 중심으로 한 소개 관계를 시각적으로 표시
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Link2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      미니 네트워크 그래프
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {client.name}님을 중심으로 한 소개 관계도가 여기에
                      표시됩니다
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/network">전체 네트워크 보기</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
