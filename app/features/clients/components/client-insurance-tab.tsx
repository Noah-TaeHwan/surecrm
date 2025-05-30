import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
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
  PlusIcon,
  LockClosedIcon,
  LayersIcon,
  CalendarIcon,
  FileTextIcon,
  ActivityLogIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import { insuranceTypeConfig } from './insurance-config';
import { AddInsuranceModal } from './add-insurance-modal';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { typeHelpers } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔧 임시 보험 정보 타입 정의 (실제로는 insurance schema에서 import)
interface InsuranceInfo {
  id: string;
  type: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  premium?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  documents?: string[];
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
  policyNumber?: string;
  insurer?: string;
  agent?: string;
  beneficiaries?: string[];
  coverage?: string;
  deductible?: number;
  claimHistory?: Array<{
    date: string;
    amount: number;
    description: string;
  }>;
  healthInfo?: {
    healthConditions?: string[];
    previousSurgeries?: string[];
    currentMedications?: string[];
    familyHistory?: string[];
    smokingStatus?: 'never' | 'former' | 'current';
    drinkingStatus?: 'never' | 'occasionally' | 'regularly';
  };
  vehicleInfo?: {
    vehicleNumber?: string;
    ownerName?: string;
    vehicleType?: string;
    manufacturer?: string;
    model?: string;
    year?: number;
    engineType?: string;
    displacement?: number;
  };
}

// 상세정보 키를 한국어로 매핑하는 객체
const detailsKeyMapping: Record<string, string> = {
  // 자동차보험 관련
  vehicleNumber: '차량번호',
  ownerName: '소유자명',
  vehicleType: '차량종류',
  manufacturer: '제조회사',
  model: '모델명',
  year: '연식',
  engineType: '연료종류',
  displacement: '배기량(cc)',

  // 건강보험 관련
  healthConditions: '기존 질환',
  previousSurgeries: '수술 이력',
  currentMedications: '복용 약물',
  familyHistory: '가족력',
  smokingStatus: '흡연상태',
  drinkingStatus: '음주상태',

  // 기타 공통
  notes: '메모',
  coverage: '보장범위',
  deductible: '자기부담금',
  beneficiary: '수익자',
  policyNumber: '증권번호',
  insurer: '보험사',
  agent: '담당자',
};

// 값을 한국어로 변환하는 함수
const formatDetailValue = (key: string, value: any): string => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '없음';
  }

  // 흡연상태 매핑
  if (key === 'smokingStatus') {
    const smokingMap = {
      never: '비흡연',
      former: '과거흡연',
      current: '현재흡연',
    };
    return smokingMap[value as keyof typeof smokingMap] || value;
  }

  // 음주상태 매핑
  if (key === 'drinkingStatus') {
    const drinkingMap = {
      never: '금주',
      occasionally: '가끔',
      regularly: '정기적',
    };
    return drinkingMap[value as keyof typeof drinkingMap] || value;
  }

  // 배기량은 cc 단위 추가
  if (key === 'displacement' && typeof value === 'number') {
    return `${value}cc`;
  }

  // 연식은 년도 추가
  if (key === 'year' && typeof value === 'number') {
    return `${value}년`;
  }

  return String(value);
};

interface ClientInsuranceTabProps {
  client: ClientDisplay;
  insuranceInfo: InsuranceInfo[];
  agentId: string; // 🔒 보안 로깅용
  onDataAccess?: (accessType: string, data: string[]) => void;
  onInsuranceAdded?: (insurance: InsuranceInfo) => void;
}

