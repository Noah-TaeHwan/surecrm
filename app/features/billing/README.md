# 💳 구독 관리 (Billing) 기능

## 🚧 현재 상태: MVP 비활성화

이 기능은 현재 **MVP 단계에서 비활성화** 되어 있습니다.

### ❌ 비활성화된 이유

- 결제 시스템 연동 복잡성
- TossPayments API 연동 필요
- 법적 요구사항 (전자상거래법, 개인정보보호법 등) 대응 필요
- MVP 단계에서는 핵심 CRM 기능에 집중

### 📍 현재 접근 방법

- 사이드바 메뉴에서 **주석 처리** 됨
- 직접 URL 접근(`/billing/subscribe`) 시에만 확인 가능
- 모든 관련 컴포넌트에 비활성화 주석 추가

### 🔮 향후 계획 (Post-MVP)

#### 1단계: 기본 구독 시스템

- [ ] TossPayments API 연동
- [ ] 결제 플로우 구현
- [ ] 구독 상태 관리
- [ ] 청구 및 영수증 발행

#### 2단계: 고급 기능

- [ ] 다양한 요금제 옵션
- [ ] 사용량 기반 과금
- [ ] 할인 쿠폰 시스템
- [ ] 결제 실패 처리

#### 3단계: 엔터프라이즈

- [ ] 팀 단위 결제
- [ ] 비용 센터 관리
- [ ] 세금 계산서 발행
- [ ] 대량 구매 할인

### 📁 현재 파일 구조

```
app/features/billing/
├── README.md                          # 이 파일
├── components/
│   ├── simple-subscription-page.tsx   # 🚧 심플한 구독 페이지 (비활성화)
│   ├── subscription-stepper.tsx       # 🚧 다단계 구독 스테퍼 (비활성화)
│   ├── plan-selection/               # 🚧 요금제 선택 (비활성화)
│   ├── payment/                      # 🚧 결제 컴포넌트 (비활성화)
│   └── subscription/                 # 🚧 구독 관리 (비활성화)
├── hooks/                            # 🚧 구독 관련 훅 (비활성화)
├── lib/                              # 🚧 구독 로직 (비활성화)
├── pages/                            # 🚧 구독 페이지 (비활성화)
└── types/                            # 🚧 구독 타입 (비활성화)
```

### 🔄 활성화하려면

1. **사이드바 메뉴 활성화**

   ```typescript
   // app/common/components/navigation/sidebar.tsx
   {
     label: '구독 관리',
     href: '/billing/subscribe',
     icon: <CreditCard className="h-5 w-5" />,
   },
   ```

2. **컴포넌트 주석 제거**

   - 각 파일 상단의 "MVP 비활성화" 주석 제거

3. **결제 시스템 연동**
   - TossPayments 계정 생성 및 API 키 설정
   - Webhook 엔드포인트 구현
   - 실제 결제 처리 로직 완성

### 📞 문의

구독 관리 기능 개발 일정이나 우선순위 변경이 필요한 경우:

- 개발팀 담당자에게 연락
- GitHub Issue 생성
- 제품 로드맵 검토 요청
