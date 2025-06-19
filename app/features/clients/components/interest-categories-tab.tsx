import { TabsContent } from '~/common/components/ui/tabs';
import { Card, CardContent, CardHeader } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { cn } from '~/lib/utils';

interface InterestCategoriesData {
  interestedInAutoInsurance: boolean;
  interestedInDementia: boolean;
  interestedInDental: boolean;
  interestedInDriverInsurance: boolean;
  interestedInHealthCheckup: boolean;
  interestedInMedicalExpenses: boolean;
  interestedInFireInsurance: boolean;
  interestedInCaregiver: boolean;
  interestedInCancer: boolean;
  interestedInSavings: boolean;
  interestedInLiability: boolean;
  interestedInLegalAdvice: boolean;
  interestedInTax: boolean;
  interestedInInvestment: boolean;
  interestedInPetInsurance: boolean;
  interestedInAccidentInsurance: boolean;
  interestedInTrafficAccident: boolean;
  interestNotes: string;
}

interface InterestCategoriesTabProps {
  interestCategories: InterestCategoriesData;
  setInterestCategories: React.Dispatch<
    React.SetStateAction<InterestCategoriesData>
  >;
  onSave: () => void;
}

export function InterestCategoriesTab({
  interestCategories,
  setInterestCategories,
  onSave,
}: InterestCategoriesTabProps) {
  return (
    <TabsContent value="interests" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              관심사항
            </h3>
            <Button
              size="sm"
              className="flex-shrink-0"
              onClick={async () => {
                try {
                  await onSave();
                } catch (error) {
                  console.error('관심사항 저장 실패:', error);
                }
              }}
            >
              <span className="hidden sm:inline">관심사항 </span>저장
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* 🚗 보험 관련 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              🚗 보험 관련 관심사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
              {[
                {
                  key: 'interestedInAutoInsurance',
                  label: '자동차보험',
                  icon: '🚗',
                },
                {
                  key: 'interestedInDriverInsurance',
                  label: '운전자',
                  icon: '🚙',
                },
                {
                  key: 'interestedInFireInsurance',
                  label: '화재보험',
                  icon: '🔥',
                },
                {
                  key: 'interestedInLiability',
                  label: '일상배상책임',
                  icon: '⚖️',
                },
                {
                  key: 'interestedInAccidentInsurance',
                  label: '상해보험',
                  icon: '🩹',
                },
                {
                  key: 'interestedInPetInsurance',
                  label: '펫보험',
                  icon: '🐕',
                },
              ].map(item => (
                <div
                  key={item.key}
                  className={cn(
                    'flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors',
                    'hover:bg-muted/20 md:hover:bg-transparent',
                    'min-h-[44px] md:min-h-0'
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`insurance-${item.key}`}
                      checked={
                        interestCategories[
                          item.key as keyof typeof interestCategories
                        ] as boolean
                      }
                      onCheckedChange={checked =>
                        setInterestCategories(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`insurance-${item.key}`}
                      className={cn(
                        'text-sm cursor-pointer leading-relaxed flex-1',
                        'hover:text-primary transition-colors'
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🏥 건강 관련 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              🏥 건강 관련 관심사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-secondary/30 rounded-lg border border-border/60">
              {[
                {
                  key: 'interestedInDementia',
                  label: '치매',
                  icon: '🧠',
                },
                {
                  key: 'interestedInDental',
                  label: '치아(임플란트)',
                  icon: '🦷',
                },
                {
                  key: 'interestedInHealthCheckup',
                  label: '건강검진',
                  icon: '🏥',
                },
                {
                  key: 'interestedInMedicalExpenses',
                  label: '실비원가',
                  icon: '💊',
                },
                {
                  key: 'interestedInCaregiver',
                  label: '간병인',
                  icon: '👩‍⚕️',
                },
                {
                  key: 'interestedInCancer',
                  label: '암 (표적항암, 로봇수술)',
                  icon: '🎗️',
                },
              ].map(item => (
                <div
                  key={item.key}
                  className={cn(
                    'flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors',
                    'hover:bg-muted/20 md:hover:bg-transparent',
                    'min-h-[44px] md:min-h-0'
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`health-${item.key}`}
                      checked={
                        interestCategories[
                          item.key as keyof typeof interestCategories
                        ] as boolean
                      }
                      onCheckedChange={checked =>
                        setInterestCategories(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`health-${item.key}`}
                      className={cn(
                        'text-sm cursor-pointer leading-relaxed flex-1',
                        'hover:text-primary transition-colors'
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💰 재정 관련 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              💰 재정 관련 관심사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              {[
                {
                  key: 'interestedInSavings',
                  label: '저축 (연금, 노후, 목돈)',
                  icon: '💰',
                },
                {
                  key: 'interestedInInvestment',
                  label: '재테크',
                  icon: '📈',
                },
                {
                  key: 'interestedInTax',
                  label: '상속세, 양도세',
                  icon: '📋',
                },
              ].map(item => (
                <div
                  key={item.key}
                  className={cn(
                    'flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors',
                    'hover:bg-muted/20 md:hover:bg-transparent',
                    'min-h-[44px] md:min-h-0'
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`finance-${item.key}`}
                      checked={
                        interestCategories[
                          item.key as keyof typeof interestCategories
                        ] as boolean
                      }
                      onCheckedChange={checked =>
                        setInterestCategories(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`finance-${item.key}`}
                      className={cn(
                        'text-sm cursor-pointer leading-relaxed flex-1',
                        'hover:text-primary transition-colors'
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⚖️ 법률 관련 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              ⚖️ 법률 관련 관심사항
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
              {[
                {
                  key: 'interestedInLegalAdvice',
                  label: '민사소송법률',
                  icon: '⚖️',
                },
                {
                  key: 'interestedInTrafficAccident',
                  label: '교통사고(합의)',
                  icon: '🚨',
                },
              ].map(item => (
                <div
                  key={item.key}
                  className={cn(
                    'flex items-center gap-3 p-2 md:p-0 rounded-md transition-colors',
                    'hover:bg-muted/20 md:hover:bg-transparent',
                    'min-h-[44px] md:min-h-0'
                  )}
                >
                  <span className="text-base md:text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`legal-${item.key}`}
                      checked={
                        interestCategories[
                          item.key as keyof typeof interestCategories
                        ] as boolean
                      }
                      onCheckedChange={checked =>
                        setInterestCategories(prev => ({
                          ...prev,
                          [item.key]: checked === true,
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`legal-${item.key}`}
                      className={cn(
                        'text-sm cursor-pointer leading-relaxed flex-1',
                        'hover:text-primary transition-colors'
                      )}
                    >
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📝 기타 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              📝 기타 관심사항
            </h4>
            <div className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  위 목록에 없는 관심사항이나 추가로 알고 싶은 내용을
                  입력해주세요
                </Label>
                <Textarea
                  className="min-h-[100px] text-sm"
                  placeholder="기타 관심사항을 자세히 입력해주세요..."
                  value={interestCategories.interestNotes}
                  onChange={e =>
                    setInterestCategories(prev => ({
                      ...prev,
                      interestNotes: e.target.value,
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
