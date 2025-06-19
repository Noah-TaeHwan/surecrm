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
import { cn } from '~/lib/utils';

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
    <TabsContent value="medical" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">병력사항</h3>
            <Button
              size="sm"
              className="flex-shrink-0"
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
              <span className="hidden sm:inline">병력사항 </span>저장
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          
          {/* 🕐 3개월 이내 의료사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              🕐 3개월 이내 의료 관련 사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
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
                <div 
                  key={item.key} 
                  className={cn(
                    "flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors",
                    "hover:bg-muted/20 md:hover:bg-transparent",
                    // 모바일에서 터치하기 쉽게 더 큰 영역
                    "min-h-[44px] md:min-h-0"
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">{item.icon}</span>
                  <div className="flex items-center gap-2 flex-1">
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
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`recent-${item.key}`}
                      className={cn(
                        "text-sm cursor-pointer leading-relaxed flex-1",
                        "hover:text-primary transition-colors"
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📅 1년 이내 재검사 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              📅 1년 이내 재검사 관련
            </h4>
            <div className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className={cn(
                "flex items-start gap-3 p-2 md:p-0 rounded-md transition-colors",
                "hover:bg-muted/20 md:hover:bg-transparent",
                "min-h-[60px] md:min-h-0" // 긴 텍스트를 위해 더 큰 최소 높이
              )}>
                <span className="text-base md:text-lg flex-shrink-0 mt-0.5">🔄</span>
                <div className="flex items-start gap-2 flex-1">
                  <Checkbox
                    id="additional-exam"
                    checked={medicalHistory.hasAdditionalExam}
                    onCheckedChange={(checked) =>
                      setMedicalHistory(prev => ({
                        ...prev,
                        hasAdditionalExam: checked === true,
                      }))
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                  />
                  <Label 
                    htmlFor="additional-exam"
                    className={cn(
                      "text-sm cursor-pointer leading-relaxed flex-1",
                      "hover:text-primary transition-colors"
                    )}
                  >
                    의사로부터 진찰 또는 검사를 통하여{' '}
                    <br className="md:hidden" />
                    추가검사(재검사) 소견 여부
                  </Label>
                </div>
              </div>
              
              {/* 1년 이내 재검사 상세 내용 */}
              {medicalHistory.hasAdditionalExam && (
                <div className="mt-3 space-y-2">
                  <Label className="text-xs md:text-sm text-muted-foreground">
                    추가검사 상세 내용
                  </Label>
                  <Textarea
                    className="min-h-[80px] text-sm"
                    placeholder="추가검사나 재검사 관련 상세 내용을 입력해주세요..."
                    value={medicalHistory.additionalExamDetails}
                    onChange={e =>
                      setMedicalHistory(prev => ({
                        ...prev,
                        additionalExamDetails: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* 🗓️ 5년 이내 주요 의료 이력 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              🗓️ 5년 이내 주요 의료 이력
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-secondary/30 rounded-lg border border-border/60">
              {[
                {
                  key: 'hasMajorHospitalization',
                  label: '입원',
                  icon: '🏥',
                },
                { 
                  key: 'hasMajorSurgery', 
                  label: '수술', 
                  icon: '⚕️' 
                },
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
                <div 
                  key={item.key} 
                  className={cn(
                    "flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors",
                    "hover:bg-muted/20 md:hover:bg-transparent",
                    "min-h-[44px] md:min-h-0"
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">{item.icon}</span>
                  <div className="flex items-center gap-2 flex-1">
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
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`major-${item.key}`}
                      className={cn(
                        "text-sm cursor-pointer leading-relaxed flex-1",
                        "hover:text-primary transition-colors"
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📝 상세 내용 섹션 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              📝 상세 내용
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  3개월 이내 상세 내용
                </Label>
                <Textarea
                  className="min-h-[100px] text-sm"
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
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  5년 이내 주요 의료 이력 상세 내용
                </Label>
                <Textarea
                  className="min-h-[100px] text-sm"
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
