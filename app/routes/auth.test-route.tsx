export async function loader() {
  console.log('🚨🚨🚨 TEST ROUTE LOADER 실행됨!');
  return { 
    message: '테스트 라우트가 정상적으로 작동합니다!',
    timestamp: new Date().toISOString()
  };
}

interface ComponentProps {
  loaderData: {
    message: string;
    timestamp: string;
  };
}

export default function TestRoute({ loaderData }: ComponentProps) {
  console.log('🚨🚨🚨 TEST ROUTE COMPONENT 실행됨!', loaderData);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border-4 border-blue-500">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          🚨 테스트 라우트 정상 작동!
        </h1>
        <p className="text-gray-600 mb-2">{loaderData.message}</p>
        <p className="text-sm text-gray-500">타임스탬프: {loaderData.timestamp}</p>
        <div className="mt-4">
          <a 
            href="/auth/confirm?token_hash=test123&type=email" 
            className="text-blue-600 underline"
          >
            ➡️ auth/confirm 테스트 링크
          </a>
        </div>
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: '테스트 라우트 | SureCRM' },
    { name: 'description', content: '라우팅 테스트 페이지' },
  ];
} 