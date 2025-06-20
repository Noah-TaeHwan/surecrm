import { Badge } from '~/common/components/ui/badge';
import { AuroraText } from '~/common/components/magicui/aurora-text';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

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

interface FAQSectionProps {
  faqs: FAQCategory[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
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
            자주 묻는 질문
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            <AuroraText color="orange" speed={12} intensity={0.4}>
              궁금한 점이 있으신가요?
            </AuroraText>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            SureCRM에 대해 궁금한 점을 확인하세요.
          </p>
        </div>

        <div className="max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.flatMap((category, categoryIndex) =>
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
