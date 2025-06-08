import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    console.log('🔧 [API Route] 보험계약 수정 요청 수신');

    const user = await requireAuth(request);
    const formData = await request.formData();

    const contractId = formData.get('contractId')?.toString();
    if (!contractId) {
      return Response.json(
        {
          success: false,
          message: '계약 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const { updateInsuranceContractWithAttachments } = await import(
      '~/api/shared/insurance-contracts'
    );

    const contractData = {
      productName: formData.get('productName')?.toString() || '',
      insuranceCompany: formData.get('insuranceCompany')?.toString() || '',
      insuranceType: formData.get('insuranceType')?.toString() || '',
      contractNumber: formData.get('contractNumber')?.toString() || undefined,
      policyNumber: formData.get('policyNumber')?.toString() || undefined,
      contractDate: formData.get('contractDate')?.toString() || '',
      effectiveDate: formData.get('effectiveDate')?.toString() || '',
      expirationDate: formData.get('expirationDate')?.toString() || undefined,
      contractorName: formData.get('contractorName')?.toString() || '',
      insuredName: formData.get('insuredName')?.toString() || '',
      beneficiaryName: formData.get('beneficiaryName')?.toString() || undefined,
      monthlyPremium: formData.get('monthlyPremium')?.toString()
        ? parseFloat(formData.get('monthlyPremium')?.toString() || '0')
        : undefined,
      agentCommission: formData.get('agentCommission')?.toString()
        ? parseFloat(formData.get('agentCommission')?.toString() || '0')
        : undefined,
      coverageAmount: formData.get('coverageAmount')?.toString()
        ? parseFloat(formData.get('coverageAmount')?.toString() || '0')
        : undefined,
      paymentMethod: formData.get('paymentMethod')?.toString() || undefined,
      notes: formData.get('notes')?.toString() || undefined,
    };

    // 📁 새로운 첨부파일 처리
    const newAttachments: Array<{
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

        newAttachments.push({
          file: value,
          fileName,
          fileDisplayName,
          documentType,
          description,
        });
      }
    }

    console.log(
      `📎 [API Route] 수정 시 새 첨부파일 ${newAttachments.length}개 발견`
    );

    const result = await updateInsuranceContractWithAttachments(
      contractId,
      user.id,
      contractData,
      newAttachments
    );

    console.log('🎯 [API Route] 보험계약 수정 결과:', result);

    return Response.json(result);
  } catch (error) {
    console.error('❌ [API Route] 보험계약 수정 실패:', error);

    return Response.json(
      {
        success: false,
        message: '보험계약 수정에 실패했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
