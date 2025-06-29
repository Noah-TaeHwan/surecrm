import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function PrivacyPage() {
  const { t } = useTranslation('common');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            SureCRM 개인정보처리방침
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            버전: 2.0 | 시행일자: 2025년 6월 26일
          </p>

          <div className="space-y-8 text-sm leading-relaxed">
            <section className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">총칙</h2>
              <p className="text-muted-foreground">
                주식회사 슈어소프트(이하 '회사')는 정보주체의 자유와 권리 보호를
                위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여,
                적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 회사는
                본 개인정보처리방침을 통해 정보주체가 제공하는 개인정보가 어떠한
                용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한
                조치가 취해지고 있는지 알려드립니다.
                <br />
                <br />
                본 방침은 SureCRM 서비스(이하 '서비스')에 적용됩니다. 회사는
                서비스의 성격에 따라 다음과 같이 두 가지 역할을 수행합니다. 이는
                글로벌 데이터 보호 규정(GDPR) 등 국제 표준을 준수하고 책임
                범위를 명확히 하기 위함입니다.
                <br />
                <br />
                <strong>개인정보처리자 (Data Controller):</strong> 회사는 서비스
                제공을 위해 직접 수집하는 회원 및 잠재 고객의 개인정보에 대해
                개인정보처리자의 지위를 가집니다. 여기에는 계정 관리, 결제, 고객
                지원, 마케팅 활동에 필요한 정보가 포함됩니다.
                <br />
                <br />
                <strong>개인정보 수탁자 (Data Processor):</strong> 회사는 회원이
                서비스를 이용하여 수집, 저장, 처리하는 '고객 데이터'에 대해서는
                개인정보 수탁자의 지위를 가집니다. 이 경우, 데이터의 통제 권한은
                회원에게 있으며, 회사는 오직 회원의 지시에 따라 데이터를
                처리합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제1조 (처리하는 개인정보의 항목 및 처리 목적)
              </h2>
              <p className="text-muted-foreground mb-4">
                회사는 서비스 제공, 회원 관리, 고객 지원 등 다양한 목적을 위해
                필요 최소한의 개인정보를 수집하고 있습니다. 수집하는 개인정보의
                항목, 목적, 보유 기간은 아래 표와 같이 투명하게 공개하며, 이는
                정보주체의 알 권리를 보장하고 관련 법규를 준수하기 위한 필수적인
                조치입니다.
              </p>

              <div className="bg-muted/20 rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-3">
                  A. 회사가 '개인정보처리자'로서 직접 수집하는 정보
                </h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">회원 가입 및 관리</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>목적:</strong> 회원 식별, 본인 인증, 서비스 제공
                      계약 유지 및 관리, 부정 이용 방지, 각종 고지 및 통지
                      <br />
                      <strong>수집 항목:</strong> [필수] 이름, 이메일 주소,
                      연락처, 회사명, 비밀번호 / [선택] 부서, 직책
                      <br />
                      <strong>보유 기간:</strong> 회원 탈퇴 시까지 (단, 부정
                      이용 방지를 위한 기록은 1년간 보관)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">유료 서비스 결제 및 정산</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>목적:</strong> 유료 서비스 이용에 따른 요금 결제,
                      청구서 발송, 정산 및 환불 처리
                      <br />
                      <strong>수집 항목:</strong> 카드사명, 카드번호(일부
                      마스킹), 사업자등록번호, 청구지 주소 등 결제에 필요한 정보
                      <br />
                      <strong>보유 기간:</strong> 5년 (전자상거래 등에서의
                      소비자보호에 관한 법률)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">고객 문의 및 지원</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>목적:</strong> 문의사항 확인 및 회신, 불만 처리,
                      분쟁 조정을 위한 기록 보존
                      <br />
                      <strong>수집 항목:</strong> 이메일 주소, 연락처, 상담
                      내용(텍스트, 이미지 등)
                      <br />
                      <strong>보유 기간:</strong> 3년 (전자상거래 등에서의
                      소비자보호에 관한 법률)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">마케팅 및 광고 활용</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>목적:</strong> 신규 서비스, 기능, 이벤트, 프로모션
                      정보 안내, 뉴스레터 발송 (별도 동의 시)
                      <br />
                      <strong>수집 항목:</strong> 이름, 이메일 주소, 연락처
                      <br />
                      <strong>보유 기간:</strong> 동의 철회 시 또는 수신 거부
                      시까지
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      서비스 이용 기록 자동 생성
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>목적:</strong> 서비스 품질 개선, 이용 환경 최적화,
                      통계 분석, 비정상적 이용 행태 탐지
                      <br />
                      <strong>수집 항목:</strong> 접속 IP 주소, 쿠키(Cookie),
                      서비스 이용 기록, 접속 로그, 브라우저 종류, OS 정보 등
                      기기 정보
                      <br />
                      <strong>보유 기간:</strong> 3개월 (통신비밀보호법)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-bold mb-3">
                  B. 회사가 '개인정보 수탁자'로서 회원을 대신하여 처리하는 정보
                </h3>

                <div>
                  <h4 className="font-semibold">고객 데이터</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>목적:</strong> 회원이 CRM 기능 수행을 위해 서비스
                    내에 자발적으로 입력, 업로드, 관리하는 데이터의 처리
                    <br />
                    <strong>수집 항목:</strong> 회원이 수집하여 입력하는 고객의
                    개인정보 일체 (예: 고객의 이름, 연락처, 이메일, 주소, 상담
                    내역, 구매 이력 등)
                    <br />
                    <strong>보유 기간:</strong> 서비스 이용계약 기간 동안 (계약
                    종료 또는 회원의 삭제 요청 시 파기)
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제2조 (개인정보의 처리 및 보유 기간)
              </h2>
              <p className="text-muted-foreground">
                회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터
                개인정보를 수집 시에 동의받은 보유·이용 기간 내에서 개인정보를
                처리 및 보유합니다.
                <br />
                <br />
                원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당
                정보를 지체 없이 파기합니다.
                <br />
                <br />
                다만, 제1조의 표에 명시된 바와 같이 「전자상거래 등에서의
                소비자보호에 관한 법률」, 「통신비밀보호법」 등 관계 법령의
                규정에 의하여 보존할 필요가 있는 경우, 회사는 관계 법령에서 정한
                일정한 기간 동안 개인정보를 보관합니다. 이 경우 회사는 보관하는
                정보를 그 보관의 목적으로만 이용하며, 보존 기간은 아래와
                같습니다.
                <br />
                <br />
                <strong>가.</strong> 계약 또는 청약철회 등에 관한 기록: 5년
                <br />
                <strong>나.</strong> 대금결제 및 재화 등의 공급에 관한 기록: 5년
                <br />
                <strong>다.</strong> 소비자의 불만 또는 분쟁처리에 관한 기록:
                3년
                <br />
                <strong>라.</strong> 웹사이트 방문 기록: 3개월
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제3조 (개인정보의 제3자 제공)
              </h2>
              <p className="text-muted-foreground">
                회사는 정보주체의 개인정보를 제1조(처리하는 개인정보의 항목 및
                처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 사전
                동의 없이는 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의
                경우에는 예외로 합니다.
                <br />
                <br />
                1. 정보주체로부터 별도의 동의를 받은 경우
                <br />
                2. 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여
                불가피한 경우
                <br />
                3. 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
                요구가 있는 경우
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제4조 (개인정보 처리업무의 위탁)
              </h2>
              <p className="text-muted-foreground mb-4">
                회사는 원활한 서비스 제공과 업무 효율성 증대를 위해 다음과 같이
                개인정보 처리업무를 외부 전문업체에 위탁하여 운영하고 있습니다.
                <br />
                <br />
                회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라
                위탁업무 수행목적 외 개인정보 처리 금지, 기술적·관리적 보호조치,
                재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한
                사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게
                처리하는지를 감독하고 있습니다.
              </p>

              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-bold mb-3">개인정보 처리 위탁 현황</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Amazon Web Services, Inc. (AWS):</strong> 클라우드
                    인프라(서버) 운영 및 데이터 보관
                  </div>
                  <div>
                    <strong>토스페이먼츠 주식회사:</strong> 신용카드, 계좌이체
                    등 서비스 이용 요금 결제 처리
                  </div>
                  <div>
                    <strong>HubSpot, Inc.:</strong> 마케팅 자동화, 이메일 발송,
                    고객 관계 관리 시스템 운영
                  </div>
                  <div>
                    <strong>Google, LLC (Google Analytics):</strong> 서비스 이용
                    형태 및 접속 통계 분석
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제5조 (개인정보의 국외 이전)
              </h2>
              <p className="text-muted-foreground mb-4">
                회사는 안정적이고 효율적인 서비스 제공을 위해 다음과 같이
                개인정보를 국외에 이전하여 처리하고 있으며, 정보주체의 권리가
                침해되지 않도록 관련 법령에 따라 필요한 모든 조치를 취하고
                있습니다. 글로벌 클라우드 인프라 활용은 현대 SaaS의 표준이며,
                이를 투명하게 공개하는 것은 고객 신뢰의 핵심 요소입니다.
              </p>

              <div className="bg-muted/20 rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-3">개인정보 국외 이전 현황</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Amazon Web Services, Inc.</strong>
                    <br />
                    이전 국가: 미국 (데이터는 서울 리전에 저장되나, 장애 복구 및
                    관리 목적으로 접근 가능)
                    <br />
                    이전 항목: 서비스 운영에 필요한 모든 데이터 (회원정보, 고객
                    데이터 등)
                    <br />
                    이전 목적: 클라우드 서버 호스팅 및 데이터 저장
                    <br />
                    보유 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지
                  </div>
                  <div>
                    <strong>HubSpot, Inc.</strong>
                    <br />
                    이전 국가: 미국
                    <br />
                    이전 항목: 이름, 이메일 주소, 연락처, 회사명 등 회원 정보
                    <br />
                    이전 목적: 고객 관리(CRM) 및 마케팅 자동화, 이메일 발송
                    <br />
                    보유 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지
                  </div>
                  <div>
                    <strong>Google, LLC</strong>
                    <br />
                    이전 국가: 미국
                    <br />
                    이전 항목: 비식별화된 행태정보 (쿠키, 서비스 이용 기록 등)
                    <br />
                    이전 목적: 서비스 이용 현황 분석 및 통계
                    <br />
                    보유 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                정보주체는 개인정보의 국외 이전을 거부할 수 있습니다. 다만, 국외
                이전은 서비스 제공에 필수적인 요소이므로, 거부 시 서비스의 전부
                또는 일부 이용이 제한될 수 있습니다. 국외 이전을 원하지 않으시는
                경우, 고객센터를 통해 문의해주시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제6조 (정보주체와 법정대리인의 권리·의무 및 행사방법)
              </h2>
              <p className="text-muted-foreground">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련
                권리를 행사할 수 있습니다. 이는 국내법뿐만 아니라 GDPR 등
                국제적인 데이터 보호 기준을 포괄하는 것으로, 정보주체의
                자기결정권을 최대한 보장하기 위함입니다.
                <br />
                <br />
                <strong>가.</strong> 개인정보 열람 요구권: 자신의 개인정보 처리
                내역을 열람할 수 있는 권리
                <br />
                <strong>나.</strong> 개인정보 정정·삭제 요구권: 정보에 오류가
                있거나 불완전할 경우 정정 또는 삭제를 요구할 수 있는 권리
                <br />
                <strong>다.</strong> 개인정보 처리정지 요구권: 특정 조건 하에서
                자신의 개인정보 처리를 일시적으로 중단하도록 요구할 수 있는 권리
                <br />
                <strong>라.</strong> 동의 철회권: 개인정보 수집·이용·제공에 대한
                동의를 언제든지 철회할 수 있는 권리
                <br />
                <strong>마.</strong> 개인정보 이동권 (Data Portability): 회사가
                처리하는 자신의 개인정보를 체계적이고 보편적으로 사용되는 기계가
                읽을 수 있는 형태로 제공받아, 다른 개인정보처리자에게 이전할 수
                있는 권리
                <br />
                <br />
                권리 행사는 서비스 내 '회원정보 수정' 기능을 이용하거나,
                개인정보 보호책임자에게 서면, 전화, 이메일 등을 통하여 하실 수
                있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제7조 (개인정보의 파기)
              </h2>
              <p className="text-muted-foreground">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
                <br />
                <br />
                정보주체로부터 동의받은 개인정보 보유기간이 경과하거나
                처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를
                계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의
                데이터베이스(DB)로 옮기거나 보관장소를 달리하여 안전하게
                보존합니다.
                <br />
                <br />
                개인정보 파기의 절차 및 방법은 다음과 같습니다:
                <br />
                <strong>가.</strong> 파기절차: 회사는 파기 사유가 발생한
                개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아
                개인정보를 파기합니다.
                <br />
                <strong>나.</strong> 파기방법: 전자적 파일 형태로 기록·저장된
                개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여
                삭제하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나
                소각하여 파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제8조 (개인정보의 안전성 확보 조치)
              </h2>
              <p className="text-muted-foreground mb-4">
                회사는 정보주체의 개인정보가 분실, 도난, 유출, 위·변조 또는
                훼손되지 않도록 안전성 확보를 위해 다음과 같은
                기술적·관리적·물리적 조치를 하고 있습니다.
              </p>

              <div className="space-y-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-bold mb-2">관리적 조치</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <strong>가.</strong> 내부관리계획 수립 및 시행: 개인정보의
                      안전한 처리를 위하여 내부관리계획을 수립하고 연 1회 이상
                      이행 여부를 점검합니다.
                    </div>
                    <div>
                      <strong>나.</strong> 개인정보 취급 직원의 최소화 및 교육:
                      개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜
                      최소화하며, 정기적인 보안 교육을 실시합니다.
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-bold mb-2">기술적 조치</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <strong>가.</strong> 개인정보처리시스템 접근통제:
                      개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의
                      부여, 변경, 말소를 통하여 개인정보에 대한 접근을 통제하고,
                      침입차단시스템(방화벽)을 이용하여 외부로부터의 무단 접근을
                      통제하고 있습니다.
                    </div>
                    <div>
                      <strong>나.</strong> 접속기록의 보관 및 위·변조 방지:
                      개인정보처리시스템에 접속한 기록을 최소 2년 이상 보관,
                      관리하며, 접속 기록이 위·변조 및 도난, 분실되지 않도록
                      보안 기능을 사용하고 있습니다.
                    </div>
                    <div>
                      <strong>다.</strong> 개인정보의 암호화: 정보주체의
                      비밀번호 등 중요 개인정보는 암호화하여 저장 및 관리하고
                      있으며, 중요한 데이터는 파일 및 전송 데이터를 암호화하거나
                      파일 잠금 기능을 사용하는 등의 별도 보안 기능을 사용하고
                      있습니다.
                    </div>
                    <div>
                      <strong>라.</strong> 보안프로그램 설치 및 주기적 갱신:
                      해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을
                      막기 위하여 보안프로그램을 설치하고 주기적으로
                      갱신·점검합니다.
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-bold mb-2">물리적 조치</h3>
                  <div className="text-sm text-muted-foreground">
                    <strong>가.</strong> 비인가자에 대한 출입 통제: 개인정보를
                    보관하고 있는 전산실, 자료보관실 등 물리적 보관 장소를
                    별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고
                    있습니다.
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
              </h2>
              <p className="text-muted-foreground">
                회사는 정보주체에게 개별적인 맞춤 서비스를 제공하기 위해
                이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                <br />
                <br />
                쿠키는 웹사이트를 운영하는 데 이용되는 서버가 정보주체의
                브라우저에 보내는 소량의 정보이며, 정보주체의 컴퓨터
                하드디스크에 저장됩니다.
                <br />
                <br />
                <strong>쿠키의 사용 목적:</strong> 회원과 비회원의 접속 빈도나
                방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취
                추적, 각종 이벤트 참여 정도 및 방문 횟수 파악 등을 통한 타겟
                마케팅 및 개인 맞춤 서비스 제공.
                <br />
                <br />
                <strong>쿠키의 설치·운영 및 거부:</strong> 정보주체는 쿠키
                설치에 대한 선택권을 가지고 있습니다. 따라서, 웹브라우저에서
                옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다
                확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.
                단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할
                수 있습니다.
                <br />
                <br />
                <strong>설정방법 예시(Chrome):</strong> 웹 브라우저 우측 상단
                메뉴 - 설정 - 개인정보 및 보안 - 쿠키 및 기타 사이트 데이터
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제10조 (행태정보의 처리)
              </h2>
              <p className="text-muted-foreground">
                회사는 맞춤형 광고 제공 및 서비스 개선을 위해 행태정보를
                수집·이용할 수 있습니다.
                <br />
                <br />
                <strong>수집하는 행태정보 항목:</strong> 웹/앱 방문 이력, 검색
                및 클릭 기록 등 서비스 이용 기록
                <br />
                <br />
                <strong>행태정보 수집 방법:</strong> 웹사이트 및 앱 방문 시 로그
                분석 툴 등을 통해 자동 수집
                <br />
                <br />
                <strong>보유·이용 기간 및 이후 정보처리 방법:</strong>{' '}
                수집일로부터 1년 후 파기 또는 비식별 조치
                <br />
                <br />
                <strong>정보주체의 통제권 행사 방법:</strong> 제9조 제4항의 쿠키
                설정 거부 또는 광고 식별자 설정 변경을 통해 행태정보 수집을
                거부할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제11조 (개인정보 보호책임자)
              </h2>
              <p className="text-muted-foreground mb-4">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
                처리와 관련한 정보주체의 불만 처리 및 피해구제 등을 위하여
                아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>

              <div className="bg-muted/20 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-bold mb-2">개인정보 보호책임자 (DPO)</h3>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      <strong>성명:</strong> 오태환
                    </div>
                    <div>
                      <strong>직책:</strong> 정보보호최고책임자 (CISO)
                    </div>
                    <div>
                      <strong>연락처:</strong> +82 10-5814-3481
                    </div>
                    <div>
                      <strong>이메일:</strong> noah@surecrm.pro
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">개인정보보호 담당부서</h3>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      <strong>부서명:</strong> 정보보호팀
                    </div>
                    <div>
                      <strong>담당자:</strong> 오태환
                    </div>
                    <div>
                      <strong>연락처:</strong> +82 10-5814-3481
                    </div>
                    <div>
                      <strong>이메일:</strong> noah@surecrm.pro
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mt-4">
                정보주체는 서비스 이용 과정에서 발생하는 모든 개인정보보호 관련
                문의, 불만 처리, 피해 구제 등에 관한 사항을 개인정보 보호책임자
                및 담당부서로 문의할 수 있습니다. 회사는 정보주체의 문의에 대해
                지체 없이 답변 및 처리해드릴 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제12조 (권익침해 구제방법)
              </h2>
              <p className="text-muted-foreground">
                정보주체는 개인정보침해로 인한 구제를 받기 위하여
                개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터
                등에 분쟁 해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타
                개인정보침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기
                바랍니다.
                <br />
                <br />
                1. <strong>개인정보분쟁조정위원회:</strong> (국번없이) 1833-6972
                (www.kopico.go.kr)
                <br />
                2. <strong>개인정보침해신고센터:</strong> (국번없이) 118
                (privacy.kisa.or.kr)
                <br />
                3. <strong>대검찰청:</strong> (국번없이) 1301 (www.spo.go.kr)
                <br />
                4. <strong>경찰청:</strong> (국번없이) 182 (ecrm.cyber.go.kr)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">
                제13조 (개인정보처리방침의 변경)
              </h2>
              <p className="text-muted-foreground">
                본 개인정보처리방침은 2025년 6월 26일부터 적용됩니다.
                <br />
                <br />
                법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는
                경우에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여
                고지할 것입니다. 다만, 정보주체의 권리 또는 의무에 중요한 변경이
                있는 경우에는 최소 30일 전에 고지하겠습니다.
              </p>
            </section>

            <section className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">부칙</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <strong>본 개인정보처리방침 버전:</strong> 2.0
                </div>
                <div>
                  <strong>공고일자:</strong> 2025년 5월 27일
                </div>
                <div>
                  <strong>시행일자:</strong> 2025년 6월 26일
                </div>
                <div>
                  <strong>문의:</strong> noah@surecrm.pro
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
