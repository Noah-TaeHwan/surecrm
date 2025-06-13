import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Separator } from '~/common/components/ui/separator';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  CreditCard,
  Shield,
  Loader2,
  User,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';

interface PaymentFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing: boolean;
}

interface PaymentFormProps {
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingInterval: string;
  };
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
}

export function PaymentForm({
  selectedPlan,
  onSubmit,
  isLoading = false,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    companyName: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false,
  });

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`;
    }
    return `$${price}`;
  };

  const handleInputChange = (
    field: keyof PaymentFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone
    ) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    onSubmit(formData);
  };

  const isFormValid =
    formData.customerName &&
    formData.customerEmail &&
    formData.customerPhone &&
    formData.agreeToTerms &&
    formData.agreeToPrivacy;

  return (
    <div className="space-y-6">
      {/* 선택된 플랜 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            결제 정보
          </CardTitle>
          <CardDescription>
            선택하신 플랜을 확인하고 결제를 진행하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">{selectedPlan.name}</h3>
              <p className="text-sm text-muted-foreground">매월 자동 결제</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                {formatPrice(selectedPlan.price, selectedPlan.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                / 월 (부가세 포함)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고객 정보 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            고객 정보
          </CardTitle>
          <CardDescription>
            결제 및 서비스 이용을 위한 기본 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-medium">
                  이름 *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="홍길동"
                    value={formData.customerName}
                    onChange={e =>
                      handleInputChange('customerName', e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-medium">
                  휴대폰 번호 *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.customerPhone}
                    onChange={e =>
                      handleInputChange('customerPhone', e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-sm font-medium">
                이메일 주소 *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="hong@example.com"
                  value={formData.customerEmail}
                  onChange={e =>
                    handleInputChange('customerEmail', e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                회사명 (선택)
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="(주)보험설계사무소"
                  value={formData.companyName}
                  onChange={e =>
                    handleInputChange('companyName', e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* 약관 동의 */}
            <div className="space-y-4">
              <h4 className="font-medium">약관 동의</h4>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={checked =>
                      handleInputChange('agreeToTerms', checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="text-destructive">*</span>{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      이용약관
                    </a>
                    에 동의합니다.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={checked =>
                      handleInputChange('agreeToPrivacy', checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="agreeToPrivacy"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="text-destructive">*</span>{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      개인정보처리방침
                    </a>
                    에 동의합니다.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={checked =>
                      handleInputChange('agreeToMarketing', checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="agreeToMarketing"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    마케팅 정보 수신에 동의합니다. (선택)
                  </Label>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 결제 버튼 */}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    결제 처리 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {formatPrice(
                      selectedPlan.price,
                      selectedPlan.currency
                    )}{' '}
                    결제하기
                  </>
                )}
              </Button>

              {/* 보안 정보 */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>SSL 암호화로 안전하게 보호됩니다</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* TossPayments 결제 위젯 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 수단</CardTitle>
          <CardDescription>
            안전한 토스페이먼츠 결제 시스템을 통해 결제가 진행됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">결제 위젯이 여기에 표시됩니다</p>
              <p className="text-xs">(토스페이먼츠 SDK 연동 후)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
