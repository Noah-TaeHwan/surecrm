import React from 'react';
import {
  HeartIcon,
  HomeIcon,
  FileTextIcon,
  DrawingPinIcon,
  PersonIcon,
  ImageIcon,
  LockClosedIcon,
  EyeClosedIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import type { ClientPrivacyLevel } from '../types';

// 🔒 **보안 강화된 보험 유형 인터페이스**
interface SecureInsuranceType {
  icon: React.ReactNode;
  label: string;
  color: string;
  privacyLevel: ClientPrivacyLevel;
  requiresHealthInfo: boolean;
  requiresFinancialInfo: boolean;
  complianceLevel: 'standard' | 'enhanced' | 'strict';
  accessRestriction: 'agent' | 'manager' | 'admin';
  dataRetentionPeriod: number; // 년 단위
  encryptionRequired: boolean;
  auditRequired: boolean;
}

// 🔒 **보안 강화된 문서 유형 인터페이스**
interface SecureDocumentType {
  icon: React.ReactNode;
  label: string;
  privacyLevel: ClientPrivacyLevel;
  isPersonalData: boolean;
  requiresConsent: boolean;
  maxFileSize: number; // MB
  allowedExtensions: string[];
  encryptionRequired: boolean;
  accessLogRequired: boolean;
  retentionYears: number;
}

// 🔒 **보안 강화된 보험 유형별 설정**
export const secureInsuranceTypeConfig: Record<string, SecureInsuranceType> = {
  life: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '생명보험',
    color: 'bg-red-100 text-red-800',
    privacyLevel: 'confidential',
    requiresHealthInfo: true,
    requiresFinancialInfo: true,
    complianceLevel: 'strict',
    accessRestriction: 'manager',
    dataRetentionPeriod: 10,
    encryptionRequired: true,
    auditRequired: true,
  },
  health: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '건강보험',
    color: 'bg-green-100 text-green-800',
    privacyLevel: 'confidential',
    requiresHealthInfo: true,
    requiresFinancialInfo: false,
    complianceLevel: 'strict',
    accessRestriction: 'manager',
    dataRetentionPeriod: 7,
    encryptionRequired: true,
    auditRequired: true,
  },
  auto: {
    icon: <DrawingPinIcon className="h-4 w-4" />,
    label: '자동차보험',
    color: 'bg-blue-100 text-blue-800',
    privacyLevel: 'private',
    requiresHealthInfo: false,
    requiresFinancialInfo: false,
    complianceLevel: 'enhanced',
    accessRestriction: 'agent',
    dataRetentionPeriod: 5,
    encryptionRequired: true,
    auditRequired: false,
  },
  prenatal: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '태아보험',
    color: 'bg-pink-100 text-pink-800',
    privacyLevel: 'confidential',
    requiresHealthInfo: true,
    requiresFinancialInfo: false,
    complianceLevel: 'strict',
    accessRestriction: 'manager',
    dataRetentionPeriod: 20, // 태아보험은 장기 보관
    encryptionRequired: true,
    auditRequired: true,
  },
  property: {
    icon: <HomeIcon className="h-4 w-4" />,
    label: '재산보험',
    color: 'bg-yellow-100 text-yellow-800',
    privacyLevel: 'private',
    requiresHealthInfo: false,
    requiresFinancialInfo: true,
    complianceLevel: 'enhanced',
    accessRestriction: 'agent',
    dataRetentionPeriod: 7,
    encryptionRequired: true,
    auditRequired: false,
  },
  other: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '기타',
    color: 'bg-gray-100 text-gray-800',
    privacyLevel: 'restricted',
    requiresHealthInfo: false,
    requiresFinancialInfo: false,
    complianceLevel: 'standard',
    accessRestriction: 'agent',
    dataRetentionPeriod: 3,
    encryptionRequired: false,
    auditRequired: false,
  },
};

