import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function TermsPage() {
  const { t } = useTranslation('common');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  // 안전한 번역 함수 - 네임스페이스 로딩과 Hydration 체크
  const safeT = (key: string, options?: any): string => {
    if (!isHydrated) return '';
    const result = t(key, options);
    return typeof result === 'string' ? result : '';
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            SureCRM 서비스 이용약관
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            시행일: 2025년 6월 26일 | 버전: 2.0
          </p>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-6">제1장 총칙</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">제1조 (목적)</h3>
                  <p className="text-muted-foreground">
                    본 약관은 주식회사 슈어소프트(이하 '회사')가 제공하는
                    SureCRM 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원
                    간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을
                    목적으로 합니다. 본 약관은 서비스 이용계약의 일부를
                    구성하며, 회원은 본 약관에 동의함으로써 서비스를 이용할 수
                    있습니다.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제2조 (용어의 정의)
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    본 약관에서 사용하는 용어의 정의는 다음과 같습니다. 본
                    약관에서 정의되지 않은 용어는 관련 법령 및 회사의 개별
                    서비스 운영정책에서 정하는 바에 따르며, 그 외에는 일반적인
                    상거래 관행에 따릅니다.
                  </p>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1. 서비스:</strong> '회사'가 'SureCRM' 브랜드로
                      제공하는 고객 관계 관리(CRM) 솔루션 및 이와 관련된 모든
                      제반 서비스(웹 애플리케이션, 모바일 앱, API, 기술 지원,
                      컨설팅 등)를 의미합니다. 서비스의 구체적인 내용은 구독
                      플랜에 따라 상이할 수 있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2. 회사:</strong> 본 약관에 따라 '서비스'를
                      제공하는 법인인 주식회사 슈어소프트를 의미합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3. 회원:</strong> 본 약관에 동의하고 회사와 서비스
                      이용계약을 체결한 개인 또는 법인을 의미합니다. 회원은
                      서비스 이용의 주체로서 본 약관에 따른 모든 권리와 의무를
                      부담합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4. 최종 이용자:</strong> '회원'에 의해 서비스 사용
                      권한을 부여받아 실제로 서비스를 이용하는 개인(예: 회원의
                      임직원)을 의미합니다. '회원'은 자신의 '최종 이용자'가 본
                      약관을 준수하도록 관리할 책임이 있습니다. B2B SaaS
                      환경에서 서비스 제공의 안정성과 책임 소재를 명확히 하기
                      위해, 계약의 주체인 '회원'과 실제 사용자인 '최종 이용자'를
                      구분하는 것은 필수적입니다. 이는 '회원'이 소속 '최종
                      이용자'의 행위에 대해 계약상 책임을 지게 함으로써,
                      서비스의 오남용을 방지하고 건전한 이용 환경을 조성하는
                      기반이 됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>5. 계정:</strong> '회원'이 서비스를 이용하기 위해
                      생성하는 고유한 식별 정보의 집합으로, 아이디와 비밀번호를
                      포함합니다. 계정의 관리 책임은 전적으로 '회원'에게
                      있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>6. 아이디(ID):</strong> '회원' 식별과 서비스
                      이용을 위하여 '회원'이 선정하고 '회사'가 승인하는 문자,
                      숫자 또는 양자의 조합을 의미합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>7. 비밀번호:</strong> '회원'의 동일성 확인과 정보
                      보호를 위해 '회원' 스스로가 설정한 문자, 숫자 또는 양자의
                      조합을 의미합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>8. 고객 데이터(Customer Data):</strong> '회원'
                      또는 '최종 이용자'가 서비스를 이용하는 과정에서 서버에
                      저장하거나 처리하기 위해 입력, 업로드, 전송하는 모든
                      전자적 데이터 및 정보(회원의 고객에 대한 개인정보 포함)를
                      의미합니다. '고객 데이터'의 소유권은 전적으로 '회원'에게
                      있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>9. 콘텐츠:</strong> '회원' 또는 '최종 이용자'가
                      서비스를 이용하면서 게시 또는 생성하는 모든 정보, 즉
                      텍스트, 이미지, 동영상, 파일 및 링크 등을 포괄적으로
                      의미합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>10. 유료 서비스:</strong> '회원'이 '회사'에 별도의
                      이용 요금을 지불해야만 이용할 수 있는 서비스 또는 기능을
                      의미하며, 구독 플랜, 부가 기능 등이 이에 해당합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>11. 운영 정책:</strong> 본 약관 외에 서비스의 특정
                      기능(예: 메시지 발송) 이용에 관한 세부 지침, 가이드라인 등
                      회사가 별도로 정하여 공지하는 규정을 의미합니다. 운영
                      정책은 본 약관의 일부를 구성합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제3조 (약관의 명시, 효력 및 개정)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 본 약관의 내용과 상호, 대표자
                      성명, 영업소 소재지 주소, 사업자등록번호, 연락처(전화,
                      이메일 주소) 등을 회원이 쉽게 알 수 있도록 서비스 초기
                      화면 또는 연결 화면에 게시합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 본 약관은 회원이 서비스 가입 시
                      동의함으로써 효력이 발생합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 「약관의 규제에 관한 법률」,
                      「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련
                      법령을 위배하지 않는 범위에서 본 약관을 개정할 수
                      있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회사가 약관을 개정할 경우에는 적용일자
                      및 개정사유를 명시하여 현행약관과 함께 그 적용일자 7일
                      전부터 적용일자 전일까지 서비스 내에 공지합니다. 다만,
                      회원에게 불리하게 약관 내용을 변경하는 경우에는 최소한
                      30일 이상의 사전 유예기간을 두고 공지하며, 이메일, 서비스
                      내 알림 등 전자적 수단을 통해 회원에게 개별적으로
                      통지합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>5.</strong> 회원이 개정약관에 동의하지 않는 경우,
                      회원은 이용계약을 해지할 수 있습니다. 회사가 전항에 따라
                      통지하면서 '회원이 명시적인 거부 의사를 표시하지 않을 경우
                      개정약관에 동의한 것으로 본다'는 뜻을 명확하게
                      고지하였음에도 불구하고, 회원이 시행일 이후에도 서비스를
                      계속 이용하는 경우에는 개정약관에 동의한 것으로 봅니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">
                제2장 서비스 이용 계약
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제4조 (이용 계약의 성립)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 이용계약은 서비스를 이용하고자 하는
                      자(이하 '가입신청자')가 본 약관의 내용에 동의한 다음,
                      회사가 정한 절차에 따라 이용신청을 하고, 회사가 이러한
                      신청에 대하여 승낙함으로써 체결됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 가입신청자는 반드시 본인 또는 소속
                      법인의 명의로 가입을 신청해야 하며, 회사는 본인확인기관을
                      통한 인증 절차를 요구할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제5조 (이용 신청의 승낙과 제한)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 가입신청자의 신청에 대하여
                      서비스 이용을 승낙함을 원칙으로 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 다음 각 호에 해당하는 신청에
                      대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수
                      있습니다. 이는 플랫폼의 안정성과 보안, 다른 선량한
                      회원들을 보호하기 위한 필수적인 조치입니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - 가입신청자가 이전에 회원 자격을 상실한 적이 있는 경우
                        (단, 회사의 재가입 승낙을 얻은 경우는 예외)
                      </p>
                      <p className="text-muted-foreground">
                        - 실명이 아니거나 타인의 명의를 이용한 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 허위의 정보를 기재하거나, 회사가 제시하는 내용을
                        누락한 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 만 14세 미만의 아동이 법정대리인의 동의를 얻지 않은
                        경우 (B2B 서비스 특성상 해당 가능성은 낮으나, 법적
                        준수를 위해 명시)
                      </p>
                      <p className="text-muted-foreground">
                        - 서비스의 정상적인 운영을 저해하거나, 관련 법령을
                        위반할 목적으로 신청하는 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 비정상적인 경로(예: VPN 우회)나 부정한 방법을 통해
                        이용 신청을 하는 등, 서비스의 안정성을 위협할 수 있다고
                        판단되는 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 기술적, 운영상 문제로 서비스 제공이 곤란한 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 기타 회사가 합리적인 판단에 의해 필요하다고 인정하는
                        경우
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 서비스 관련 설비의 여유가
                      없거나, 기술상 또는 업무상 문제가 있는 경우에는 그 사유가
                      해소될 때까지 승낙을 유보할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제6조 (회원 정보의 관리)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원은 서비스 내 개인정보 관리 화면을
                      통하여 언제든지 본인의 정보를 열람하고 수정할 수 있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회원은 가입 신청 시 기재한 사항이
                      변경되었을 경우, 즉시 온라인으로 수정하거나 회사에 그
                      변경사항을 알려야 하며, 이를 이행하지 않아 발생한 불이익에
                      대해 회사는 책임지지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회원은 자신의 계정(아이디, 비밀번호)에
                      대한 관리 책임을 부담하며, 이를 제3자가 이용하도록
                      허용해서는 안 됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회원은 자신의 계정이 도용되거나
                      제3자에 의해 사용되고 있음을 인지한 경우, 이를 즉시 회사에
                      통지하고 회사의 안내에 따라야 합니다. 이를 통지하지 않거나
                      통지 후 회사의 안내에 따르지 않아 발생한 불이익에 대하여
                      회사는 책임지지 않습니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">제3장 서비스의 이용</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제7조 (서비스의 제공 및 변경)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 회원에게 아래와 같은 서비스를
                      제공합니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - 고객 정보 관리 및 분석 기능
                      </p>
                      <p className="text-muted-foreground">
                        - 영업 활동 관리 및 파이프라인 시각화 기능
                      </p>
                      <p className="text-muted-foreground">
                        - 마케팅 자동화 및 캠페인 관리 기능
                      </p>
                      <p className="text-muted-foreground">
                        - 서비스 데스크 및 고객 지원 관리 기능
                      </p>
                      <p className="text-muted-foreground">
                        - 데이터 연동을 위한 API 제공
                      </p>
                      <p className="text-muted-foreground">
                        - 기타 회사가 추가 개발하거나 제휴 계약 등을 통해
                        회원에게 제공하는 일체의 서비스
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 연중무휴, 1일 24시간 서비스
                      제공을 원칙으로 합니다. 다만, 제8조에 해당하는 경우
                      서비스가 일시적으로 중단될 수 있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 상당한 이유가 있는 경우,
                      운영상, 기술상의 필요에 따라 제공하고 있는 서비스의 전부
                      또는 일부를 변경할 수 있습니다. 내용이 중대하거나 회원에게
                      불리한 변경일 경우, 회사는 제3조 제4항에서 정한 방법으로
                      회원에게 통지합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회사는 무료 서비스의 일부 또는 전부를
                      회사의 정책 및 운영의 필요상 수정, 중단, 변경할 수 있으며,
                      이에 대하여 관련 법령에 특별한 규정이 없는 한 회원에게
                      별도의 보상을 하지 않습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제8조 (서비스의 중단 및 제한)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 다음 각 호에 해당하는 경우
                      서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - 서비스용 설비의 보수 등 공사로 인한 부득이한 경우
                        (사전 공지를 원칙으로 함)
                      </p>
                      <p className="text-muted-foreground">
                        - 회원이 회사의 영업활동을 방해하는 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 정전, 제반 설비의 장애 또는 이용량의 폭주 등으로
                        정상적인 서비스 이용에 지장이 있는 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 기간통신사업자가 전기통신 서비스를 중단했을 경우
                      </p>
                      <p className="text-muted-foreground">
                        - 국가비상사태, 천재지변 등 불가항력적 사유가 있는 경우
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 제1항의 사유로 서비스 제공이
                      중단되는 경우, 제3조 제4항의 방법으로 회원에게 통지합니다.
                      다만, 회사가 통제할 수 없는 사유로 인한 서비스의
                      중단(시스템 관리자의 고의, 과실이 없는 디스크 장애, 시스템
                      다운 등)으로 인하여 사전 통지가 불가능한 경우에는 사후에
                      통지할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제9조 (유료 서비스 이용)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원은 회사가 제공하는 다양한 유료
                      서비스 플랜(예: Basic, Pro, Enterprise) 중 하나를 선택하여
                      이용할 수 있습니다. 각 플랜별 제공 기능 및 이용 요금은
                      서비스 홈페이지에 명시됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 유료 서비스 이용 요금은 월간 또는 연간
                      구독 방식으로 결제됩니다. 요금은 선택한 플랜, 이용하는
                      최종 이용자 수, 추가 기능(Add-on) 등에 따라 산정됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 요금은 회원이 등록한 결제수단을 통해
                      매월 또는 매년 정해진 날짜에 자동으로 청구됩니다. 정상적인
                      결제가 이루어지지 않을 경우, 서비스 이용이 제한될 수
                      있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회원은 언제든지 상위 플랜으로
                      업그레이드하거나 하위 플랜으로 다운그레이드할 수 있습니다.
                      업그레이드 시에는 차액이 즉시 청구될 수 있으며,
                      다운그레이드는 다음 결제 주기에 적용됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>5.</strong> 모든 서비스 이용 요금에는
                      부가가치세(VAT) 등 관련 세금이 포함되어 있지 않으며,
                      회원은 해당 세금을 추가로 부담해야 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>6.</strong> 회사는 프로모션, 비영리 단체 지원 등
                      특정 조건에 따라 요금을 할인하거나 크레딧을 제공할 수
                      있습니다. 이러한 혜택의 조건 및 내용은 별도로 공지됩니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제10조 (청약 철회, 계약 해지 및 환불)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원은 언제든지 서비스 내 설정 화면
                      또는 고객센터를 통해 이용계약을 해지(회원 탈퇴)할 수
                      있습니다. 해지 신청 시, 이용계약은 즉시 종료됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 본 서비스는 그 특성상 「전자상거래
                      등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호에
                      따라 청약철회가 제한될 수 있는 디지털 콘텐츠에 해당할 수
                      있습니다. 회사가 사전에 이러한 사실을 고지한 경우, 회원의
                      단순 변심이나 착오 구매에 의한 청약철회 및 환불은
                      불가능합니다. 이는 분쟁을 최소화하고 안정적인 서비스를
                      제공하기 위함입니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 유료 서비스의 환불 정책은 다음과
                      같습니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - <strong>월간 구독:</strong> 이미 결제된 당월 이용
                        요금은 환불되지 않으며, 계약 해지 시 다음 결제 주기가
                        도래하기 전까지 서비스를 이용할 수 있습니다.
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>연간 구독:</strong> 연간 구독을 중도에
                        해지하는 경우, 회사는 잔여 기간에 대한 요금을 환불하지
                        않는 것을 원칙으로 합니다. 다만, 회사가 별도로 정한
                        기준에 따라 위약금(예: 연간 할인액)을 공제한 후 일부
                        금액을 환불할 수 있습니다.
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>회사의 귀책사유로 인한 해지:</strong> 회사의
                        중대한 과실로 회원이 서비스를 정상적으로 이용하지 못한
                        경우, 회사는 회원의 요청에 따라 잔여 기간에 대한 요금을
                        환불하거나 그에 상응하는 조치를 취합니다.
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>회원의 귀책사유로 인한 해지:</strong> 회원이
                        본 약관상의 의무를 위반하여 회사가 이용계약을 해지하는
                        경우, 환불은 제공되지 않습니다.
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 환불 절차, 분쟁 해결 등은 「전자상거래
                      등에서의 소비자보호에 관한 법률」 및
                      「소비자분쟁해결기준」 등 관련 법규에 따릅니다. 명확한
                      환불 정책은 결제 대행사(PG)와의 관계에서 발생할 수 있는
                      지불 거절(Chargeback) 분쟁을 예방하고, 안정적인 결제
                      시스템을 유지하는 데 필수적입니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제11조 (운영 정책 및 제재)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원은 서비스를 이용함에 있어 다음 각
                      호의 행위를 해서는 안 됩니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - 법령, 공공질서 및 미풍양속에 위배되는 콘텐츠를
                        게시하거나 전송하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 제3자의 지식재산권, 명예, 개인정보 등 제반 권리를
                        침해하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 회사의 사전 동의 없이 서비스를 영리 목적으로
                        이용하거나 제3자에게 재판매, 임대하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 서비스의 안정적인 운영을 방해할 수 있는 컴퓨터
                        바이러스, 악성코드를 유포하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 서비스의 기술적 보호 조치를 무력화하거나, 소스 코드를
                        리버스 엔지니어링, 디컴파일하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 스팸, 불법 광고 등 정보통신망법을 위반하는 정보를
                        전송하는 행위
                      </p>
                      <p className="text-muted-foreground">
                        - 회사가 금지하는 특정 업종(예: 불법 도박, 성인물,
                        의약품 판매 등)의 영업을 위해 서비스를 이용하는 행위
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 회원이 제1항의 금지행위를 한
                      경우, 사안의 중대성에 따라 다음과 같은 단계적 제재 조치를
                      취할 수 있습니다.
                    </p>
                    <div className="pl-4 space-y-2">
                      <p className="text-muted-foreground">
                        - <strong>경고:</strong> 위반 행위에 대한 시정을
                        요구하는 1차 조치
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>이용 제한:</strong> 특정 기능(예: 메시지
                        발송)의 이용을 일시적으로 제한
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>계정 정지:</strong> 일정 기간 동안 서비스
                        전체에 대한 접근을 차단
                      </p>
                      <p className="text-muted-foreground">
                        - <strong>영구 이용 제한 및 계약 해지:</strong> 중대한
                        위반 또는 반복적인 위반 시 계정을 영구적으로
                        비활성화하고 이용계약을 해지
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 제재 조치를 취하기 전에
                      회원에게 그 사유를 통지하고 소명할 기회를 부여하는 것을
                      원칙으로 합니다. 단, 다른 회원이나 서비스에 대한 심각한
                      위험이 예상되는 등 긴급한 조치가 필요한 경우에는 선 조치
                      후 통지할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제12조 (휴면 계정 정책)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원이 1년 이상 서비스에 로그인하지
                      않는 경우, 해당 계정은 휴면 계정으로 전환될 수 있습니다.
                      회사는 휴면 전환 30일 전까지 해당 사실을 이메일 등으로
                      회원에게 통지합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 휴면 계정으로 전환된 무료 회원의 계정
                      및 관련 데이터는 회사의 정책에 따라 삭제될 수 있습니다.
                      유료 회원의 계정은 구독이 유지되는 동안 휴면 처리되지
                      않습니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">
                제4장 계약 당사자의 권리와 의무
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제13조 (회사의 의무)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 관련 법령과 본 약관이 금지하는
                      행위를 하지 않으며, 계속적이고 안정적으로 서비스를
                      제공하기 위해 최선을 다하여 노력합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 회원의 개인정보(고객 데이터
                      포함)를 안전하게 보호하기 위해 보안 시스템을 갖추고
                      개인정보처리방침을 공시하고 준수합니다. 회사는 회원의 동의
                      없이 고객 데이터를 제3자에게 누설하거나 배포하지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 서비스 이용과 관련하여
                      회원으로부터 제기된 의견이나 불만이 정당하다고 인정할
                      경우에는 이를 신속하게 처리해야 합니다. 처리 과정 및
                      결과는 서비스 내 공지, 이메일 등을 통해 회원에게 전달할 수
                      있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제14조 (회원의 의무)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원은 유료 서비스 이용에 따른 요금을
                      지정된 기일에 성실하게 납부할 의무가 있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회원은 본 약관 및 관련 법령, 회사의
                      운영 정책을 준수해야 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회원은 서비스 이용에 필요한 모든 고객
                      데이터의 정확성, 품질, 적법성에 대해 전적인 책임을 집니다.
                      회원은 고객 데이터를 수집하고 회사에 처리를 위탁하기 위해
                      필요한 모든 권리, 동의, 허가를 확보했음을 보증해야 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회원은 자신의 최종 이용자가 본 약관을
                      준수하도록 관리·감독할 책임이 있으며, 최종 이용자의 약관
                      위반 행위는 회원의 위반 행위로 간주됩니다. 이는 B2B
                      서비스의 책임 관계를 명확히 하는 핵심 조항입니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>5.</strong> 회원은 회사의 지식재산권을 침해하는
                      어떠한 행위도 해서는 안 됩니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제15조 (고객 데이터의 처리와 소유권)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회원이 서비스를 통해 입력, 업로드,
                      전송하는 모든 고객 데이터(개인정보 포함)의 소유권은
                      회원에게 있습니다. 회사는 서비스 제공 목적으로만 해당
                      데이터를 처리하며, 회원의 명시적 동의 없이 다른 목적으로
                      사용하지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 고객 데이터를 안전하게 보관하고
                      처리하기 위해 적절한 기술적, 관리적 보호조치를 취합니다.
                      다만, 회원은 자신의 고객 데이터에 대한 백업 및 보안 관리에
                      대해서도 책임을 집니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회원이 계약을 해지하는 경우, 회사는
                      회원의 요청에 따라 고객 데이터를 반환하거나 삭제합니다.
                      단, 관련 법령에 따라 보관이 필요한 데이터는 해당 법령에서
                      정한 기간 동안 보관할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제16조 (지식재산권)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 서비스에 관한 저작권 및 지식재산권은
                      회사에 귀속됩니다. 회원은 서비스를 이용함으로써 얻은
                      정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송
                      기타 방법에 의하여 영리목적으로 이용하거나 제3자에게
                      이용하게 하여서는 안 됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회원이 서비스 내에 게시한 게시물에
                      대한 권리는 회원에게 귀속됩니다. 단, 회사는 서비스의 운영,
                      전시, 전송, 배포, 홍보의 목적으로 회원의 저작물을 사용할
                      수 있으며, 이 경우 회사는 저작권법 규정을 준수합니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">
                제5장 책임의 제한 및 분쟁해결
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">제17조 (면책조항)</h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사는 천재지변 또는 이에 준하는
                      불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                      서비스 제공에 관한 책임이 면제됩니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사는 회원의 귀책사유로 인한 서비스
                      이용의 장애에 대하여는 책임을 지지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 회원이 서비스를 이용하여
                      기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그
                      밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을
                      지지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>4.</strong> 회사는 회원이 서비스에 게재한 정보,
                      자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을
                      지지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>5.</strong> 회사는 회원 간 또는 회원과 제3자
                      상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임을
                      지지 않습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제18조 (책임의 제한)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 회사의 고의 또는 중과실로 인해
                      회원에게 손해가 발생한 경우, 회사는 관련 법령에 따라 그
                      손해를 배상할 책임이 있습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사의 경과실로 인한 손해배상 책임은
                      회원이 회사에 지급한 최근 12개월간의 서비스 이용료 총액을
                      한도로 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>3.</strong> 회사는 간접손해, 특별손해, 결과적
                      손해, 징벌적 손해에 대해서는 책임을 지지 않습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">제19조 (손해배상)</h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      회원은 본 약관의 규정을 위반하거나, 관련 법령을 위반하여
                      회사 또는 제3자에게 손해를 입힌 경우, 그로 인해 발생하는
                      모든 손해를 배상할 책임이 있습니다. 회원은 자신의 위반
                      행위로 인해 제3자가 회사에 대해 제기하는 모든 청구, 소송,
                      손해배상 요구로부터 회사를 면책하고 방어해야 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    제20조 (준거법 및 재판관할)
                  </h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 본 약관 및 서비스 이용계약에 관해서는
                      대한민국 법률을 준거법으로 합니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회사와 회원 간 발생한 분쟁에 관한
                      소송은 서울중앙지방법원을 제1심 관할법원으로 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">제21조 (기타 조항)</h3>
                  <div className="space-y-3 pl-4">
                    <p className="text-muted-foreground">
                      <strong>1.</strong> 본 약관의 어떠한 조항도 당사자 간의
                      파트너십, 합작 투자, 대리 또는 고용 관계를 생성하는 것으로
                      해석되지 않습니다.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>2.</strong> 회원이 본 약관상의 권리나 의무를
                      회사의 사전 서면 동의 없이 제3자에게 양도하거나 담보로
                      제공할 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-muted/30 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">부칙</h3>
              <p className="text-sm text-muted-foreground mb-4">
                본 약관은 2025년 6월 26일부터 시행됩니다.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>공고일자:</strong> 2025년 5월 27일
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>시행일자:</strong> 2025년 6월 26일
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>버전:</strong> 2.0
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>문의:</strong> noah@surecrm.pro
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
