// 📋 고객 확장 데이터 API
// 16개 Supabase 테이블 중 핵심 4개 테이블 연동
import { db } from '~/lib/core/db.server';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  clientDetails,
  insuranceInfo,
  appClientFamilyMembers,
  appClientContactHistory,
} from '~/features/clients/lib/schema';

// 🎯 1. Client Details (상세 정보) API
export async function getClientDetails(clientId: string, agentId: string) {
  try {
    console.log('📋 고객 상세 정보 조회:', { clientId, agentId });

    const details = await db
      .select()
      .from(clientDetails)
      .where(eq(clientDetails.clientId, clientId))
      .limit(1);

    console.log('✅ 고객 상세 정보 조회 완료:', details.length > 0);
    return details[0] || null;
  } catch (error) {
    console.error('❌ 고객 상세 정보 조회 실패:', error);
    throw new Error('고객 상세 정보를 조회할 수 없습니다.');
  }
}

export async function createClientDetails(
  clientId: string,
  data: {
    ssn?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    bankAccount?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalHistory?: string;
  },
  agentId: string
) {
  try {
    console.log('📋 고객 상세 정보 생성:', { clientId, agentId });

    const newDetails = await db
      .insert(clientDetails)
      .values({
        clientId,
        ssn: data.ssn,
        birthDate: data.birthDate,
        gender: data.gender,
        bankAccount: data.bankAccount,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        medicalHistory: data.medicalHistory,
      })
      .returning();

    console.log('✅ 고객 상세 정보 생성 완료');
    return { success: true, data: newDetails[0] };
  } catch (error) {
    console.error('❌ 고객 상세 정보 생성 실패:', error);
    return { success: false, message: '고객 상세 정보 생성에 실패했습니다.' };
  }
}

export async function updateClientDetails(
  clientId: string,
  data: {
    ssn?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    bankAccount?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalHistory?: string;
  },
  agentId: string
) {
  try {
    console.log('📋 고객 상세 정보 수정:', { clientId, agentId });

    const updateData: any = {
      updatedAt: new Date(),
    };

    // 변경된 필드만 업데이트 객체에 추가
    if (data.ssn !== undefined) updateData.ssn = data.ssn;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.bankAccount !== undefined)
      updateData.bankAccount = data.bankAccount;
    if (data.emergencyContact !== undefined)
      updateData.emergencyContact = data.emergencyContact;
    if (data.emergencyPhone !== undefined)
      updateData.emergencyPhone = data.emergencyPhone;
    if (data.medicalHistory !== undefined)
      updateData.medicalHistory = data.medicalHistory;

    const updatedDetails = await db
      .update(clientDetails)
      .set(updateData)
      .where(eq(clientDetails.clientId, clientId))
      .returning();

    if (updatedDetails.length === 0) {
      // 데이터가 없으면 새로 생성
      return await createClientDetails(clientId, data, agentId);
    }

    console.log('✅ 고객 상세 정보 수정 완료');
    return { success: true, data: updatedDetails[0] };
  } catch (error) {
    console.error('❌ 고객 상세 정보 수정 실패:', error);
    return { success: false, message: '고객 상세 정보 수정에 실패했습니다.' };
  }
}

// 🎯 2. Client Insurance (보험 정보) API
export async function getClientInsurance(clientId: string, agentId: string) {
  try {
    console.log('🛡️ 고객 보험 정보 조회:', { clientId, agentId });

    const insurances = await db
      .select()
      .from(insuranceInfo)
      .where(eq(insuranceInfo.clientId, clientId))
      .orderBy(desc(insuranceInfo.createdAt));

    console.log('✅ 고객 보험 정보 조회 완료:', insurances.length, '건');
    return insurances;
  } catch (error) {
    console.error('❌ 고객 보험 정보 조회 실패:', error);
    throw new Error('고객 보험 정보를 조회할 수 없습니다.');
  }
}

export async function createClientInsurance(
  clientId: string,
  data: {
    insuranceType: string;
    policyNumber?: string;
    insurer?: string;
    premium?: number;
    coverageAmount?: number;
    startDate?: string;
    endDate?: string;
    beneficiary?: string;
    isActive?: boolean;
  },
  agentId: string
) {
  try {
    console.log('🛡️ 고객 보험 정보 생성:', { clientId, agentId });

    const newInsurance = await db
      .insert(insuranceInfo)
      .values({
        clientId,
        insuranceType: data.insuranceType as any,
        policyNumber: data.policyNumber,
        insurer: data.insurer,
        premium: data.premium?.toString(),
        coverageAmount: data.coverageAmount?.toString(),
        startDate: data.startDate,
        endDate: data.endDate,
        beneficiary: data.beneficiary,
        isActive: data.isActive ?? true,
      })
      .returning();

    console.log('✅ 고객 보험 정보 생성 완료');
    return { success: true, data: newInsurance[0] };
  } catch (error) {
    console.error('❌ 고객 보험 정보 생성 실패:', error);
    return { success: false, message: '고객 보험 정보 생성에 실패했습니다.' };
  }
}