// 🔒 **보안 강화된 문서 유형별 설정**
export const secureDocumentTypeConfig: Record<string, SecureDocumentType> = {
  id_card: {
    icon: <PersonIcon className="h-4 w-4" />,
    label: '신분증',
    privacyLevel: 'confidential',
    isPersonalData: true,
    requiresConsent: true,
    maxFileSize: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    encryptionRequired: true,
    accessLogRequired: true,
    retentionYears: 10,
  },
  health_certificate: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '건강진단서',
    privacyLevel: 'confidential',
    isPersonalData: true,
    requiresConsent: true,
    maxFileSize: 10,
    allowedExtensions: ['pdf', 'jpg', 'jpeg'],
    encryptionRequired: true,
    accessLogRequired: true,
    retentionYears: 7,
  },
  financial_statement: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '재무제표',
    privacyLevel: 'confidential',
    isPersonalData: true,
    requiresConsent: true,
    maxFileSize: 15,
    allowedExtensions: ['pdf', 'xlsx', 'xls'],
    encryptionRequired: true,
    accessLogRequired: true,
    retentionYears: 5,
  },
  vehicle_registration: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '차량등록증',
    privacyLevel: 'private',
    isPersonalData: true,
    requiresConsent: false,
    maxFileSize: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    encryptionRequired: true,
    accessLogRequired: false,
    retentionYears: 5,
  },
  vehicle_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '차량사진',
    privacyLevel: 'restricted',
    isPersonalData: false,
    requiresConsent: false,
    maxFileSize: 10,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    encryptionRequired: false,
    accessLogRequired: false,
    retentionYears: 3,
  },
  dashboard_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '계기판사진',
    privacyLevel: 'restricted',
    isPersonalData: false,
    requiresConsent: false,
    maxFileSize: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    encryptionRequired: false,
    accessLogRequired: false,
    retentionYears: 3,
  },
  license_plate_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '번호판사진',
    privacyLevel: 'private',
    isPersonalData: true,
    requiresConsent: false,
    maxFileSize: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    encryptionRequired: true,
    accessLogRequired: false,
    retentionYears: 5,
  },
  blackbox_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '블랙박스사진',
    privacyLevel: 'private',
    isPersonalData: false,
    requiresConsent: false,
    maxFileSize: 20,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'mp4'],
    encryptionRequired: true,
    accessLogRequired: false,
    retentionYears: 3,
  },
  policy: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '보험증권',
    privacyLevel: 'confidential',
    isPersonalData: true,
    requiresConsent: true,
    maxFileSize: 10,
    allowedExtensions: ['pdf'],
    encryptionRequired: true,
    accessLogRequired: true,
    retentionYears: 10,
  },
  contract: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '계약서',
    privacyLevel: 'confidential',
    isPersonalData: true,
    requiresConsent: true,
    maxFileSize: 15,
    allowedExtensions: ['pdf'],
    encryptionRequired: true,
    accessLogRequired: true,
    retentionYears: 10,
  },
  other: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '기타문서',
    privacyLevel: 'restricted',
    isPersonalData: false,
    requiresConsent: false,
    maxFileSize: 5,
    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    encryptionRequired: false,
    accessLogRequired: false,
    retentionYears: 1,
  },
};

// 🔒 **개인정보 보호 레벨별 아이콘**
export const privacyLevelIcons: Record<ClientPrivacyLevel, React.ReactNode> = {
  public: null,
  restricted: <EyeClosedIcon className="h-3 w-3" />,
  private: <LockClosedIcon className="h-3 w-3" />,
  confidential: <ExclamationTriangleIcon className="h-3 w-3" />,
};

// 🔒 **보안 레벨별 색상 매핑**
export const privacyLevelColors: Record<ClientPrivacyLevel, string> = {
  public: 'bg-gray-100 text-gray-800',
  restricted: 'bg-blue-100 text-blue-800',
  private: 'bg-orange-100 text-orange-800',
  confidential: 'bg-red-100 text-red-800',
};

// 🔒 **하위 호환성을 위한 기존 export들 (deprecated)**
export const insuranceTypeConfig = secureInsuranceTypeConfig;
export const insuranceTypeIcons: Record<string, React.ReactNode> = {
  life: <HeartIcon className="h-3 w-3" />,
  health: <HeartIcon className="h-3 w-3" />,
  auto: <DrawingPinIcon className="h-3 w-3" />,
  prenatal: <HeartIcon className="h-3 w-3" />,
  property: <HomeIcon className="h-3 w-3" />,
  other: <FileTextIcon className="h-3 w-3" />,
};
export const insuranceTypeText: Record<string, string> = Object.fromEntries(
  Object.entries(secureInsuranceTypeConfig).map(([key, config]) => [
    key,
    config.label,
  ])
);
export const documentTypeConfig = secureDocumentTypeConfig;

// 🔒 **보안 검증 헬퍼 함수들**
export const getInsuranceSecurityLevel = (type: string): ClientPrivacyLevel => {
  return secureInsuranceTypeConfig[type]?.privacyLevel || 'restricted';
};

export const requiresHealthInfo = (type: string): boolean => {
  return secureInsuranceTypeConfig[type]?.requiresHealthInfo || false;
};

export const requiresFinancialInfo = (type: string): boolean => {
  return secureInsuranceTypeConfig[type]?.requiresFinancialInfo || false;
};

export const getDocumentPrivacyLevel = (
  docType: string
): ClientPrivacyLevel => {
  return secureDocumentTypeConfig[docType]?.privacyLevel || 'restricted';
};

export const isPersonalDataDocument = (docType: string): boolean => {
  return secureDocumentTypeConfig[docType]?.isPersonalData || false;
};

export const requiresConsentForDocument = (docType: string): boolean => {
  return secureDocumentTypeConfig[docType]?.requiresConsent || false;
};
