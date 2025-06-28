import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeUserEmailProps {
  username: string;
  loginUrl?: string;
  dashboardUrl?: string;
}

export default function WelcomeUser({
  username,
  loginUrl = 'https://surecrm.pro/login',
  dashboardUrl = 'https://surecrm.pro/dashboard',
}: WelcomeUserEmailProps) {
  return (
    <Html lang="ko">
      <Head>
        <title>SureCRM에 오신 것을 환영합니다!</title>
        <style>{`
          /* SureCRM 전용 OKLCH 색상 시스템 */
          :root {
            --surecrm-primary: oklch(0.645 0.246 16.439);
            --surecrm-primary-foreground: oklch(0.969 0.015 12.422);
            --surecrm-secondary: oklch(0.967 0.001 286.375);
            --surecrm-background: oklch(1 0 0);
            --surecrm-foreground: oklch(0.141 0.005 285.823);
            --surecrm-border: oklch(0.92 0.004 286.32);
            --surecrm-muted: oklch(0.552 0.016 285.938);
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --surecrm-background: oklch(0.141 0.005 285.823);
              --surecrm-foreground: oklch(0.985 0 0);
              --surecrm-border: oklch(1 0 0 / 10%);
              --surecrm-muted: oklch(0.705 0.015 286.067);
            }
          }

          /* 애니메이션 효과 */
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          /* Liquid Glass 효과 */
          .liquid-glass {
            background: linear-gradient(135deg, 
              oklch(1 0 0 / 0.8) 0%, 
              oklch(0.98 0.005 240 / 0.6) 100%
            );
            backdrop-filter: blur(12px);
            border: 1px solid oklch(1 0 0 / 0.2);
          }
          
          .shimmer-effect {
            background: linear-gradient(
              90deg,
              transparent,
              oklch(0.645 0.246 16.439 / 0.1),
              transparent
            );
            background-size: 200% 100%;
            animation: shimmer 2s ease-in-out infinite;
          }

          /* 이메일 클라이언트 호환성을 위한 인라인 백업 */
          .fallback-primary { color: #A73F03 !important; }
          .fallback-bg { background-color: #F8FAFC !important; }
          .fallback-border { border-color: #E2E8F0 !important; }
          .fallback-text { color: #1E293B !important; }
          .fallback-muted { color: #64748B !important; }

          /* 반응형 디자인 */
          @media screen and (max-width: 480px) {
            .mobile-responsive {
              width: 100% !important;
              max-width: 100% !important;
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            
            .mobile-stack {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin-bottom: 24px !important;
            }
            
            .mobile-text-center {
              text-align: center !important;
            }
            
            .mobile-button {
              width: 100% !important;
              max-width: 280px !important;
              margin: 0 auto !important;
            }
          }

          /* 테이블 기반 반응형 (더 넓은 호환성) */
          @media screen and (max-width: 600px) {
            table[class="responsive-table"] {
              width: 100% !important;
            }
            
            td[class="responsive-cell"] {
              display: block !important;
              width: 100% !important;
              padding: 12px !important;
              text-align: center !important;
            }
          }
        `}</style>
      </Head>
      <Preview>
        👋 {username}님, SureCRM과 함께 보험 영업의 새로운 혁신을 시작하세요! 🚀
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                // SureCRM 전용 색상 시스템 (OKLCH 기반)
                'surecrm-primary': 'oklch(0.645 0.246 16.439)',
                'surecrm-primary-foreground': 'oklch(0.969 0.015 12.422)',
                'surecrm-secondary': 'oklch(0.967 0.001 286.375)',
                'surecrm-background': 'oklch(1 0 0)',
                'surecrm-foreground': 'oklch(0.141 0.005 285.823)',
                'surecrm-border': 'oklch(0.92 0.004 286.32)',
                'surecrm-muted': 'oklch(0.552 0.016 285.938)',
              },
              fontSize: {
                xs: ['12px', { lineHeight: '16px' }],
                sm: ['14px', { lineHeight: '20px' }],
                base: ['16px', { lineHeight: '24px' }],
                lg: ['18px', { lineHeight: '28px' }],
                xl: ['20px', { lineHeight: '30px' }],
                '2xl': ['24px', { lineHeight: '32px' }],
                '3xl': ['30px', { lineHeight: '36px' }],
                '4xl': ['36px', { lineHeight: '42px' }],
              },
              spacing: {
                px: '1px',
                0: '0',
                1: '4px',
                2: '8px',
                3: '12px',
                4: '16px',
                5: '20px',
                6: '24px',
                7: '28px',
                8: '32px',
                10: '40px',
                12: '48px',
                14: '56px',
                16: '64px',
                20: '80px',
                24: '96px',
                28: '112px',
                32: '128px',
                40: '160px',
              },
              fontFamily: {
                sans: [
                  '-apple-system',
                  'BlinkMacSystemFont',
                  'Segoe UI',
                  'Roboto',
                  'Helvetica Neue',
                  'Arial',
                  'sans-serif',
                  'Apple Color Emoji',
                  'Segoe UI Emoji',
                ],
              },
              boxShadow: {
                liquid:
                  '0 8px 32px oklch(0.141 0.005 285.823 / 0.1), 0 1px 2px oklch(0.141 0.005 285.823 / 0.06)',
                glow: '0 0 20px oklch(0.645 0.246 16.439 / 0.3)',
              },
            },
          },
        }}
      >
        <Body
          style={{ backgroundColor: 'oklch(0.985 0.003 240)' }}
          className="font-sans"
        >
          <Container
            style={{
              margin: '0 auto',
              padding: '48px 24px',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            {/* 메인 헤더 섹션 */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                className="liquid-glass"
                style={{
                  backgroundColor: 'oklch(0.975 0.025 240)',
                  borderColor: 'oklch(0.92 0.06 240)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '24px',
                  padding: '40px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: '100%',
                }}
              >
                {/* 배경 효과 */}
                <div
                  className="absolute inset-0 shimmer-effect"
                  style={{ opacity: 0.1 }}
                />

                {/* 로고 및 브랜딩 */}
                <div className="relative z-10 mb-8">
                  <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
                    style={{
                      background:
                        'linear-gradient(135deg, oklch(0.645 0.246 16.439), oklch(0.577 0.245 27.325))',
                      boxShadow: '0 8px 25px oklch(0.141 0.005 285.823 / 0.15)',
                    }}
                  >
                    <span className="text-white text-3xl font-bold">S</span>
                  </div>

                  <Heading
                    className="text-4xl font-bold mb-2 fallback-text"
                    style={{ color: 'oklch(0.141 0.005 285.823)' }}
                  >
                    SureCRM
                  </Heading>
                  <Text
                    className="fallback-muted text-base"
                    style={{ color: 'oklch(0.552 0.016 285.938)' }}
                  >
                    보험 영업의 소개 네트워크와 영업 파이프라인 관리
                  </Text>
                </div>

                {/* 환영 메시지 */}
                <div className="relative z-10 mb-8">
                  <Heading
                    className="text-3xl font-bold mb-4 fallback-text"
                    style={{
                      color: 'oklch(0.141 0.005 285.823)',
                      textAlign: 'center',
                      lineHeight: '40px',
                      margin: '0 0 16px 0',
                      wordBreak: 'keep-all',
                    }}
                  >
                    🎉 환영합니다, {username}님!
                  </Heading>
                  <Text
                    className="text-lg leading-relaxed fallback-text"
                    style={{
                      color: 'oklch(0.141 0.005 285.823)',
                      textAlign: 'center',
                      lineHeight: '28px',
                      margin: '0',
                      maxWidth: '480px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    SureCRM 가족이 되어주셔서 진심으로 감사합니다.
                    <br />
                    이제 더 스마트하고 효율적인 보험 영업의 디지털 혁신을
                    경험해보세요.
                  </Text>
                </div>

                {/* CTA 버튼 */}
                <Section className="mb-8">
                  <Button
                    href={dashboardUrl}
                    className="mobile-button"
                    style={{
                      background:
                        'linear-gradient(135deg, oklch(0.645 0.246 16.439), oklch(0.577 0.245 27.325))',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '20px 40px',
                      borderRadius: '16px',
                      border: 'none',
                      textDecoration: 'none',
                      display: 'inline-block',
                      textAlign: 'center',
                      maxWidth: '320px',
                      width: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 8px 25px oklch(0.141 0.005 285.823 / 0.15)',
                    }}
                  >
                    🚀 대시보드에서 시작하기
                  </Button>
                </Section>
              </div>
            </Section>

            {/* 핵심 기능 소개 - 반응형 그리드 레이아웃 */}
            <Section style={{ marginBottom: '40px' }}>
              <div
                className="liquid-glass fallback-border"
                style={{
                  borderColor: 'oklch(0.92 0.004 286.32)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  maxWidth: '100%',
                }}
              >
                <Heading
                  className="text-2xl font-bold mb-8 text-center fallback-text"
                  style={{
                    color: 'oklch(0.141 0.005 285.823)',
                    textAlign: 'center',
                    lineHeight: '32px',
                    margin: '0 0 32px 0',
                    wordBreak: 'keep-all',
                  }}
                >
                  SureCRM으로 무엇을 할 수 있나요?
                </Heading>

                {/* 이메일 클라이언트 호환 그리드 - 테이블 기반 레이아웃 */}
                <table
                  role="presentation"
                  cellSpacing={0}
                  cellPadding={0}
                  border={0}
                  width="100%"
                  style={{ width: '100%', tableLayout: 'fixed' }}
                >
                  <tr>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#E8F4FD',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                👥
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              고객 관리
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              고객 정보, 상담 이력, 계약 현황을 체계적으로
                              관리하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#F0FDF4',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                📊
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              영업 파이프라인
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              영업 단계별로 고객을 관리하고 진행 상황을
                              추적하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#FFFBEB',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                🤝
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              소개 네트워크
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              추천인과 피추천인 관계를 시각화하고 관리하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#FDF4FF',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                📅
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              구글 캘린더 연동
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              구글 계정과 캘린더를 연동하여 일정을 통합
                              관리하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#FEF2F2',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                📈
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              보고서 및 대시보드
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              영업 성과와 통계를 시각적 차트로 확인하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td
                      style={{
                        width: '33.33%',
                        verticalAlign: 'top',
                        padding: '12px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td
                            style={{ textAlign: 'center', padding: '16px 8px' }}
                          >
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 8px rgba(30, 41, 59, 0.1)',
                              }}
                            >
                              <span
                                style={{ fontSize: '24px', lineHeight: '1' }}
                              >
                                💌
                              </span>
                            </div>
                            <h3
                              style={{
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 12px 0',
                                fontWeight: 'bold',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              초대장 관리
                            </h3>
                            <p
                              style={{
                                color: '#64748B',
                                textAlign: 'center',
                                fontSize: '14px',
                                lineHeight: '20px',
                                margin: '0',
                                wordBreak: 'keep-all',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              }}
                            >
                              팀 멤버 초대와 권한 관리를 간편하게 처리하세요
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </Section>

            {/* 퀵 스타트 가이드 */}
            <Section className="mb-10">
              <div
                className="rounded-2xl p-8 border-2"
                style={{
                  backgroundColor: 'oklch(0.975 0.025 240)',
                  borderColor: 'oklch(0.92 0.06 240)',
                }}
              >
                <Heading
                  className="text-xl font-bold mb-6 text-center"
                  style={{ color: 'oklch(0.5 0.12 240)' }}
                >
                  🎯 시작 가이드
                </Heading>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                      style={{ backgroundColor: 'oklch(0.645 0.246 16.439)' }}
                    >
                      1
                    </div>
                    <div>
                      <Text
                        className="font-semibold mb-1"
                        style={{ color: 'oklch(0.5 0.12 240)' }}
                      >
                        프로필 설정
                      </Text>
                      <Text
                        className="text-sm leading-relaxed"
                        style={{ color: 'oklch(0.5 0.12 240)', opacity: 0.8 }}
                      >
                        기본 정보와 영업 목표를 설정하여 개인화된 경험을
                        시작하세요
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                      style={{ backgroundColor: 'oklch(0.696 0.17 162.48)' }}
                    >
                      2
                    </div>
                    <div>
                      <Text
                        className="font-semibold mb-1"
                        style={{ color: 'oklch(0.5 0.12 240)' }}
                      >
                        고객 데이터 등록
                      </Text>
                      <Text
                        className="text-sm leading-relaxed"
                        style={{ color: 'oklch(0.5 0.12 240)', opacity: 0.8 }}
                      >
                        기존 고객 정보를 시스템에 입력하고 상담 이력을
                        기록해보세요
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                      style={{ backgroundColor: 'oklch(0.769 0.188 70.08)' }}
                    >
                      3
                    </div>
                    <div>
                      <Text
                        className="font-semibold mb-1"
                        style={{ color: 'oklch(0.5 0.12 240)' }}
                      >
                        첫 영업 기회 생성
                      </Text>
                      <Text
                        className="text-sm leading-relaxed"
                        style={{ color: 'oklch(0.5 0.12 240)', opacity: 0.8 }}
                      >
                        파이프라인에 첫 영업 기회를 추가하고 진행 상황을
                        추적해보세요
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 고객 지원 섹션 */}
            <Section style={{ marginBottom: '40px' }}>
              <div
                className="liquid-glass fallback-border"
                style={{
                  borderColor: '#E2E8F0',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  maxWidth: '100%',
                }}
              >
                <h2
                  style={{
                    color: '#1E293B',
                    textAlign: 'center',
                    fontSize: '20px',
                    lineHeight: '28px',
                    margin: '0 0 24px 0',
                    fontWeight: 'bold',
                    wordBreak: 'keep-all',
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  💬 고객 지원
                </h2>

                {/* 반응형 버튼 레이아웃 */}
                <table
                  role="presentation"
                  cellSpacing={0}
                  cellPadding={0}
                  border={0}
                  width="100%"
                  style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                >
                  <tr>
                    <td
                      style={{
                        width: '50%',
                        verticalAlign: 'top',
                        padding: '8px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              href="https://surecrm.pro/help"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: '#E2E8F0',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                color: '#1E293B',
                                fontWeight: '500',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                textAlign: 'center',
                                width: '100%',
                                maxWidth: '180px',
                                boxSizing: 'border-box',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '14px',
                                lineHeight: '20px',
                                wordBreak: 'keep-all',
                              }}
                            >
                              📚 도움말 센터
                            </Button>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td
                      style={{
                        width: '50%',
                        verticalAlign: 'top',
                        padding: '8px',
                      }}
                      className="responsive-cell"
                    >
                      <table
                        role="presentation"
                        cellSpacing={0}
                        cellPadding={0}
                        border={0}
                        width="100%"
                      >
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              href="mailto:noah@surecrm.pro"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: '#E2E8F0',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                color: '#1E293B',
                                fontWeight: '500',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                textAlign: 'center',
                                width: '100%',
                                maxWidth: '180px',
                                boxSizing: 'border-box',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '14px',
                                lineHeight: '20px',
                                wordBreak: 'keep-all',
                              }}
                            >
                              📧 고객지원팀
                            </Button>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </Section>

            <Hr
              style={{
                borderColor: 'oklch(0.92 0.004 286.32)',
                margin: '32px 0',
              }}
            />

            {/* 푸터 */}
            <Section className="text-center">
              <Text
                className="text-sm mb-6 fallback-muted"
                style={{
                  color: 'oklch(0.552 0.016 285.938)',
                  textAlign: 'center',
                  lineHeight: '20px',
                  margin: '0 0 24px 0',
                  maxWidth: '480px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                이 이메일은 SureCRM 계정 생성에 의해 발송되었습니다.
                <br />더 이상 이메일을 받고 싶지 않으시면{' '}
                <Link
                  href="https://surecrm.pro/unsubscribe"
                  className="fallback-primary"
                  style={{ color: 'oklch(0.645 0.246 16.439)' }}
                >
                  여기서 구독을 취소
                </Link>
                할 수 있습니다.
              </Text>

              <div
                className="border-t pt-6 mt-6"
                style={{ borderColor: 'oklch(0.92 0.004 286.32)' }}
              >
                <Text
                  className="text-sm fallback-muted"
                  style={{
                    color: 'oklch(0.552 0.016 285.938)',
                    textAlign: 'center',
                    lineHeight: '20px',
                    margin: '0',
                  }}
                >
                  © {new Date().getFullYear()} SureCRM. All rights reserved.
                  <br />
                  <strong>보험 영업의 혁신을 이끄는 스마트 CRM 솔루션</strong>
                </Text>
                <div className="mt-4">
                  <Link
                    href="https://surecrm.pro"
                    className="font-semibold fallback-primary"
                    style={{ color: 'oklch(0.645 0.246 16.439)' }}
                  >
                    🌐 surecrm.pro
                  </Link>
                </div>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
