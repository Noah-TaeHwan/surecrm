import React from 'react';
import { TabsContent } from '~/common/components/ui/tabs';
import { Card, CardContent, CardHeader } from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { cn } from '~/lib/utils';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

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
  const { t } = useHydrationSafeTranslation('clients');

  // 보험 관련 관심사항 목록
  const insuranceInterests = [
    {
      key: 'interestedInAutoInsurance',
      label: t('interestCategoriesTab.autoInsurance', '자동차보험'),
      icon: '🚗',
    },
    {
      key: 'interestedInDriverInsurance',
      label: t('interestCategoriesTab.driverInsurance', '운전자'),
      icon: '🚙',
    },
    {
      key: 'interestedInFireInsurance',
      label: t('interestCategoriesTab.fireInsurance', '화재보험'),
      icon: '🔥',
    },
    {
      key: 'interestedInLiability',
      label: t('interestCategoriesTab.liability', '일상배상책임'),
      icon: '⚖️',
    },
    {
      key: 'interestedInAccidentInsurance',
      label: t('interestCategoriesTab.accidentInsurance', '상해보험'),
      icon: '🩹',
    },
    {
      key: 'interestedInPetInsurance',
      label: t('interestCategoriesTab.petInsurance', '펫보험'),
      icon: '🐕',
    },
  ];

  // 건강 관련 관심사항 목록
  const healthInterests = [
    {
      key: 'interestedInDementia',
      label: t('interestCategoriesTab.dementia', '치매'),
      icon: '🧠',
    },
    {
      key: 'interestedInDental',
      label: t('interestCategoriesTab.dental', '치아(임플란트)'),
      icon: '🦷',
    },
    {
      key: 'interestedInHealthCheckup',
      label: t('interestCategoriesTab.healthCheckup', '건강검진'),
      icon: '🏥',
    },
    {
      key: 'interestedInMedicalExpenses',
      label: t('interestCategoriesTab.medicalExpenses', '실비원가'),
      icon: '💊',
    },
    {
      key: 'interestedInCaregiver',
      label: t('interestCategoriesTab.caregiver', '간병인'),
      icon: '👩‍⚕️',
    },
    {
      key: 'interestedInCancer',
      label: t('interestCategoriesTab.cancer', '암 (표적항암, 로봇수술)'),
      icon: '🎗️',
    },
  ];

  // 재정 관련 관심사항 목록
  const financeInterests = [
    {
      key: 'interestedInSavings',
      label: t('interestCategoriesTab.savings', '저축 (연금, 노후, 목돈)'),
      icon: '💰',
    },
    {
      key: 'interestedInInvestment',
      label: t('interestCategoriesTab.investment', '재테크'),
      icon: '📈',
    },
    {
      key: 'interestedInTax',
      label: t('interestCategoriesTab.tax', '상속세, 양도세'),
      icon: '📋',
    },
  ];

  // 법률 관련 관심사항 목록
  const legalInterests = [
    {
      key: 'interestedInLegalAdvice',
      label: t('interestCategoriesTab.legalAdvice', '민사소송법률'),
      icon: '⚖️',
    },
    {
      key: 'interestedInTrafficAccident',
      label: t('interestCategoriesTab.trafficAccident', '교통사고(합의)'),
      icon: '🚨',
    },
  ];

  return (
    <TabsContent value="interests" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              {t('interestCategoriesTab.title', '관심사항')}
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
              <span className="hidden sm:inline">
                {t('interestCategoriesTab.saveButtonFull', '관심사항 저장')}
              </span>
              <span className="sm:hidden">
                {t('interestCategoriesTab.saveButton', '저장')}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* 🚗 보험 관련 관심사항 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
              🚗{' '}
              {t(
                'interestCategoriesTab.insuranceSection',
                '보험 관련 관심사항'
              )}
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
              {insuranceInterests.map(item => (
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
              🏥{' '}
              {t('interestCategoriesTab.healthSection', '건강 관련 관심사항')}
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-secondary/30 rounded-lg border border-border/60">
              {healthInterests.map(item => (
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
              💰{' '}
              {t('interestCategoriesTab.financeSection', '재정 관련 관심사항')}
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              {financeInterests.map(item => (
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
              ⚖️ {t('interestCategoriesTab.legalSection', '법률 관련 관심사항')}
            </h4>
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
              {legalInterests.map(item => (
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
              📝 {t('interestCategoriesTab.additionalSection', '기타 관심사항')}
            </h4>
            <div className="p-3 md:p-4 bg-muted/20 rounded-lg border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm text-muted-foreground font-medium">
                  {t(
                    'interestCategoriesTab.additionalNotesLabel',
                    '위 목록에 없는 관심사항이나 추가로 알고 싶은 내용을 입력해주세요'
                  )}
                </Label>
                <Textarea
                  className="min-h-[100px] text-sm"
                  placeholder={t(
                    'interestCategoriesTab.additionalNotesPlaceholder',
                    '기타 관심사항을 자세히 입력해주세요...'
                  )}
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
