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
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';

interface SubscriptionInfoData {
  // 개인 정보
  fullName: string;
  email: string;
  phone: string;

  // 회사 정보
  companyName: string;
  businessNumber?: string;
  position: string;

  // 주소 정보 (선택)
  address?: string;

  // 동의 사항
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing: boolean;
}

interface SubscriptionInfoFormProps {
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  onSubmit: (data: SubscriptionInfoData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function SubscriptionInfoForm({
  selectedPlan,
  onSubmit,
  onBack,
  isLoading = false,
}: SubscriptionInfoFormProps) {
  const [formData, setFormData] = useState<SubscriptionInfoData>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    businessNumber: '',
    position: '보험설계사',
    address: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`;
    }
    return `$${price}`;
  };

  const validateField = (
    field: keyof SubscriptionInfoData,
    value: string | boolean
  ) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value || (value as string).trim().length < 2) {
          newErrors[field] = '이름은 2글자 이상 입력해주세요.';
        } else {
          delete newErrors[field];
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value as string)) {
          newErrors[field] = '올바른 이메일 주소를 입력해주세요.';
        } else {
          delete newErrors[field];
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9-+\s()]{10,}$/;
        if (!value || !phoneRegex.test(value as string)) {
          newErrors[field] = '올바른 전화번호를 입력해주세요.';
        } else {
          delete newErrors[field];
        }
        break;
      case 'companyName':
        if (!value || (value as string).trim().length < 2) {
          newErrors[field] = '회사명을 입력해주세요.';
        } else {
          delete newErrors[field];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (
    field: keyof SubscriptionInfoData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (typeof value === 'string' && value.length > 0) {
      validateField(field, value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    const requiredFields: (keyof SubscriptionInfoData)[] = [
      'fullName',
      'email',
      'phone',
      'companyName',
    ];

    let hasErrors = false;
    requiredFields.forEach(field => {
      if (!formData[field] || (formData[field] as string).trim() === '') {
        validateField(field, '');
        hasErrors = true;
      }
    });

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (hasErrors || Object.keys(errors).length > 0) {
      alert('입력 정보를 확인해주세요.');
      return;
    }

    onSubmit(formData);
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.companyName.trim() &&
    formData.agreeToTerms &&
    formData.agreeToPrivacy &&
    Object.keys(errors).length === 0;

  return (
    <div className="space-y-8">
      {/* 선택된 플랜 요약 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedPlan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  선택된 구독 플랜
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatPrice(selectedPlan.price, selectedPlan.currency)}
              </div>
              <div className="text-sm text-muted-foreground">/ 월</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 정보 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 개인 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              개인 정보
            </CardTitle>
            <CardDescription>
              구독 계정 생성을 위한 기본 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  이름 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="홍길동"
                    value={formData.fullName}
                    onChange={e =>
                      handleInputChange('fullName', e.target.value)
                    }
                    className={`pl-10 ${
                      errors.fullName ? 'border-destructive' : ''
                    }`}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  휴대폰 번호 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${
                      errors.phone ? 'border-destructive' : ''
                    }`}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일 주소 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hong@example.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 회사 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              회사 정보
            </CardTitle>
            <CardDescription>
              보험설계사 업무와 관련된 회사 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  회사명 <span className="text-destructive">*</span>
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
                    className={`pl-10 ${
                      errors.companyName ? 'border-destructive' : ''
                    }`}
                    required
                  />
                </div>
                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                  직책
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="position"
                    type="text"
                    placeholder="보험설계사"
                    value={formData.position}
                    onChange={e =>
                      handleInputChange('position', e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* 고급 정보 토글 */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              >
                {showAdvanced ? '간단히 보기' : '추가 정보 입력 (선택)'}
                <ArrowRight
                  className={`ml-1 w-3 h-3 transition-transform ${
                    showAdvanced ? 'rotate-90' : ''
                  }`}
                />
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessNumber"
                      className="text-sm font-medium"
                    >
                      사업자등록번호 (선택)
                    </Label>
                    <Input
                      id="businessNumber"
                      type="text"
                      placeholder="123-45-67890"
                      value={formData.businessNumber}
                      onChange={e =>
                        handleInputChange('businessNumber', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      사무실 주소 (선택)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="서울시 강남구 테헤란로 123"
                        value={formData.address}
                        onChange={e =>
                          handleInputChange('address', e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 약관 동의 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>약관 동의</CardTitle>
            <CardDescription>
              SureCRM 서비스 이용을 위한 필수 약관에 동의해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={checked =>
                    handleInputChange('agreeToTerms', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="text-destructive">*</span>{' '}
                    <a
                      href="/terms"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      서비스 이용약관
                    </a>
                    에 동의합니다.
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onCheckedChange={checked =>
                    handleInputChange('agreeToPrivacy', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="agreeToPrivacy"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    <span className="text-destructive">*</span>{' '}
                    <a
                      href="/terms"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      개인정보처리방침
                    </a>
                    에 동의합니다.
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToMarketing"
                  checked={formData.agreeToMarketing}
                  onCheckedChange={checked =>
                    handleInputChange('agreeToMarketing', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="agreeToMarketing"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    마케팅 정보 수신에 동의합니다. (선택)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    새로운 기능, 이벤트, 할인 혜택 등의 정보를 받아보실 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>

            {(!formData.agreeToTerms || !formData.agreeToPrivacy) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  서비스 이용을 위해 필수 약관에 동의해주세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            이전 단계
          </Button>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="min-w-32"
          >
            {isLoading ? '처리 중...' : '다음 단계'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
