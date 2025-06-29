import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/common/components/ui/badge';
import { AuroraText } from '~/common/components/magicui/aurora-text';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';

interface FaqItemProps {
  value: string;
  question: string;
  answer: string;
}

function FaqItem({ value, question, answer }: FaqItemProps) {
  return (
    <AccordionItem
      value={value}
      className="bg-white/5 backdrop-blur-sm mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl"
    >
      <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-primary/5 transition-colors duration-300 font-medium text-sm sm:text-base">
        <div className="flex items-start sm:items-center">
          <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 sm:mr-3 text-primary flex-shrink-0 mt-0.5 sm:mt-0">
            <span className="text-xs">Q</span>
          </div>
          <span className="text-left leading-relaxed">{question}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/5">
        <div className="pt-3 sm:pt-4 text-muted-foreground flex">
          <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-muted/50 flex items-center justify-center mr-2 sm:mr-3 text-muted-foreground shrink-0 mt-0.5">
            <span className="text-xs">A</span>
          </div>
          <div className="text-sm sm:text-base leading-relaxed">{answer}</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function FAQSection() {
  const { t, i18n } = useTranslation('landing');
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 감지 (SSR/CSR mismatch 방지)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 다국어 FAQ 데이터
  const getLocalizedFAQs = () => {
    const currentLang = isHydrated ? i18n.language : 'ko';

    const localizedFAQs = {
      ko: [
        {
          category: 'service',
          faqs: [
            {
              id: '1',
              question: 'SureCRM은 어떤 서비스인가요?',
              answer:
                'SureCRM은 보험설계사를 위한 전문 CRM SaaS 솔루션입니다. 고객 관리, 소개 네트워크 시각화, 영업 파이프라인 관리, 일정 관리 등을 통해 보험설계사의 업무 효율성을 극대화하고 소개 네트워크를 체계적으로 관리할 수 있습니다.',
            },
            {
              id: '2',
              question: '14일 무료 트라이얼은 어떻게 진행되나요?',
              answer:
                '회원가입 후 자동으로 14일 무료 트라이얼이 시작됩니다. 트라이얼 기간 동안 모든 기능을 제한 없이 사용하실 수 있으며, 결제 정보를 입력하지 않아도 됩니다. 트라이얼 종료 후 계속 사용하시려면 유료 구독으로 전환하시면 됩니다.',
            },
            {
              id: '3',
              question: '월 구독료는 얼마인가요?',
              answer:
                'SureCRM의 월 구독료는 $20입니다. 이 요금으로 모든 핵심 기능을 이용하실 수 있으며, 고객 데이터 무제한 저장, 소개 네트워크 분석, 영업 파이프라인 관리, 일정 관리 등이 포함됩니다.',
            },
            {
              id: '4',
              question: '결제는 언제 이루어지나요?',
              answer:
                '14일 무료 트라이얼 종료 후, 계속 사용하시기로 결정하시면 그때부터 월 단위로 $20가 자동 결제됩니다. 트라이얼 기간 중에는 어떠한 비용도 청구되지 않습니다.',
            },
            {
              id: '5',
              question: '언제든지 구독을 취소할 수 있나요?',
              answer:
                '네, 언제든지 구독을 취소하실 수 있습니다. 설정 메뉴에서 간단히 취소할 수 있으며, 취소 후에도 현재 결제 주기가 끝날 때까지는 서비스를 계속 이용하실 수 있습니다.',
            },
          ],
        },
      ],
      en: [
        {
          category: 'service',
          faqs: [
            {
              id: '1',
              question: 'What is SureCRM?',
              answer:
                'SureCRM is a professional CRM SaaS solution for insurance agents. It maximizes work efficiency and systematically manages referral networks through customer management, referral network visualization, sales pipeline management, and schedule management.',
            },
            {
              id: '2',
              question: 'How does the 14-day free trial work?',
              answer:
                'The 14-day free trial starts automatically after signing up. During the trial period, you can use all features without restrictions and no payment information is required. To continue using after the trial ends, simply convert to a paid subscription.',
            },
            {
              id: '3',
              question: 'What is the monthly subscription fee?',
              answer:
                "SureCRM's monthly subscription fee is $20. This price includes access to all core features including unlimited customer data storage, referral network analysis, sales pipeline management, and schedule management.",
            },
            {
              id: '4',
              question: 'When is payment processed?',
              answer:
                'After the 14-day free trial ends, if you decide to continue using the service, $20 will be automatically charged monthly from that point. No charges are made during the trial period.',
            },
            {
              id: '5',
              question: 'Can I cancel my subscription at any time?',
              answer:
                'Yes, you can cancel your subscription at any time. You can easily cancel from the settings menu, and even after cancellation, you can continue using the service until the end of your current billing cycle.',
            },
          ],
        },
      ],
      ja: [
        {
          category: 'service',
          faqs: [
            {
              id: '1',
              question: 'SureCRMとは何ですか？',
              answer:
                'SureCRMは保険設計士のための専門CRM SaaSソリューションです。顧客管理、紹介ネットワーク可視化、営業パイプライン管理、スケジュール管理などを通じて保険設計士の業務効率性を最大化し、紹介ネットワークを体系的に管理できます。',
            },
            {
              id: '2',
              question: '14日間無料トライアルはどのように進行されますか？',
              answer:
                '会員登録後、自動的に14日間無料トライアルが開始されます。トライアル期間中はすべての機能を制限なしに使用でき、決済情報を入力する必要もありません。トライアル終了後も続けて使用される場合は、有料サブスクリプションに転換してください。',
            },
            {
              id: '3',
              question: '月額利用料はいくらですか？',
              answer:
                'SureCRMの月額利用料は$20です。この料金ですべてのコア機能をご利用いただけ、顧客データ無制限保存、紹介ネットワーク分析、営業パイプライン管理、スケジュール管理などが含まれます。',
            },
            {
              id: '4',
              question: '決済はいつ行われますか？',
              answer:
                '14日間無料トライアル終了後、継続してご使用になることを決定された場合、その時点から月単位で$20が自動決済されます。トライアル期間中はいかなる費用も請求されません。',
            },
            {
              id: '5',
              question: 'いつでもサブスクリプションをキャンセルできますか？',
              answer:
                'はい、いつでもサブスクリプションをキャンセルできます。設定メニューから簡単にキャンセルでき、キャンセル後も現在の請求サイクルが終了するまではサービスを継続してご利用いただけます。',
            },
          ],
        },
      ],
    };

    return (
      localizedFAQs[currentLang as keyof typeof localizedFAQs] ||
      localizedFAQs.ko
    );
  };

  const displayFAQs = getLocalizedFAQs();

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 relative">
      <AnimatedGridPattern
        className="absolute inset-0 opacity-20 pointer-events-none [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        numSquares={25}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
          >
            {isHydrated ? t('faq.badge') : '자주 묻는 질문'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            <AuroraText color="orange" speed={12} intensity={0.4}>
              {isHydrated ? t('faq.headline') : '궁금한 점이 있으신가요?'}
            </AuroraText>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            {isHydrated
              ? t('faq.description')
              : 'SureCRM에 대해 궁금한 점을 확인하세요.'}
          </p>
        </div>

        <div className="max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {displayFAQs.flatMap((category, categoryIndex) =>
              category.faqs.map((faq, faqIndex) => (
                <FaqItem
                  key={faq.id}
                  value={`item-${categoryIndex}-${faqIndex}`}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))
            )}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
