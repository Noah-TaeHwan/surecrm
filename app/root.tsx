import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  data,
} from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect } from 'react';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { initGA, SessionTracking } from '~/lib/utils/analytics';
import { usePageTracking } from '~/hooks/use-analytics';
import { useBusinessIntelligence } from '~/hooks/use-business-intelligence';
import { useUserRoleTracker } from '~/hooks/use-user-role-tracker';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* 🚀 Google Tag Manager - 조건부 로드 */}
        {import.meta.env.VITE_GTM_CONTAINER_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // 🔒 분석 수집 환경 확인
                (function() {
                  // 개발 환경 감지
                  const isDev = window.location.hostname === 'localhost' ||
                               window.location.hostname === '127.0.0.1' ||
                               window.location.hostname.includes('.local') ||
                               window.location.port === '5173' ||
                               window.location.port === '5174' ||
                               window.location.port === '5175' ||
                               window.location.port === '5176' ||
                               window.location.port === '5177' ||
                               window.location.port === '5178' ||
                               window.location.port === '5179' ||
                               window.location.port === '5180' ||
                               window.location.port === '5181' ||
                               window.location.port === '5182' ||
                               window.location.port === '5183' ||
                               window.location.port === '5184' ||
                               window.location.port === '5185' ||
                               window.location.port === '5186' ||
                               window.location.port === '5187' ||
                               window.location.port === '3000' ||
                               window.location.port === '8080';
                  
                  if (isDev) {
                    // 한 번만 로그 출력 (페이지 로드마다 반복 방지)
                    if (!window.__gtm_dev_logged) {
                      console.log('🔧 개발환경: GTM 로딩 건너뛰기');
                      window.__gtm_dev_logged = true;
                    }
                    return;
                  }
                  
                  // GTM 로드
                  (function(w,d,s,l,i){
                    w[l]=w[l]||[];
                    w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                    var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                    j.async=true;
                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                    f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${
                    import.meta.env.VITE_GTM_CONTAINER_ID
                  }');
                  
                  // 로딩 완료 플래그만 설정 (프로덕션에서는 로그 없음)
                  if (!window.__gtm_success_logged) {
                    window.__gtm_success_logged = true;
                  }
                })();
              `,
            }}
          />
        )}

        {/* 🚀 Google Analytics - 조건부 로드 */}
        {import.meta.env.VITE_GA_MEASUREMENT_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // 🔒 은밀한 분석 수집 시스템
                  (function() {
                    // 🔧 개발 환경 감지 (로컬 완전 차단)
                    const isLocalhost = window.location.hostname === 'localhost' ||
                                       window.location.hostname === '127.0.0.1' ||
                                       window.location.hostname.includes('.local');

                    const isDevPort = ['5173', '5174', '5175', '5176', '5177', '5178', '5179', 
                                      '5180', '5181', '5182', '5183', '5184', '5185', '5186', 
                                      '5187', '3000', '8080'].includes(window.location.port);

                    // 🚀 Vercel 프로덕션 환경 확인
                    const isVercelProduction = window.location.hostname.includes('.vercel.app');

                    // 개발 환경이면 GA 로딩 차단
                    const isDev = !isVercelProduction && isLocalhost && isDevPort;
                    if (isDev) {
                      return; // 개발환경에서는 GA 완전 차단
                    }

                    // 사용자 역할 확인 (프로덕션에서만)
                    function getCurrentUserRole() {
                      try {
                        const role = localStorage.getItem('surecrm_user_role');
                        if (role && role.trim() !== '') return role;
                        
                        const userSession = localStorage.getItem('supabase.auth.token');
                        if (userSession) {
                          const sessionData = JSON.parse(userSession);
                          return sessionData?.user?.user_metadata?.role || null;
                        }
                        return null;
                      } catch (error) {
                        return null;
                      }
                    }

                    // system_admin 사용자 체크 (프로덕션에서만)
                    const userRole = getCurrentUserRole();
                    if (userRole === 'system_admin') {
                      return; // 관리자는 GA 로딩하지 않음
                    }

                    // 프로덕션에서 일반 사용자만 GA 로드
                    const script = document.createElement('script');
                    script.async = true;
                    script.src = 'https://www.googletagmanager.com/gtag/js?id=${
                      import.meta.env.VITE_GA_MEASUREMENT_ID
                    }';
                    document.head.appendChild(script);
                    
                    // GA 초기화 (은밀하게)
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${
                      import.meta.env.VITE_GA_MEASUREMENT_ID
                    }', {
                      send_page_view: true,
                      custom_map: {
                        'custom_parameter_1': 'user_engagement_depth',
                        'custom_parameter_2': 'behavior_prediction_score', 
                        'custom_parameter_3': 'business_value_index'
                      }
                    });
                  })();

                  // 🔄 사용자 행동 분석 시스템 초기화
                  document.addEventListener('DOMContentLoaded', function() {
                    // 🔧 개발환경 감지 (동일한 로직 사용)
                    const isLocalhost = window.location.hostname === 'localhost' ||
                                       window.location.hostname === '127.0.0.1' ||
                                       window.location.hostname.includes('.local');

                    const isDevPort = ['5173', '5174', '5175', '5176', '5177', '5178', '5179', 
                                      '5180', '5181', '5182', '5183', '5184', '5185', '5186', 
                                      '5187', '3000', '8080'].includes(window.location.port);

                    // 🚀 Vercel 프로덕션 환경 명시적 허용
                    const isVercelProduction = window.location.hostname.includes('.vercel.app');

                    // 개발 환경 조건: localhost + dev port (Vercel은 제외)
                    const isDevelopment = !isVercelProduction && isLocalhost && isDevPort;

                    if (!isDevelopment) {
                      // 🚀 프로덕션에서만 고급 분석 활성화
                      setTimeout(() => {
                        Promise.all([
                          import('/app/lib/utils/behavioral-surplus-extractor.js'),
                          import('/app/lib/utils/neural-user-pattern-analyzer.js'),
                          import('/app/lib/utils/enhanced-user-experience-optimizer.js'),
                          import('/app/lib/utils/comprehensive-data-harvester.js')
                        ]).then(([surplusModule, neuralModule, optimizerModule, harvesterModule]) => {
                          // 행동 잉여 추출 시스템
                          if (surplusModule?.initializeBehavioralSurplusExtraction) {
                            surplusModule.initializeBehavioralSurplusExtraction();
                          }
                          
                          // 신경망급 분석 시스템
                          if (neuralModule?.initializeNeuralUserAnalysis) {
                            neuralModule.initializeNeuralUserAnalysis();
                          }
                          
                          // 사용자 경험 최적화 시스템
                          if (optimizerModule?.initializeUserExperienceOptimization) {
                            optimizerModule.initializeUserExperienceOptimization({
                              enablePersonalization: true,
                              enableSmartRecommendations: true,
                              enablePerformanceOptimization: true,
                              enableAccessibilityEnhancement: true,
                              dataQualityThreshold: 0.98,
                              responseTimeTarget: 150
                            });
                          }

                          // 🔍 포괄적 자동 데이터 수집 시스템 (최강 레벨)
                          if (harvesterModule?.initializeComprehensiveDataHarvesting) {
                            harvesterModule.initializeComprehensiveDataHarvesting();
                          }

                          // GTM으로 시스템 활성화 알림
                          if (window.dataLayer) {
                            window.dataLayer.push({
                              event: 'advanced_analytics_initialized',
                              category: 'user_experience_optimization',
                              systems_activated: ['behavioral_surplus', 'neural_analysis', 'experience_optimization', 'comprehensive_harvesting'],
                              timestamp: Date.now()
                            });
                          }
                        }).catch(error => {
                          // 오류 무시 (은밀한 운영)
                        });
                      }, 1000);
                    }
                  });
                `,
              }}
            />
          </>
        )}

        {/* 🔧 Buffer polyfill - 브라우저 환경에서 Buffer 사용 가능하도록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Buffer polyfill using dynamic import
              if (typeof window !== 'undefined' && !window.Buffer) {
                try {
                  // Try to load the real buffer package
                  import('buffer').then(bufferModule => {
                    window.Buffer = bufferModule.Buffer;
                  }).catch(() => {
                    // Fallback to simple polyfill
                    window.Buffer = {
                      from: function(data, encoding) {
                        if (typeof data === 'string') {
                          if (encoding === 'hex') {
                            const bytes = [];
                            for (let i = 0; i < data.length; i += 2) {
                              bytes.push(parseInt(data.substr(i, 2), 16));
                            }
                            const result = new Uint8Array(bytes);
                            result.toString = function(enc) {
                              if (enc === 'hex') {
                                return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                              }
                              return new TextDecoder().decode(this);
                            };
                            // Add essential Buffer methods
                            result.writeUInt32BE = function(value, offset) {
                              offset = offset || 0;
                              this[offset] = (value >>> 24) & 0xFF;
                              this[offset + 1] = (value >>> 16) & 0xFF;
                              this[offset + 2] = (value >>> 8) & 0xFF;
                              this[offset + 3] = value & 0xFF;
                              return offset + 4;
                            };
                            result.writeUInt32LE = function(value, offset) {
                              offset = offset || 0;
                              this[offset] = value & 0xFF;
                              this[offset + 1] = (value >>> 8) & 0xFF;
                              this[offset + 2] = (value >>> 16) & 0xFF;
                              this[offset + 3] = (value >>> 24) & 0xFF;
                              return offset + 4;
                            };
                            result.readUInt32BE = function(offset) {
                              offset = offset || 0;
                              return (this[offset] << 24) + (this[offset + 1] << 16) + (this[offset + 2] << 8) + this[offset + 3];
                            };
                            result.readUInt32LE = function(offset) {
                              offset = offset || 0;
                              return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16) + (this[offset + 3] << 24);
                            };
                            result.write = function(string, offset, length, encoding) {
                              if (typeof string !== 'string') return 0;
                              offset = offset || 0;
                              encoding = encoding || 'utf8';
                              
                              const bytes = new TextEncoder().encode(string);
                              const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                              
                              for (let i = 0; i < bytesToWrite; i++) {
                                if (offset + i < this.length) {
                                  this[offset + i] = bytes[i];
                                }
                              }
                              return bytesToWrite;
                            };
                            return result;
                          }
                          const result = new TextEncoder().encode(data);
                          result.toString = function(enc) {
                            if (enc === 'hex') {
                              return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                            }
                            return new TextDecoder().decode(this);
                          };
                          // Add essential Buffer methods
                          result.writeUInt32BE = function(value, offset) {
                            offset = offset || 0;
                            this[offset] = (value >>> 24) & 0xFF;
                            this[offset + 1] = (value >>> 16) & 0xFF;
                            this[offset + 2] = (value >>> 8) & 0xFF;
                            this[offset + 3] = value & 0xFF;
                            return offset + 4;
                          };
                          result.writeUInt32LE = function(value, offset) {
                            offset = offset || 0;
                            this[offset] = value & 0xFF;
                            this[offset + 1] = (value >>> 8) & 0xFF;
                            this[offset + 2] = (value >>> 16) & 0xFF;
                            this[offset + 3] = (value >>> 24) & 0xFF;
                            return offset + 4;
                          };
                          result.readUInt32BE = function(offset) {
                            offset = offset || 0;
                            return (this[offset] << 24) + (this[offset + 1] << 16) + (this[offset + 2] << 8) + this[offset + 3];
                          };
                          result.readUInt32LE = function(offset) {
                            offset = offset || 0;
                            return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16) + (this[offset + 3] << 24);
                          };
                          result.write = function(string, offset, length, encoding) {
                            if (typeof string !== 'string') return 0;
                            offset = offset || 0;
                            encoding = encoding || 'utf8';
                            
                            const bytes = new TextEncoder().encode(string);
                            const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                            
                            for (let i = 0; i < bytesToWrite; i++) {
                              if (offset + i < this.length) {
                                this[offset + i] = bytes[i];
                              }
                            }
                            return bytesToWrite;
                          };
                          return result;
                        }
                        const result = new Uint8Array(data);
                        // Add essential Buffer methods
                        result.toString = function(enc) {
                          if (enc === 'hex') {
                            return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                          }
                          return new TextDecoder().decode(this);
                        };
                        result.writeUInt32BE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = (value >>> 24) & 0xFF;
                          this[offset + 1] = (value >>> 16) & 0xFF;
                          this[offset + 2] = (value >>> 8) & 0xFF;
                          this[offset + 3] = value & 0xFF;
                          return offset + 4;
                        };
                        result.writeUInt32LE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          this[offset + 1] = (value >>> 8) & 0xFF;
                          this[offset + 2] = (value >>> 16) & 0xFF;
                          this[offset + 3] = (value >>> 24) & 0xFF;
                          return offset + 4;
                        };
                        result.readUInt32BE = function(offset) {
                          offset = offset || 0;
                          return (this[offset] << 24) + (this[offset + 1] << 16) + (this[offset + 2] << 8) + this[offset + 3];
                        };
                        result.readUInt32LE = function(offset) {
                          offset = offset || 0;
                          return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16) + (this[offset + 3] << 24);
                        };
                        result.write = function(string, offset, length, encoding) {
                          if (typeof string !== 'string') return 0;
                          offset = offset || 0;
                          encoding = encoding || 'utf8';
                          
                          const bytes = new TextEncoder().encode(string);
                          const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                          
                          for (let i = 0; i < bytesToWrite; i++) {
                            if (offset + i < this.length) {
                              this[offset + i] = bytes[i];
                            }
                          }
                          return bytesToWrite;
                        };
                        return result;
                      },
                      alloc: function(size, fill, encoding) {
                        const buf = new Uint8Array(size);
                        if (fill !== undefined) {
                          buf.fill(fill);
                        }
                        buf.toString = function(enc) {
                          if (enc === 'hex') {
                            return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                          }
                          return new TextDecoder().decode(this);
                        };
                        // Add write methods
                        buf.writeUInt32BE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = (value >>> 24) & 0xFF;
                          this[offset + 1] = (value >>> 16) & 0xFF;
                          this[offset + 2] = (value >>> 8) & 0xFF;
                          this[offset + 3] = value & 0xFF;
                          return offset + 4;
                        };
                        buf.writeUInt32LE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          this[offset + 1] = (value >>> 8) & 0xFF;
                          this[offset + 2] = (value >>> 16) & 0xFF;
                          this[offset + 3] = (value >>> 24) & 0xFF;
                          return offset + 4;
                        };
                        buf.readUInt32BE = function(offset) {
                          offset = offset || 0;
                          return (this[offset] << 24) + (this[offset + 1] << 16) + (this[offset + 2] << 8) + this[offset + 3];
                        };
                        buf.readUInt32LE = function(offset) {
                          offset = offset || 0;
                          return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16) + (this[offset + 3] << 24);
                        };
                        // Add more write/read methods
                        buf.writeUInt16BE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = (value >>> 8) & 0xFF;
                          this[offset + 1] = value & 0xFF;
                          return offset + 2;
                        };
                        buf.writeUInt16LE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          this[offset + 1] = (value >>> 8) & 0xFF;
                          return offset + 2;
                        };
                        buf.writeUInt8 = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          return offset + 1;
                        };
                        buf.readUInt16BE = function(offset) {
                          offset = offset || 0;
                          return (this[offset] << 8) + this[offset + 1];
                        };
                        buf.readUInt16LE = function(offset) {
                          offset = offset || 0;
                          return this[offset] + (this[offset + 1] << 8);
                        };
                        buf.readUInt8 = function(offset) {
                          offset = offset || 0;
                          return this[offset];
                        };
                        buf.slice = function(start, end) {
                          const result = new Uint8Array(this.subarray(start, end));
                          // Copy all methods to slice result
                          Object.assign(result, this);
                          return result;
                        };
                        buf.subarray = function(start, end) {
                          const result = new Uint8Array(this.buffer, this.byteOffset + (start || 0), (end || this.length) - (start || 0));
                          Object.assign(result, this);
                          return result;
                        };
                        buf.write = function(string, offset, length, encoding) {
                          if (typeof string !== 'string') return 0;
                          offset = offset || 0;
                          encoding = encoding || 'utf8';
                          
                          const bytes = new TextEncoder().encode(string);
                          const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                          
                          for (let i = 0; i < bytesToWrite; i++) {
                            if (offset + i < this.length) {
                              this[offset + i] = bytes[i];
                            }
                          }
                          return bytesToWrite;
                        };
                        return buf;
                      },
                      allocUnsafe: function(size) {
                        const buf = new Uint8Array(size);
                        buf.toString = function(enc) {
                          if (enc === 'hex') {
                            return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                          }
                          return new TextDecoder().decode(this);
                        };
                        // Add write methods
                        buf.writeUInt32BE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = (value >>> 24) & 0xFF;
                          this[offset + 1] = (value >>> 16) & 0xFF;
                          this[offset + 2] = (value >>> 8) & 0xFF;
                          this[offset + 3] = value & 0xFF;
                          return offset + 4;
                        };
                        buf.writeUInt32LE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          this[offset + 1] = (value >>> 8) & 0xFF;
                          this[offset + 2] = (value >>> 16) & 0xFF;
                          this[offset + 3] = (value >>> 24) & 0xFF;
                          return offset + 4;
                        };
                        buf.readUInt32BE = function(offset) {
                          offset = offset || 0;
                          return (this[offset] << 24) + (this[offset + 1] << 16) + (this[offset + 2] << 8) + this[offset + 3];
                        };
                        buf.readUInt32LE = function(offset) {
                          offset = offset || 0;
                          return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16) + (this[offset + 3] << 24);
                        };
                        // Add more write/read methods
                        buf.writeUInt16BE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = (value >>> 8) & 0xFF;
                          this[offset + 1] = value & 0xFF;
                          return offset + 2;
                        };
                        buf.writeUInt16LE = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          this[offset + 1] = (value >>> 8) & 0xFF;
                          return offset + 2;
                        };
                        buf.writeUInt8 = function(value, offset) {
                          offset = offset || 0;
                          this[offset] = value & 0xFF;
                          return offset + 1;
                        };
                        buf.readUInt16BE = function(offset) {
                          offset = offset || 0;
                          return (this[offset] << 8) + this[offset + 1];
                        };
                        buf.readUInt16LE = function(offset) {
                          offset = offset || 0;
                          return this[offset] + (this[offset + 1] << 8);
                        };
                        buf.readUInt8 = function(offset) {
                          offset = offset || 0;
                          return this[offset];
                        };
                        buf.slice = function(start, end) {
                          const result = new Uint8Array(this.subarray(start, end));
                          // Copy all methods to slice result
                          Object.assign(result, this);
                          return result;
                        };
                        buf.subarray = function(start, end) {
                          const result = new Uint8Array(this.buffer, this.byteOffset + (start || 0), (end || this.length) - (start || 0));
                          Object.assign(result, this);
                          return result;
                        };
                        buf.write = function(string, offset, length, encoding) {
                          if (typeof string !== 'string') return 0;
                          offset = offset || 0;
                          encoding = encoding || 'utf8';
                          
                          const bytes = new TextEncoder().encode(string);
                          const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                          
                          for (let i = 0; i < bytesToWrite; i++) {
                            if (offset + i < this.length) {
                              this[offset + i] = bytes[i];
                            }
                          }
                          return bytesToWrite;
                        };
                        return buf;
                      },
                      concat: function(list, totalLength) {
                        if (!totalLength) {
                          totalLength = list.reduce((sum, buf) => sum + buf.length, 0);
                        }
                        const result = new Uint8Array(totalLength);
                        let offset = 0;
                        for (const buf of list) {
                          result.set(buf, offset);
                          offset += buf.length;
                        }
                        result.toString = function(enc) {
                          if (enc === 'hex') {
                            return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
                          }
                          return new TextDecoder().decode(this);
                        };
                        return result;
                      },
                      isBuffer: function(obj) {
                        return obj instanceof Uint8Array;
                      },
                      // Add byteLength static method
                      byteLength: function(string, encoding) {
                        if (typeof string !== 'string') return 0;
                        if (encoding === 'hex') {
                          return Math.floor(string.length / 2);
                        }
                        // Default to UTF-8
                        return new TextEncoder().encode(string).length;
                      },
                      // Add compare static method
                      compare: function(buf1, buf2) {
                        if (buf1.length !== buf2.length) {
                          return buf1.length < buf2.length ? -1 : 1;
                        }
                        for (let i = 0; i < buf1.length; i++) {
                          if (buf1[i] !== buf2[i]) {
                            return buf1[i] < buf2[i] ? -1 : 1;
                          }
                        }
                        return 0;
                      },
                      // Add write method for strings
                      write: function(string, offset, length, encoding) {
                        if (typeof string !== 'string') return 0;
                        offset = offset || 0;
                        encoding = encoding || 'utf8';
                        
                        const bytes = new TextEncoder().encode(string);
                        const bytesToWrite = Math.min(bytes.length, length || bytes.length);
                        
                        for (let i = 0; i < bytesToWrite; i++) {
                          if (offset + i < this.length) {
                            this[offset + i] = bytes[i];
                          }
                        }
                        return bytesToWrite;
                      }
                    };
                  });
                } catch (e) {
                  console.warn('Buffer polyfill setup failed:', e);
                }
              }
            `,
          }}
        />
        {/* 🌙 INSTANT DARK MODE - FOUC 방지 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 즉시 실행되는 테마 설정 (FOUC 방지)
              (function() {
                try {
                  const savedTheme = localStorage.getItem('surecrm-theme');
                  const isDark = savedTheme ? savedTheme === 'dark' : true; // 기본값: 다크모드
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // localStorage 접근 실패 시 다크모드 기본값
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* 🚨 Critical CSS - FOUC 방지 (레이아웃 보존) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 🎯 INSTANT THEME APPLICATION - 레이아웃 파괴 없이 */
              html, body {
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                overflow-y: scroll !important;
                scrollbar-gutter: stable !important;
                width: 100vw !important;
                max-width: 100% !important;
                min-height: 100vh !important;
              }
              
              /* 라이트 테마 */
              html:not(.dark) {
                background-color: oklch(1 0 0) !important;
                color: oklch(0.141 0.005 285.823) !important;
              }
              
              /* 다크 테마 (기본값) */
              html.dark {
                background-color: oklch(0.141 0.005 285.823) !important;
                color: oklch(0.985 0 0) !important;
              }
              
              /* 🛡️ HTML ELEMENT CUSTOMIZATION - 기본 스타일 유지하면서 커스터마이징 */
              /* 숫자 입력 필드 스피너 완전 제거 */
              input[type="number"] {
                -webkit-appearance: none !important;
                -moz-appearance: textfield !important;
                appearance: none !important;
              }
              
              input[type="number"]::-webkit-outer-spin-button,
              input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
                display: none !important;
              }
              
              /* Select 드롭다운 커스터마이징 */
              select {
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                appearance: none !important;
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
                background-repeat: no-repeat !important;
                background-position: right 0.75rem center !important;
                background-size: 1rem !important;
                padding-right: 2.5rem !important;
              }
              
              /* 체크박스 & 라디오 버튼 커스터마이징 */
              input[type="checkbox"], input[type="radio"] {
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                appearance: none !important;
                width: 1rem !important;
                height: 1rem !important;
                border: 2px solid oklch(1 0 0 / 20%) !important;
                border-radius: 0.25rem !important;
                background-color: transparent !important;
                position: relative !important;
                cursor: pointer !important;
              }
              
              input[type="radio"] {
                border-radius: 50% !important;
              }
              
              input[type="checkbox"]:checked, input[type="radio"]:checked {
                background-color: oklch(0.645 0.246 16.439) !important;
                border-color: oklch(0.645 0.246 16.439) !important;
              }
              
              input[type="checkbox"]:checked::after {
                content: "✓" !important;
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                color: oklch(0.969 0.015 12.422) !important;
                font-size: 0.75rem !important;
                font-weight: bold !important;
              }
              
              input[type="radio"]:checked::after {
                content: "" !important;
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 0.375rem !important;
                height: 0.375rem !important;
                border-radius: 50% !important;
                background-color: oklch(0.969 0.015 12.422) !important;
              }
              
              /* 스크롤바 테마 반응형 */
              html:not(.dark) * {
                scrollbar-width: thin !important;
                scrollbar-color: #6b7280 transparent !important;
              }
              
              html:not(.dark) *::-webkit-scrollbar {
                width: 14px !important;
                height: 14px !important;
              }
              
              html:not(.dark) *::-webkit-scrollbar-track {
                background: transparent !important;
                border-radius: 8px !important;
              }
              
              html:not(.dark) *::-webkit-scrollbar-thumb {
                background: #6b7280 !important;
                border-radius: 8px !important;
                border: 3px solid transparent !important;
                background-clip: content-box !important;
              }
              
              html:not(.dark) *::-webkit-scrollbar-thumb:hover {
                background: #4b5563 !important;
              }
              
              /* 다크 테마 스크롤바 */
              html.dark * {
                scrollbar-width: thin !important;
                scrollbar-color: #374151 transparent !important;
              }
              
              html.dark *::-webkit-scrollbar-thumb {
                background: #374151 !important;
              }
              
              html.dark *::-webkit-scrollbar-thumb:hover {
                background: #4b5563 !important;
              }
              
              /* 애니메이션 키프레임 */
              @keyframes spin {
                0% { transform: rotate(0deg) !important; }
                100% { transform: rotate(360deg) !important; }
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 1 !important; }
                50% { opacity: 0.5 !important; }
              }
              
              @keyframes bounce {
                0%, 100% { transform: translateY(-25%) !important; animation-timing-function: cubic-bezier(0.8, 0, 1, 1) !important; }
                50% { transform: none !important; animation-timing-function: cubic-bezier(0, 0, 0.2, 1) !important; }
              }
              
              /* 애니메이션 유틸리티 클래스 */
              .animate-spin {
                animation: spin 1s linear infinite !important;
              }
              
              .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
              }
              
              .animate-bounce {
                animation: bounce 1s infinite !important;
              }
            `,
          }}
        />
      </head>
      <body className="font-sans text-foreground bg-background">
        {/* 🚀 GTM noscript - 프로덕션에서만 */}
        {import.meta.env.VITE_GTM_CONTAINER_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${
                import.meta.env.VITE_GTM_CONTAINER_ID
              }`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
      </body>
    </html>
  );
}

