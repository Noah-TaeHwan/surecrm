import React from 'react';
import {
  HeartIcon,
  HomeIcon,
  FileTextIcon,
  DrawingPinIcon,
  PersonIcon,
  ImageIcon,
} from '@radix-ui/react-icons';

// 보험 유형별 설정
export const insuranceTypeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  life: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '생명보험',
    color: 'bg-red-100 text-red-800',
  },
  health: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '건강보험',
    color: 'bg-green-100 text-green-800',
  },
  auto: {
    icon: <DrawingPinIcon className="h-4 w-4" />,
    label: '자동차보험',
    color: 'bg-blue-100 text-blue-800',
  },
  prenatal: {
    icon: <HeartIcon className="h-4 w-4" />,
    label: '태아보험',
    color: 'bg-pink-100 text-pink-800',
  },
  property: {
    icon: <HomeIcon className="h-4 w-4" />,
    label: '재산보험',
    color: 'bg-yellow-100 text-yellow-800',
  },
  other: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '기타',
    color: 'bg-gray-100 text-gray-800',
  },
};

// 보험 유형별 아이콘 매핑 (작은 크기용)
export const insuranceTypeIcons: Record<string, React.ReactNode> = {
  life: <HeartIcon className="h-3 w-3" />,
  health: <HeartIcon className="h-3 w-3" />,
  auto: <DrawingPinIcon className="h-3 w-3" />,
  prenatal: <HeartIcon className="h-3 w-3" />,
  property: <HomeIcon className="h-3 w-3" />,
  other: <FileTextIcon className="h-3 w-3" />,
};

// 보험 유형 텍스트 매핑
export const insuranceTypeText: Record<string, string> = {
  life: '생명보험',
  health: '건강보험',
  auto: '자동차보험',
  prenatal: '태아보험',
  property: '재산보험',
  other: '기타',
};

// 문서 유형별 설정
export const documentTypeConfig: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  id_card: { icon: <PersonIcon className="h-4 w-4" />, label: '신분증' },
  vehicle_registration: {
    icon: <FileTextIcon className="h-4 w-4" />,
    label: '차량등록증',
  },
  vehicle_photo: { icon: <ImageIcon className="h-4 w-4" />, label: '차량사진' },
  dashboard_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '계기판사진',
  },
  license_plate_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '번호판사진',
  },
  blackbox_photo: {
    icon: <ImageIcon className="h-4 w-4" />,
    label: '블랙박스사진',
  },
  policy: { icon: <FileTextIcon className="h-4 w-4" />, label: '보험증권' },
  other: { icon: <FileTextIcon className="h-4 w-4" />, label: '기타문서' },
};
