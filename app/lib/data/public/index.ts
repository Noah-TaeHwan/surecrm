// 공개 데이터 모듈 통합 export

// 통계 관련
export {
  getPublicStats,
  getInviteStats,
  getRecentSignups,
  getGrowthRate,
  validateInviteCode,
  type PublicStats,
  type InviteStats,
} from './stats';

// 후기 관련
export { getPublicTestimonials, type Testimonial } from './testimonials';

// 컨텐츠 관련 (이용약관, 개인정보처리방침)
export {
  getTermsOfService,
  getPrivacyPolicy,
  type TermsData,
  type PrivacyPolicyData,
} from './content';

// FAQ 관련
export { getFAQs, type FAQ, type FAQCategory } from './faq';

// 설정 관련
export { getSiteSetting } from './settings';

// TODO: 추가될 모듈들 (초대 검증 등)
// export { ... } from './invitations';
