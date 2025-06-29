import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  isPopular?: boolean;
  isSelected?: boolean;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
}

export function PlanCard({ plan, onSelect, isLoading = false }: PlanCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`;
    }
    return `$${price}`;
  };

  const getBillingIntervalText = (interval: string) => {
    switch (interval) {
      case 'month':
        return '월';
      case 'year':
        return '년';
      default:
        return interval;
    }
  };

  return (
    <Card
      className={`relative transition-all duration-200 ${
        plan.isPopular
          ? 'border-primary shadow-lg ring-1 ring-primary/20'
          : 'hover:shadow-md'
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            추천 플랜
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">
          {plan.description}
        </CardDescription>

        <div className="pt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-muted-foreground">
              / {getBillingIntervalText(plan.billingInterval)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 기능 목록 */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* 선택 버튼 */}
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isLoading}
          className="w-full"
          size="lg"
          variant={plan.isPopular ? 'default' : 'outline'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            '시작하기'
          )}
        </Button>

        {/* 추가 정보 */}
        <div className="text-center text-xs text-muted-foreground">
          언제든지 취소 가능 • 14일 무료 체험
        </div>
      </CardContent>
    </Card>
  );
}