export function ClientInsuranceTab({
  client,
  insuranceInfo,
  agentId,
  onDataAccess,
  onInsuranceAdded,
}: ClientInsuranceTabProps) {
  // 🔒 개인정보 표시 제어
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'pending' | 'cancelled'
  >('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'public' | 'business'>(
    'business'
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        `고객 보험 ${accessType}`
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

  // 🔒 보험 정보 필터링 (상태 및 보안 레벨)
  const filterInsurance = (insuranceList: InsuranceInfo[]) => {
    return insuranceList.filter((insurance) => {
      // 상태 필터
      if (filterStatus !== 'all' && insurance.status !== filterStatus) {
        return false;
      }

      // 보안 레벨 필터
      const insLevel = insurance.confidentialityLevel || 'public';
      switch (filterLevel) {
        case 'public':
          return insLevel === 'public';
        case 'business':
          return ['public', 'restricted'].includes(insLevel);
        case 'all':
          return (
            ['public', 'restricted', 'private'].includes(insLevel) ||
            showConfidentialData
          );
        default:
          return true;
      }
    });
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

  // 상태별 배지 설정
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">활성</Badge>;
      case 'pending':
        return <Badge variant="outline">검토중</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>;
      case 'expired':
        return <Badge variant="secondary">만료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleInsuranceAdded = async (newInsurance: InsuranceInfo) => {
    await handleDataAccess('새 보험 추가', ['insurance', 'create']);
    onInsuranceAdded?.(newInsurance);
  };

  const filteredInsurance = filterInsurance(insuranceInfo);

  return (
    <div className="space-y-6">
      {/* 🔒 보안 및 필터 컨트롤 헤더 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">보험 필터:</span>

                {/* 상태 필터 */}
                <Select
                  value={filterStatus}
                  onValueChange={(value: any) => {
                    setFilterStatus(value);
                    handleDataAccess(`상태 필터 변경: ${value}`, [
                      'filter_settings',
                    ]);
                  }}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="pending">검토중</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
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
                <Label
                  htmlFor="show-confidential-insurance"
                  className="text-xs"
                >
                  기밀정보 표시
                </Label>
                <Switch
                  id="show-confidential-insurance"
                  checked={showConfidentialData}
                  onCheckedChange={(checked) => {
                    setShowConfidentialData(checked);
                    handleDataAccess(
                      checked ? '기밀정보 표시' : '기밀정보 숨김',
                      ['privacy_settings']
                    );
                  }}
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredInsurance.length}개 보험
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LayersIcon className="h-5 w-5" />
            보험 정보
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <LockClosedIcon className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>민감한 금융 정보가 포함되어 있습니다</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <p className="text-sm text-muted-foreground">
            고객의 가입 및 검토 중인 보험 목록 (보안 필터 적용됨)
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAddModalOpen(true);
            handleDataAccess('보험 추가 모달 열기', [
              'insurance',
              'create_modal',
            ]);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          보험 추가하기
        </Button>
      </div>

      {/* 보험 정보 카드들 */}
      {filteredInsurance.length > 0 ? (
        filteredInsurance.map((insurance) => {
          const config = insuranceTypeConfig[insurance.type] || {
            label: insurance.type,
            icon: <LayersIcon className="h-4 w-4" />,
            color: 'bg-gray-100',
          };

          return (
            <Card
              key={insurance.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                handleDataAccess('보험 상세 조회', ['insurance', insurance.id])
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {config.label}
                      {getStatusBadge(insurance.status)}
                      {getConfidentialityBadge(insurance.confidentialityLevel)}
                    </div>
                    {insurance.insurer && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {maskData(insurance.insurer, privacyLevel)}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-1">
                        💰 보험료
                      </div>
                      <div className="text-2xl font-bold">
                        {insurance.premium && showConfidentialData
                          ? `₩${insurance.premium.toLocaleString()}`
                          : insurance.premium
                          ? '₩***,***'
                          : '미정'}
                      </div>
                    </div>

                    {insurance.startDate && (
                      <div>
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          보험 기간
                        </div>
                        <div className="text-sm">
                          {maskData(insurance.startDate, 'private')} ~{' '}
                          {maskData(insurance.endDate || '', 'private')}
                        </div>
                      </div>
                    )}

                    {insurance.policyNumber && showConfidentialData && (
                      <div>
                        <div className="text-sm font-medium mb-2">증권번호</div>
                        <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {insurance.policyNumber}
                        </div>
                      </div>
                    )}

                    {insurance.agent && (
                      <div>
                        <div className="text-sm font-medium mb-2">담당자</div>
                        <div className="text-sm">
                          {maskData(insurance.agent, privacyLevel)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 상세 정보 */}
                  <div className="space-y-4">
                    {insurance.coverage && (
                      <div>
                        <div className="text-sm font-medium mb-2">보장범위</div>
                        <div className="text-sm">
                          {maskData(insurance.coverage, privacyLevel)}
                        </div>
                      </div>
                    )}

                    {insurance.deductible && showConfidentialData && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          자기부담금
                        </div>
                        <div className="text-sm">
                          ₩{insurance.deductible.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {insurance.beneficiaries &&
                      insurance.beneficiaries.length > 0 &&
                      showConfidentialData && (
                        <div>
                          <div className="text-sm font-medium mb-2">수익자</div>
                          <div className="flex flex-wrap gap-1">
                            {insurance.beneficiaries.map(
                              (beneficiary, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {beneficiary}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {insurance.notes && (
                      <div>
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <FileTextIcon className="h-3 w-3" />
                          메모
                        </div>
                        <div className="text-sm p-2 bg-muted/50 rounded">
                          {maskData(insurance.notes, privacyLevel)}
                        </div>
                      </div>
                    )}

                    {insurance.documents && insurance.documents.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          관련 문서
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {insurance.documents.map((doc, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {maskData(doc, privacyLevel)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🔒 건강정보 (건강보험의 경우, 기밀 데이터) */}
                {insurance.healthInfo && showConfidentialData && (
                  <div className="mt-6 pt-4 border-t border-red-200 bg-red-50/50 rounded p-4">
                    <div className="text-sm font-medium mb-3 text-red-800 flex items-center gap-2">
                      <LockClosedIcon className="h-4 w-4" />
                      건강정보 (기밀)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(insurance.healthInfo).map(
                        ([key, value]) => (
                          <div key={key}>
                            <div className="font-medium text-red-700 mb-1">
                              {detailsKeyMapping[key] || key}
                            </div>
                            <div className="text-red-600">
                              {formatDetailValue(key, value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 차량정보 (자동차보험의 경우) */}
                {insurance.vehicleInfo && (
                  <div className="mt-6 pt-4 border-t border-blue-200 bg-blue-50/50 rounded p-4">
                    <div className="text-sm font-medium mb-3 text-blue-800">
                      차량정보
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(insurance.vehicleInfo).map(
                        ([key, value]) => (
                          <div key={key}>
                            <div className="font-medium text-blue-700 mb-1">
                              {detailsKeyMapping[key] || key}
                            </div>
                            <div className="text-blue-600">
                              {formatDetailValue(key, value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 보험금 청구 이력 */}
                {insurance.claimHistory &&
                  insurance.claimHistory.length > 0 &&
                  showConfidentialData && (
                    <div className="mt-6 pt-4 border-t border-yellow-200 bg-yellow-50/50 rounded p-4">
                      <div className="text-sm font-medium mb-3 text-yellow-800">
                        보험금 청구 이력
                      </div>
                      <div className="space-y-2">
                        {insurance.claimHistory.map((claim, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="font-medium text-sm">
                                {claim.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {claim.date}
                              </div>
                            </div>
                            <div className="font-bold text-yellow-700">
                              ₩{claim.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        /* 빈 상태 */
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <LayersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filterStatus !== 'all' || filterLevel !== 'all'
                ? '조건에 맞는 보험이 없습니다'
                : '보험 정보가 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus !== 'all' || filterLevel !== 'all'
                ? '필터 설정을 변경하거나 새 보험을 추가해보세요.'
                : '고객의 첫 번째 보험 정보를 추가해보세요.'}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              보험 추가하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 🔒 보험 통계 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ActivityLogIcon className="h-5 w-5" />
            보험 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredInsurance.length}
              </div>
              <div className="text-sm text-muted-foreground">총 보험</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredInsurance.filter((i) => i.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">활성 보험</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {showConfidentialData
                  ? `₩${filteredInsurance
                      .reduce((sum, i) => sum + (i.premium || 0), 0)
                      .toLocaleString()}`
                  : '***'}
              </div>
              <div className="text-sm text-muted-foreground">총 보험료</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  filteredInsurance.filter(
                    (i) => i.confidentialityLevel === 'confidential'
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">기밀 보험</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보험 추가 모달 */}
      <AddInsuranceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        clientId={client.id}
        onInsuranceAdded={handleInsuranceAdded}
      />
    </div>
  );
}
