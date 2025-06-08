// API 파일

// 🏢 보험계약 관리 API
import { eq, and, desc } from 'drizzle-orm';
import { db } from '~/lib/core/db';
import {
  insuranceContracts,
  contractAttachments,
  opportunityProducts,
  clients,
} from '~/lib/schema/core';
import type {
  NewInsuranceContract,
  InsuranceContract,
  NewContractAttachment,
  ContractAttachment,
} from '~/lib/schema/core';

/**
 * 보험계약 생성
 */
export async function createInsuranceContract(
  clientId: string,
  agentId: string,
  contractData: {
    productName: string;
    insuranceCompany: string;
    insuranceType: string;
    contractNumber?: string;
    policyNumber?: string;
    contractDate: string;
    effectiveDate: string;
    expirationDate?: string;
    contractorName: string;
    insuredName: string;
    beneficiaryName?: string;
    monthlyPremium?: number;
    annualPremium?: number;
    coverageAmount?: number;
    agentCommission?: number;
    specialClauses?: string;
    paymentMethod?: string;
    paymentPeriod?: number;
    notes?: string;
    opportunityProductId?: string;
  }
) {
  try {
    console.log('🏢 보험계약 생성:', { clientId, agentId, contractData });

    const newContract: NewInsuranceContract = {
      clientId,
      agentId,
      opportunityProductId: contractData.opportunityProductId || null,
      productName: contractData.productName,
      insuranceCompany: contractData.insuranceCompany,
      insuranceType: contractData.insuranceType as any,
      contractNumber: contractData.contractNumber || null,
      policyNumber: contractData.policyNumber || null,
      contractDate: contractData.contractDate,
      effectiveDate: contractData.effectiveDate,
      expirationDate: contractData.expirationDate || null,
      contractorName: contractData.contractorName,
      insuredName: contractData.insuredName,
      beneficiaryName: contractData.beneficiaryName || null,
      monthlyPremium: contractData.monthlyPremium?.toString() || null,
      annualPremium: contractData.annualPremium?.toString() || null,
      coverageAmount: contractData.coverageAmount?.toString() || null,
      agentCommission: contractData.agentCommission?.toString() || null,
      specialClauses: contractData.specialClauses || null,
      paymentMethod: contractData.paymentMethod || null,
      paymentPeriod: contractData.paymentPeriod || null,
      notes: contractData.notes || null,
      status: 'active',
    };

    const [createdContract] = await db
      .insert(insuranceContracts)
      .values(newContract)
      .returning();

    console.log('✅ 보험계약 생성 완료:', createdContract.id);
    return {
      success: true,
      data: createdContract,
      message: '보험계약이 성공적으로 생성되었습니다.',
    };
  } catch (error) {
    console.error('❌ 보험계약 생성 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '보험계약 생성에 실패했습니다.',
    };
  }
}

/**
 * 고객의 보험계약 목록 조회
 */
export async function getClientInsuranceContracts(
  clientId: string,
  agentId: string
) {
  try {
    console.log('📋 고객 보험계약 목록 조회:', { clientId, agentId });

    const contracts = await db
      .select({
        id: insuranceContracts.id,
        productName: insuranceContracts.productName,
        insuranceCompany: insuranceContracts.insuranceCompany,
        insuranceType: insuranceContracts.insuranceType,
        contractNumber: insuranceContracts.contractNumber,
        policyNumber: insuranceContracts.policyNumber,
        contractDate: insuranceContracts.contractDate,
        effectiveDate: insuranceContracts.effectiveDate,
        expirationDate: insuranceContracts.expirationDate,
        contractorName: insuranceContracts.contractorName,
        insuredName: insuranceContracts.insuredName,
        beneficiaryName: insuranceContracts.beneficiaryName,
        monthlyPremium: insuranceContracts.monthlyPremium,
        annualPremium: insuranceContracts.annualPremium,
        coverageAmount: insuranceContracts.coverageAmount,
        agentCommission: insuranceContracts.agentCommission,
        status: insuranceContracts.status,
        paymentMethod: insuranceContracts.paymentMethod,
        paymentPeriod: insuranceContracts.paymentPeriod,
        specialClauses: insuranceContracts.specialClauses,
        notes: insuranceContracts.notes,
        createdAt: insuranceContracts.createdAt,
        updatedAt: insuranceContracts.updatedAt,
      })
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.clientId, clientId),
          eq(insuranceContracts.agentId, agentId)
        )
      )
      .orderBy(desc(insuranceContracts.createdAt));

    console.log(`✅ 보험계약 ${contracts.length}개 조회 완료`);
    return {
      success: true,
      data: contracts,
    };
  } catch (error) {
    console.error('❌ 보험계약 목록 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: [],
    };
  }
}

/**
 * 보험계약 상세 조회
 */
