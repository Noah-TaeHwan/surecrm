import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Textarea } from '~/common/components/ui/textarea';
import { Separator } from '~/common/components/ui/separator';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/common/components/ui/avatar';
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
import {
  ArrowLeftIcon,
  Pencil1Icon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  CalendarIcon,
  Link2Icon,
  DotsHorizontalIcon,
  ChatBubbleIcon,
  Share1Icon,
  CheckIcon,
  Cross1Icon,
  HeartIcon,
  FileTextIcon,
  TrashIcon,
  PersonIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { typeHelpers } from '../types';
import { AddMeetingModal } from './add-meeting-modal';
import { AddDocumentModal } from './add-document-modal';
import { ClientGratitudeModal } from './client-gratitude-modal';
import { logDataAccess as logClientDataAccess } from '../lib/client-data';
import { ArrowLeft, Edit2, Plus, Save, X, Trash2 } from 'lucide-react';

// 🔧 BadgeVariant 타입 정의
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

interface ClientDetailHeaderProps {
  client: ClientDisplay;
  clientDetail?: {
    ssn?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    consentDate?: string;
  };
  insuranceTypes?: string[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
  clientName: string;
  isEditing: boolean;
  isDeleting: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onDeleteClient: () => void;
  onShowOpportunityModal: () => void;
}

// 🎨 Avatar 컴포넌트 분리
function ClientAvatar({ client }: { client: ClientDisplay }) {
  const displayName = typeHelpers.getClientDisplayName(client);
  const privacyLevel = client.accessLevel || client.privacyLevel || 'private';

  return (
    <div className="relative">
      <Avatar className="h-20 w-20">
        <AvatarImage src={undefined} />
        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {/* 🔒 개인정보 보호 레벨 표시 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border">
              {privacyLevel === 'confidential' ? (
                <LockClosedIcon className="h-3 w-3 text-red-600" />
              ) : privacyLevel === 'private' ? (
                <LockClosedIcon className="h-3 w-3 text-yellow-600" />
              ) : (
                <PersonIcon className="h-3 w-3 text-green-600" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>보안 레벨: {privacyLevel}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function ClientDetailHeader({
  client,
  clientDetail,
  insuranceTypes = [],
  agentId,
  onDataAccess,
  clientName,
  isEditing,
  isDeleting,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDeleteClient,
  onShowOpportunityModal,
}: ClientDetailHeaderProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(client.notes || '');
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);

  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);

  // 🎨 중요도별 스타일 통일 (영업 파이프라인과 동일한 색상 시스템)
  const importanceStyles = {
    high: {
      borderColor: 'border-l-orange-500',
      bgGradient:
        'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
      badge:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
      icon: 'text-orange-600',
    },
    medium: {
      borderColor: 'border-l-blue-500',
      bgGradient:
        'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
      badge:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
      icon: 'text-blue-600',
    },
    low: {
      borderColor: 'border-l-muted-foreground',
      bgGradient:
        'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
      badge: 'bg-muted text-muted-foreground border-muted-foreground/20',
      icon: 'text-muted-foreground',
    },
  };

  const currentImportanceStyle =
    importanceStyles[client.importance as keyof typeof importanceStyles] ||
    importanceStyles.medium;

  // 배지 설정들 (기존 코드 교체)
  const importanceBadgeClass = currentImportanceStyle.badge;

  const importanceText: Record<string, string> = {
    high: '키맨',
    medium: '일반',
    low: '관심',
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    lead: 'outline',
    contact: 'secondary',
    proposal: 'default',
    contract: 'destructive',
  };

  // 🔒 데이터 마스킹 함수
  const maskData = (data: string, level: ClientPrivacyLevel) => {
    return typeHelpers.maskData(data, level, showConfidentialData);
  };

  // 나이 계산
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(clientDetail?.birthDate);

  // BMI 계산
  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI(client.height, client.weight);

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '저체중', color: 'text-blue-600' };
    if (bmi < 25) return { text: '정상', color: 'text-green-600' };
    if (bmi < 30) return { text: '과체중', color: 'text-yellow-600' };
    return { text: '비만', color: 'text-red-600' };
  };

  // 🔒 데이터 접근 로깅
  const logDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logClientDataAccess(
        client.id,
        agentId,
        'view',
        dataFields,
        undefined,
        navigator.userAgent,
        `고객 상세 정보 ${accessType}`
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('데이터 접근 로깅 실패:', error);
    }
  };

  // 메모 저장 핸들러
  const handleSaveNote = async () => {
    try {
      await logDataAccess('메모 수정', ['notes']);
      // TODO: API 호출로 메모 저장
      console.log('메모 저장:', noteValue);
      setIsEditingNote(false);
    } catch (error) {
      console.error('메모 저장 실패:', error);
    }
  };

  // 메모 취소 핸들러
  const handleCancelNote = () => {
    setNoteValue(client.notes || '');
    setIsEditingNote(false);
  };

  const handleMeetingAdded = (newMeeting: any) => {
    logDataAccess('미팅 추가', ['meetings']);
    console.log('새 미팅 추가됨:', newMeeting);
  };

  const handleDocumentAdded = (newDocument: any) => {
    logDataAccess('문서 추가', ['documents']);
    console.log('새 문서 추가됨:', newDocument);
  };

  const handleGratitudeSent = (gratitude: any) => {
    logDataAccess('감사 메시지', ['communications']);
    console.log('감사 표현 전송됨:', gratitude);
  };

  const displayName = typeHelpers.getClientDisplayName(client);
  const privacyLevel = (client.accessLevel ||
    client.privacyLevel ||
    'private') as ClientPrivacyLevel;

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              고객 목록
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">
              {maskData(displayName, privacyLevel)}
            </h1>
            {/* 🔒 개인정보 보호 컨트롤 */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  privacyLevel === 'confidential'
                    ? 'destructive'
                    : privacyLevel === 'private'
                      ? 'default'
                      : 'outline'
                }
                className="text-xs"
              >
                <LockClosedIcon className="h-3 w-3 mr-1" />
                {privacyLevel}
              </Badge>
              <div className="flex items-center gap-1">
                <Label htmlFor="show-confidential" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential"
                  checked={showConfidentialData}
                  onCheckedChange={setShowConfidentialData}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => logDataAccess('프로필 편집', ['profile'])}
              >
                <PersonIcon className="mr-2 h-4 w-4" />
                프로필 편집
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsGratitudeOpen(true)}>
                <HeartIcon className="mr-2 h-4 w-4" />
                감사 메시지 보내기
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <TrashIcon className="mr-2 h-4 w-4" />
                고객 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setIsAddDocumentOpen(true)}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            문서 추가
          </Button>
          <Button onClick={() => setIsAddMeetingOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            미팅 예약
          </Button>
        </div>
      </div>

      {/* 통합된 기본 정보 카드 */}
      <Card
        className={`${currentImportanceStyle.borderColor} border-l-4 ${currentImportanceStyle.bgGradient} border-border/50`}
      >
        <CardContent className="pt-6 space-y-6">
          {/* 상단 섹션: 아바타, 기본 연락처, 영업 정보 */}
          <div className="flex items-start gap-6">
            <ClientAvatar client={client} />
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MobileIcon className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${client.phone}`}
                      className="text-primary hover:underline"
                    >
                      {client.phone}
                    </a>
                    {client.telecomProvider && (
                      <Badge variant="outline" className="text-xs">
                        {client.telecomProvider}
                      </Badge>
                    )}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-primary hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={stageBadgeVariant[client.stageName || 'default']}
                    >
                      {client.stageName || '미설정'}
                    </Badge>
                    <Badge className={`${importanceBadgeClass} border`}>
                      {importanceText[client.importance]}
                    </Badge>
                  </div>
                  {client.referredBy && (
                    <div className="flex items-center gap-2">
                      <Link2Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <Link
                          to={`/clients/${client.referredBy.id}`}
                          className="hover:underline"
                        >
                          {client.referredBy.fullName}
                        </Link>
                        님 소개
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {client.tags?.map((tag, index) => (
                      <Badge
                        key={typeHelpers.getTagId(tag) || index}
                        variant="outline"
                        className="text-xs"
                      >
                        {typeHelpers.getTagName(tag)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₩{client.contractAmount?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      예상 계약금액
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 개인 정보 상세 섹션 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                상세 정보
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {age && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">나이</div>
                  <div className="font-medium">{age}세</div>
                </div>
              )}
              {clientDetail?.gender && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">성별</div>
                  <div className="font-medium">
                    {clientDetail.gender === 'male' ? '남성' : '여성'}
                  </div>
                </div>
              )}
              {clientDetail?.ssn && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    주민등록번호
                  </div>
                  <div className="font-medium text-xs">{clientDetail.ssn}</div>
                </div>
              )}
              {client.height && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">키</div>
                  <div className="font-medium">{client.height}cm</div>
                </div>
              )}
              {client.weight && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    몸무게
                  </div>
                  <div className="font-medium">{client.weight}kg</div>
                </div>
              )}
              {bmi && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">BMI</div>
                  <div className="font-medium">
                    {bmi}{' '}
                    <span
                      className={`text-xs ${getBMIStatus(Number(bmi)).color}`}
                    >
                      ({getBMIStatus(Number(bmi)).text})
                    </span>
                  </div>
                </div>
              )}
              {client.hasDrivingLicense !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    운전 여부
                  </div>
                  <div className="flex items-center gap-1">
                    {client.hasDrivingLicense ? (
                      <>
                        <CheckIcon className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 text-sm">가능</span>
                      </>
                    ) : (
                      <>
                        <Cross1Icon className="h-3 w-3 text-red-600" />
                        <span className="text-red-600 text-sm">불가</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {client.occupation && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    직업 상세
                  </div>
                  <div className="font-medium text-sm">{client.occupation}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 메모 섹션 - 빠른 편집 기능 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ChatBubbleIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  메모
                </span>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNote(true)}
                >
                  <Pencil1Icon className="h-3 w-3 mr-1" />
                  편집
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNote(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button onClick={handleSaveNote}>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-3">
                <Textarea
                  value={noteValue}
                  onChange={e => setNoteValue(e.target.value)}
                  placeholder="고객에 대한 메모를 입력하세요..."
                  className="resize-none"
                  rows={4}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 min-h-[60px] flex items-center">
                {client.notes || '메모가 없습니다. 클릭하여 추가하세요.'}
              </div>
            )}
          </div>

          {/* 등록/수정 정보 */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>
                등록일: {new Date(client.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <span>
                최종 수정:{' '}
                {new Date(client.updatedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 미팅 추가 모달 */}
      <AddMeetingModal
        open={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        clientId={client.id}
        clientName={client.fullName}
        onMeetingAdded={handleMeetingAdded}
      />

      {/* 문서 업로드 모달 */}
      <AddDocumentModal
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        clientId={client.id}
        clientName={client.fullName}
        insuranceTypes={insuranceTypes}
        onDocumentAdded={handleDocumentAdded}
      />

      {/* 감사 보내기 모달 */}
      <ClientGratitudeModal
        open={isGratitudeOpen}
        onOpenChange={setIsGratitudeOpen}
        client={client}
        agentId={agentId}
        onGratitudeSent={handleGratitudeSent}
      />

      {/* 🚀 새 영업 기회 추가 (핵심 기능) */}
      <Button variant="outline" onClick={onShowOpportunityModal}>
        <Plus className="h-4 w-4 mr-2" />새 영업 기회
      </Button>

      {/* 🚀 새 영업 기회 추가 (핵심 기능) */}
      <Button
        variant="outline"
        onClick={onDeleteClient}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? '삭제 중...' : '삭제'}
      </Button>
    </>
  );
}

function ClientStatusBadge({
  stage,
  variant = 'default',
}: {
  stage: string;
  variant?: BadgeVariant;
}) {
  const badgeVariant = variant || getBadgeVariant(stage);

  return (
    <Badge variant={badgeVariant} className="font-medium">
      {stage}
    </Badge>
  );
}

function ReferralBadge({ referral }: { referral: any }) {
  return (
    <Badge variant="outline" className="text-xs">
      <PersonIcon className="mr-1 h-3 w-3" />
      {referral.fullName} 추천
    </Badge>
  );
}

function getBadgeVariant(stage: string): BadgeVariant {
  switch (stage) {
    case '첫 상담':
    case '니즈 분석':
    case '상품 설명':
    case '계약 검토':
      return 'outline';
    case '계약 완료':
      return 'default';
    default:
      return 'secondary';
  }
}
