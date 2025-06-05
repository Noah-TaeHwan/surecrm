import { TabsContent } from '~/common/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { CheckboxGroup } from './checkbox-group';
import { BoxedTextareaField, TextareaField } from './textarea-field';
import { SaveButton } from './save-button-handler';

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
    <TabsContent value="checkup" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-lg">🎯</span>
            점검 목적
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            고객의 보험 관련 걱정사항과 필요사항을 파악합니다.
          </p>
          {/* 저장 버튼 */}
          <SaveButton onSave={onSave} label="점검목적 저장" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* 걱정사항 체크리스트 */}
          <CheckboxGroup
            title="😟 현재 걱정되는 사항"
            items={[
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
            ]}
            values={checkupPurposes}
            onChange={(key, checked) =>
              setCheckupPurposes((prev) => ({
                ...prev,
                [key]: checked,
              }))
            }
            gridCols="grid-cols-2"
            bgColor="bg-muted/25"
            borderColor="border-border/50"
          />

          {/* 필요사항 체크리스트 */}
          <CheckboxGroup
            title="✅ 필요한 사항"
            items={[
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
            ]}
            values={checkupPurposes}
            onChange={(key, checked) =>
              setCheckupPurposes((prev) => ({
                ...prev,
                [key]: checked,
              }))
            }
            gridCols="grid-cols-2"
            bgColor="bg-accent/25"
            borderColor="border-border/50"
          />

          {/* 저축 현황 (주관식) */}
          <BoxedTextareaField
            label="💰 저축 현황"
            boxLabel="지금 저축은 어디서 하고 계신가요?"
            value={checkupPurposes.currentSavingsLocation}
            onChange={(value) =>
              setCheckupPurposes((prev) => ({
                ...prev,
                currentSavingsLocation: value,
              }))
            }
            placeholder="저축 현황에 대해 자세히 입력해주세요..."
            rows={3}
          />

          {/* 추가 걱정사항 */}
          <TextareaField
            label="기타 걱정사항"
            value={checkupPurposes.additionalConcerns}
            onChange={(value) =>
              setCheckupPurposes((prev) => ({
                ...prev,
                additionalConcerns: value,
              }))
            }
            placeholder="기타 걱정사항이나 추가로 논의하고 싶은 내용을 입력해주세요..."
            rows={4}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