export async function getInsuranceContractDetail(
  contractId: string,
  agentId: string
) {
  try {
    console.log('🏢 보험계약 상세 조회:', { contractId, agentId });

    const [contract] = await db
      .select()
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.id, contractId),
          eq(insuranceContracts.agentId, agentId)
        )
      )
      .limit(1);

    if (!contract) {
      return {
        success: false,
        error: '보험계약을 찾을 수 없습니다.',
        data: null,
      };
    }

    // 첨부파일도 함께 조회
    const attachments = await db
      .select()
      .from(contractAttachments)
      .where(
        and(
          eq(contractAttachments.contractId, contractId),
          eq(contractAttachments.isActive, true)
        )
      )
      .orderBy(desc(contractAttachments.uploadedAt));

    console.log('✅ 보험계약 상세 조회 완료');
    return {
      success: true,
      data: {
        ...contract,
        attachments,
      },
    };
  } catch (error) {
    console.error('❌ 보험계약 상세 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: null,
    };
  }
}

/**
 * 보험계약 수정
 */
export async function updateInsuranceContract(
  contractId: string,
  agentId: string,
  updateData: Partial<{
    productName: string;
    insuranceCompany: string;
    contractNumber: string;
    policyNumber: string;
    contractDate: string;
    effectiveDate: string;
    expirationDate: string;
    contractorName: string;
    insuredName: string;
    beneficiaryName: string;
    monthlyPremium: number;
    annualPremium: number;
    coverageAmount: number;
    agentCommission: number;
    specialClauses: string;
    paymentMethod: string;
    paymentPeriod: number;
    notes: string;
    status: 'draft' | 'active' | 'cancelled' | 'expired' | 'suspended';
  }>
) {
  try {
    console.log('🏢 보험계약 수정:', { contractId, agentId, updateData });

    const [updatedContract] = await db
      .update(insuranceContracts)
      .set({
        ...updateData,
        monthlyPremium: updateData.monthlyPremium?.toString(),
        annualPremium: updateData.annualPremium?.toString(),
        coverageAmount: updateData.coverageAmount?.toString(),
        agentCommission: updateData.agentCommission?.toString(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(insuranceContracts.id, contractId),
          eq(insuranceContracts.agentId, agentId)
        )
      )
      .returning();

    if (!updatedContract) {
      return {
        success: false,
        error: '보험계약을 찾을 수 없습니다.',
      };
    }

    console.log('✅ 보험계약 수정 완료');
    return {
      success: true,
      data: updatedContract,
      message: '보험계약이 성공적으로 수정되었습니다.',
    };
  } catch (error) {
    console.error('❌ 보험계약 수정 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '보험계약 수정에 실패했습니다.',
    };
  }
}

/**
 * 보험계약 삭제 (상태 변경)
 */
export async function deleteInsuranceContract(
  contractId: string,
  agentId: string
) {
  try {
    console.log('🏢 보험계약 삭제:', { contractId, agentId });

    const [deletedContract] = await db
      .update(insuranceContracts)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(insuranceContracts.id, contractId),
          eq(insuranceContracts.agentId, agentId)
        )
      )
      .returning();

    if (!deletedContract) {
      return {
        success: false,
        error: '보험계약을 찾을 수 없습니다.',
      };
    }

    console.log('✅ 보험계약 삭제 완료');
    return {
      success: true,
      message: '보험계약이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('❌ 보험계약 삭제 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '보험계약 삭제에 실패했습니다.',
    };
  }
}

/**
 * 계약 첨부파일 업로드
 */
