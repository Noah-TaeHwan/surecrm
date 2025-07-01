import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  type LinksFunction,
} from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect } from 'react';
import './app.css';
import { initGA, SessionTracking } from '~/lib/utils/analytics';
import { initEnhancedMeasurement } from '~/lib/utils/ga4-enhanced-measurement';
import { usePageTracking } from '~/hooks/use-analytics';
import { useBusinessIntelligence } from '~/hooks/use-business-intelligence';
import { useUserRoleTracker } from '~/hooks/use-user-role-tracker';
import {
  initDynamicViewportHeight,
  enableFullScreenMode,
  isIOSSafari,
} from '~/lib/utils/viewport-height';
import * as Sentry from '@sentry/react-router';
import { SubscriptionProvider } from '~/lib/contexts/subscription-context';

// 🌍 다국어 지원 초기화
import './lib/i18n';

// Root.tsx 전용 타입 정의

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    // 🔧 preload 경고 방지를 위한 추가 속성
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: '/app.css',
    // 🔧 중요한 CSS는 즉시 로드
    as: 'style',
  },
  // 🎨 파비콘 및 아이콘 관련
  {
    rel: 'icon',
    type: 'image/x-icon',
    href: '/favicon.ico',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  {
    rel: 'manifest',
    href: '/manifest.json',
  },
  // CSS 사전 로드 (중요 스타일만)
  {
    rel: 'preload',
    href: '/app.css',
    as: 'style',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* 🎨 브랜드 메타 태그들 - 다크 테마로 수정 */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="SureCRM" />
        <meta name="application-name" content="SureCRM" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* 🔐 Google 도메인 소유권 확인 - OAuth 검증 요구사항 */}
        <meta
          name="google-site-verification"
          content="google-site-verification-code-here"
        />

        {/* 🌐 기본 다국어 메타 태그 */}
        <meta httpEquiv="Content-Language" content="ko" />
        <meta name="language" content="Korean" />

        {/* 🔍 기본 SEO 메타 태그 */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="googlebot" content="index, follow" />

        {/* 📱 모바일 최적화 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* 🚀 성능 최적화 힌트 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* 🏢 조직 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SureCRM',
              url: 'https://surecrm.pro',
              logo: 'https://surecrm.pro/logo-192.png',
              description:
                '보험설계사를 위한 소개 네트워크 관리 솔루션. 누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Korean', 'English', 'Japanese'],
                url: 'https://surecrm.pro/contact',
              },
              sameAs: [],
              offers: {
                '@type': 'Offer',
                price: '14일 무료체험',
                priceCurrency: 'KRW',
                description: 'SureCRM Pro 구독 서비스',
              },
            }),
          }}
        />

        <Meta />
        <Links />

        {/* 🚀 Google Tag Manager - surecrm.pro에서만 로드 */}
        {import.meta.env.VITE_GTM_CONTAINER_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // 🔒 프로덕션 도메인 확인
                (function() {
                  // surecrm.pro 도메인에서만 GTM 로드
                  const isProductionDomain = window.location.hostname === 'surecrm.pro' ||
                                            window.location.hostname === 'www.surecrm.pro';
                  
                  if (!isProductionDomain) {
                    // console.log('🔧 GTM: surecrm.pro 도메인이 아니므로 로딩 건너뛰기 (' + window.location.hostname + ')');
                    return;
                  }
                  
                  console.log('🚀 GTM: surecrm.pro에서 로딩 중...');
                  
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
                })();
              `,
            }}
          />
        )}

        {/* 🚀 Google Analytics - surecrm.pro에서만 로드 */}
        {import.meta.env.VITE_GA_MEASUREMENT_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // 🔒 프로덕션 도메인 확인
                  (function() {
                    // surecrm.pro 도메인에서만 GA 로드
                    const isProductionDomain = window.location.hostname === 'surecrm.pro' ||
                                              window.location.hostname === 'www.surecrm.pro';
                    
                    if (!isProductionDomain) {
                      // console.log('🔧 GA: surecrm.pro 도메인이 아니므로 로딩 건너뛰기 (' + window.location.hostname + ')');
                      return;
                    }

                    console.log('🚀 GA: surecrm.pro에서 로딩 중...');
                    
                    // GA 스크립트 로드
                    const script = document.createElement('script');
                    script.async = true;
                    script.src = 'https://www.googletagmanager.com/gtag/js?id=${
                      import.meta.env.VITE_GA_MEASUREMENT_ID
                    }';
                    document.head.appendChild(script);
                    
                    // GA 초기화
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${
                      import.meta.env.VITE_GA_MEASUREMENT_ID
                    }', {
                      send_page_view: true,
                      cookie_domain: 'surecrm.pro',
                      cookie_flags: 'SameSite=Lax',
                      cookie_expires: 31536000, // 1년
                    });
                  })();
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
              // 즉시 실행되는 테마 설정 (FOUC 방지) - 강제 다크모드
              (function() {
                try {
                  // MVP에서는 무조건 다크모드만 제공
                    document.documentElement.classList.add('dark');
                  localStorage.setItem('surecrm-theme', 'dark');
                                      // console.log('🌙 강제 다크모드 적용 완료');
                } catch (e) {
                  // 오류 발생 시에도 다크모드 강제 적용
                  document.documentElement.classList.add('dark');
                  console.log('🌙 오류 발생, 다크모드 강제 적용');
                }
              })();
            `,
          }}
        />
        {/* 🚨 Critical CSS - FOUC 방지 (레이아웃 보존) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 🎯 INSTANT THEME APPLICATION - 반응형 스크롤 정책 */
              html, body {
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                min-height: 100vh !important;
              }
              
              /* 데스크톱에서만 기존 스크롤 정책 적용 */
              @media (min-width: 768px) {
                html, body {
                  overflow-y: scroll !important;
                  scrollbar-gutter: stable !important;
                  width: 100vw !important;
                  max-width: 100% !important;
                }
              }
              
              /* 모바일에서는 MainLayout이 스크롤 담당 */
              @media (max-width: 767.98px) {
                html, body {
                  overflow: hidden !important;
                  height: 100vh !important;
                  max-height: 100vh !important;
                  width: 100% !important;
                }
              }
              
              /* MVP 다크모드 강제 적용 */
              html {
                background-color: oklch(0.141 0.005 285.823) !important;
                color: oklch(0.985 0 0) !important;
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
      <body className="dark font-sans text-foreground bg-background">
        {/* 🚀 GTM noscript - surecrm.pro에서만 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // surecrm.pro에서만 GTM noscript iframe 추가
              (function() {
                const isProductionDomain = window.location.hostname === 'surecrm.pro' ||
                                          window.location.hostname === 'www.surecrm.pro';
                
                if (isProductionDomain) {
                  const noscript = document.createElement('noscript');
                  const iframe = document.createElement('iframe');
                  iframe.src = 'https://www.googletagmanager.com/ns.html?id=${import.meta.env.VITE_GTM_CONTAINER_ID}';
                  iframe.height = '0';
                  iframe.width = '0';
                  iframe.style.display = 'none';
                  iframe.style.visibility = 'hidden';
                  noscript.appendChild(iframe);
                  document.body.insertBefore(noscript, document.body.firstChild);
                }
              })();
            `,
          }}
        />
        <SubscriptionProvider>{children}</SubscriptionProvider>
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

  // 📊 비즈니스 인텔리전스 시스템 활성화 (프로덕션에서만)
  const { getAnalyticsStream, getCurrentProfile } = useBusinessIntelligence({
    enableAdvancedAnalytics: !import.meta.env.DEV, // 개발 환경에서는 비활성화
    enableBehavioralTracking: !import.meta.env.DEV, // 개발 환경에서는 비활성화
    enablePerformanceMonitoring: !import.meta.env.DEV, // 개발 환경에서는 비활성화
    enableUserJourneyMapping: !import.meta.env.DEV, // 개발 환경에서는 비활성화
    samplingRate: 0.8, // 80% 샘플링으로 성능 최적화
  });

  // 🚀 iPhone Safari 하단 주소창 대응 전역 초기화
  useEffect(() => {
    const cleanupViewportHeight = initDynamicViewportHeight();

    // 🚀 iPhone Safari 전체 화면 모드 활성화
    if (isIOSSafari()) {
      enableFullScreenMode();
      console.log(
        '🚀 iPhone Safari 전체 화면 모드 활성화됨 - 주소창 영역까지 활용'
      );
    }

    return () => {
      cleanupViewportHeight?.();
    };
  }, []);

  // GA 초기화 및 세션 시작
  useEffect(() => {
    initGA();
    initEnhancedMeasurement(); // Enhanced Measurement 수동 초기화
    SessionTracking.startSession();

    // 페이지 종료 시 세션 종료 및 최종 데이터 전송
    const handleBeforeUnload = () => {
      SessionTracking.endSession();

      // 💎 최종 세션 인텔리전스 수집 (프로덕션에서만)
      if (!import.meta.env.DEV) {
        const currentProfile = getCurrentProfile();
        const stream = getAnalyticsStream();

        if (currentProfile && stream) {
          const sessionDuration = Date.now() - currentProfile.sessionStartTime;

          if (sessionDuration > 5000) {
            // 5초 이상 세션만
            // 최종 비즈니스 가치 계산 및 전송
            const businessValue = Math.round(
              (sessionDuration / 1000) * 0.2 +
                (stream.clickHeatmap?.length || 0) * 0.3 +
                (stream.scrollPattern?.length || 0) * 0.5 +
                (stream.sessionIntelligence?.engagementDepth || 0) * 20 +
                (10 - (stream.sessionIntelligence?.frustrationLevel || 0)) * 15
            );

            // 사용자 프로필 완성도 점수
            const profileCompleteness = Math.min(
              100,
              ((stream.clickHeatmap?.length || 0) / 20) * 30 +
                ((stream.scrollPattern?.length || 0) / 10) * 25 +
                ((stream.keystrokes?.length || 0) / 10) * 20 +
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
                  interactions: stream.clickHeatmap?.length || 0,
                  mouse_movements: stream.mouseMovements?.length || 0,
                  scroll_events: stream.scrollPattern?.length || 0,
                  keystrokes: stream.keystrokes?.length || 0,
                  engagement: stream.sessionIntelligence?.engagementDepth || 0,
                  frustration:
                    stream.sessionIntelligence?.frustrationLevel || 0,
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
                  clicks: stream.clickHeatmap?.length || 0,
                  scrolls: stream.scrollPattern?.length || 0,
                  keystrokes: stream.keystrokes?.length || 0,
                  engagement: stream.sessionIntelligence?.engagementDepth || 0,
                },
              });
            }
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

  return (
    <>
      <ResizeObserverErrorHandler />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    // 🔒 프로덕션에서만 Sentry로 오류 전송 (404가 아닌 경우)
    if (!import.meta.env.DEV) {
      try {
        Sentry.captureException(error);
      } catch (sentryError) {
        console.warn('⚠️ Sentry 오류 캡처 실패:', sentryError);
      }
    }

    if (import.meta.env.DEV) {
      details = error.message;
      stack = error.stack;
    }
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

// ResizeObserver 오류 핸들러 컴포넌트
function ResizeObserverErrorHandler() {
  useEffect(() => {
    const handleResizeObserverError = (event: ErrorEvent) => {
      // ResizeObserver 관련 오류 메시지 패턴
      const resizeObserverErrors = [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'ResizeObserver maximum depth exceeded',
      ];

      const isResizeObserverError = resizeObserverErrors.some(errorPattern =>
        event.message?.includes(errorPattern)
      );

      if (isResizeObserverError) {
        // 🔇 ResizeObserver 오류는 로그만 남기고 무시
        console.warn('🔧 ResizeObserver 오류 감지 (무시됨):', event.message);

        // 오류 전파 중단
        event.preventDefault();
        event.stopPropagation();

        // 개발 환경에서 오버레이 숨기기
        if (import.meta.env.DEV) {
          const overlay = document.getElementById(
            'webpack-dev-server-client-overlay'
          );
          if (overlay) {
            overlay.style.display = 'none';
          }
        }

        return false; // 오류 처리 완료
      }
    };

    // 전역 오류 리스너 등록
    window.addEventListener('error', handleResizeObserverError);

    // 정리 함수
    return () => {
      window.removeEventListener('error', handleResizeObserverError);
    };
  }, []);

  return null; // 렌더링하지 않음
}
