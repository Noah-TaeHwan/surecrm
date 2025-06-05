import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { TabsContent } from '~/common/components/ui/tabs';

interface MedicalHistoryData {
  hasRecentDiagnosis: boolean;
  hasRecentSuspicion: boolean;
  hasRecentMedication: boolean;
  hasRecentTreatment: boolean;
  hasRecentHospitalization: boolean;
  hasRecentSurgery: boolean;
  recentMedicalDetails: string;
  hasAdditionalExam: boolean;
  additionalExamDetails: string;
  hasMajorHospitalization: boolean;
  hasMajorSurgery: boolean;
  hasLongTermTreatment: boolean;
  hasLongTermMedication: boolean;
  majorMedicalDetails: string;
}

interface MedicalHistoryTabProps {
  medicalHistory: MedicalHistoryData;
  setMedicalHistory: React.Dispatch<React.SetStateAction<MedicalHistoryData>>;
  submit: (target: any, options?: any) => void;
  setSuccessMessage: (message: string) => void;
  setShowSuccessModal: (show: boolean) => void;
}

export function MedicalHistoryTab({
  medicalHistory,
  setMedicalHistory,
  submit,
  setSuccessMessage,
  setShowSuccessModal,
}: MedicalHistoryTabProps) {
  return (
    <TabsContent value="medical" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-lg">🏥</span>
            병력사항
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            고객의 의료 이력 및 건강 상태 정보를 관리합니다.
          </p>
          {/* 저장 버튼 */}
          <div className="flex justify-end pb-4 border-b">
            <Button
              type="submit"
              className="px-6"
              onClick={async () => {
                try {
                  const formData = new FormData();
                  formData.append('intent', 'updateMedicalHistory');

                  // 병력사항 데이터 추가
                  Object.entries(medicalHistory).forEach(([key, value]) => {
                    formData.append(key, value.toString());
                  });

                  submit(formData, { method: 'post' });

                  // 성공 모달 표시
                  setSuccessMessage('병력사항이 성공적으로 저장되었습니다.');
                  setShowSuccessModal(true);
                } catch (error) {
                  console.error('병력사항 저장 실패:', error);
                }
              }}
            >
              병력사항 저장
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* 3개월 이내 의료사항 */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              🕐 3개월 이내 의료 관련 사항
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              {[
                {
                  key: 'hasRecentDiagnosis',
                  label: '질병 확정진단',
                  icon: '🔬',
                },
                {
                  key: 'hasRecentSuspicion',
                  label: '질병 의심소견',
                  icon: '🤔',
                },
                {
                  key: 'hasRecentMedication',
                  label: '투약',
                  icon: '💊',
                },
                {
                  key: 'hasRecentTreatment',
                  label: '치료',
                  icon: '🩺',
                },
                {
                  key: 'hasRecentHospitalization',
                  label: '입원',
                  icon: '🏥',
                },
                {
                  key: 'hasRecentSurgery',
                  label: '수술',
                  icon: '⚕️',
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={
                        medicalHistory[
                          item.key as keyof typeof medicalHistory
                        ] as boolean
                      }
                      onChange={(e) =>
                        setMedicalHistory((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                    />
                    <span>{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 1년 이내 재검사 */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              📅 1년 이내 재검사 관련
            </h4>
            <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔄</span>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={medicalHistory.hasAdditionalExam}
                    onChange={(e) =>
                      setMedicalHistory((prev) => ({
                        ...prev,
                        hasAdditionalExam: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    의사로부터 진찰 또는 검사를 통하여 추가검사(재검사) 소견
                    여부
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 5년 이내 주요 의료 이력 */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              🗓️ 5년 이내 주요 의료 이력
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg border border-border/60">
              {[
                {
                  key: 'hasMajorHospitalization',
                  label: '입원',
                  icon: '🏥',
                },
                { key: 'hasMajorSurgery', label: '수술', icon: '⚕️' },
                {
                  key: 'hasLongTermTreatment',
                  label: '7일 이상 치료',
                  icon: '📅',
                },
                {
                  key: 'hasLongTermMedication',
                  label: '30일 이상 투약',
                  icon: '💊',
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={
                        medicalHistory[
                          item.key as keyof typeof medicalHistory
                        ] as boolean
                      }
                      onChange={(e) =>
                        setMedicalHistory((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                    />
                    <span>{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 상세 메모 섹션 */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">상세 내용</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">
                  3개월 이내 상세 내용
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm mt-1"
                  rows={4}
                  placeholder="3개월 이내 의료 관련 상세 내용을 입력해주세요..."
                  value={medicalHistory.recentMedicalDetails}
                  onChange={(e) =>
                    setMedicalHistory((prev) => ({
                      ...prev,
                      recentMedicalDetails: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  5년 이내 주요 의료 이력 상세 내용
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm mt-1"
                  rows={4}
                  placeholder="5년 이내 주요 의료 이력 상세 내용을 입력해주세요..."
                  value={medicalHistory.majorMedicalDetails}
                  onChange={(e) =>
                    setMedicalHistory((prev) => ({
                      ...prev,
                      majorMedicalDetails: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
