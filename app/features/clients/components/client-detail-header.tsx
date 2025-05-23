import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Textarea } from '~/common/components/ui/textarea';
import { Separator } from '~/common/components/ui/separator';
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
  ArrowLeftIcon,
  Pencil2Icon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  CalendarIcon,
  Link2Icon,
  DotsHorizontalIcon,
  ChatBubbleIcon,
  Share1Icon,
  UploadIcon,
  DownloadIcon,
  PersonIcon,
  RulerHorizontalIcon,
  CheckIcon,
  Cross1Icon,
  CheckCircledIcon,
  Cross2Icon,
  HeartIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import type { Client, BadgeVariant } from './types';
import { AddMeetingModal } from './add-meeting-modal';
import { AddDocumentModal } from './add-document-modal';
import { ClientGratitudeModal } from './client-gratitude-modal';

interface ClientDetailHeaderProps {
  client: Client;
  clientDetail?: {
    ssn?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    consentDate?: string;
  };
  insuranceTypes?: string[];
}

export function ClientDetailHeader({
  client,
  clientDetail,
  insuranceTypes = [],
}: ClientDetailHeaderProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(client.notes || '');
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);

  // 배지 설정들
  const importanceBadgeVariant: Record<string, BadgeVariant> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  };

  const importanceText: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
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

  // 메모 저장 핸들러
  const handleSaveNote = () => {
    // TODO: API 호출로 메모 저장
    console.log('메모 저장:', noteValue);
    setIsEditingNote(false);
  };

  // 메모 취소 핸들러
  const handleCancelNote = () => {
    setNoteValue(client.notes || '');
    setIsEditingNote(false);
  };

  const handleMeetingAdded = (newMeeting: any) => {
    // TODO: 실제 API 호출로 미팅 추가
    console.log('새 미팅 추가됨:', newMeeting);
    // 상태 업데이트 또는 새로고침 로직
  };

  const handleDocumentAdded = (newDocument: any) => {
    // TODO: 실제 API 호출로 문서 추가
    console.log('새 문서 추가됨:', newDocument);
    // 상태 업데이트 또는 새로고침 로직
  };

  const handleGratitudeSent = (gratitude: any) => {
    // TODO: 실제 API 호출로 감사 표현 기록
    console.log('감사 표현 전송됨:', gratitude);
    // 상태 업데이트 또는 새로고침 로직
  };

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              고객 목록
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>빠른 작업</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAddMeetingOpen(true)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                미팅 예약
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsGratitudeOpen(true)}>
                <HeartIcon className="mr-2 h-4 w-4" />
                감사 보내기
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share1Icon className="mr-2 h-4 w-4" />
                소개 요청
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAddDocumentOpen(true)}>
                <UploadIcon className="mr-2 h-4 w-4" />
                문서 업로드
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DownloadIcon className="mr-2 h-4 w-4" />
                정보 내보내기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to={`/clients/edit/${client.id}`}>
            <Button>
              <Pencil2Icon className="mr-2 h-4 w-4" />
              편집
            </Button>
          </Link>
        </div>
      </div>

      {/* 통합된 기본 정보 카드 */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* 상단 섹션: 아바타, 기본 연락처, 영업 정보 */}
          <div className="flex items-start gap-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={client.profileImage || undefined} />
              <AvatarFallback className="text-lg">
                {client.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MobileIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                    {client.telecomProvider && (
                      <Badge variant="outline" className="text-xs">
                        {client.telecomProvider}
                      </Badge>
                    )}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
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
                    <Badge variant={stageBadgeVariant[client.stage]}>
                      {client.stage}
                    </Badge>
                    <Badge variant={importanceBadgeVariant[client.importance]}>
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
                          {client.referredBy.name}
                        </Link>
                        님 소개 ({client.referredBy.relationship})
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {client.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
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
                  {client.nextMeeting && (
                    <div className="text-right">
                      <div className="text-sm font-medium">다음 미팅</div>
                      <div className="text-sm text-muted-foreground">
                        {client.nextMeeting.date} {client.nextMeeting.time}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.nextMeeting.location}
                      </div>
                    </div>
                  )}
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
              {!isEditingNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNote(true)}
                >
                  <Pencil2Icon className="h-3 w-3 mr-1" />
                  편집
                </Button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-3">
                <Textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="고객에 대한 메모를 입력하세요..."
                  className="resize-none"
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSaveNote}>
                    <CheckCircledIcon className="h-3 w-3 mr-1" />
                    저장
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelNote}
                  >
                    <Cross2Icon className="h-3 w-3 mr-1" />
                    취소
                  </Button>
                </div>
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
        clientName={client.name}
        onMeetingAdded={handleMeetingAdded}
      />

      {/* 문서 업로드 모달 */}
      <AddDocumentModal
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        clientId={client.id}
        clientName={client.name}
        insuranceTypes={insuranceTypes}
        onDocumentAdded={handleDocumentAdded}
      />

      {/* 감사 보내기 모달 */}
      <ClientGratitudeModal
        open={isGratitudeOpen}
        onOpenChange={setIsGratitudeOpen}
        client={client}
        onGratitudeSent={handleGratitudeSent}
      />
    </>
  );
}