export async function updateClientInsurance(
  insuranceId: string,
  data: {
    insuranceType?: string;
    policyNumber?: string;
    insurer?: string;
    premium?: number;
    coverageAmount?: number;
    startDate?: string;
    endDate?: string;
    beneficiary?: string;
    isActive?: boolean;
  },
  agentId: string
) {
  try {
    console.log('🛡️ 고객 보험 정보 수정:', { insuranceId, agentId });

    const updateData: any = {
      updatedAt: new Date(),
    };

    // 변경된 필드만 업데이트
    if (data.insuranceType !== undefined)
      updateData.insuranceType = data.insuranceType;
    if (data.policyNumber !== undefined)
      updateData.policyNumber = data.policyNumber;
    if (data.insurer !== undefined) updateData.insurer = data.insurer;
    if (data.premium !== undefined)
      updateData.premium = data.premium?.toString();
    if (data.coverageAmount !== undefined)
      updateData.coverageAmount = data.coverageAmount?.toString();
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.beneficiary !== undefined)
      updateData.beneficiary = data.beneficiary;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedInsurance = await db
      .update(insuranceInfo)
      .set(updateData)
      .where(eq(insuranceInfo.id, insuranceId))
      .returning();

    console.log('✅ 고객 보험 정보 수정 완료');
    return { success: true, data: updatedInsurance[0] };
  } catch (error) {
    console.error('❌ 고객 보험 정보 수정 실패:', error);
    return { success: false, message: '고객 보험 정보 수정에 실패했습니다.' };
  }
}

export async function deleteClientInsurance(
  insuranceId: string,
  agentId: string
) {
  try {
    console.log('🛡️ 고객 보험 정보 삭제:', { insuranceId, agentId });

    const deletedInsurance = await db
      .update(insuranceInfo)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(insuranceInfo.id, insuranceId))
      .returning();

    console.log('✅ 고객 보험 정보 삭제 완료');
    return { success: true, data: deletedInsurance[0] };
  } catch (error) {
    console.error('❌ 고객 보험 정보 삭제 실패:', error);
    return { success: false, message: '고객 보험 정보 삭제에 실패했습니다.' };
  }
}

// 🎯 3. Client Family Members (가족 구성원) API
export async function getClientFamilyMembers(
  clientId: string,
  agentId: string
) {
  try {
    console.log('👨‍👩‍👧‍👦 고객 가족 구성원 조회:', { clientId, agentId });

    const familyMembers = await db
      .select()
      .from(appClientFamilyMembers)
      .where(eq(appClientFamilyMembers.clientId, clientId))
      .orderBy(asc(appClientFamilyMembers.name));

    console.log('✅ 고객 가족 구성원 조회 완료:', familyMembers.length, '명');
    return familyMembers;
  } catch (error) {
    console.error('❌ 고객 가족 구성원 조회 실패:', error);
    throw new Error('고객 가족 구성원 정보를 조회할 수 없습니다.');
  }
}

export async function createClientFamilyMember(
  clientId: string,
  data: {
    name: string;
    relationship: string;
    birthDate?: string;
    gender?: string;
    occupation?: string;
    phone?: string;
    email?: string;
    hasInsurance?: boolean;
    insuranceDetails?: any;
    notes?: string;
  },
  agentId: string
) {
  try {
    console.log('👨‍👩‍👧‍👦 고객 가족 구성원 생성:', { clientId, agentId });

    const newFamilyMember = await db
      .insert(appClientFamilyMembers)
      .values({
        clientId,
        name: data.name,
        relationship: data.relationship,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        gender: data.gender,
        occupation: data.occupation,
        phone: data.phone,
        email: data.email,
        hasInsurance: data.hasInsurance ?? false,
        insuranceDetails: data.insuranceDetails,
        notes: data.notes,
        privacyLevel: 'confidential',
        consentDate: new Date(),
      })
      .returning();

    console.log('✅ 고객 가족 구성원 생성 완료');
    return { success: true, data: newFamilyMember[0] };
  } catch (error) {
    console.error('❌ 고객 가족 구성원 생성 실패:', error);
    return { success: false, message: '가족 구성원 추가에 실패했습니다.' };
  }
}

export async function updateClientFamilyMember(
  memberId: string,
  data: {
    name?: string;
    relationship?: string;
    birthDate?: string;
    gender?: string;
    occupation?: string;
    phone?: string;
    email?: string;
    hasInsurance?: boolean;
    insuranceDetails?: any;
    notes?: string;
  },
  agentId: string
) {
  try {
    console.log('👨‍👩‍👧‍👦 고객 가족 구성원 수정:', { memberId, agentId });

    const updateData: any = {
      updatedAt: new Date(),
    };

    // 변경된 필드만 업데이트
    if (data.name !== undefined) updateData.name = data.name;
    if (data.relationship !== undefined)
      updateData.relationship = data.relationship;
    if (data.birthDate !== undefined)
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.occupation !== undefined) updateData.occupation = data.occupation;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.hasInsurance !== undefined)
      updateData.hasInsurance = data.hasInsurance;
    if (data.insuranceDetails !== undefined)
      updateData.insuranceDetails = data.insuranceDetails;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedMember = await db
      .update(appClientFamilyMembers)
      .set(updateData)
      .where(eq(appClientFamilyMembers.id, memberId))
      .returning();

    console.log('✅ 고객 가족 구성원 수정 완료');
    return { success: true, data: updatedMember[0] };
  } catch (error) {
    console.error('❌ 고객 가족 구성원 수정 실패:', error);
    return { success: false, message: '가족 구성원 수정에 실패했습니다.' };
  }
}

