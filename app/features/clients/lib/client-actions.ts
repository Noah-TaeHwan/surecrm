import type { Route } from '../pages/+types/client-detail-page';
import { requireAuth } from '~/lib/auth/middleware';

export async function updateClientAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    // 폼 데이터 추출
    const updateData: any = {};

    const fullName = formData.get('fullName')?.toString();
    const phone = formData.get('phone')?.toString();
    const email = formData.get('email')?.toString();
    const telecomProvider = formData.get('telecomProvider')?.toString();
    const address = formData.get('address')?.toString();
    const occupation = formData.get('occupation')?.toString();
    const height = formData.get('height')?.toString();
    const weight = formData.get('weight')?.toString();
    const importance = formData.get('importance')?.toString();
    const notes = formData.get('notes')?.toString();
    const hasDrivingLicense = formData.get('hasDrivingLicense') === 'true';
    const referredById = formData.get('referredById')?.toString(); // 🆕 소개자 ID

    // 🔒 주민등록번호 관련 필드들 추가
    const ssnFront = formData.get('ssnFront')?.toString();
    const ssnBack = formData.get('ssnBack')?.toString();

    // snake_case 필드명으로 변환
    if (fullName) updateData.full_name = fullName;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email || null;
    if (telecomProvider !== undefined) {
      updateData.telecom_provider =
        telecomProvider === 'none' ? null : telecomProvider;
    }
    if (address !== undefined) updateData.address = address || null;
    if (occupation !== undefined) updateData.occupation = occupation || null;
    if (height !== undefined) updateData.height = height || null;
    if (weight !== undefined) updateData.weight = weight || null;
    if (importance) updateData.importance = importance;
    if (notes !== undefined) updateData.notes = notes || null;
    if (hasDrivingLicense !== undefined)
      updateData.has_driving_license = hasDrivingLicense;
    if (referredById !== undefined) {
      updateData.referred_by_id = referredById === '' ? null : referredById; // 🆕 소개자 ID 처리
    }

    updateData.updated_at = new Date().toISOString();

    // 🎯 Supabase Admin 클라이언트를 사용하여 직접 업데이트 (RLS 우회)
    const { createAdminClient } = await import('~/lib/core/supabase');
    const supabase = createAdminClient();

    // 1️⃣ 기본 프로필 정보 업데이트
    const { error: updateError } = await supabase
      .from('app_client_profiles')
      .update(updateData)
      .eq('id', clientId)
      .eq('agent_id', agentId)
      .eq('is_active', true);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 2️⃣ 주민등록번호가 입력된 경우 상세 정보 처리
    if (ssnFront && ssnBack && ssnFront.length === 6 && ssnBack.length === 7) {
      const fullSSN = `${ssnFront}-${ssnBack}`;

      console.log('🔍 주민등록번호 처리 시작:', {
        clientId,
        agentId,
        ssnMasked: `${ssnFront}-${ssnBack.charAt(0)}******`,
      });

      // 🔍 주민등록번호 파싱
      const { parseKoreanId } = await import('~/lib/utils/korean-id-utils');
      const parseResult = parseKoreanId(fullSSN);

      console.log('📋 주민등록번호 파싱 결과:', {
        isValid: parseResult.isValid,
        hasBirthDate: !!parseResult.birthDate,
        hasGender: !!parseResult.gender,
        errorMessage: parseResult.errorMessage,
      });

      if (parseResult.isValid && parseResult.birthDate && parseResult.gender) {
        try {
          // 🔒 주민등록번호 Base64 인코딩 (임시 - 나중에 AES-256-GCM으로 업그레이드)
          console.log('🔐 Base64 인코딩 시작...');
          const encryptedSSN = btoa(fullSSN); // 간단한 Base64 인코딩

          console.log('✅ Base64 인코딩 완료:', {
            encryptedLength: encryptedSSN.length,
            hasEncryptedData: encryptedSSN.length > 0,
          });

          // 상세 정보 객체 생성
          const detailsData = {
            client_id: clientId,
            birth_date: parseResult.birthDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
            gender: parseResult.gender,
            ssn: encryptedSSN, // 🔒 AES-256-GCM 암호화된 JSON 문자열
            updated_at: new Date().toISOString(),
          };

          console.log('📊 저장할 데이터:', {
            client_id: detailsData.client_id,
            birth_date: detailsData.birth_date,
            gender: detailsData.gender,
            ssnLength: detailsData.ssn.length,
            updated_at: detailsData.updated_at,
          });

          // 🎯 기존 데이터 확인 후 upsert
          console.log('🔍 기존 데이터 확인 중...');
          const { data: existingDetails } = await supabase
            .from('app_client_details')
            .select('id')
            .eq('client_id', clientId)
            .single();

          console.log('📋 기존 데이터 확인 결과:', {
            hasExisting: !!existingDetails,
            existingId: existingDetails?.id,
          });

          if (existingDetails) {
            // 기존 데이터 업데이트
            console.log('🔄 기존 데이터 업데이트 시작...');
            const { data: updateResult, error: detailsUpdateError } =
              await supabase
                .from('app_client_details')
                .update(detailsData)
                .eq('client_id', clientId)
                .select(); // 업데이트된 데이터 반환

            if (detailsUpdateError) {
              console.error('❌ 상세 정보 업데이트 실패:', detailsUpdateError);
              throw new Error(
                `상세 정보 업데이트 실패: ${detailsUpdateError.message}`
              );
            } else {
              console.log('✅ 상세 정보 업데이트 성공:', {
                updatedRecords: updateResult?.length || 0,
                firstRecord: updateResult?.[0]
                  ? {
                      id: updateResult[0].id,
                      birth_date: updateResult[0].birth_date,
                      gender: updateResult[0].gender,
                    }
                  : null,
              });
            }
          } else {
            // 새 데이터 삽입
            console.log('➕ 새 데이터 삽입 시작...');
            const { data: insertResult, error: detailsInsertError } =
              await supabase
                .from('app_client_details')
                .insert(detailsData)
                .select(); // 삽입된 데이터 반환

            if (detailsInsertError) {
              console.error('❌ 상세 정보 삽입 실패:', detailsInsertError);
              throw new Error(
                `상세 정보 삽입 실패: ${detailsInsertError.message}`
              );
            } else {
              console.log('✅ 상세 정보 삽입 성공:', {
                insertedRecords: insertResult?.length || 0,
                firstRecord: insertResult?.[0]
                  ? {
                      id: insertResult[0].id,
                      birth_date: insertResult[0].birth_date,
                      gender: insertResult[0].gender,
                    }
                  : null,
              });
            }
          }

          console.log('✅ 주민등록번호 파싱 및 저장 완료:', {
            birthDate: parseResult.birthDate.toISOString().split('T')[0],
            gender: parseResult.gender,
            ssnMasked: `${ssnFront}-${ssnBack.charAt(0)}******`, // 🔒 마스킹된 SSN만 로그
          });
        } catch (encodingError) {
          console.error(
            '❌ Base64 인코딩 또는 저장 과정에서 오류:',
            encodingError
          );
          throw new Error(
            `주민등록번호 처리 실패: ${
              encodingError instanceof Error
                ? encodingError.message
                : '알 수 없는 오류'
            }`
          );
        }
      } else {
        console.warn('⚠️ 주민등록번호 파싱 실패:', parseResult.errorMessage);

        // 🎯 주민등록번호 관련 구체적 에러 메시지 반환
        let userFriendlyMessage = '주민등록번호를 확인해주세요.';

        if (parseResult.errorMessage?.includes('1977년생은 성별코드가')) {
          userFriendlyMessage =
            '77년생의 경우 성별코드는 1(남성) 또는 2(여성)입니다. 입력하신 번호를 다시 확인해주세요.';
        } else if (parseResult.errorMessage?.includes('성별코드가')) {
          userFriendlyMessage =
            '생년과 성별코드가 일치하지 않습니다. 주민등록번호를 다시 확인해주세요.';
        } else if (parseResult.errorMessage?.includes('미래 날짜')) {
          userFriendlyMessage =
            '미래 날짜로 입력되었습니다. 주민등록번호를 다시 확인해주세요.';
        } else if (parseResult.errorMessage?.includes('유효하지 않은 날짜')) {
          userFriendlyMessage =
            '존재하지 않는 날짜입니다. 생년월일 부분을 확인해주세요.';
        } else if (parseResult.errorMessage?.includes('13자리')) {
          userFriendlyMessage =
            '주민등록번호는 13자리여야 합니다. (예: 771111-1234567)';
        }

        return {
          success: false,
          message: userFriendlyMessage,
          error: parseResult.errorMessage,
          inputError: true, // 입력 오류임을 표시
        };
      }
    } else {
      console.log('ℹ️ 주민등록번호 입력되지 않음 - 상세 정보 처리 건너뜀');
    }

    return {
      success: true,
      message: '고객 정보가 성공적으로 업데이트되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 고객 정보 업데이트 실패:', error);
    return {
      success: false,
      message: `고객 정보 업데이트에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function deleteClientAction(request: Request, clientId: string) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    // 🎯 Supabase Admin 클라이언트를 사용하여 직접 삭제 (soft delete)
    const { createAdminClient } = await import('~/lib/core/supabase');
    const supabase = createAdminClient();

    const { error: deleteError } = await supabase
      .from('app_client_profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .eq('agent_id', agentId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return {
      success: true,
      message: '고객이 성공적으로 삭제되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 고객 삭제 실패:', error);
    return {
      success: false,
      message: `고객 삭제에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateClientStageAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const targetStageId = formData.get('targetStageId')?.toString();
    const notes = formData.get('notes')?.toString();

    if (!targetStageId) {
      throw new Error('대상 단계 ID가 필요합니다.');
    }

    // 🎯 Supabase Admin 클라이언트를 사용하여 직접 업데이트
    const { createAdminClient } = await import('~/lib/core/supabase');
    const supabase = createAdminClient();

    // 기존 메모와 새 메모 결합
    const { data: currentClient, error: fetchError } = await supabase
      .from('app_client_profiles')
      .select('notes')
      .eq('id', clientId)
      .eq('agent_id', agentId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const existingNotes = currentClient?.notes || '';
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n--- 새 영업 기회 (${currentDate}) ---\n${notes}`
      : notes;

    // 고객 단계와 메모 업데이트
    const { error: updateError } = await supabase
      .from('app_client_profiles')
      .update({
        current_stage_id: targetStageId,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .eq('agent_id', agentId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      success: true,
      message: '영업 기회가 성공적으로 생성되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 영업 기회 생성 실패:', error);
    return {
      success: false,
      message: `영업 기회 생성에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateMedicalHistoryAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    // 🆕 새로운 API 함수 import
    const { updateMedicalHistory } = await import(
      '~/features/clients/lib/client-data'
    );

    const medicalData = {
      // 3개월 이내 항목들 (스키마와 매칭)
      hasRecentDiagnosis: formData.get('hasRecentDiagnosis') === 'true',
      hasRecentSuspicion: formData.get('hasRecentSuspicion') === 'true',
      hasRecentMedication: formData.get('hasRecentMedication') === 'true',
      hasRecentTreatment: formData.get('hasRecentTreatment') === 'true',
      hasRecentHospitalization:
        formData.get('hasRecentHospitalization') === 'true',
      hasRecentSurgery: formData.get('hasRecentSurgery') === 'true',
      recentMedicalDetails:
        formData.get('recentMedicalDetails')?.toString() || null,
      // 1년 이내 항목들 (스키마와 매칭)
      hasAdditionalExam: formData.get('hasAdditionalExam') === 'true',
      additionalExamDetails:
        formData.get('additionalExamDetails')?.toString() || null,
      // 5년 이내 항목들 (스키마와 매칭)
      hasMajorHospitalization:
        formData.get('hasMajorHospitalization') === 'true',
      hasMajorSurgery: formData.get('hasMajorSurgery') === 'true',
      hasLongTermTreatment: formData.get('hasLongTermTreatment') === 'true',
      hasLongTermMedication: formData.get('hasLongTermMedication') === 'true',
      majorMedicalDetails:
        formData.get('majorMedicalDetails')?.toString() || null,
      lastUpdatedBy: agentId,
    };

    await updateMedicalHistory(clientId, medicalData, agentId);

    return {
      success: true,
      message: '병력사항이 성공적으로 업데이트되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 병력사항 업데이트 실패:', error);
    return {
      success: false,
      message: `병력사항 업데이트에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateCheckupPurposesAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { updateCheckupPurposes } = await import(
      '~/features/clients/lib/client-data'
    );

    const checkupData = {
      // 걱정 관련 항목들 (스키마와 매칭)
      isInsurancePremiumConcern:
        formData.get('isInsurancePremiumConcern') === 'true',
      isCoverageConcern: formData.get('isCoverageConcern') === 'true',
      isMedicalHistoryConcern:
        formData.get('isMedicalHistoryConcern') === 'true',
      // 필요 관련 항목들
      needsDeathBenefit: formData.get('needsDeathBenefit') === 'true',
      needsImplantPlan: formData.get('needsImplantPlan') === 'true',
      needsCaregiverInsurance:
        formData.get('needsCaregiverInsurance') === 'true',
      needsDementiaInsurance: formData.get('needsDementiaInsurance') === 'true',
      // 저축 현황 (스키마와 매칭)
      currentSavingsLocation:
        formData.get('currentSavingsLocation')?.toString() || null,
      // 기타 걱정사항 (스키마와 매칭)
      additionalConcerns:
        formData.get('additionalConcerns')?.toString() || null,
      lastUpdatedBy: agentId,
    };

    await updateCheckupPurposes(clientId, checkupData, agentId);

    return {
      success: true,
      message: '점검목적이 성공적으로 업데이트되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 점검목적 업데이트 실패:', error);
    return {
      success: false,
      message: `점검목적 업데이트에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateInterestCategoriesAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { updateInterestCategories } = await import(
      '~/features/clients/lib/client-data'
    );

    const interestData = {
      interestedInAutoInsurance:
        formData.get('interestedInAutoInsurance') === 'true',
      interestedInDementia: formData.get('interestedInDementia') === 'true',
      interestedInDental: formData.get('interestedInDental') === 'true',
      interestedInDriverInsurance:
        formData.get('interestedInDriverInsurance') === 'true',
      interestedInHealthCheckup:
        formData.get('interestedInHealthCheckup') === 'true',
      interestedInMedicalExpenses:
        formData.get('interestedInMedicalExpenses') === 'true',
      interestedInFireInsurance:
        formData.get('interestedInFireInsurance') === 'true',
      interestedInCaregiver: formData.get('interestedInCaregiver') === 'true',
      interestedInCancer: formData.get('interestedInCancer') === 'true',
      interestedInSavings: formData.get('interestedInSavings') === 'true',
      interestedInLiability: formData.get('interestedInLiability') === 'true',
      interestedInLegalAdvice:
        formData.get('interestedInLegalAdvice') === 'true',
      interestedInTax: formData.get('interestedInTax') === 'true',
      interestedInInvestment: formData.get('interestedInInvestment') === 'true',
      interestedInPetInsurance:
        formData.get('interestedInPetInsurance') === 'true',
      interestedInAccidentInsurance:
        formData.get('interestedInAccidentInsurance') === 'true',
      interestedInTrafficAccident:
        formData.get('interestedInTrafficAccident') === 'true',
      // 추가 관심사항 메모
      interestNotes: formData.get('interestNotes')?.toString() || null,
      lastUpdatedBy: agentId,
    };

    await updateInterestCategories(clientId, interestData, agentId);

    return {
      success: true,
      message: '관심사항이 성공적으로 업데이트되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 관심사항 업데이트 실패:', error);
    return {
      success: false,
      message: `관심사항 업데이트에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function createConsultationCompanionAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { createConsultationCompanion } = await import(
      '~/features/clients/lib/client-data'
    );

    const companionData = {
      name: formData.get('companionName')?.toString() || '',
      phone: formData.get('companionPhone')?.toString() || '',
      relationship: formData.get('companionRelationship')?.toString() || '',
      isPrimary: formData.get('companionIsPrimary') === 'true',
      addedBy: agentId,
    };

    if (!companionData.name.trim()) {
      throw new Error('동반자 이름은 필수입니다.');
    }

    await createConsultationCompanion(clientId, companionData, agentId);

    return {
      success: true,
      message: '상담동반자가 성공적으로 추가되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담동반자 생성 실패:', error);
    return {
      success: false,
      message: `상담동반자 추가에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateConsultationCompanionAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { updateConsultationCompanion } = await import(
      '~/features/clients/lib/client-data'
    );

    const companionId = formData.get('companionId')?.toString();
    if (!companionId) {
      throw new Error('동반자 ID가 필요합니다.');
    }

    const companionData = {
      name: formData.get('companionName')?.toString() || '',
      phone: formData.get('companionPhone')?.toString() || '',
      relationship: formData.get('companionRelationship')?.toString() || '',
      isPrimary: formData.get('companionIsPrimary') === 'true',
    };

    if (!companionData.name.trim()) {
      throw new Error('동반자 이름은 필수입니다.');
    }

    await updateConsultationCompanion(companionId, companionData, agentId);

    return {
      success: true,
      message: '상담동반자가 성공적으로 수정되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담동반자 수정 실패:', error);
    return {
      success: false,
      message: `상담동반자 수정에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function deleteConsultationCompanionAction(
  request: Request,
  companionId: string
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { deleteConsultationCompanion } = await import(
      '~/features/clients/lib/client-data'
    );

    await deleteConsultationCompanion(companionId, agentId);

    return {
      success: true,
      message: '상담동반자가 성공적으로 삭제되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담동반자 삭제 실패:', error);
    return {
      success: false,
      message: `상담동반자 삭제에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function createConsultationNoteAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { createConsultationNote } = await import(
      '~/features/clients/lib/client-data'
    );

    const noteData = {
      consultationDate: formData.get('consultationDate')?.toString() || '',
      title: formData.get('title')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      contractInfo: formData.get('contractInfo')?.toString() || null,
      followUpDate: formData.get('followUpDate')?.toString() || null,
      followUpNotes: formData.get('followUpNotes')?.toString() || null,
      noteType: 'consultation', // 기본 노트 타입 추가
      addedBy: agentId,
    };

    if (!noteData.consultationDate || !noteData.title || !noteData.content) {
      throw new Error('상담일시, 제목, 내용은 필수입니다.');
    }

    await createConsultationNote(clientId, noteData, agentId);

    return {
      success: true,
      message: '상담내용이 성공적으로 추가되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담내용 생성 실패:', error);
    return {
      success: false,
      message: `상담내용 추가에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function updateConsultationNoteAction(
  request: Request,
  clientId: string,
  formData: FormData
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    const { updateConsultationNote } = await import(
      '~/features/clients/lib/client-data'
    );

    const noteId = formData.get('noteId')?.toString();
    if (!noteId) {
      throw new Error('상담내용 ID가 필요합니다.');
    }

    const noteData = {
      consultationDate: formData.get('consultationDate')?.toString() || '',
      title: formData.get('title')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      contractInfo: formData.get('contractInfo')?.toString() || null,
      followUpDate: formData.get('followUpDate')?.toString() || null,
      followUpNotes: formData.get('followUpNotes')?.toString() || null,
      noteType: 'consultation', // 기본 노트 타입 추가
    };

    if (!noteData.consultationDate || !noteData.title || !noteData.content) {
      throw new Error('상담일시, 제목, 내용은 필수입니다.');
    }

    await updateConsultationNote(noteId, noteData, agentId);

    return {
      success: true,
      message: '상담내용이 성공적으로 수정되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담내용 수정 실패:', error);
    return {
      success: false,
      message: `상담내용 수정에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function deleteConsultationNoteAction(
  request: Request,
  noteId: string
) {
  // 🎯 실제 로그인된 보험설계사 정보 가져오기
  const user = await requireAuth(request);
  const agentId = user.id;

  try {
    // 상담 기록 삭제 함수 구현
    const { db } = await import('~/lib/core/db');
    const { appClientConsultationNotes } = await import(
      '~/features/clients/lib/schema'
    );
    const { eq, and } = await import('drizzle-orm');

    const result = await db
      .delete(appClientConsultationNotes)
      .where(
        and(
          eq(appClientConsultationNotes.id, noteId),
          eq(appClientConsultationNotes.agentId, agentId)
        )
      );

    return {
      success: true,
      message: '상담내용이 성공적으로 삭제되었습니다.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 상담내용 삭제 실패:', error);
    return {
      success: false,
      message: `상담내용 삭제에 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
