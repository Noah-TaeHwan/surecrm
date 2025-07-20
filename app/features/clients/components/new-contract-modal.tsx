/**
 * 🆕 보험계약 등록/수정 모달 컴포넌트
 * 
 * 보험계약 정보의 등록 및 수정을 위한 모달 다이얼로그
 */

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Plus,
  Calendar,
  DollarSign,
  CheckCircle,
  Paperclip,
  Upload,
  X,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Separator } from '~/common/components/ui/separator';
import { cn } from '~/lib/utils';

// 🆔 국제적 ID 유틸리티 import
import {
  parseKoreanId,
  maskKoreanId,
  validateKoreanId,
  formatKoreanIdInput,
} from '~/lib/utils/korean-id-utils';
import {
  validateInternationalId,
  formatIdInput,
  maskIdInput,
  getIdConfigForLanguage,
  type SupportedLanguage,
  type InternationalIdResult,
} from '~/lib/utils/international-id-utils';

// 🌐 다국어 훅 import
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { useTranslation } from 'react-i18next';

// 타입 import
import type { 
  InsuranceContract, 
  ContractFormData, 
  AttachmentData,
  NewContractModalProps,
  DOCUMENT_TYPES
} from '../types/insurance-types';

// 문서 타입 배열 정의
const DOCUMENT_TYPES_ARRAY: readonly string[] = [
  'contract',
  'application',
  'identification',
  'medical_report',
  'financial_statement',
  'other_document',
];

