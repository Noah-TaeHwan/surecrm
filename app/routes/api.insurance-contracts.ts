import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    console.log('🏢 [API Route] 보험계약 생성 요청 수신');

    const user = await requireAuth(request);
    const formData = await request.formData();

    const clientId = formData.get('clientId')?.toString();
    if (!clientId) {
      return Response.json(
        {
          success: false,
          message: '고객 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const { createInsuranceContract } = await import(
      '~/api/shared/insurance-contracts'
    );

    const contractData = {
      productName: formData.get('productName')?.toString() || '',
      insuranceCompany: formData.get('insuranceCompany')?.toString() || '',
      insuranceType: formData.get('insuranceType')?.toString() || '',
      insuranceCode: formData.get('insuranceCode')?.toString() || undefined, // 🆕 보종코드
      contractNumber: formData.get('contractNumber')?.toString() || undefined,
      policyNumber: formData.get('policyNumber')?.toString() || undefined,
      contractDate: formData.get('contractDate')?.toString() || '',
      effectiveDate: formData.get('effectiveDate')?.toString() || '',
      expirationDate: formData.get('expirationDate')?.toString() || undefined,
      paymentDueDate: formData.get('paymentDueDate')?.toString() || undefined, // 🆕 납기일
      contractorName: formData.get('contractorName')?.toString() || '',
      contractorSsn: formData.get('contractorSsn')?.toString() || undefined, // 🆕 계약자 주민번호
      contractorPhone: formData.get('contractorPhone')?.toString() || undefined, // 🆕 계약자 연락처
      insuredName: formData.get('insuredName')?.toString() || '',
      insuredSsn: formData.get('insuredSsn')?.toString() || undefined, // 🆕 피보험자 주민번호
      insuredPhone: formData.get('insuredPhone')?.toString() || undefined, // 🆕 피보험자 연락처
      beneficiaryName: formData.get('beneficiaryName')?.toString() || undefined,
      premiumAmount: formData.get('premiumAmount')?.toString() // 🆕 납입보험료 (통합)
        ? parseFloat(formData.get('premiumAmount')?.toString() || '0')
        : undefined,
      monthlyPremium: formData.get('monthlyPremium')?.toString()
        ? parseFloat(formData.get('monthlyPremium')?.toString() || '0')
        : undefined,
      annualPremium: formData.get('annualPremium')?.toString() // 🆕 연 보험료
        ? parseFloat(formData.get('annualPremium')?.toString() || '0')
        : undefined,
      agentCommission: formData.get('agentCommission')?.toString()
        ? parseFloat(formData.get('agentCommission')?.toString() || '0')
        : undefined,
      coverageAmount: formData.get('coverageAmount')?.toString()
        ? parseFloat(formData.get('coverageAmount')?.toString() || '0')
        : undefined,
      paymentCycle: formData.get('paymentCycle')?.toString() || undefined, // 🆕 납입주기
      paymentPeriod: formData.get('paymentPeriod')?.toString() // 🆕 납입기간
        ? parseInt(formData.get('paymentPeriod')?.toString() || '0')
        : undefined,
      notes: formData.get('notes')?.toString() || undefined,
    };

    // 📁 첨부파일 처리
    const attachments: Array<{
      file: File;
      fileName: string;
      fileDisplayName: string;
      documentType: string;
      description?: string;
    }> = [];

    // FormData에서 파일들 추출
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith('attachment_file_') && value instanceof File) {
        const index = key.split('_')[2];
        const fileName =
          formData.get(`attachment_fileName_${index}`)?.toString() ||
          value.name;
        const fileDisplayName =
          formData.get(`attachment_displayName_${index}`)?.toString() ||
          value.name;
        const documentType =
          formData.get(`attachment_documentType_${index}`)?.toString() ||
          'other_document';
        const description = formData
          .get(`attachment_description_${index}`)
          ?.toString();

        attachments.push({
          file: value,
          fileName,
          fileDisplayName,
          documentType,
          description,
        });
      }
    }

    console.log(`📎 [API Route] 첨부파일 ${attachments.length}개 발견`);

    const result = await createInsuranceContract(
      clientId,
      user.id,
      contractData,
      attachments
    );

    console.log('🎯 [API Route] 보험계약 생성 결과:', result);

    return Response.json(result);
  } catch (error) {
    console.error('❌ [API Route] 보험계약 생성 실패:', error);

    return Response.json(
      {
        success: false,
        message: '보험계약 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
