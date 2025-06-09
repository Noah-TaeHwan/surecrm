# 🏷️ Google Tag Manager (GTM) 설치 및 설정 가이드

## 📋 목차

1. [GTM 계정 생성 및 컨테이너 설정](#1-gtm-계정-생성-및-컨테이너-설정)
2. [SureCRM 프로젝트 연동](#2-surecrm-프로젝트-연동)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [GTM 태그 및 트리거 설정](#4-gtm-태그-및-트리거-설정)
5. [테스트 및 디버깅](#5-테스트-및-디버깅)
6. [문제 해결 가이드](#6-문제-해결-가이드)

---

## 1. GTM 계정 생성 및 컨테이너 설정

### 1-1. GTM 계정 생성

1. [Google Tag Manager](https://tagmanager.google.com/) 접속
2. "계정 만들기" 클릭
3. 계정 정보 입력:
   - **계정 이름**: `SureCRM` 또는 원하는 이름
   - **국가**: 대한민국
   - **데이터 공유 설정**: 필요에 따라 체크

### 1-2. 컨테이너 생성

1. "컨테이너 만들기" 클릭
2. 컨테이너 정보 입력:
   - **컨테이너 이름**: `SureCRM Production` (운영용)
   - **타겟 플랫폼**: 웹

### 1-3. 컨테이너 ID 확인

- 생성 완료 후 컨테이너 ID 확인 (형식: `GTM-XXXXXXX`)
- 이 ID를 환경 변수에 설정해야 함

---

## 2. SureCRM 프로젝트 연동

### 2-1. 현재 구현 상태 확인 ✅

SureCRM에는 이미 GTM 연동이 구현되어 있습니다:

**파일 위치**: `app/root.tsx`

```typescript
{
  /* Google Tag Manager - 조건부 로드 */
}
{
  import.meta.env.VITE_GTM_CONTAINER_ID && (
    <script>
      // 개발 환경에서는 자동으로 로딩 건너뛰기 // Production에서만 GTM 로드
    </script>
  );
}
```

### 2-2. 특징

- ✅ **개발 환경 자동 제외**: localhost, 127.0.0.1 등에서 자동으로 비활성화
- ✅ **조건부 로딩**: 환경 변수가 설정된 경우에만 로드
- ✅ **에러 처리**: 로딩 실패 시 에러 방지
- ✅ **noscript 지원**: JavaScript 비활성화 환경 대응

---

## 3. 환경 변수 설정

### 3-1. .env 파일 수정

프로젝트 루트의 `.env` 파일에 GTM 컨테이너 ID 추가:

```bash
# Google Tag Manager 설정
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX  # 실제 컨테이너 ID로 변경
```

### 3-2. 환경별 설정

**개발 환경 (.env.local)**:

```bash
# 개발 환경에서는 GTM 비활성화 (선택사항)
# VITE_GTM_CONTAINER_ID=  # 주석 처리하면 비활성화
```

**프로덕션 환경 (.env.production)**:

```bash
# 프로덕션에서만 GTM 활성화
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX
```

---

## 4. GTM 태그 및 트리거 설정

### 4-1. Google Analytics 4 태그 설정

1. GTM 대시보드에서 "태그" → "새로 만들기"
2. 태그 유형: **Google Analytics: GA4 구성**
3. 설정:
   - **측정 ID**: `G-SZW1G856L5` (기존 GA4 ID)
   - **태그 이름**: `GA4 - SureCRM Configuration`

### 4-2. 맞춤 이벤트 태그 설정

**SureCRM 전용 이벤트들**:

#### 4-2-1. 대시보드 조회 태그

```javascript
태그 이름: SureCRM - Dashboard View
태그 유형: Google Analytics: GA4 이벤트
구성 태그: GA4 - SureCRM Configuration
이벤트 이름: dashboard_view
매개변수:
  - event_category: dashboard
  - kpi_data: {{DLV - KPI Data}}
```

#### 4-2-2. 고객 관리 태그

```javascript
태그 이름: SureCRM - Client Management
태그 유형: Google Analytics: GA4 이벤트
이벤트 이름: client_action
매개변수:
  - event_category: client_management
  - action_type: {{DLV - Client Action}}
  - client_data: {{DLV - Client Data}}
```

### 4-3. 트리거 설정

#### 4-3-1. 페이지 뷰 트리거

```javascript
트리거 이름: All Pages - SureCRM
트리거 유형: 페이지뷰
실행 대상: 모든 페이지뷰
```

#### 4-3-2. 맞춤 이벤트 트리거

```javascript
트리거 이름: SureCRM Custom Events
트리거 유형: 맞춤 이벤트
이벤트 이름: dashboard_view|client_action|pipeline_action
```

### 4-4. 데이터 레이어 변수 설정

**내장 변수 활성화**:

- Page URL
- Page Title
- Click Element
- Click Text

**맞춤 변수 생성**:

```javascript
변수 이름: DLV - KPI Data
변수 유형: 데이터 영역 변수
데이터 영역 변수 이름: kpi_data

변수 이름: DLV - Client Action
변수 유형: 데이터 영역 변수
데이터 영역 변수 이름: action_type

변수 이름: DLV - User Role
변수 유형: 데이터 영역 변수
데이터 영역 변수 이름: user_role
```

---

## 5. 테스트 및 디버깅

### 5-1. GTM 미리보기 모드

1. GTM 대시보드에서 "미리보기" 클릭
2. SureCRM 사이트 접속
3. 하단에 GTM 디버그 창 확인

### 5-2. 태그 실행 확인

**확인할 항목**:

- ✅ 페이지 로드 시 GA4 구성 태그 실행
- ✅ 대시보드 접속 시 dashboard_view 이벤트 발생
- ✅ 고객 관리 액션 시 client_action 이벤트 발생

### 5-3. Real-time 리포트 확인

Google Analytics 4에서:

1. "실시간" 리포트 접속
2. 현재 활성 사용자 확인
3. 이벤트 발생 확인

### 5-4. 브라우저 개발자도구 확인

```javascript
// 콘솔에서 dataLayer 확인
console.log(window.dataLayer);

// GTM 로딩 확인
console.log('GTM 로딩:', window.google_tag_manager);
```

---

## 6. 문제 해결 가이드

### 6-1. GTM이 로드되지 않는 경우

**원인 및 해결책**:

1. **환경 변수 미설정**

   ```bash
   # .env 파일 확인
   VITE_GTM_CONTAINER_ID=GTM-XXXXXXX
   ```

2. **개발 환경에서 테스트 시**

   ```javascript
   // 개발 환경에서는 의도적으로 비활성화됨
   console.log('🔧 개발환경: GTM 로딩 건너뛰기');
   ```

3. **잘못된 컨테이너 ID**
   - GTM 대시보드에서 정확한 ID 확인
   - `GTM-` 접두사 포함하여 입력

### 6-2. 이벤트가 추적되지 않는 경우

1. **데이터 레이어 확인**

   ```javascript
   // 브라우저 콘솔에서 확인
   window.dataLayer;
   ```

2. **system_admin 사용자 제외 확인**

   ```javascript
   // 로컬 스토리지에서 사용자 역할 확인
   localStorage.getItem('surecrm_user_role');
   ```

3. **트리거 조건 재확인**
   - GTM 대시보드에서 트리거 조건 점검
   - 이벤트명 대소문자 구분 확인

### 6-3. system_admin 사용자 데이터 제외 확인

**확인 방법**:

```javascript
// 1. 개발자 도구 콘솔에서 확인
localStorage.getItem('surecrm_user_role');

// 2. system_admin이면 분석 비활성화 로그 확인
// "👑 시스템 관리자: 분석 데이터 수집 비활성화"
```

### 6-4. GA4와 GTM 중복 추적 방지

**현재 설정 상태**:

- ✅ GA4는 기본 구성용으로만 사용
- ✅ GTM을 통해 모든 맞춤 이벤트 관리
- ✅ 중복 추적 방지 로직 구현됨

---

## 7. 고급 설정

### 7-1. 서버사이드 GTM (선택사항)

향후 필요 시 Server-side GTM 도입 가능:

- 데이터 보안 강화
- 클라이언트 성능 최적화
- 쿠키 제한 환경 대응

### 7-2. 맞춤 차원 활용

**GA4 맞춤 차원 설정**:

```javascript
사용자 속성:
- user_role (system_admin, team_admin, agent)
- team_size
- insurance_company

이벤트 매개변수:
- client_count
- pipeline_stage
- business_value
```

### 7-3. Consent Mode 설정 (GDPR 대응)

```javascript
// 향후 필요 시 구현
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
});
```

---

## 📞 지원 및 문의

### 설치 중 문제가 발생한 경우:

1. **환경 변수 확인**: `.env` 파일의 `VITE_GTM_CONTAINER_ID` 설정
2. **브라우저 콘솔 확인**: 에러 메시지 및 로딩 상태 점검
3. **GTM 미리보기 모드**: 태그 실행 상태 실시간 확인
4. **네트워크 탭 확인**: GTM 스크립트 로딩 여부 확인

### 성공 확인 체크리스트:

- [ ] GTM 컨테이너 ID 정확히 설정
- [ ] 프로덕션 환경에서 GTM 스크립트 로딩 확인
- [ ] 개발 환경에서 자동 비활성화 확인
- [ ] system_admin 사용자 데이터 제외 확인
- [ ] GA4 연동 및 이벤트 추적 확인
- [ ] 실시간 리포트에서 데이터 확인

**🎉 모든 항목이 체크되면 GTM 설치 완료!**
