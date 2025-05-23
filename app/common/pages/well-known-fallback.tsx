export function loader({ request }: any) {
  // .well-known 경로에 대해서는 빈 JSON 응답 반환
  return new Response('{}', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function meta() {
  return [];
}

export default function WellKnownFallback() {
  // 실제로는 렌더링되지 않음 (loader에서 직접 응답 반환)
  return null;
}
