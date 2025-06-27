# Deployment Force Update

이 파일은 Vercel 강제 재배포를 위한 더미 파일입니다.

## 2025-01-16 18:30 KST

- React Router v7 수동 청크 분할 제거
- 자동 코드 분할로 전환
- vendor 청크 오류 해결
- 빌드 캐시 완전 초기화

## 변경사항

- `vite.config.ts`: manualChunks 제거, ES modules 호환성 강화
- `vercel.json`: 빌드 명령어에 캐시 정리 추가
- 모든 빌드 아티팩트 완전 삭제 후 재빌드
