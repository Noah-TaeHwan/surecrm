import { Badge } from '~/common/components/ui/badge';
import { AuroraText } from '~/common/components/ui/aurora-text';
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
      className="bg-white/5 backdrop-blur-sm mb-4 overflow-hidden rounded-xl"
    >
      <AccordionTrigger className="px-6 py-5 hover:bg-primary/5 transition-colors duration-300 font-medium">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
            <span className="text-xs">Q</span>
          </div>
          {question}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 border-t border-white/5">
        <div className="pt-4 text-muted-foreground flex">
          <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center mr-3 text-muted-foreground shrink-0 mt-0.5">
            <span className="text-xs">A</span>
          </div>
          <div>{answer}</div>
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
    <section id="faq" className="py-20 relative">
      <AnimatedGridPattern
        className="absolute inset-0 opacity-20 pointer-events-none [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        numSquares={25}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-4 py-1.5 text-sm font-medium"
          >
            자주 묻는 질문
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <AuroraText color="orange" speed={12} intensity={0.4}>
              궁금한 점이 있으신가요?
            </AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SureCRM에 대해 궁금한 점을 확인하세요.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
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
