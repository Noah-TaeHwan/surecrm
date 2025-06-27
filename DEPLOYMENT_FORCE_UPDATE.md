# Deployment Force Update

이 파일은 Vercel 강제 재배포를 위한 더미 파일입니다.

## 2025-01-16 18:30 KST

- React Router v7 수동 청크 분할 제거
- 자동 코드 분할로 전환
- vendor 청크 오류 해결
- 빌드 캐시 완전 초기화

## 2025-01-16 18:35 KST - Vercel 배포 오류 수정

- `vercel.json` 함수 런타임 설정 제거
- React Router v7 + Vercel 프리셋 자동 설정 활용
- SSR 모드 유지, Vercel 자동 처리

## 변경사항

- `vite.config.ts`: manualChunks 제거, ES modules 호환성 강화
- `vercel.json`: 불필요한 설정 제거, 빌드 명령어만 유지
- 모든 빌드 아티팩트 완전 삭제 후 재빌드
