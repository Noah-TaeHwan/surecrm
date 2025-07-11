// 사용자 인터페이스
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  teamId?: string;
  isActive: boolean;
  invitationsLeft: number;
}

// 회원가입 인터페이스
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  company?: string;
  invitationCode: string;
}

// 로그인 시도 인터페이스 (기존 비밀번호 방식)
export interface LoginAttempt {
  email: string;
  password: string;
}

// 매직링크 요청 인터페이스 (새로운 로그인 방식)
export interface MagicLinkRequest {
  email: string;
}

// 매직링크 검증 인터페이스
export interface MagicLinkVerification {
  token: string;
  type: string;
}

// 로그인 결과 인터페이스
export interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

// 매직링크 결과 인터페이스
export interface MagicLinkResult {
  success: boolean;
  error?: string;
  message?: string;
}

// 회원가입 결과 인터페이스
export interface SignUpResult {
  success: boolean;
  error?: string;
  user?: User;
}

// 초대장 검증 결과 인터페이스
export interface InvitationValidationResult {
  valid: boolean;
  invitation?: any;
  error?: string;
}

// OTP 결과 인터페이스
export interface OTPResult {
  success: boolean;
  error?: string;
  user?: any;
}

// 비밀번호 재설정 결과 인터페이스
export interface PasswordResetResult {
  success: boolean;
  error?: string;
}

// 초대장 생성 결과 인터페이스
export interface InvitationCreationResult {
  success: boolean;
  code?: string;
  error?: string;
}
