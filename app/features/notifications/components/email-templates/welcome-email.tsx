import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Button,
  Hr,
  Img,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName?: string;
  userEmail?: string;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}

export function WelcomeEmail({
  userName = '고객님',
  userEmail = '',
  dashboardUrl = 'https://surecrm-sigma.vercel.app/dashboard',
  unsubscribeUrl = '#',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* 헤더 */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={logo}>SureCRM</Heading>
                <Text style={tagline}>보험설계사를 위한 스마트 CRM</Text>
              </Column>
            </Row>
          </Section>

          {/* 메인 컨텐츠 */}
          <Section style={content}>
            <Heading style={h1}>
              🎉 {userName}님, SureCRM에 오신 것을 환영합니다!
            </Heading>

            <Text style={text}>
              보험설계사로서 더 체계적이고 전문적인 업무를 하고 싶으셨죠?
              <br />
              이제 SureCRM과 함께 고객 관리부터 영업 성과까지 한 번에
              해결하세요!
            </Text>

            {/* 핵심 가치 제안 */}
            <Section style={valueProposition}>
              <Heading style={h2}>🚀 이제 이런 것들이 가능해집니다</Heading>

              <Row style={featureRow}>
                <Column style={featureColumn}>
                  <Text style={featureIcon}>📋</Text>
                  <Text style={featureTitle}>고객 정보 한눈에</Text>
                  <Text style={featureDesc}>
                    흩어진 고객 정보를 체계적으로 관리하고 중요한 정보를 놓치지
                    마세요
                  </Text>
                </Column>
                <Column style={featureColumn}>
                  <Text style={featureIcon}>📈</Text>
                  <Text style={featureTitle}>영업 성과 실시간 추적</Text>
                  <Text style={featureDesc}>
                    파이프라인에서 계약 진행 상황을 실시간으로 확인하세요
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureColumn}>
                  <Text style={featureIcon}>💰</Text>
                  <Text style={featureTitle}>수수료 자동 계산</Text>
                  <Text style={featureDesc}>
                    복잡한 수수료 계산을 자동화하고 목표 달성률을 확인하세요
                  </Text>
                </Column>
                <Column style={featureColumn}>
                  <Text style={featureIcon}>⏰</Text>
                  <Text style={featureTitle}>스마트 일정 관리</Text>
                  <Text style={featureDesc}>
                    고객 미팅과 중요한 일정을 놓치지 않도록 알림을 받으세요
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA 섹션 */}
            <Section style={ctaSection}>
              <Heading style={h2}>🎯 지금 바로 시작해보세요!</Heading>
              <Text style={text}>
                3분이면 첫 번째 고객 정보를 등록하고 영업 파이프라인을 설정할 수
                있어요.
                <br />
                <strong>성공하는 보험설계사의 첫걸음, 지금 시작하세요!</strong>
              </Text>

              <Button style={button} href={dashboardUrl}>
                🚀 SureCRM 시작하기
              </Button>

              <Text style={linkText}>
                또는{' '}
                <Link href={dashboardUrl} style={link}>
                  여기를 클릭하세요
                </Link>
              </Text>
            </Section>

            {/* 빠른 시작 가이드 */}
            <Section style={guideSection}>
              <Heading style={h3}>💡 빠른 시작 가이드</Heading>
              <Text style={guideText}>
                <strong>1단계:</strong> 첫 번째 고객 정보 등록하기
                <br />
                <strong>2단계:</strong> 진행 중인 계약을 영업 파이프라인에
                추가하기
                <br />
                <strong>3단계:</strong> 대시보드에서 현재 성과 확인하기
              </Text>

              <Text style={tipText}>
                💡 <strong>꿀팁:</strong> 모바일에서도 언제든 접속 가능하니까,
                고객 만나러 가는 길에도 정보를 확인해보세요!
              </Text>
            </Section>

            {/* 지원 정보 */}
            <Section style={supportSection}>
              <Text style={supportText}>
                궁금한 것이 있으시면 언제든 문의해주세요.
                <br />더 나은 서비스를 위해 항상 노력하고 있습니다. 🙌
              </Text>
            </Section>
          </Section>

          {/* 푸터 */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              이 이메일은 SureCRM 가입 시 자동으로 발송됩니다.
              <br />더 이상 이메일을 받고 싶지 않으시면{' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                여기를 클릭하세요
              </Link>
            </Text>
            <Text style={copyright}>© 2024 SureCRM. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// 스타일 정의
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
};

const header = {
  borderRadius: '8px 8px 0 0',
  backgroundColor: '#1e40af',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const tagline = {
  color: '#e0e7ff',
  fontSize: '16px',
  margin: '0',
};

const content = {
  padding: '32px 24px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const valueProposition = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const featureRow = {
  margin: '16px 0',
};

const featureColumn = {
  width: '50%',
  padding: '0 8px',
  verticalAlign: 'top' as const,
};

const featureIcon = {
  fontSize: '24px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const featureDesc = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '16px 0',
};

const linkText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
};

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
};

const guideSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const guideText = {
  color: '#92400e',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const tipText = {
  color: '#d97706',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
  fontStyle: 'italic',
};

const supportSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const supportText = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const footer = {
  marginTop: '32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const copyright = {
  color: '#d1d5db',
  fontSize: '11px',
  margin: '0',
  textAlign: 'center' as const,
};

const unsubscribeLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
};

export default WelcomeEmail;