export function NewContractModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  clientName = '',
  isSubmitting = false,
}: NewContractModalProps) {
  const { t } = useHydrationSafeTranslation('clients');
  const { i18n } = useTranslation();
  const editingContract = initialData;
  const [initialFormData, setInitialFormData] = useState<ContractFormData | null>(null);

  // 🔢 숫자 필드 포맷팅
  const formatNumberInput = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 🌐 현재 언어에 따른 ID 설정
  const currentLanguage = (
    i18n.language?.startsWith('ko')
      ? 'ko'
      : i18n.language?.startsWith('ja')
        ? 'ja'
        : 'en'
  ) as SupportedLanguage;
  const contractorIdConfig = getIdConfigForLanguage(currentLanguage);
  const insuredIdConfig = getIdConfigForLanguage(currentLanguage);
  // 📋 폼 상태 관리
  const [formData, setFormData] = useState(() => {
    if (initialFormData) {
      return initialFormData;
    }
    return {
      productName: '',
      insuranceCompany: '',
      insuranceType: 'life',
      insuranceCode: '',
      contractNumber: '',
      policyNumber: '',
      contractDate: '',
      effectiveDate: '',
      expirationDate: '',
      paymentDueDate: '',
      contractorName: clientName,
      contractorSsn: '',
      contractorPhone: '',
      insuredName: clientName,
      insuredSsn: '',
      insuredPhone: '',
      beneficiaryName: '',
      premiumAmount: '',
      monthlyPremium: '',
      annualPremium: '',
      coverageAmount: '',
      agentCommission: '',
      paymentCycle: 'monthly',
      paymentPeriod: '',
      specialClauses: '',
      notes: '',
    };
  });

  // 📁 첨부파일 상태 관리
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔄 수정 모드일 때 폼 데이터 업데이트
  useEffect(() => {
    if (editingContract) {
      const formData: ContractFormData = {
        productName: editingContract.productName || '',
        insuranceCompany: editingContract.insuranceCompany || '',
        insuranceType: editingContract.insuranceType || 'life',
        insuranceCode: editingContract.insuranceCode || '',
        contractNumber: editingContract.contractNumber || '',
        policyNumber: editingContract.policyNumber || '',
        contractDate: editingContract.contractDate || '',
        effectiveDate: editingContract.effectiveDate || '',
        expirationDate: editingContract.expirationDate || '',
        paymentDueDate: editingContract.paymentDueDate || '',
        contractorName: editingContract.contractorName || '',
        contractorSsn: editingContract.contractorSsn || '',
        contractorPhone: editingContract.contractorPhone || '',
        insuredName: editingContract.insuredName || '',
        insuredSsn: editingContract.insuredSsn || '',
        insuredPhone: editingContract.insuredPhone || '',
        beneficiaryName: editingContract.beneficiaryName || '',
        premiumAmount: editingContract.premiumAmount || '',
        monthlyPremium: editingContract.monthlyPremium
          ? formatNumberInput(editingContract.monthlyPremium)
          : '',
        annualPremium: editingContract.annualPremium
          ? formatNumberInput(editingContract.annualPremium)
          : '',
        coverageAmount: editingContract.coverageAmount
          ? formatNumberInput(editingContract.coverageAmount)
          : '',
        agentCommission: editingContract.agentCommission
          ? formatNumberInput(editingContract.agentCommission)
          : '',
        paymentCycle: editingContract.paymentCycle || 'monthly',
        paymentPeriod: editingContract.paymentPeriod?.toString() || '',
        specialClauses: editingContract.specialClauses || '',
        notes: editingContract.notes || '',
      };
      setFormData(formData);
      setInitialFormData(formData);

      // 🔧 기존 첨부파일 설정 (수정 시)
      if (editingContract.attachments && editingContract.attachments.length > 0) {
        const existingAttachments: AttachmentData[] = editingContract.attachments.map(
          (attachment) => ({
            id: attachment.id,
            fileName: attachment.fileName,
            fileDisplayName: attachment.fileDisplayName || attachment.fileName,
            documentType: attachment.documentType || 'other_document',
            description: attachment.description || '',
            isExisting: true,
            fileUrl: `/api/insurance-contracts/attachment/${attachment.id}`,
          })
        );
        setAttachments(existingAttachments);
      }
    }
  }, [editingContract]);

  // 📝 입력값 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 🔢 숫자 입력 핸들러
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatNumberInput(value);
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 🆔 한국 주민번호 입력 핸들러
  const handleKoreanIdInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'contractorSsn' | 'insuredSsn'
  ) => {
    const { value } = e.target;
    const formattedValue = formatKoreanIdInput(value);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: formattedValue,
    }));
    // 에러 메시지 제거
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 🆔 국제 ID 입력 핸들러
  const handleInternationalIdInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'contractorSsn' | 'insuredSsn',
    language: SupportedLanguage
  ) => {
    const { value } = e.target;
    const formattedValue = formatIdInput(value, currentLanguage);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: formattedValue,
    }));
    // 에러 메시지 제거
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 📁 파일 선택 핸들러
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingFile(true);

    try {
      const newAttachments: AttachmentData[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        fileDisplayName: file.name,
        documentType: 'other_document',
        description: '',
        isExisting: false,
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('파일 선택 오류:', error);
    } finally {
      setIsUploadingFile(false);
    }

    // Input 초기화
    e.target.value = '';
  };

  // 📁 첨부파일 제거 핸들러
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
  };

  // 📁 첨부파일 정보 업데이트
  const handleUpdateAttachment = (
    attachmentId: string,
    field: keyof AttachmentData,
    value: string
  ) => {
    setAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === attachmentId
          ? { ...attachment, [field]: value }
          : attachment
      )
    );
  };

  // ✅ 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName) {
      newErrors.productName = t('newContractModal.validation.productNameRequired');
    }
    if (!formData.insuranceCompany) {
      newErrors.insuranceCompany = t('newContractModal.validation.companyRequired');
    }
    if (!formData.contractDate) {
      newErrors.contractDate = t('newContractModal.validation.contractDateRequired');
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = t('newContractModal.validation.effectiveDateRequired');
    }
    if (!formData.contractorName) {
      newErrors.contractorName = t('newContractModal.validation.contractorNameRequired');
    }
    if (!formData.insuredName) {
      newErrors.insuredName = t('newContractModal.validation.insuredNameRequired');
    }

    // 🆔 ID 유효성 검사 (국제적)
    if (formData.contractorSsn) {
      if (currentLanguage === 'ko') {
        const contractorIdValidation = parseKoreanId(formData.contractorSsn);
        if (!contractorIdValidation.isValid) {
          newErrors.contractorSsn = contractorIdValidation.errorMessage || t('newContractModal.validation.id.invalid');
        }
      } else {
        const contractorIdValidation = validateInternationalId(
          formData.contractorSsn,
          currentLanguage
        );
        if (!contractorIdValidation.isValid) {
          newErrors.contractorSsn = contractorIdValidation.errorMessage || t('newContractModal.validation.id.invalid');
        }
      }
    }

    if (formData.insuredSsn) {
      if (currentLanguage === 'ko') {
        const insuredIdValidation = parseKoreanId(formData.insuredSsn);
        if (!insuredIdValidation.isValid) {
          newErrors.insuredSsn = insuredIdValidation.errorMessage || t('newContractModal.validation.id.invalid');
        }
      } else {
        const insuredIdValidation = validateInternationalId(
          formData.insuredSsn,
          currentLanguage
        );
        if (!insuredIdValidation.isValid) {
          newErrors.insuredSsn = insuredIdValidation.errorMessage || t('newContractModal.validation.id.invalid');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📤 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData, attachments);
  };

  // 🔒 ID 표시 관련 상태
  const [showContractorSsn, setShowContractorSsn] = useState(false);
  const [showInsuredSsn, setShowInsuredSsn] = useState(false);

  // 🔧 ID 마스킹 함수
  const getMaskedId = (
    idValue: string,
    language: SupportedLanguage
  ) => {
    if (!idValue) return '';

    if (language === 'ko') {
      return maskKoreanId(idValue);
    } else {
      return maskIdInput(idValue, language);
    }
  };

  // 📊 월 보험료 기반 연 보험료 자동 계산
  useEffect(() => {
    if (formData.monthlyPremium) {
      const monthly = parseFloat(formData.monthlyPremium.replace(/,/g, ''));
      if (!isNaN(monthly)) {
        const annual = monthly * 12;
        setFormData((prev) => ({
          ...prev,
          annualPremium: formatNumberInput(annual.toString()),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        annualPremium: '',
      }));
    }
  }, [formData.monthlyPremium]);

  // 📊 납입주기에 따른 납입보험료 설정
  useEffect(() => {
    if (formData.paymentCycle === 'monthly' && formData.monthlyPremium) {
      setFormData((prev) => ({
        ...prev,
        premiumAmount: formData.monthlyPremium,
      }));
    } else if (formData.paymentCycle === 'annually' && formData.annualPremium) {
      setFormData((prev) => ({
        ...prev,
        premiumAmount: formData.annualPremium,
      }));
    }
  }, [formData.paymentCycle, formData.monthlyPremium, formData.annualPremium]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingContract
              ? t('newContractModal.titleEdit')
              : t('newContractModal.title')}
          </DialogTitle>
          <DialogDescription>{t('newContractModal.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 📝 상품 정보 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.productInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="productName">
                  {t('newContractModal.fields.productName')} *
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.productName')}
                  className={errors.productName ? 'border-red-500' : ''}
                />
                {errors.productName && (
                  <p className="text-xs text-red-500">{errors.productName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuranceCompany">
                  {t('newContractModal.fields.insuranceCompany')} *
                </Label>
                <Input
                  id="insuranceCompany"
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.insuranceCompany')}
                  className={errors.insuranceCompany ? 'border-red-500' : ''}
                />
                {errors.insuranceCompany && (
                  <p className="text-xs text-red-500">{errors.insuranceCompany}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuranceType">
                  {t('newContractModal.fields.insuranceType')}
                </Label>
                <Select
                  value={formData.insuranceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, insuranceType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="life">{t('insuranceTypes.life')}</SelectItem>
                    <SelectItem value="health">{t('insuranceTypes.health')}</SelectItem>
                    <SelectItem value="car">{t('insuranceTypes.car')}</SelectItem>
                    <SelectItem value="fire">{t('insuranceTypes.fire')}</SelectItem>
                    <SelectItem value="travel">{t('insuranceTypes.travel')}</SelectItem>
                    <SelectItem value="annuity">{t('insuranceTypes.annuity')}</SelectItem>
                    <SelectItem value="pension">{t('insuranceTypes.pension')}</SelectItem>
                    <SelectItem value="accident">{t('insuranceTypes.accident')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuranceCode">
                  {t('newContractModal.fields.insuranceCode')}
                </Label>
                <Input
                  id="insuranceCode"
                  name="insuranceCode"
                  value={formData.insuranceCode}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.insuranceCode')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contractNumber">
                  {t('newContractModal.fields.contractNumber')}
                </Label>
                <Input
                  id="contractNumber"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.contractNumber')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="policyNumber">
                  {t('newContractModal.fields.policyNumber')}
                </Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.policyNumber')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 📅 날짜 정보 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.dateInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="contractDate">
                  {t('newContractModal.fields.contractDate')} *
                </Label>
                <Input
                  id="contractDate"
                  name="contractDate"
                  type="date"
                  value={formData.contractDate}
                  onChange={handleInputChange}
                  className={errors.contractDate ? 'border-red-500' : ''}
                />
                {errors.contractDate && (
                  <p className="text-xs text-red-500">{errors.contractDate}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="effectiveDate">
                  {t('newContractModal.fields.effectiveDate')} *
                </Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleInputChange}
                  className={errors.effectiveDate ? 'border-red-500' : ''}
                />
                {errors.effectiveDate && (
                  <p className="text-xs text-red-500">{errors.effectiveDate}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="expirationDate">
                  {t('newContractModal.fields.expirationDate')}
                </Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentDueDate">
                  {t('newContractModal.fields.paymentDueDate')}
                </Label>
                <Input
                  id="paymentDueDate"
                  name="paymentDueDate"
                  type="date"
                  value={formData.paymentDueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 👥 계약자/피보험자 정보 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.personInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="contractorName">
                  {t('newContractModal.fields.contractorName')} *
                </Label>
                <Input
                  id="contractorName"
                  name="contractorName"
                  value={formData.contractorName}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.contractorName')}
                  className={errors.contractorName ? 'border-red-500' : ''}
                />
                {errors.contractorName && (
                  <p className="text-xs text-red-500">{errors.contractorName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contractorSsn">
                  {t('newContractModal.fields.contractorSsn')}
                </Label>
                <div className="relative">
                  <Input
                    id="contractorSsn"
                    name="contractorSsn"
                    type={showContractorSsn ? 'text' : 'password'}
                    value={
                      showContractorSsn
                        ? formData.contractorSsn
                        : getMaskedId(
                            formData.contractorSsn,
                            currentLanguage
                          )
                    }
                    onChange={(e) =>
                      currentLanguage === 'ko'
                        ? handleKoreanIdInputChange(e, 'contractorSsn')
                        : handleInternationalIdInputChange(
                            e,
                            'contractorSsn',
                            currentLanguage
                          )
                    }
                    placeholder={contractorIdConfig.placeholder}
                    className={cn(
                      'pr-10',
                      errors.contractorSsn ? 'border-red-500' : ''
                    )}
                    maxLength={contractorIdConfig.maxLength}
                  />
                  <button
                    type="button"
                    onClick={() => setShowContractorSsn(!showContractorSsn)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showContractorSsn ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.contractorSsn && (
                  <p className="text-xs text-red-500">{errors.contractorSsn}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contractorPhone">
                  {t('newContractModal.fields.contractorPhone')}
                </Label>
                <Input
                  id="contractorPhone"
                  name="contractorPhone"
                  value={formData.contractorPhone}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.contractorPhone')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuredName">
                  {t('newContractModal.fields.insuredName')} *
                </Label>
                <Input
                  id="insuredName"
                  name="insuredName"
                  value={formData.insuredName}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.insuredName')}
                  className={errors.insuredName ? 'border-red-500' : ''}
                />
                {errors.insuredName && (
                  <p className="text-xs text-red-500">{errors.insuredName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuredSsn">
                  {t('newContractModal.fields.insuredSsn')}
                </Label>
                <div className="relative">
                  <Input
                    id="insuredSsn"
                    name="insuredSsn"
                    type={showInsuredSsn ? 'text' : 'password'}
                    value={
                      showInsuredSsn
                        ? formData.insuredSsn
                        : getMaskedId(
                            formData.insuredSsn,
                            currentLanguage
                          )
                    }
                    onChange={(e) =>
                      currentLanguage === 'ko'
                        ? handleKoreanIdInputChange(e, 'insuredSsn')
                        : handleInternationalIdInputChange(
                            e,
                            'insuredSsn',
                            currentLanguage
                          )
                    }
                    placeholder={insuredIdConfig.placeholder}
                    className={cn(
                      'pr-10',
                      errors.insuredSsn ? 'border-red-500' : ''
                    )}
                    maxLength={insuredIdConfig.maxLength}
                  />
                  <button
                    type="button"
                    onClick={() => setShowInsuredSsn(!showInsuredSsn)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showInsuredSsn ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.insuredSsn && (
                  <p className="text-xs text-red-500">{errors.insuredSsn}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="insuredPhone">
                  {t('newContractModal.fields.insuredPhone')}
                </Label>
                <Input
                  id="insuredPhone"
                  name="insuredPhone"
                  value={formData.insuredPhone}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.insuredPhone')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="beneficiaryName">
                  {t('newContractModal.fields.beneficiaryName')}
                </Label>
                <Input
                  id="beneficiaryName"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.beneficiaryName')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 💰 보험료 정보 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.premiumInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="monthlyPremium">
                  {t('newContractModal.fields.monthlyPremium')}
                </Label>
                <Input
                  id="monthlyPremium"
                  name="monthlyPremium"
                  value={formData.monthlyPremium}
                  onChange={handleNumberInputChange}
                  placeholder={t('newContractModal.placeholders.monthlyPremium')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="annualPremium">
                  {t('newContractModal.fields.annualPremium')}
                </Label>
                <Input
                  id="annualPremium"
                  name="annualPremium"
                  value={formData.annualPremium}
                  onChange={handleNumberInputChange}
                  placeholder={t('newContractModal.placeholders.annualPremium')}
                  disabled={!!formData.monthlyPremium}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="coverageAmount">
                  {t('newContractModal.fields.coverageAmount')}
                </Label>
                <Input
                  id="coverageAmount"
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleNumberInputChange}
                  placeholder={t('newContractModal.placeholders.coverageAmount')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agentCommission">
                  {t('newContractModal.fields.agentCommission')}
                </Label>
                <Input
                  id="agentCommission"
                  name="agentCommission"
                  value={formData.agentCommission}
                  onChange={handleNumberInputChange}
                  placeholder={t('newContractModal.placeholders.agentCommission')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentCycle">
                  {t('newContractModal.fields.paymentCycle')}
                </Label>
                <Select
                  value={formData.paymentCycle}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentCycle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {t('paymentCycle.monthly')}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t('paymentCycle.quarterly')}
                    </SelectItem>
                    <SelectItem value="semi-annually">
                      {t('paymentCycle.semiAnnually')}
                    </SelectItem>
                    <SelectItem value="annually">
                      {t('paymentCycle.annually')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentPeriod">
                  {t('newContractModal.fields.paymentPeriod')}
                </Label>
                <Input
                  id="paymentPeriod"
                  name="paymentPeriod"
                  value={formData.paymentPeriod}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.paymentPeriod')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 📝 기타 정보 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.additionalInfo')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="specialClauses">
                  {t('newContractModal.fields.specialClauses')}
                </Label>
                <Textarea
                  id="specialClauses"
                  name="specialClauses"
                  value={formData.specialClauses}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.specialClauses')}
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">{t('newContractModal.fields.notes')}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t('newContractModal.placeholders.notes')}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 📁 첨부파일 섹션 */}
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              {t('newContractModal.sections.attachments')}
            </h3>
            <div className="space-y-4">
              {/* 파일 업로드 버튼 */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {t('newContractModal.attachments.selectFile')}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  disabled={isUploadingFile}
                />
              </div>

              {/* 첨부파일 목록 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {attachment.fileDisplayName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor={`doc-type-${attachment.id}`}
                                className="text-xs"
                              >
                                {t('newContractModal.attachments.documentType')}
                              </Label>
                              <Select
                                value={attachment.documentType}
                                onValueChange={(value) =>
                                  handleUpdateAttachment(
                                    attachment.id,
                                    'documentType',
                                    value
                                  )
                                }
                              >
                                <SelectTrigger
                                  id={`doc-type-${attachment.id}`}
                                  className="h-8"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DOCUMENT_TYPES_ARRAY.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {t(`documentTypes.${type}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`doc-name-${attachment.id}`}
                                className="text-xs"
                              >
                                {t('newContractModal.attachments.displayName')}
                              </Label>
                              <Input
                                id={`doc-name-${attachment.id}`}
                                value={attachment.fileDisplayName}
                                onChange={(e) =>
                                  handleUpdateAttachment(
                                    attachment.id,
                                    'fileDisplayName',
                                    e.target.value
                                  )
                                }
                                className="h-8"
                                placeholder={t(
                                  'newContractModal.attachments.displayNamePlaceholder'
                                )}
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`doc-desc-${attachment.id}`}
                              className="text-xs"
                            >
                              {t('newContractModal.attachments.description')}
                            </Label>
                            <Input
                              id={`doc-desc-${attachment.id}`}
                              value={attachment.description}
                              onChange={(e) =>
                                handleUpdateAttachment(
                                  attachment.id,
                                  'description',
                                  e.target.value
                                )
                              }
                              className="h-8"
                              placeholder={t(
                                'newContractModal.attachments.descriptionPlaceholder'
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              {t('newContractModal.buttons.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {editingContract
                    ? t('newContractModal.buttons.updating')
                    : t('newContractModal.buttons.registering')}
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  {editingContract
                    ? t('newContractModal.buttons.update')
                    : t('newContractModal.buttons.register')}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}