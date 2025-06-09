// API 파일

// 🏢 보험계약 관리 API
import { eq, and, desc, count, sql, not } from 'drizzle-orm';
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

// 🔗 Storage 관련 import 추가
import { uploadContractAttachment } from '~/lib/core/storage';

/**
 * 보험계약 생성 (첨부파일 포함)
 */
export async function createInsuranceContract(
  clientId: string,
  agentId: string,
  contractData: {
    productName: string;
    insuranceCompany: string;
    insuranceType: string;
    insuranceCode?: string;
    contractNumber?: string;
    policyNumber?: string;
    contractDate: string;
    effectiveDate: string;
    expirationDate?: string;
    paymentDueDate?: string;
    contractorName: string;
    contractorSsn?: string;
    contractorPhone?: string;
    insuredName: string;
    insuredSsn?: string;
    insuredPhone?: string;
    beneficiaryName?: string;
    premiumAmount?: number;
    monthlyPremium?: number;
    annualPremium?: number;
    coverageAmount?: number;
    agentCommission?: number;
    specialClauses?: string;
    paymentMethod?: string;
    paymentCycle?: string;
    paymentPeriod?: number;
    notes?: string;
    opportunityProductId?: string;
  },
  attachments: Array<{
    file: File;
    fileName: string;
    fileDisplayName: string;
    documentType: string;
    description?: string;
  }> = []
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
      insuranceCode: contractData.insuranceCode || null,
      contractNumber: contractData.contractNumber || null,
      policyNumber: contractData.policyNumber || null,
      contractDate: contractData.contractDate,
      effectiveDate: contractData.effectiveDate,
      expirationDate: contractData.expirationDate || null,
      paymentDueDate: contractData.paymentDueDate || null,
      contractorName: contractData.contractorName,
      contractorSsn: contractData.contractorSsn || null,
      contractorPhone: contractData.contractorPhone || null,
      insuredName: contractData.insuredName,
      insuredSsn: contractData.insuredSsn || null,
      insuredPhone: contractData.insuredPhone || null,
      beneficiaryName: contractData.beneficiaryName || null,
      premiumAmount: contractData.premiumAmount?.toString() || null,
      monthlyPremium: contractData.monthlyPremium?.toString() || null,
      annualPremium: contractData.annualPremium?.toString() || null,
      coverageAmount: contractData.coverageAmount?.toString() || null,
      agentCommission: contractData.agentCommission?.toString() || null,
      specialClauses: contractData.specialClauses || null,
      paymentMethod: contractData.paymentMethod || null,
      paymentCycle: contractData.paymentCycle as any,
      paymentPeriod: contractData.paymentPeriod || null,
      notes: contractData.notes || null,
      status: 'active',
    };

    const [createdContract] = await db
      .insert(insuranceContracts)
      .values(newContract)
      .returning();

    console.log('✅ 보험계약 생성 완료:', createdContract.id);

    // 🎯 파이프라인 자동 이동: 계약 완료 단계로 이동
    try {
      const { getPipelineStages } = await import(
        '~/features/pipeline/lib/supabase-pipeline-data'
      );
      const { updateClientStage } = await import('~/api/shared/clients');

      // 에이전트의 파이프라인 단계 조회
      const stages = await getPipelineStages(agentId);

      // "계약 완료" 단계 찾기
      const completedStage = stages.find((stage) => stage.name === '계약 완료');

      if (completedStage) {
        // 고객을 "계약 완료" 단계로 자동 이동
        const stageUpdateResult = await updateClientStage(
          clientId,
          completedStage.id,
          agentId
        );

        if (stageUpdateResult.success) {
          console.log('✅ 고객이 계약 완료 단계로 자동 이동되었습니다:', {
            clientId,
            stageName: completedStage.name,
            stageId: completedStage.id,
          });
        } else {
          console.warn(
            '⚠️ 계약 완료 단계 이동 실패:',
            stageUpdateResult.message
          );
        }
      } else {
        console.warn(
          '⚠️ "계약 완료" 단계를 찾을 수 없습니다. 파이프라인 설정을 확인해주세요.'
        );
      }
    } catch (pipelineError) {
      console.warn('⚠️ 파이프라인 자동 이동 중 오류:', pipelineError);
      // 파이프라인 이동 실패는 계약 생성 성공에 영향주지 않음
    }

    // 📁 첨부파일 업로드 처리
    if (attachments.length > 0) {
      console.log(`📎 첨부파일 ${attachments.length}개 업로드 시작...`);

      const uploadResults = await Promise.allSettled(
        attachments.map(async (attachment) => {
          try {
            // 1. Supabase Storage에 파일 업로드
            const uploadResult = await uploadContractAttachment(
              attachment.file,
              createdContract.id,
              agentId,
              attachment.documentType
            );

            if (!uploadResult.success) {
              throw new Error(uploadResult.error || '파일 업로드 실패');
            }

            // 2. 데이터베이스에 첨부파일 정보 저장
            const attachmentRecord: NewContractAttachment = {
              contractId: createdContract.id,
              agentId,
              fileName: attachment.fileName,
              fileDisplayName: attachment.fileDisplayName,
              filePath: uploadResult.data!.filePath,
              fileSize: attachment.file.size,
              mimeType: attachment.file.type,
              documentType: attachment.documentType as any,
              description: attachment.description || null,
            };

            const [savedAttachment] = await db
              .insert(contractAttachments)
              .values(attachmentRecord)
              .returning();

            console.log('✅ 첨부파일 업로드 완료:', {
              id: savedAttachment.id,
              fileName: attachment.fileName,
            });

            return savedAttachment;
          } catch (error) {
            console.error('❌ 첨부파일 업로드 실패:', {
              fileName: attachment.fileName,
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            });
            throw error;
          }
        })
      );

      // 업로드 결과 검사
      const failedUploads = uploadResults.filter(
        (result) => result.status === 'rejected'
      );
      if (failedUploads.length > 0) {
        console.warn(`⚠️ ${failedUploads.length}개 첨부파일 업로드 실패`);
        // 계약은 성공했지만 일부 첨부파일 실패 시 경고 메시지 포함
      }

      const successfulUploads = uploadResults.filter(
        (result) => result.status === 'fulfilled'
      ).length;
      console.log(`✅ ${successfulUploads}개 첨부파일 업로드 성공`);
    }

    return {
      success: true,
      data: createdContract,
      message:
        attachments.length > 0
          ? `보험계약과 첨부파일 ${attachments.length}개가 성공적으로 등록되었습니다.`
          : '보험계약이 성공적으로 생성되었습니다.',
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
 * 고객의 보험계약 목록 조회 (첨부파일 포함)
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
        insuranceCode: insuranceContracts.insuranceCode,
        contractNumber: insuranceContracts.contractNumber,
        policyNumber: insuranceContracts.policyNumber,
        contractDate: insuranceContracts.contractDate,
        effectiveDate: insuranceContracts.effectiveDate,
        expirationDate: insuranceContracts.expirationDate,
        paymentDueDate: insuranceContracts.paymentDueDate,
        contractorName: insuranceContracts.contractorName,
        contractorSsn: insuranceContracts.contractorSsn,
        contractorPhone: insuranceContracts.contractorPhone,
        insuredName: insuranceContracts.insuredName,
        insuredSsn: insuranceContracts.insuredSsn,
        insuredPhone: insuranceContracts.insuredPhone,
        beneficiaryName: insuranceContracts.beneficiaryName,
        premiumAmount: insuranceContracts.premiumAmount,
        monthlyPremium: insuranceContracts.monthlyPremium,
        annualPremium: insuranceContracts.annualPremium,
        coverageAmount: insuranceContracts.coverageAmount,
        agentCommission: insuranceContracts.agentCommission,
        status: insuranceContracts.status,
        paymentMethod: insuranceContracts.paymentMethod,
        paymentCycle: insuranceContracts.paymentCycle,
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
          eq(insuranceContracts.agentId, agentId),
          // 🔍 삭제되지 않은 (cancelled 상태가 아닌) 계약만 조회
          not(eq(insuranceContracts.status, 'cancelled'))
        )
      )
      .orderBy(desc(insuranceContracts.createdAt));

    // 📎 각 계약의 첨부파일도 함께 조회
    const contractsWithAttachments = await Promise.all(
      contracts.map(async (contract) => {
        try {
          const attachments = await db
            .select({
              id: contractAttachments.id,
              fileName: contractAttachments.fileName,
              fileDisplayName: contractAttachments.fileDisplayName,
              documentType: contractAttachments.documentType,
              filePath: contractAttachments.filePath,
              fileSize: contractAttachments.fileSize,
              mimeType: contractAttachments.mimeType,
              description: contractAttachments.description,
              uploadedAt: contractAttachments.uploadedAt,
            })
            .from(contractAttachments)
            .where(
              and(
                eq(contractAttachments.contractId, contract.id),
                eq(contractAttachments.isActive, true)
              )
            )
            .orderBy(desc(contractAttachments.uploadedAt));

          return {
            ...contract,
            attachments,
          };
        } catch (error) {
          console.error(`❌ 계약 ${contract.id} 첨부파일 조회 실패:`, error);
          return {
            ...contract,
            attachments: [],
          };
        }
      })
    );

    console.log(`✅ 보험계약 ${contracts.length}개 조회 완료 (첨부파일 포함)`);
    return {
      success: true,
      data: contractsWithAttachments,
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
    insuranceCode: string;
    contractNumber: string;
    policyNumber: string;
    contractDate: string;
    effectiveDate: string;
    expirationDate: string;
    paymentDueDate: string;
    contractorName: string;
    contractorSsn: string;
    contractorPhone: string;
    insuredName: string;
    insuredSsn: string;
    insuredPhone: string;
    beneficiaryName: string;
    premiumAmount: number;
    monthlyPremium: number;
    annualPremium: number;
    coverageAmount: number;
    agentCommission: number;
    specialClauses: string;
    paymentMethod: string;
    paymentCycle: string;
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
        premiumAmount: updateData.premiumAmount?.toString(),
        monthlyPremium: updateData.monthlyPremium?.toString(),
        annualPremium: updateData.annualPremium?.toString(),
        coverageAmount: updateData.coverageAmount?.toString(),
        agentCommission: updateData.agentCommission?.toString(),
        paymentCycle: updateData.paymentCycle as any,
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
 * 보험계약 수정 (첨부파일 포함)
 */
export async function updateInsuranceContractWithAttachments(
  contractId: string,
  agentId: string,
  updateData: Partial<{
    productName: string;
    insuranceCompany: string;
    insuranceCode: string;
    contractNumber: string;
    policyNumber: string;
    contractDate: string;
    effectiveDate: string;
    expirationDate: string;
    paymentDueDate: string;
    contractorName: string;
    contractorSsn: string;
    contractorPhone: string;
    insuredName: string;
    insuredSsn: string;
    insuredPhone: string;
    beneficiaryName: string;
    premiumAmount: number;
    monthlyPremium: number;
    annualPremium: number;
    coverageAmount: number;
    agentCommission: number;
    specialClauses: string;
    paymentMethod: string;
    paymentCycle: string;
    paymentPeriod: number;
    notes: string;
    status: 'draft' | 'active' | 'cancelled' | 'expired' | 'suspended';
  }>,
  newAttachments: Array<{
    file: File;
    fileName: string;
    fileDisplayName: string;
    documentType: string;
    description?: string;
  }> = []
) {
  try {
    console.log('🏢 보험계약 수정 (첨부파일 포함):', {
      contractId,
      agentId,
      updateData,
    });

    // 1. 보험계약 정보 수정
    const contractUpdateResult = await updateInsuranceContract(
      contractId,
      agentId,
      updateData
    );

    if (!contractUpdateResult.success) {
      return contractUpdateResult;
    }

    // 2. 새로운 첨부파일 업로드 처리
    if (newAttachments.length > 0) {
      console.log(`📎 새 첨부파일 ${newAttachments.length}개 업로드 시작...`);

      const uploadResults = await Promise.allSettled(
        newAttachments.map(async (attachment) => {
          try {
            // Supabase Storage에 파일 업로드
            const uploadResult = await uploadContractAttachment(
              attachment.file,
              contractId,
              agentId,
              attachment.documentType
            );

            if (!uploadResult.success) {
              throw new Error(uploadResult.error || '파일 업로드 실패');
            }

            // 데이터베이스에 첨부파일 정보 저장
            const attachmentRecord: NewContractAttachment = {
              contractId,
              agentId,
              fileName: attachment.fileName,
              fileDisplayName: attachment.fileDisplayName,
              filePath: uploadResult.data!.filePath,
              fileSize: attachment.file.size,
              mimeType: attachment.file.type,
              documentType: attachment.documentType as any,
              description: attachment.description || null,
            };

            const [savedAttachment] = await db
              .insert(contractAttachments)
              .values(attachmentRecord)
              .returning();

            console.log('✅ 새 첨부파일 업로드 완료:', {
              id: savedAttachment.id,
              fileName: attachment.fileName,
            });

            return savedAttachment;
          } catch (error) {
            console.error('❌ 첨부파일 업로드 실패:', {
              fileName: attachment.fileName,
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            });
            throw error;
          }
        })
      );

      const successfulUploads = uploadResults.filter(
        (result) => result.status === 'fulfilled'
      ).length;
      console.log(`✅ ${successfulUploads}개 새 첨부파일 업로드 성공`);
    }

    return {
      success: true,
      data: contractUpdateResult.data,
      message:
        newAttachments.length > 0
          ? `보험계약과 첨부파일 ${newAttachments.length}개가 성공적으로 수정되었습니다.`
          : '보험계약이 성공적으로 수정되었습니다.',
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
 * 보험계약 완전 삭제 (하드 삭제 + Storage 첨부파일 삭제)
 */
export async function deleteInsuranceContract(
  contractId: string,
  agentId: string
) {
  try {
    console.log('🏢 보험계약 완전 삭제 시작:', { contractId, agentId });

    // 1. 삭제할 계약 존재 여부 확인
    const [existingContract] = await db
      .select()
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.id, contractId),
          eq(insuranceContracts.agentId, agentId)
        )
      )
      .limit(1);

    if (!existingContract) {
      return {
        success: false,
        error: '보험계약을 찾을 수 없습니다.',
      };
    }

    // 2. 관련 첨부파일들 조회
    const attachments = await db
      .select()
      .from(contractAttachments)
      .where(eq(contractAttachments.contractId, contractId));

    console.log(`📎 삭제할 첨부파일: ${attachments.length}개`);

    // 3. 트랜잭션으로 안전하게 삭제
    const deletionResult = await db.transaction(async (tx) => {
      // 3.1. 첨부파일 레코드 삭제
      if (attachments.length > 0) {
        await tx
          .delete(contractAttachments)
          .where(eq(contractAttachments.contractId, contractId));
        console.log('✅ 첨부파일 레코드 삭제 완료');
      }

      // 3.2. 보험계약 삭제
      const [deletedContract] = await tx
        .delete(insuranceContracts)
        .where(
          and(
            eq(insuranceContracts.id, contractId),
            eq(insuranceContracts.agentId, agentId)
          )
        )
        .returning();

      console.log('✅ 보험계약 레코드 삭제 완료');
      return deletedContract;
    });

    // 4. Storage에서 첨부파일들 실제 삭제
    if (attachments.length > 0) {
      const { deleteFile } = await import('~/lib/core/storage');

      const deletionPromises = attachments.map(async (attachment) => {
        try {
          const result = await deleteFile(
            'contract-attachments',
            attachment.filePath
          );
          if (result.success) {
            console.log(`✅ Storage 파일 삭제 성공: ${attachment.fileName}`);
          } else {
            console.warn(
              `⚠️ Storage 파일 삭제 실패: ${attachment.fileName}`,
              result.error
            );
          }
          return result;
        } catch (error) {
          console.error(
            `❌ Storage 파일 삭제 오류: ${attachment.fileName}`,
            error
          );
          return { success: false, error: '파일 삭제 중 오류' };
        }
      });

      const storageResults = await Promise.allSettled(deletionPromises);
      const failedDeletions = storageResults.filter(
        (result) =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' && !result.value.success)
      );

      if (failedDeletions.length > 0) {
        console.warn(
          `⚠️ ${failedDeletions.length}개 파일의 Storage 삭제 실패 (DB는 정상 삭제됨)`
        );
      }
    }

    console.log('✅ 보험계약 완전 삭제 완료:', {
      contractId,
      deletedAttachments: attachments.length,
    });

    return {
      success: true,
      message: '보험계약과 관련 파일이 완전히 삭제되었습니다.',
      deletedData: {
        contractId,
        attachmentsDeleted: attachments.length,
      },
    };
  } catch (error) {
    console.error('❌ 보험계약 완전 삭제 실패:', error);
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
 * 계약 첨부파일 완전 삭제 (하드 삭제 + Storage 파일 삭제)
 */
export async function deleteContractAttachment(
  attachmentId: string,
  agentId: string
) {
  try {
    console.log('📎 계약 첨부파일 완전 삭제 시작:', { attachmentId, agentId });

    // 1. 삭제할 첨부파일 조회
    const [existingAttachment] = await db
      .select()
      .from(contractAttachments)
      .where(
        and(
          eq(contractAttachments.id, attachmentId),
          eq(contractAttachments.agentId, agentId),
          eq(contractAttachments.isActive, true)
        )
      )
      .limit(1);

    if (!existingAttachment) {
      return {
        success: false,
        error: '첨부파일을 찾을 수 없습니다.',
      };
    }

    console.log('📂 삭제할 파일 정보:', {
      fileName: existingAttachment.fileName,
      filePath: existingAttachment.filePath,
    });

    // 2. 데이터베이스에서 첨부파일 레코드 삭제
    const [deletedAttachment] = await db
      .delete(contractAttachments)
      .where(
        and(
          eq(contractAttachments.id, attachmentId),
          eq(contractAttachments.agentId, agentId)
        )
      )
      .returning();

    console.log('✅ 첨부파일 레코드 삭제 완료');

    // 3. Storage에서 실제 파일 삭제
    try {
      const { deleteFile } = await import('~/lib/core/storage');
      const storageResult = await deleteFile(
        'contract-attachments',
        existingAttachment.filePath
      );

      if (storageResult.success) {
        console.log(
          `✅ Storage 파일 삭제 성공: ${existingAttachment.fileName}`
        );
      } else {
        console.warn(
          `⚠️ Storage 파일 삭제 실패: ${existingAttachment.fileName}`,
          storageResult.error
        );
        // Storage 삭제 실패해도 DB는 이미 삭제되었으므로 성공으로 처리
      }
    } catch (storageError) {
      console.error(
        `❌ Storage 파일 삭제 오류: ${existingAttachment.fileName}`,
        storageError
      );
      // Storage 삭제 실패해도 DB는 이미 삭제되었으므로 성공으로 처리
    }

    return {
      success: true,
      message: '첨부파일이 완전히 삭제되었습니다.',
      deletedData: {
        fileName: existingAttachment.fileName,
        filePath: existingAttachment.filePath,
      },
    };
  } catch (error) {
    console.error('❌ 계약 첨부파일 완전 삭제 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '첨부파일 삭제에 실패했습니다.',
    };
  }
}

/**
 * 계약 첨부파일 메타데이터 수정
 */
export async function updateContractAttachmentMetadata(
  attachmentId: string,
  agentId: string,
  updateData: {
    documentType?: string;
    description?: string;
    fileDisplayName?: string;
  }
) {
  try {
    console.log('📎 첨부파일 메타데이터 수정:', {
      attachmentId,
      agentId,
      updateData,
    });

    const [updatedAttachment] = await db
      .update(contractAttachments)
      .set({
        ...(updateData.documentType && {
          documentType: updateData.documentType as any,
        }),
        ...(updateData.description !== undefined && {
          description: updateData.description,
        }),
        ...(updateData.fileDisplayName && {
          fileDisplayName: updateData.fileDisplayName,
        }),
      })
      .where(
        and(
          eq(contractAttachments.id, attachmentId),
          eq(contractAttachments.agentId, agentId),
          eq(contractAttachments.isActive, true)
        )
      )
      .returning();

    if (!updatedAttachment) {
      return {
        success: false,
        error: '첨부파일을 찾을 수 없습니다.',
      };
    }

    console.log('✅ 첨부파일 메타데이터 수정 완료');
    return {
      success: true,
      data: updatedAttachment,
      message: '첨부파일 정보가 성공적으로 수정되었습니다.',
    };
  } catch (error) {
    console.error('❌ 첨부파일 메타데이터 수정 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '첨부파일 수정에 실패했습니다.',
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

/**
 * 🎯 통합 수수료 통계 조회 (대시보드, 보고서, 파이프라인 공통)
 * 실제 계약 수수료 + 예상 계약 수수료를 통합하여 계산
 */
export async function getUnifiedCommissionStats(agentId: string) {
  try {
    console.log('📊 통합 수수료 통계 조회 시작:', { agentId });

    // 1. 실제 계약 수수료 (확정된 수익)
    const actualContracts = await db
      .select({
        count: count(),
        totalCommission: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
        totalMonthlyPremium: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.monthlyPremium} AS NUMERIC)), 0)`,
      })
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.agentId, agentId),
          eq(insuranceContracts.status, 'active'),
          sql`${insuranceContracts.agentCommission} IS NOT NULL`
        )
      );

    // 2. 예상 계약 수수료 (진행 중인 수익)
    const { opportunityProducts } = await import('~/lib/schema');
    const expectedContracts = await db
      .select({
        count: count(),
        totalExpectedCommission: sql<number>`COALESCE(SUM(CAST(${opportunityProducts.expectedCommission} AS NUMERIC)), 0)`,
        totalExpectedPremium: sql<number>`COALESCE(SUM(CAST(${opportunityProducts.monthlyPremium} AS NUMERIC)), 0)`,
      })
      .from(opportunityProducts)
      .where(
        and(
          eq(opportunityProducts.agentId, agentId),
          eq(opportunityProducts.status, 'active'),
          sql`${opportunityProducts.expectedCommission} IS NOT NULL`
        )
      );

    const actualData = actualContracts[0] || {
      count: 0,
      totalCommission: 0,
      totalMonthlyPremium: 0,
    };
    const expectedData = expectedContracts[0] || {
      count: 0,
      totalExpectedCommission: 0,
      totalExpectedPremium: 0,
    };

    const result = {
      // 실제 계약 데이터 (확정된 수익)
      actualContracts: {
        count: actualData.count,
        totalCommission: Number(actualData.totalCommission),
        totalMonthlyPremium: Number(actualData.totalMonthlyPremium),
      },
      // 예상 계약 데이터 (진행 중인 수익)
      expectedContracts: {
        count: expectedData.count,
        totalCommission: Number(expectedData.totalExpectedCommission),
        totalMonthlyPremium: Number(expectedData.totalExpectedPremium),
      },
      // 통합 합계
      total: {
        contracts: actualData.count + expectedData.count,
        commission:
          Number(actualData.totalCommission) +
          Number(expectedData.totalExpectedCommission),
        monthlyPremium:
          Number(actualData.totalMonthlyPremium) +
          Number(expectedData.totalExpectedPremium),
      },
      // 계산된 지표
      averageCommissionPerContract:
        actualData.count > 0
          ? Number(actualData.totalCommission) / actualData.count
          : 0,
    };

    console.log('✅ 통합 수수료 통계 조회 완료:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ 통합 수수료 통계 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: {
        actualContracts: {
          count: 0,
          totalCommission: 0,
          totalMonthlyPremium: 0,
        },
        expectedContracts: {
          count: 0,
          totalCommission: 0,
          totalMonthlyPremium: 0,
        },
        total: { contracts: 0, commission: 0, monthlyPremium: 0 },
        averageCommissionPerContract: 0,
      },
    };
  }
}
