import { useState } from 'react';
import { MobileInput, ResponsiveInput } from '~/common/components/responsive';
import {
  Search,
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
} from 'lucide-react';

export function meta() {
  return [
    { title: 'Mobile Input 컴포넌트 테스트 - SureCRM' },
    {
      name: 'description',
      content:
        'MobileInput과 ResponsiveInput 컴포넌트의 다양한 사용 사례와 접근성 기능을 테스트합니다.',
    },
  ];
}

export default function TestMobileInputPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    search: '',
    amount: '',
    cardNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // 에러 클리어
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('폼 제출 성공!');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Mobile Input 컴포넌트 테스트</h1>
          <p className="text-muted-foreground">
            WCAG 2.5.5 AAA 준수 모바일 최적화 Input 컴포넌트들을 테스트해보세요
          </p>
        </div>

        {/* 기본 MobileInput 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            1. 기본 MobileInput 컴포넌트
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 크기 변형 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">크기 변형</h3>
              <MobileInput
                label="Small 크기"
                placeholder="작은 크기 입력 필드"
                size="sm"
              />
              <MobileInput
                label="Default 크기"
                placeholder="기본 크기 입력 필드"
                size="default"
              />
              <MobileInput
                label="Large 크기"
                placeholder="큰 크기 입력 필드"
                size="lg"
              />
              <MobileInput
                label="Extra Large 크기"
                placeholder="매우 큰 크기 입력 필드"
                size="xl"
              />
            </div>

            {/* 상태 변형 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">상태 변형</h3>
              <MobileInput
                label="기본 상태"
                placeholder="기본 상태 입력 필드"
                state="default"
              />
              <MobileInput
                label="에러 상태"
                placeholder="에러 상태 입력 필드"
                state="error"
                error="이 필드는 필수입니다."
              />
              <MobileInput
                label="성공 상태"
                placeholder="성공 상태 입력 필드"
                state="success"
                successMessage="올바르게 입력되었습니다."
              />
              <MobileInput
                label="경고 상태"
                placeholder="경고 상태 입력 필드"
                state="warning"
                warningMessage="입력을 확인해주세요."
              />
            </div>
          </div>
        </section>

        {/* 터치 피드백 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. 터치 피드백 강도</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <MobileInput
              label="Subtle 피드백"
              placeholder="미세한 터치 피드백"
              touchFeedback="subtle"
            />
            <MobileInput
              label="Medium 피드백"
              placeholder="중간 터치 피드백"
              touchFeedback="medium"
            />
            <MobileInput
              label="Strong 피드백"
              placeholder="강한 터치 피드백"
              touchFeedback="strong"
            />
          </div>
        </section>

        {/* 아이콘과 함께 사용 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. 아이콘과 함께 사용</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <MobileInput
              label="검색"
              placeholder="검색어를 입력하세요"
              startIcon={<Search className="h-4 w-4" />}
              value={formData.search}
              onChange={handleInputChange('search')}
            />
            <MobileInput
              label="이메일"
              type="email"
              inputMode="email"
              placeholder="이메일을 입력하세요"
              startIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
            />
            <MobileInput
              label="전화번호"
              type="tel"
              inputMode="tel"
              placeholder="전화번호를 입력하세요"
              startIcon={<Phone className="h-4 w-4" />}
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={errors.phone}
            />
            <MobileInput
              label="금액"
              type="number"
              inputMode="numeric"
              placeholder="금액을 입력하세요"
              startIcon={<CreditCard className="h-4 w-4" />}
              endIcon={
                <span className="text-sm text-muted-foreground">원</span>
              }
              value={formData.amount}
              onChange={handleInputChange('amount')}
            />
          </div>
        </section>

        {/* 비밀번호 필드 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. 비밀번호 필드</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <MobileInput
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              startIcon={<Lock className="h-4 w-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              helperText="8자 이상의 비밀번호를 입력하세요"
              required
            />
            <MobileInput
              label="비밀번호 확인"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력하세요"
              startIcon={<Lock className="h-4 w-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              required
            />
          </div>
        </section>

        {/* ResponsiveInput 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            5. ResponsiveInput 컴포넌트
          </h2>
          <p className="text-muted-foreground">
            화면 크기에 따라 자동으로 데스크톱/모바일 버전을 선택합니다
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <ResponsiveInput
              label="반응형 이름 필드"
              placeholder="이름을 입력하세요"
              startIcon={<User className="h-4 w-4" />}
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              required
            />
            <ResponsiveInput
              label="강제 모바일 버전"
              placeholder="항상 모바일 스타일"
              forceVariant="mobile"
              size="lg"
              touchFeedback="strong"
              startIcon={<User className="h-4 w-4" />}
            />
            <ResponsiveInput
              label="강제 데스크톱 버전"
              placeholder="항상 데스크톱 스타일"
              forceVariant="desktop"
            />
            <ResponsiveInput
              label="모바일 전용 옵션"
              placeholder="모바일에서만 특별한 기능"
              mobileOnly={{
                size: 'xl',
                touchFeedback: 'strong',
                successMessage: '모바일에서만 보이는 성공 메시지',
                startIcon: <Search className="h-4 w-4" />,
              }}
            />
          </div>
        </section>

        {/* 폼 제출 테스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. 폼 제출 테스트</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ResponsiveInput
                label="이름"
                placeholder="이름을 입력하세요"
                startIcon={<User className="h-4 w-4" />}
                value={formData.name}
                onChange={handleInputChange('name')}
                error={errors.name}
                required
              />
              <ResponsiveInput
                label="이메일"
                type="email"
                inputMode="email"
                placeholder="이메일을 입력하세요"
                startIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-4 py-2 rounded-md font-medium transition-colors"
            >
              폼 제출하기
            </button>
          </form>
        </section>

        {/* 접근성 정보 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. 접근성 기능</h2>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-medium">구현된 접근성 기능:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>WCAG 2.5.5 AAA 준수 - 최소 44px 터치 타겟</li>
              <li>완전한 키보드 네비게이션 지원</li>
              <li>스크린 리더 호환성 (ARIA 라벨링)</li>
              <li>명확한 포커스 표시</li>
              <li>에러 상태 음성 안내 (role="alert")</li>
              <li>햅틱 피드백 (지원 기기에서)</li>
              <li>네이티브 키보드 타입 최적화</li>
              <li>충분한 색상 대비</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
