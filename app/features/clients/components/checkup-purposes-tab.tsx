import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { cn } from '~/lib/utils';

interface CheckupPurposesData {
  isInsurancePremiumConcern: boolean;
  isCoverageConcern: boolean;
  isMedicalHistoryConcern: boolean;
  needsDeathBenefit: boolean;
  needsImplantPlan: boolean;
  needsCaregiverInsurance: boolean;
  needsDementiaInsurance: boolean;
  currentSavingsLocation: string;
  additionalConcerns: string;
}

interface CheckupPurposesTabProps {
  checkupPurposes: CheckupPurposesData;
  setCheckupPurposes: React.Dispatch<React.SetStateAction<CheckupPurposesData>>;
  onSave: () => void;
}

export function CheckupPurposesTab({
  checkupPurposes,
  setCheckupPurposes,
  onSave,
}: CheckupPurposesTabProps) {
  return (
    <TabsContent value="checkup" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">점검목적</h3>
            <Button
              size="sm"
              className="flex-shrink-0"
              onClick={async () => {
                try {
                  await onSave();
                } catch (error) {
                  console.error('점검목적 저장 실패:', error);
                }
              }}
            >
              <span className="hidden sm:inline">점검목적 </span>저장
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          
          {/* 😟 현재 걱정되는 사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              😟 현재 걱정되는 사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
              {[
                {
                  key: 'isInsurancePremiumConcern',
                  label: '현재 보험료가 걱정되시나요?',
                  icon: '💰',
                },
                {
                  key: 'isCoverageConcern',
                  label: '현재 보장이 걱정되시나요?',
                  icon: '🛡️',
                },
                {
                  key: 'isMedicalHistoryConcern',
                  label: '현재 병력이 있어서 걱정되시나요?',
                  icon: '🏥',
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
                      id={`concern-${item.key}`}
                      checked={
                        checkupPurposes[
                          item.key as keyof typeof checkupPurposes
                        ] as boolean
                      }
                      onCheckedChange={(checked) =>
                        setCheckupPurposes(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`concern-${item.key}`}
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

          {/* 💰 저축 현황 관련 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              💰 저축 현황 관련
            </h4>
            <div className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  지금 저축은 어디서 하고 계신가요?
                </Label>
                <Textarea
                  className="min-h-[80px] text-sm"
                  placeholder="저축 현황에 대해 자세히 입력해주세요..."
                  value={checkupPurposes.currentSavingsLocation}
                  onChange={e =>
                    setCheckupPurposes(prev => ({
                      ...prev,
                      currentSavingsLocation: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* ✅ 필요한 사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              ✅ 필요한 사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-secondary/30 rounded-lg border border-border/60">
              {[
                {
                  key: 'needsDeathBenefit',
                  label: '현재 사망보험금이 필요하신가요?',
                  icon: '💼',
                },
                {
                  key: 'needsImplantPlan',
                  label: '2년후 임플란트 계획이 있으신가요?',
                  icon: '🦷',
                },
                {
                  key: 'needsCaregiverInsurance',
                  label: '현재 간병인 보험이 필요하신가요?',
                  icon: '👩‍⚕️',
                },
                {
                  key: 'needsDementiaInsurance',
                  label: '현재 치매보험이 필요하신가요?',
                  icon: '🧠',
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
                      id={`needs-${item.key}`}
                      checked={
                        checkupPurposes[
                          item.key as keyof typeof checkupPurposes
                        ] as boolean
                      }
                      onCheckedChange={(checked) =>
                        setCheckupPurposes(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`needs-${item.key}`}
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
            <div className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  기타 걱정사항
                </Label>
                <Textarea
                  className="min-h-[100px] text-sm"
                  placeholder="기타 걱정사항이나 추가로 논의하고 싶은 내용을 입력해주세요..."
                  value={checkupPurposes.additionalConcerns}
                  onChange={e =>
                    setCheckupPurposes(prev => ({
                      ...prev,
                      additionalConcerns: e.target.value,
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
