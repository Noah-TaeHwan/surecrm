import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { InterestCardGrid } from './interest-card-grid';
import { TextareaField } from './textarea-field';
import { SaveButton } from './save-button-handler';

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
    <TabsContent value="interests" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-lg">❓</span>
            무엇이든 물어보세요!
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            고객의 관심사항을 체크리스트로 관리합니다.
          </p>
          {/* 저장 버튼 */}
          <SaveButton onSave={onSave} label="관심사항 저장" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <InterestCardGrid
            items={[
              {
                key: 'interestedInAutoInsurance',
                label: '자동차보험',
                icon: '🚗',
              },
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
                key: 'interestedInDriverInsurance',
                label: '운전자',
                icon: '🚙',
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
                key: 'interestedInFireInsurance',
                label: '화재보험',
                icon: '🔥',
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
              {
                key: 'interestedInSavings',
                label: '저축 (연금, 노후, 목돈)',
                icon: '💰',
              },
              {
                key: 'interestedInLiability',
                label: '일상배상책임',
                icon: '⚖️',
              },
              {
                key: 'interestedInLegalAdvice',
                label: '민사소송법률',
                icon: '⚖️',
              },
              {
                key: 'interestedInTax',
                label: '상속세, 양도세',
                icon: '📋',
              },
              {
                key: 'interestedInInvestment',
                label: '재테크',
                icon: '📈',
              },
              {
                key: 'interestedInPetInsurance',
                label: '펫보험',
                icon: '🐕',
              },
              {
                key: 'interestedInAccidentInsurance',
                label: '상해보험',
                icon: '🩹',
              },
              {
                key: 'interestedInTrafficAccident',
                label: '교통사고(합의)',
                icon: '🚨',
              },
            ]}
            values={interestCategories}
            onChange={(key, checked) =>
              setInterestCategories((prev) => ({
                ...prev,
                [key]: checked,
              }))
            }
          />

          {/* 추가 관심사항 */}
          <TextareaField
            label="기타 관심사항"
            value={interestCategories.interestNotes}
            onChange={(value) =>
              setInterestCategories((prev) => ({
                ...prev,
                interestNotes: value,
              }))
            }
            placeholder="위 목록에 없는 관심사항이나 추가로 알고 싶은 내용을 입력해주세요..."
            rows={4}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
