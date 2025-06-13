# Contributing to SureCRM

SureCRM에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 🚀 개발 환경 설정

### 1. 저장소 복제

```bash
git clone https://github.com/your-username/surecrm.git
cd surecrm
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

## 📋 기여 가이드라인

### 코드 스타일

- TypeScript를 사용합니다
- ESLint와 Prettier 설정을 준수합니다
- 함수형 컴포넌트를 사용합니다
- 명확하고 설명적인 변수명을 사용합니다

### 커밋 메시지

커밋 메시지는 다음 형식을 따릅니다:

```
type(scope): description

feat(auth): add OAuth login functionality
fix(dashboard): resolve data loading issue
docs(readme): update installation instructions
style(sidebar): improve responsive design
refactor(api): optimize database queries
test(clients): add unit tests for client service
```

### 브랜치 전략

- `master`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/description`: 새 기능 개발
- `fix/description`: 버그 수정
- `hotfix/description`: 긴급 수정

### Pull Request

1. 새로운 브랜치를 생성합니다
2. 변경사항을 구현합니다
3. 테스트를 추가/업데이트합니다
4. 다음 명령어로 코드 품질을 확인합니다:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run build
```

5. Pull Request를 생성합니다

## 🔒 보안

보안 관련 이슈를 발견하셨다면 public issue를 생성하지 마시고 직접 연락해 주세요.

## 📝 라이선스

이 프로젝트에 기여하시면 MIT 라이선스에 따라 귀하의 기여가 라이선스됩니다.

## 🤝 행동 강령

- 서로를 존중합니다
- 건설적인 피드백을 제공합니다
- 다양성과 포용성을 지지합니다
- 협력적인 환경을 만들어갑니다

## ❓ 질문이나 도움이 필요하신가요?

- GitHub Issues를 통해 버그 리포트나 기능 요청을 해주세요
- 질문이 있으시면 Discussion을 활용해 주세요

다시 한번 기여에 감사드립니다! 🙏
