import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { TabsContent } from '~/common/components/ui/tabs';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';

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
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">병력사항</h3>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await submit(
                    {
                      intent: 'updateMedicalHistory',
                      medicalHistory: JSON.stringify(medicalHistory),
                    },
                    { method: 'POST' }
                  );
                  
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
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`recent-${item.key}`}
                      checked={
                        medicalHistory[
                          item.key as keyof typeof medicalHistory
                        ] as boolean
                      }
                      onCheckedChange={(checked) =>
                        setMedicalHistory(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                    />
                    <Label 
                      htmlFor={`recent-${item.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {item.label}
                    </Label>
                  </div>
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
              <div className="flex items-start space-x-3">
                <span className="text-lg">🔄</span>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="additional-exam"
                    checked={medicalHistory.hasAdditionalExam}
                    onCheckedChange={(checked) =>
                      setMedicalHistory(prev => ({
                        ...prev,
                        hasAdditionalExam: checked === true,
                      }))
                    }
                  />
                  <Label 
                    htmlFor="additional-exam"
                    className="text-sm cursor-pointer leading-relaxed"
                  >
                    의사로부터 진찰 또는 검사를 통하여 추가검사(재검사) 소견 여부
                  </Label>
                </div>
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
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`major-${item.key}`}
                      checked={
                        medicalHistory[
                          item.key as keyof typeof medicalHistory
                        ] as boolean
                      }
                      onCheckedChange={(checked) =>
                        setMedicalHistory(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                    />
                    <Label 
                      htmlFor={`major-${item.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 상세 메모 섹션 */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">상세 내용</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  3개월 이내 상세 내용
                </Label>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="3개월 이내 의료 관련 상세 내용을 입력해주세요..."
                  value={medicalHistory.recentMedicalDetails}
                  onChange={e =>
                    setMedicalHistory(prev => ({
                      ...prev,
                      recentMedicalDetails: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  5년 이내 주요 의료 이력 상세 내용
                </Label>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="5년 이내 주요 의료 이력 상세 내용을 입력해주세요..."
                  value={medicalHistory.majorMedicalDetails}
                  onChange={e =>
                    setMedicalHistory(prev => ({
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
