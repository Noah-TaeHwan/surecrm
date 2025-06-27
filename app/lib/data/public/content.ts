import { db } from '../../core/db.server';
import { publicContents } from '../../schema';
import { eq, and, desc } from 'drizzle-orm';

// 이용약관 데이터 타입
export interface TermsData {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
  effectiveDate: string;
}

// 개인정보처리방침 데이터 타입
export interface PrivacyPolicyData {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
  effectiveDate: string;
}

/**
 * 이용약관 데이터 가져오기
 */
export async function getTermsOfService(): Promise<TermsData> {
  try {
    const terms = await db
      .select({
        id: publicContents.id,
        title: publicContents.title,
        content: publicContents.content,
        version: publicContents.version,
        effectiveDate: publicContents.effectiveDate,
        updatedAt: publicContents.updatedAt,
      })
      .from(publicContents)
      .where(
        and(
          eq(publicContents.type, 'terms_of_service'),
          eq(publicContents.status, 'published'),
          eq(publicContents.language, 'ko')
        )
      )
      .orderBy(desc(publicContents.effectiveDate))
      .limit(1);

    if (terms.length > 0) {
      const term = terms[0];
      return {
        id: term.id,
        title: term.title,
        content: term.content,
        version: term.version,
        effectiveDate: term.effectiveDate
          ? new Date(term.effectiveDate).toISOString()
          : new Date().toISOString(),
        lastUpdated: new Date(term.updatedAt).toISOString(),
      };
    }

    // 기본 이용약관 반환
    return {
      id: 'default-terms',
      title: '서비스 이용약관',
      content: getDefaultTermsContent(),
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('이용약관 조회 실패:', error);
    return {
      id: 'default-terms',
      title: '서비스 이용약관',
      content: getDefaultTermsContent(),
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * 개인정보처리방침 데이터 가져오기
 */
export async function getPrivacyPolicy(): Promise<PrivacyPolicyData> {
  try {
    const privacy = await db
      .select({
        id: publicContents.id,
        title: publicContents.title,
        content: publicContents.content,
        version: publicContents.version,
        effectiveDate: publicContents.effectiveDate,
        updatedAt: publicContents.updatedAt,
      })
      .from(publicContents)
      .where(
        and(
          eq(publicContents.type, 'privacy_policy'),
          eq(publicContents.status, 'published'),
          eq(publicContents.language, 'ko')
        )
      )
      .orderBy(desc(publicContents.effectiveDate))
      .limit(1);

    if (privacy.length > 0) {
      const policy = privacy[0];
      return {
        id: policy.id,
        title: policy.title,
        content: policy.content,
        version: policy.version,
        effectiveDate: policy.effectiveDate
          ? new Date(policy.effectiveDate).toISOString()
          : new Date().toISOString(),
        lastUpdated: new Date(policy.updatedAt).toISOString(),
      };
    }

    // 기본 개인정보처리방침 반환
    return {
      id: 'default-privacy',
      title: '개인정보처리방침',
      content: getDefaultPrivacyContent(),
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('개인정보처리방침 조회 실패:', error);
    return {
      id: 'default-privacy',
      title: '개인정보처리방침',
      content: getDefaultPrivacyContent(),
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * 기본 이용약관 내용
 */
function getDefaultTermsContent(): string {
  return `
# 서비스 이용약관

## 제 1 장 총칙

### 제 1 조 (목적)
이 약관은 SureCRM(이하 '회사'라 함)이 제공하는 보험설계사 고객관리 서비스(이하 '서비스'라 함)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

### 제 2 조 (정의)
① '서비스'란 회사가 제공하는 모든 서비스를 의미합니다.
② '이용자'란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
③ '아이디(ID)'란 이용자의 식별과 서비스 이용을 위하여 이용자가 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.

### 제 3 조 (약관의 효력 및 변경)
① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
② 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.

## 제 2 장 서비스 이용

### 제 4 조 (서비스의 제공)
① 회사는 다음과 같은 서비스를 제공합니다:
- 보험설계사를 위한 고객관리 서비스
- 소개 관계 네트워킹 시각화 서비스
- 영업 파이프라인 관리 서비스
- 캘린더 및 미팅 관리 서비스
- 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스

② 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 지정할 수 있습니다.

### 제 5 조 (서비스의 중단)
① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
② 제1항에 의한 서비스 중단의 경우에는 회사는 제8조에 정한 방법으로 이용자에게 통지합니다. 다만, 회사가 사전에 통지할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.
  `;
}

/**
 * 기본 개인정보처리방침 내용
 */
function getDefaultPrivacyContent(): string {
  return `
# 개인정보처리방침

SureCRM(이하 '회사'라 함)은 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.

## 제 1 조 (개인정보의 수집 및 이용 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 서비스 제공: 고객관리 서비스, 소개 관계 네트워킹, 영업 파이프라인 관리, 캘린더 및 미팅 관리 등 서비스 제공과 관련한 목적으로 개인정보를 처리합니다.
2. 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지와 비인가 사용방지, 가입의사 확인, 가입 및 가입횟수 제한, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달 등을 목적으로 개인정보를 처리합니다.

## 제 2 조 (수집하는 개인정보의 항목 및 수집방법)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

1. 필수 항목: 이메일 주소, 비밀번호, 이름
2. 선택 항목: 프로필 이미지, 전화번호, 직업정보
3. 서비스 이용 과정에서 생성/수집되는 정보: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록

개인정보는 서비스 가입 과정에서 이용자가 개인정보 수집에 대한 동의를 하고 직접 정보를 입력하는 방식으로 수집됩니다.
  `;
}