export async function addContractAttachment(
  contractId: string,
  agentId: string,
  attachmentData: {
    fileName: string;
    fileDisplayName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
    description?: string;
  }
) {
  try {
    console.log('📎 계약 첨부파일 추가:', {
      contractId,
      agentId,
      attachmentData,
    });

    const newAttachment: NewContractAttachment = {
      contractId,
      agentId,
      fileName: attachmentData.fileName,
      fileDisplayName: attachmentData.fileDisplayName,
      filePath: attachmentData.filePath,
      fileSize: attachmentData.fileSize,
      mimeType: attachmentData.mimeType,
      documentType: attachmentData.documentType as any,
      description: attachmentData.description || null,
    };

    const [createdAttachment] = await db
      .insert(contractAttachments)
      .values(newAttachment)
      .returning();

    console.log('✅ 계약 첨부파일 추가 완료');
    return {
      success: true,
      data: createdAttachment,
      message: '첨부파일이 성공적으로 업로드되었습니다.',
    };
  } catch (error) {
    console.error('❌ 계약 첨부파일 추가 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '첨부파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * 계약 첨부파일 삭제
 */
export async function deleteContractAttachment(
  attachmentId: string,
  agentId: string
) {
  try {
    console.log('📎 계약 첨부파일 삭제:', { attachmentId, agentId });

    const [deletedAttachment] = await db
      .update(contractAttachments)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(contractAttachments.id, attachmentId),
          eq(contractAttachments.agentId, agentId)
        )
      )
      .returning();

    if (!deletedAttachment) {
      return {
        success: false,
        error: '첨부파일을 찾을 수 없습니다.',
      };
    }

    console.log('✅ 계약 첨부파일 삭제 완료');
    return {
      success: true,
      message: '첨부파일이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('❌ 계약 첨부파일 삭제 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '첨부파일 삭제에 실패했습니다.',
    };
  }
}

/**
 * 영업 파이프라인과 연동된 계약 생성
 * (영업 기회가 성사될 때 자동으로 계약 템플릿 생성)
 */
export async function createContractFromOpportunity(
  opportunityProductId: string,
  agentId: string,
  additionalData?: Partial<{
    contractDate: string;
    effectiveDate: string;
    monthlyPremium: number;
    agentCommission: number;
    notes: string;
  }>
) {
  try {
    console.log('🔗 영업 기회에서 계약 생성:', {
      opportunityProductId,
      agentId,
    });

    // 영업 기회 정보 조회
    const [opportunity] = await db
      .select({
        clientId: opportunityProducts.clientId,
        productName: opportunityProducts.productName,
        insuranceType: opportunityProducts.insuranceType,
        monthlyPremium: opportunityProducts.monthlyPremium,
        expectedCommission: opportunityProducts.expectedCommission,
      })
      .from(opportunityProducts)
      .where(eq(opportunityProducts.id, opportunityProductId))
      .limit(1);

    if (!opportunity) {
      return {
        success: false,
        error: '영업 기회를 찾을 수 없습니다.',
      };
    }

    // 고객 정보 조회
    const [client] = await db
      .select({
        fullName: clients.fullName,
      })
      .from(clients)
      .where(eq(clients.id, opportunity.clientId))
      .limit(1);

    if (!client) {
      return {
        success: false,
        error: '고객 정보를 찾을 수 없습니다.',
      };
    }

    // 계약 데이터 구성
    const contractData = {
      productName: opportunity.productName,
      insuranceCompany: '미정', // 사용자가 수정해야 할 항목
      insuranceType: opportunity.insuranceType || 'life',
      contractDate:
        additionalData?.contractDate || new Date().toISOString().split('T')[0],
      effectiveDate:
        additionalData?.effectiveDate || new Date().toISOString().split('T')[0],
      contractorName: client.fullName,
      insuredName: client.fullName,
      monthlyPremium:
        additionalData?.monthlyPremium ||
        parseFloat(opportunity.monthlyPremium || '0'),
      agentCommission:
        additionalData?.agentCommission ||
        parseFloat(opportunity.expectedCommission || '0'),
      notes:
        additionalData?.notes || '영업 파이프라인에서 자동 생성된 계약입니다.',
      opportunityProductId,
    };

    // 계약 생성
    return await createInsuranceContract(
      opportunity.clientId,
      agentId,
      contractData
    );
  } catch (error) {
    console.error('❌ 영업 기회에서 계약 생성 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '영업 기회에서 계약 생성에 실패했습니다.',
    };
  }
}

/**
 * 보험계약 통계 조회 (대시보드 연동용)
 */
export async function getInsuranceContractStats(agentId: string) {
  try {
    console.log('📊 보험계약 통계 조회:', { agentId });

    const stats = await db
      .select({
        id: insuranceContracts.id,
        status: insuranceContracts.status,
        monthlyPremium: insuranceContracts.monthlyPremium,
        agentCommission: insuranceContracts.agentCommission,
        contractDate: insuranceContracts.contractDate,
      })
      .from(insuranceContracts)
      .where(eq(insuranceContracts.agentId, agentId));

    // 통계 계산
    const totalContracts = stats.length;
    const activeContracts = stats.filter((c) => c.status === 'active').length;
    const cancelledContracts = stats.filter(
      (c) => c.status === 'cancelled'
    ).length;
    const expiredContracts = stats.filter((c) => c.status === 'expired').length;

    const totalMonthlyPremium = stats
      .filter((c) => c.status === 'active' && c.monthlyPremium)
      .reduce((sum, c) => sum + parseFloat(c.monthlyPremium || '0'), 0);

    const totalCommission = stats
      .filter((c) => c.status === 'active' && c.agentCommission)
      .reduce((sum, c) => sum + parseFloat(c.agentCommission || '0'), 0);

    // 월별 계약 통계 (최근 12개월)
    const now = new Date();
    const monthlyStats = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      const monthlyContracts = stats.filter((contract) => {
        const contractDate = new Date(contract.contractDate);
        return (
          contractDate.getFullYear() === year &&
          contractDate.getMonth() + 1 === month
        );
      });

      monthlyStats.push({
        year,
        month,
        count: monthlyContracts.length,
        totalPremium: monthlyContracts
          .filter((c) => c.monthlyPremium)
          .reduce((sum, c) => sum + parseFloat(c.monthlyPremium || '0'), 0),
        totalCommission: monthlyContracts
          .filter((c) => c.agentCommission)
          .reduce((sum, c) => sum + parseFloat(c.agentCommission || '0'), 0),
      });
    }

    console.log('✅ 보험계약 통계 조회 완료');
    return {
      success: true,
      data: {
        summary: {
          totalContracts,
          activeContracts,
          cancelledContracts,
          expiredContracts,
          totalMonthlyPremium,
          totalCommission,
        },
        monthlyStats,
      },
    };
  } catch (error) {
    console.error('❌ 보험계약 통계 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: null,
    };
  }
}
