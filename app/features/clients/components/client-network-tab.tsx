import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { Progress } from '~/common/components/ui/progress';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  LockClosedIcon,
  PersonIcon,
  ActivityLogIcon,
  MobileIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  CalendarIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import type { ClientDisplay, ClientPrivacyLevel, BadgeVariant } from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 임시 소개 네트워크 타입 정의 (실제로는 referral schema에서 import)
interface Referral {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  currentStage?: string;
  contractAmount: number;
  referredAt: string;
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  importanceLevel?: 'high' | 'medium' | 'low';
}

interface ReferralNetwork {
  referrals: Referral[];
  stats: {
    totalReferred: number;
    totalContracts: number;
    totalValue: number;
    conversionRate: number;
    averageContractValue: number;
    lastReferralDate?: string;
  };
}

interface ClientNetworkTabProps {
  client: ClientDisplay;
  referralNetwork: ReferralNetwork;
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
}

export function ClientNetworkTab({
  client,
  referralNetwork,
  agentId,
  onDataAccess,
}: ClientNetworkTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [filterStage, setFilterStage] = useState<'all' | string>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'public' | 'business'>(
    'business'
  );

  const privacyLevel = (client.accessLevel ||
    client.privacyLevel ||
    'private') as ClientPrivacyLevel;

  // 🔒 데이터 접근 로깅
  const handleDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logDataAccess(
        client.id,
        agentId,
        'view',
        dataFields,
        undefined,
        navigator.userAgent,
        `고객 네트워크 ${accessType}`
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('데이터 접근 로깅 실패:', error);
    }
  };

  // 🔒 데이터 마스킹 함수
  const maskData = (data: string, level: ClientPrivacyLevel = privacyLevel) => {
    return typeHelpers.maskData(data, level, showConfidentialData);
  };

  // 🔒 소개 고객 필터링 (단계 및 보안 레벨)
  const filterReferrals = (referrals: Referral[]) => {
    return referrals.filter(referral => {
      // 단계 필터
      if (filterStage !== 'all' && referral.currentStage !== filterStage) {
        return false;
      }

      // 보안 레벨 필터
      const refLevel = referral.confidentialityLevel || 'public';
      switch (filterLevel) {
        case 'public':
          return refLevel === 'public';
        case 'business':
          return ['public', 'restricted'].includes(refLevel);
        case 'all':
          return (
            ['public', 'restricted', 'private'].includes(refLevel) ||
            showConfidentialData
          );
        default:
          return true;
      }
    });
  };

  // 단계별 배지 설정
  const stageBadgeVariant: Record<string, BadgeVariant> = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
    '계약 취소': 'destructive',
  };

  // 🔒 기밀 레벨에 따른 배지
  const getConfidentialityBadge = (level?: string) => {
    switch (level) {
      case 'confidential':
        return (
          <Badge variant="destructive" className="text-xs">
            기밀
          </Badge>
        );
      case 'private':
        return (
          <Badge variant="secondary" className="text-xs">
            내부
          </Badge>
        );
      case 'restricted':
        return (
          <Badge variant="outline" className="text-xs">
            제한
          </Badge>
        );
      case 'public':
        return (
          <Badge variant="default" className="text-xs">
            공개
          </Badge>
        );
      default:
        return null;
    }
  };

  // 중요도에 따른 배지
  const getImportanceBadge = (level?: string) => {
    switch (level) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            긴급
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="default" className="text-xs">
            보통
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="text-xs">
            낮음
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredReferrals = filterReferrals(referralNetwork.referrals);

  // 고유 단계 목록
  const stages = Array.from(
    new Set(referralNetwork.referrals.map(r => r.currentStage).filter(Boolean))
  );

  // 🔒 필터링된 통계 재계산
  const filteredStats = {
    totalReferred: filteredReferrals.length,
    totalContracts: filteredReferrals.filter(
      r => r.currentStage === '계약 완료'
    ).length,
    totalValue: filteredReferrals.reduce(
      (sum, r) => sum + (r.contractAmount || 0),
      0
    ),
    conversionRate:
      filteredReferrals.length > 0
        ? Math.round(
            (filteredReferrals.filter(r => r.currentStage === '계약 완료')
              .length /
              filteredReferrals.length) *
              100
          )
        : 0,
    averageContractValue:
      filteredReferrals.filter(r => r.contractAmount > 0).length > 0
        ? filteredReferrals.reduce(
            (sum, r) => sum + (r.contractAmount || 0),
            0
          ) / filteredReferrals.filter(r => r.contractAmount > 0).length
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* 🔒 보안 및 필터 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">네트워크 필터:</span>

                {/* 단계 필터 */}
                <Select
                  value={filterStage}
                  onValueChange={(value: any) => {
                    setFilterStage(value);
                    handleDataAccess(`단계 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 단계</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage!}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 보안 레벨 필터 */}
                <Select
                  value={filterLevel}
                  onValueChange={(value: any) => {
                    setFilterLevel(value);
                    handleDataAccess(`보안 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">공개</SelectItem>
                    <SelectItem value="business">업무</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-confidential-network" className="text-xs">
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-network"
                  checked={showConfidentialData}
                  onCheckedChange={checked => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredReferrals.length}명
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share1Icon className="h-5 w-5" />
                소개한 고객들
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>개인 관계 정보가 포함되어 있습니다</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                {typeHelpers.getClientDisplayName(client)}님이 소개해주신 고객
                목록 (보안 필터 적용됨)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReferrals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PersonIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {filterStage !== 'all' || filterLevel !== 'all'
                        ? '조건에 맞는 소개 고객이 없습니다'
                        : '소개한 고객이 없습니다'}
                    </h3>
                    <p className="text-sm">
                      {filterStage !== 'all' || filterLevel !== 'all'
                        ? '필터 설정을 변경해보세요'
                        : '고객이 새로운 고객을 소개하면 여기에 표시됩니다'}
                    </p>
                  </div>
                ) : (
                  filteredReferrals.map(referral => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() =>
                        handleDataAccess('소개 고객 상세 조회', [
                          'referrals',
                          referral.id,
                        ])
                      }
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {showConfidentialData
                              ? referral.fullName.charAt(0)
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium truncate">
                              {maskData(referral.fullName, privacyLevel)}
                            </div>
                            {getConfidentialityBadge(
                              referral.confidentialityLevel
                            )}
                            {getImportanceBadge(referral.importanceLevel)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span>
                                {maskData(referral.relationship, privacyLevel)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MobileIcon className="h-3 w-3" />
                                {maskData(referral.phone, privacyLevel)}
                              </span>
                              {referral.referredAt && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {maskData(referral.referredAt, 'private')}
                                </span>
                              )}
                            </div>
                          </div>
                          {referral.notes && showConfidentialData && (
                            <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
                              {referral.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        {referral.currentStage && (
                          <Badge
                            variant={
                              stageBadgeVariant[referral.currentStage] ||
                              'outline'
                            }
                          >
                            {referral.currentStage}
                          </Badge>
                        )}
                        <div className="text-sm font-bold">
                          {showConfidentialData
                            ? `₩${referral.contractAmount.toLocaleString()}`
                            : '₩***,***'}
                        </div>
                        {referral.nextFollowUp && (
                          <div className="text-xs text-blue-600">
                            다음: {maskData(referral.nextFollowUp, 'private')}
                          </div>
                        )}
                        {referral.lastContactDate && (
                          <div className="text-xs text-muted-foreground">
                            마지막:{' '}
                            {maskData(referral.lastContactDate, 'private')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityLogIcon className="h-5 w-5" />
                네트워크 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {filteredStats.totalReferred}
                  </div>
                  <div className="text-sm text-blue-700">소개한 고객</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {filteredStats.totalContracts}
                  </div>
                  <div className="text-sm text-green-700">계약 성사</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {showConfidentialData
                      ? `₩${filteredStats.totalValue.toLocaleString()}`
                      : '₩***,***'}
                  </div>
                  <div className="text-sm text-purple-700">총 계약 가치</div>
                </div>

                {showConfidentialData &&
                  filteredStats.averageContractValue > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xl font-bold text-orange-600">
                        ₩
                        {Math.round(
                          filteredStats.averageContractValue
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-700">평균 계약가</div>
                    </div>
                  )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>전환율</span>
                    <span className="font-bold">
                      {filteredStats.conversionRate}%
                    </span>
                  </div>
                  <Progress
                    value={filteredStats.conversionRate}
                    className="h-3"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {filteredStats.totalContracts} /{' '}
                    {filteredStats.totalReferred} 성사
                  </div>
                </div>

                {referralNetwork.stats.lastReferralDate && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium">마지막 소개</div>
                    <div className="text-xs text-muted-foreground">
                      {maskData(
                        referralNetwork.stats.lastReferralDate,
                        'private'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔒 네트워크 품질 분석 */}
          <Card className="mt-6 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <ActivityLogIcon className="h-4 w-4" />
                네트워크 품질
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">활성 관계</span>
                  <Badge variant="default" className="text-xs">
                    {
                      filteredReferrals.filter(r => r.status === 'active')
                        .length
                    }
                    명
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">고가치 고객</span>
                  <Badge variant="default" className="text-xs">
                    {
                      filteredReferrals.filter(
                        r => r.importanceLevel === 'high'
                      ).length
                    }
                    명
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">최근 30일 소개</span>
                  <Badge variant="outline" className="text-xs">
                    {
                      filteredReferrals.filter(r => {
                        if (!r.referredAt) return false;
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return new Date(r.referredAt) > thirtyDaysAgo;
                      }).length
                    }
                    명
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
