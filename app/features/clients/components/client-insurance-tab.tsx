import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { PlusIcon } from '@radix-ui/react-icons';
import { insuranceTypeConfig } from './insurance-config';
import { AddInsuranceModal } from './add-insurance-modal';
import type { InsuranceInfo } from '../types';

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
  insuranceInfo: InsuranceInfo[];
  clientId: string;
}

export function ClientInsuranceTab({
  insuranceInfo,
  clientId,
}: ClientInsuranceTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleInsuranceAdded = (newInsurance: InsuranceInfo) => {
    // TODO: 실제 API 호출로 보험 정보 추가
    console.log('새 보험 추가됨:', newInsurance);
    // 상태 업데이트 또는 새로고침 로직
  };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">보험 정보</h3>
          <p className="text-sm text-muted-foreground">
            고객의 가입 및 검토 중인 보험 목록
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          보험 추가하기
        </Button>
      </div>

      {/* 보험 정보 카드들 */}
      {insuranceInfo.length > 0 ? (
        insuranceInfo.map((insurance) => {
          const config = insuranceTypeConfig[insurance.type];
          return (
            <Card key={insurance.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    {config.icon}
                  </div>
                  {config.label}
                  <Badge
                    variant={
                      insurance.status === 'active' ? 'default' : 'outline'
                    }
                  >
                    {insurance.status === 'active' ? '활성' : '검토중'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">보험료</div>
                      <div className="text-2xl font-bold">
                        {insurance.premium
                          ? `₩${insurance.premium.toLocaleString()}`
                          : '미정'}
                      </div>
                    </div>

                    {insurance.startDate && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          보험 기간
                        </div>
                        <div className="text-sm">
                          {insurance.startDate} ~ {insurance.endDate}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {insurance.notes && (
                      <div>
                        <div className="text-sm font-medium mb-2">메모</div>
                        <div className="text-sm">{insurance.notes}</div>
                      </div>
                    )}

                    {insurance.documents?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          관련 문서
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {insurance.documents?.map(
                            (doc: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {doc}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        /* 빈 상태 */
        <Card>
          <CardContent className="py-10 text-center">
            <div className="text-muted-foreground mb-4">
              <PlusIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">보험 정보가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              고객의 첫 번째 보험 정보를 추가해보세요.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              보험 추가하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 보험 추가 모달 */}
      <AddInsuranceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        clientId={clientId}
        onInsuranceAdded={handleInsuranceAdded}
      />
    </div>
  );
}
