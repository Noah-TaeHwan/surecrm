import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect } from 'react';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { initGA, SessionTracking } from '~/lib/utils/analytics';
import { usePageTracking } from '~/hooks/use-analytics';
import { useAdvancedAnalytics } from '~/hooks/use-advanced-analytics';

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
    <html lang="ko" className="dark layout-lock">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* Google Tag Manager */}
        {import.meta.env.VITE_GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${
                  import.meta.env.VITE_GTM_ID
                }');
              `,
            }}
          />
        )}

        {/* Google Analytics - 조건부 로드 */}
        {import.meta.env.VITE_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${
                import.meta.env.VITE_GA_MEASUREMENT_ID
              }`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${import.meta.env.VITE_GA_MEASUREMENT_ID}');
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
        {/* Google Tag Manager (noscript) */}
        {import.meta.env.VITE_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${
                import.meta.env.VITE_GTM_ID
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
  // 📊 고급 지능형 분석 시스템 활성화 (은밀 모드)
  const { getSessionData } = useAdvancedAnalytics({
    trackInteractionPatterns: true,
    trackInputBehavior: true,
    trackNavigationFlow: true,
    trackEngagementMetrics: true,
    trackPerformanceData: true,
    trackUserSignatures: true,
    trackEmotionalIndicators: true,
    trackDecisionProcesses: true,
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
      const finalSessionData = getSessionData();
      if (finalSessionData.sessionDuration > 5000) {
        // 5초 이상 세션만
        // 최종 비즈니스 가치 계산 및 전송
        const businessValue = Math.round(
          (finalSessionData.sessionDuration / 1000) * 0.2 +
            finalSessionData.interactionPoints.length * 0.3 +
            finalSessionData.navigationFlow.length * 0.5 +
            finalSessionData.emotionalIndicators.engagement * 20 +
            finalSessionData.emotionalIndicators.confidence * 15 -
            finalSessionData.emotionalIndicators.frustration * 10
        );

        // 사용자 프로필 완성도 점수
        const profileCompleteness = Math.min(
          100,
          (finalSessionData.interactionPoints.length / 100) * 30 +
            (finalSessionData.navigationFlow.length / 50) * 25 +
            (finalSessionData.inputPatterns.length / 20) * 20 +
            (finalSessionData.engagementData.focusTime / 60000) * 25
        );

        // 🔍 GTM 최종 세션 리포트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'session_complete',
            session_duration: Math.round(
              finalSessionData.sessionDuration / 1000
            ),
            business_value: businessValue,
            profile_completeness: Math.round(profileCompleteness),
            intelligence_summary: {
              interactions: finalSessionData.interactionPoints.length,
              navigation: finalSessionData.navigationFlow.length,
              inputs: finalSessionData.inputPatterns.length,
              emotional_profile: finalSessionData.emotionalIndicators,
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

        console.log('🧠 Session Intelligence Summary:', {
          duration: Math.round(finalSessionData.sessionDuration / 1000) + 's',
          businessValue: businessValue,
          profileCompleteness: Math.round(profileCompleteness) + '%',
          dataPoints: {
            interactions: finalSessionData.interactionPoints.length,
            navigation: finalSessionData.navigationFlow.length,
            inputs: finalSessionData.inputPatterns.length,
            emotional: finalSessionData.emotionalIndicators,
          },
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getSessionData]);

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
