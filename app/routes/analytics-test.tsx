import { AnalyticsDemo } from '~/features/dashboard/components/real-time-analytics';

export function meta() {
  return [
    { title: 'Analytics 테스트 | SureCRM' },
    { name: 'description', content: 'Google Analytics 실시간 모니터링 테스트' },
  ];
}

export default function AnalyticsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <AnalyticsDemo />
      </div>
    </div>
  );
}