export async function deleteClientFamilyMember(
  memberId: string,
  agentId: string
) {
  try {
    console.log('👨‍👩‍👧‍👦 고객 가족 구성원 삭제:', { memberId, agentId });

    const deletedMember = await db
      .delete(appClientFamilyMembers)
      .where(eq(appClientFamilyMembers.id, memberId))
      .returning();

    console.log('✅ 고객 가족 구성원 삭제 완료');
    return { success: true, data: deletedMember[0] };
  } catch (error) {
    console.error('❌ 고객 가족 구성원 삭제 실패:', error);
    return { success: false, message: '가족 구성원 삭제에 실패했습니다.' };
  }
}

// 🎯 4. Client Contact History (연락 이력) API
export async function getClientContactHistory(
  clientId: string,
  agentId: string,
  limit?: number
) {
  try {
    console.log('📞 고객 연락 이력 조회:', { clientId, agentId, limit });

    let query = db
      .select()
      .from(appClientContactHistory)
      .where(
        and(
          eq(appClientContactHistory.clientId, clientId),
          eq(appClientContactHistory.agentId, agentId)
        )
      )
      .orderBy(desc(appClientContactHistory.createdAt));

    if (limit) {
      query = query.limit(limit) as any;
    }

    const contactHistory = await query;

    console.log('✅ 고객 연락 이력 조회 완료:', contactHistory.length, '건');
    return contactHistory;
  } catch (error) {
    console.error('❌ 고객 연락 이력 조회 실패:', error);
    throw new Error('고객 연락 이력을 조회할 수 없습니다.');
  }
}

export async function createClientContactHistory(
  clientId: string,
  data: {
    contactMethod: string;
    subject?: string;
    content?: string;
    duration?: number;
    outcome?: string;
    nextAction?: string;
    nextActionDate?: string;
  },
  agentId: string
) {
  try {
    console.log('📞 고객 연락 이력 생성:', { clientId, agentId });

    const newContact = await db
      .insert(appClientContactHistory)
      .values({
        clientId,
        agentId,
        contactMethod: data.contactMethod as any,
        subject: data.subject,
        content: data.content,
        duration: data.duration,
        outcome: data.outcome,
        nextAction: data.nextAction,
        nextActionDate: data.nextActionDate
          ? new Date(data.nextActionDate)
          : undefined,
        privacyLevel: 'restricted',
        isConfidential: false,
      })
      .returning();

    console.log('✅ 고객 연락 이력 생성 완료');
    return { success: true, data: newContact[0] };
  } catch (error) {
    console.error('❌ 고객 연락 이력 생성 실패:', error);
    return { success: false, message: '연락 이력 추가에 실패했습니다.' };
  }
}

export async function updateClientContactHistory(
  contactId: string,
  data: {
    contactMethod?: string;
    subject?: string;
    content?: string;
    duration?: number;
    outcome?: string;
    nextAction?: string;
    nextActionDate?: string;
  },
  agentId: string
) {
  try {
    console.log('📞 고객 연락 이력 수정:', { contactId, agentId });

    const updateData: any = {};

    // 변경된 필드만 업데이트
    if (data.contactMethod !== undefined)
      updateData.contactMethod = data.contactMethod;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.outcome !== undefined) updateData.outcome = data.outcome;
    if (data.nextAction !== undefined) updateData.nextAction = data.nextAction;
    if (data.nextActionDate !== undefined)
      updateData.nextActionDate = data.nextActionDate
        ? new Date(data.nextActionDate)
        : null;

    const updatedContact = await db
      .update(appClientContactHistory)
      .set(updateData)
      .where(
        and(
          eq(appClientContactHistory.id, contactId),
          eq(appClientContactHistory.agentId, agentId)
        )
      )
      .returning();

    console.log('✅ 고객 연락 이력 수정 완료');
    return { success: true, data: updatedContact[0] };
  } catch (error) {
    console.error('❌ 고객 연락 이력 수정 실패:', error);
    return { success: false, message: '연락 이력 수정에 실패했습니다.' };
  }
}

export async function deleteClientContactHistory(
  contactId: string,
  agentId: string
) {
  try {
    console.log('📞 고객 연락 이력 삭제:', { contactId, agentId });

    const deletedContact = await db
      .delete(appClientContactHistory)
      .where(
        and(
          eq(appClientContactHistory.id, contactId),
          eq(appClientContactHistory.agentId, agentId)
        )
      )
      .returning();

    console.log('✅ 고객 연락 이력 삭제 완료');
    return { success: true, data: deletedContact[0] };
  } catch (error) {
    console.error('❌ 고객 연락 이력 삭제 실패:', error);
    return { success: false, message: '연락 이력 삭제에 실패했습니다.' };
  }
}