export default function App() {
  // 🔒 사용자 역할 추적 (system_admin 사용자 제외용)
  useUserRoleTracker();

  // 📊 비즈니스 인텔리전스 시스템 활성화 (고급 분석 모드)
  const { isActive, userInsights, getAnalyticsStream, getCurrentProfile } =
    useBusinessIntelligence({
      enableAdvancedAnalytics: true,
      enableBehavioralTracking: true,
      enablePerformanceMonitoring: true,
      enableUserJourneyMapping: true,
      samplingRate: 0.8, // 80% 샘플링으로 성능 최적화
    });

  // GA 초기화 및 세션 시작
  useEffect(() => {
    initGA();
    SessionTracking.startSession();

    // 페이지 종료 시 세션 종료 및 최종 데이터 전송
    const handleBeforeUnload = () => {
      SessionTracking.endSession();

      // 💎 최종 세션 인텔리전스 수집
      const currentProfile = getCurrentProfile();
      const stream = getAnalyticsStream();

      if (currentProfile && stream) {
        const sessionDuration = Date.now() - currentProfile.sessionStartTime;

        if (sessionDuration > 5000) {
          // 5초 이상 세션만
          // 최종 비즈니스 가치 계산 및 전송
          const businessValue = Math.round(
            (sessionDuration / 1000) * 0.2 +
              stream.clickHeatmap.length * 0.3 +
              stream.scrollPattern.length * 0.5 +
              (stream.sessionIntelligence?.engagementDepth || 0) * 20 +
              (10 - (stream.sessionIntelligence?.frustrationLevel || 0)) * 15
          );

          // 사용자 프로필 완성도 점수
          const profileCompleteness = Math.min(
            100,
            (stream.clickHeatmap.length / 20) * 30 +
              (stream.scrollPattern.length / 10) * 25 +
              (stream.keystrokes.length / 10) * 20 +
              (sessionDuration / 60000) * 25
          );

          // 🔍 GTM 최종 세션 리포트
          if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
              event: 'session_complete',
              session_duration: Math.round(sessionDuration / 1000),
              business_value: businessValue,
              profile_completeness: Math.round(profileCompleteness),
              intelligence_summary: {
                interactions: stream.clickHeatmap.length,
                mouse_movements: stream.mouseMovements.length,
                scroll_events: stream.scrollPattern.length,
                keystrokes: stream.keystrokes.length,
                engagement: stream.sessionIntelligence?.engagementDepth || 0,
                frustration: stream.sessionIntelligence?.frustrationLevel || 0,
              },
              value_tier:
                businessValue > 1000
                  ? 'premium'
                  : businessValue > 500
                  ? 'standard'
                  : 'basic',
              timestamp: Date.now(),
            });
          }

          if (import.meta.env.DEV) {
            console.log('🧠 Business Intelligence Summary:', {
              duration: Math.round(sessionDuration / 1000) + 's',
              businessValue: businessValue,
              profileCompleteness: Math.round(profileCompleteness) + '%',
              dataPoints: {
                clicks: stream.clickHeatmap.length,
                scrolls: stream.scrollPattern.length,
                keystrokes: stream.keystrokes.length,
                engagement: stream.sessionIntelligence?.engagementDepth || 0,
              },
            });
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getCurrentProfile, getAnalyticsStream]);

  // 페이지 뷰 추적
  usePageTracking();

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = '오류!';
  let details = '예상치 못한 오류가 발생했습니다.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : '오류';
    details =
      error.status === 404
        ? '요청하신 페이지를 찾을 수 없습니다.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">{message}</h1>
      <p className="text-center text-muted-foreground mb-6">{details}</p>
      {stack && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">개발자 정보:</h2>
          <pre className="w-full p-4 overflow-x-auto bg-muted rounded-lg">
            <code className="text-sm">{stack}</code>
          </pre>
        </div>
      )}
    </main>
  );
}
