import type { LoaderFunctionArgs } from 'react-router';

// TODO: 실제 DB 연동 로직 추가
export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🚀 [Vercel Log] /admin/activity loader: 함수 실행 시작');

  const logs = [
    {
      id: 'log_1',
      user: 'admin@surecrm.pro',
      action: '로그인',
      ip: '127.0.0.1',
      timestamp: '2023-10-27T12:00:00Z',
      details: '성공적인 로그인',
    },
    {
      id: 'log_2',
      user: 'agent1@surecrm.pro',
      action: '고객 정보 수정',
      ip: '192.168.1.10',
      timestamp: '2023-10-27T11:30:00Z',
      details: '고객 ID: c_123, 필드: phone',
    },
    {
      id: 'log_3',
      user: 'system',
      action: '결제 실패',
      ip: 'N/A',
      timestamp: '2023-10-27T11:00:00Z',
      details: '사용자 ID: u_456, 금액: 50,000원',
    },
  ];
  const totalLogs = 3;

  // 날짜 데이터를 ISO 문자열로 변환 (Hydration 에러 방지)
  const logsWithISOStrings = logs.map(log => ({
    ...log,
    timestamp: new Date(log.timestamp).toISOString(),
  }));

  console.log('✅ [Vercel Log] /admin/activity loader: 데이터 로딩 완료');
  const data = { logs: logsWithISOStrings, totalLogs };
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
