import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Filter, Tag, Users } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group';
import { Label } from '~/common/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';

interface Referrer {
  id: string;
  name: string;
}

interface PipelineFiltersProps {
  referrers: Referrer[];
  selectedReferrerId: string | null;
  onReferrerChange: (referrerId: string | null) => void;
  selectedImportance: 'all' | 'high' | 'medium' | 'low';
  onImportanceChange: (importance: 'all' | 'high' | 'medium' | 'low') => void;
}

export function PipelineFilters({
  referrers,
  selectedReferrerId,
  onReferrerChange,
  selectedImportance,
  onImportanceChange,
}: PipelineFiltersProps) {
  const { t } = useHydrationSafeTranslation('pipeline');

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high':
        return t('importance.highValue', '높음');
      case 'medium':
        return t('importance.mediumValue', '중간');
      case 'low':
        return t('importance.lowValue', '낮음');
      default:
        return t('importance.all', '전체');
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 중요도 필터 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            {t('filters.importance', '중요도 필터')}
          </CardTitle>
          <CardDescription>
            {t('filters.importanceDesc', '고객의 중요도 수준으로 필터링합니다')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedImportance}
            onValueChange={value =>
              onImportanceChange(value as 'all' | 'high' | 'medium' | 'low')
            }
            className="space-y-3"
          >
            {['all', 'high', 'medium', 'low'].map(importance => (
              <div key={importance} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={importance}
                  id={`importance-${importance}`}
                />
                <Label
                  htmlFor={`importance-${importance}`}
                  className="flex items-center"
                >
                  {importance !== 'all' && (
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        importance === 'high'
                          ? 'bg-red-500'
                          : importance === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                      }`}
                    />
                  )}
                  {getImportanceLabel(importance)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 소개자 필터 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {t('filters.referrer', '소개자 필터')}
          </CardTitle>
          <CardDescription>
            {t('filters.referrerDesc', '소개자별로 고객을 필터링합니다')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrers.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="referrers">
                <AccordionTrigger className="text-sm">
                  {t('filters.referrerList', '소개자 목록')} ({referrers.length}
                  {t('labels.people', '명')})
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={selectedReferrerId || 'all'}
                    onValueChange={value =>
                      onReferrerChange(value === 'all' ? null : value)
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="referrer-all" />
                      <Label htmlFor="referrer-all">
                        {t('filters.allClients', '모든 고객')}
                      </Label>
                    </div>
                    {referrers.map(referrer => (
                      <div
                        key={referrer.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={referrer.id}
                          id={`referrer-${referrer.id}`}
                        />
                        <Label htmlFor={`referrer-${referrer.id}`}>
                          {referrer.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {t('filters.noReferrers', '소개자 데이터가 없습니다')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 필터 초기화 버튼 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onReferrerChange(null);
          onImportanceChange('all');
        }}
      >
        <Filter className="h-4 w-4 mr-2" />
        {t('filters.clear', '필터 초기화')}
      </Button>
    </div>
  );
}
