import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';

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
        {/* 🚨 Critical CSS - FOUC 방지 (레이아웃 보존) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 🎯 INSTANT DARK MODE APPLICATION - 레이아웃 파괴 없이 */
              html, body {
                background-color: oklch(0.141 0.005 285.823) !important;
                color: oklch(0.985 0 0) !important;
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                overflow-y: scroll !important;
                scrollbar-gutter: stable !important;
                width: 100vw !important;
                max-width: 100% !important;
                min-height: 100vh !important;
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
              
              /* 스크롤바 즉시 적용 */
              * {
                scrollbar-width: thin !important;
                scrollbar-color: oklch(0.374151 0 0) transparent !important;
              }
              
              *::-webkit-scrollbar {
                width: 14px !important;
                height: 14px !important;
              }
              
              *::-webkit-scrollbar-track {
                background: transparent !important;
                border-radius: 8px !important;
              }
              
              *::-webkit-scrollbar-thumb {
                background: oklch(0.374151 0 0) !important;
                border-radius: 8px !important;
                border: 3px solid transparent !important;
                background-clip: content-box !important;
              }
              
              *::-webkit-scrollbar-thumb:hover {
                background: oklch(0.4b5563 0 0) !important;
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
      <body className="layout-lock">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
