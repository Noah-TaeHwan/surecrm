import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { ExistingClientOpportunityModal } from '~/features/pipeline/components/existing-client-opportunity-modal';
import { NewOpportunityModal } from '~/features/clients/components/new-opportunity-modal';
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';

export function meta() {
  return [
    { title: '모달 상태 초기화 테스트 - SureCRM' },
    { name: 'description', content: '모달을 닫고 다시 열 때 이전 값이 초기화되는지 테스트' },
  ];
}

export default function TestModalReset() {
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // 테스트용 고객 데이터
  const testClients = [
    { id: '1', name: '김철수', phone: '010-1234-5678', currentStage: '첫 상담' },
    { id: '2', name: '이영희', phone: '010-9876-5432', currentStage: '니즈 분석' },
    { id: '3', name: '박민수', phone: '010-5555-6666', currentStage: '상품 설명' },
  ];

  const handleExistingOpportunity = async (data: any) => {
    console.log('기존 고객 영업 기회 데이터:', data);
    alert(`영업 기회 생성 완료!\n고객: ${data.clientName}\n상품: ${data.insuranceType}`);
    setShowExistingModal(false);
  };

  const handleNewOpportunity = async (data: any) => {
    console.log('새 영업 기회 데이터:', data);
    alert(`영업 기회 생성 완료!\n상품: ${data.insuranceType}`);
    setShowNewModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">모달 상태 초기화 테스트</h1>
          <p className="text-muted-foreground">
            모달에 값을 입력한 후 X 버튼으로 닫고, 다시 열어서 이전 값이 초기화되는지 확인하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 기존 고객 영업 기회 모달 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 기존 고객 영업 기회 모달
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>테스트 순서:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>모달을 열고 고객을 선택합니다</li>
                  <li>보험 상품을 선택합니다</li>
                  <li>상세 정보를 입력합니다</li>
                  <li><strong>X 버튼</strong>으로 모달을 닫습니다</li>
                  <li>다시 모달을 열어서 이전 값이 초기화되었는지 확인합니다</li>
                </ol>
              </div>
              <Button 
                onClick={() => setShowExistingModal(true)}
                className="w-full"
              >
                기존 고객 영업 기회 모달 열기
              </Button>
            </CardContent>
          </Card>

          {/* 새 영업 기회 모달 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 새 영업 기회 모달
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>테스트 순서:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>모달을 열고 보험 상품을 선택합니다</li>
                  <li>다음 단계로 진행합니다</li>
                  <li>상세 정보를 입력합니다</li>
                  <li><strong>X 버튼</strong>으로 모달을 닫습니다</li>
                  <li>다시 모달을 열어서 이전 값이 초기화되었는지 확인합니다</li>
                </ol>
              </div>
              <Button 
                onClick={() => setShowNewModal(true)}
                className="w-full"
                variant="outline"
              >
                새 영업 기회 모달 열기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 테스트 결과 안내 */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p><strong>✅ 성공한 경우:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>모달을 다시 열면 모든 입력 필드가 비어있음</li>
                <li>첫 번째 단계부터 시작됨</li>
                <li>이전에 선택했던 값들이 모두 초기화됨</li>
              </ul>
              
              <p className="mt-4"><strong>❌ 실패한 경우:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>이전에 입력했던 값들이 그대로 남아있음</li>
                <li>중간 단계에서 시작됨</li>
                <li>선택했던 고객이나 상품이 그대로 선택되어 있음</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 모달들 */}
      <ExistingClientOpportunityModal
        isOpen={showExistingModal}
        onClose={() => setShowExistingModal(false)}
        onConfirm={handleExistingOpportunity}
        clients={testClients}
        isLoading={false}
      />

      <NewOpportunityModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onConfirm={handleNewOpportunity}
        clientName="테스트 고객"
        isLoading={false}
      />
    </div>
  );
} 