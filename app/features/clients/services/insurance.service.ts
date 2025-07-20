/**
 * 💼 보험 계약 서비스 레이어
 * 
 * 보험 계약 관련 모든 API 호출을 중앙에서 관리합니다.
 * 비즈니스 로직과 API 통신을 캡슐화하여 컴포넌트에서 분리합니다.
 */

import { apiClient, downloadFile } from '~/lib/utils/api-client';
import type { 
  InsuranceContract, 
  ContractFormData, 
  AttachmentData 
} from '../types/insurance-types';

export interface InsuranceContractResponse {
  success: boolean;
  data?: InsuranceContract;
  message?: string;
  error?: string;
}

export interface InsuranceContractsListResponse {
  success: boolean;
  contracts?: InsuranceContract[];
  message?: string;
  error?: string;
}

/**
 * 보험 계약 서비스
 */
export class InsuranceService {
  /**
   * 보험 계약 목록 조회
   * @param clientId 고객 ID
   * @returns 보험 계약 목록
   */
  static async getContracts(clientId: string): Promise<InsuranceContractsListResponse> {
    try {
      const result = await apiClient<InsuranceContractsListResponse>(
        `/api/insurance-contracts?clientId=${clientId}`,
        {
          method: 'GET',
        }
      );
      
      return result.data || { success: false, contracts: [] };
    } catch (error) {
      return {
        success: false,
        contracts: [],
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 보험 계약 생성
   * @param data 계약 폼 데이터
   * @param attachments 첨부파일 목록
   * @param clientId 고객 ID
   * @param agentId 에이전트 ID
   * @returns 생성된 계약 정보
   */
  static async createContract(
    data: ContractFormData,
    attachments: AttachmentData[],
    clientId: string,
    agentId: string
  ): Promise<InsuranceContractResponse> {
    const formData = this.buildFormData(data, attachments, clientId, agentId, false);
    formData.append('intent', 'createInsuranceContract');

    const response = await apiClient<InsuranceContract>('/api/insurance-contracts', {
      method: 'POST',
      body: formData,
    });

    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    };
  }

  /**
   * 보험 계약 수정
   * @param contractId 계약 ID
   * @param data 계약 폼 데이터
   * @param attachments 첨부파일 목록
   * @param clientId 고객 ID
   * @param agentId 에이전트 ID
   * @returns 수정된 계약 정보
   */
  static async updateContract(
    contractId: string,
    data: ContractFormData,
    attachments: AttachmentData[],
    clientId: string,
    agentId: string
  ): Promise<InsuranceContractResponse> {
    const formData = this.buildFormData(data, attachments, clientId, agentId, true);
    formData.append('intent', 'updateInsuranceContract');
    formData.append('contractId', contractId);

    const response = await apiClient<InsuranceContract>('/api/update-insurance-contract', {
      method: 'POST',
      body: formData,
    });

    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    };
  }

  /**
   * 보험 계약 삭제
   * @param contractId 계약 ID
   * @returns 삭제 결과
   */
  static async deleteContract(contractId: string): Promise<InsuranceContractResponse> {
    const formData = new FormData();
    formData.append('actionType', 'delete');
    formData.append('contractId', contractId);

    const response = await apiClient<InsuranceContract>('/api/insurance-contracts', {
      method: 'POST',
      body: formData,
    });

    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    };
  }

  /**
   * 첨부파일 다운로드
   * @param contractId 계약 ID
   * @param attachmentId 첨부파일 ID
   * @returns 다운로드 성공 여부
   */
  static async downloadAttachment(
    contractId: string,
    attachmentId: string
  ): Promise<boolean> {
    try {
      // 파일명을 가져오기 위한 API 호출
      const response = await fetch(
        `/api/download-attachment?id=${attachmentId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.statusText}`);
      }

      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'download';

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
          // URL 인코딩된 파일명 디코딩
          try {
            fileName = decodeURIComponent(fileName);
          } catch (e) {
            // 디코딩 실패 시 원본 사용
          }
        }
      }

      // Blob으로 변환
      const blob = await response.blob();
      
      // Blob URL 생성 및 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * FormData 빌드 헬퍼
   * @private
   */
  private static buildFormData(
    data: ContractFormData,
    attachments: AttachmentData[],
    clientId: string,
    agentId: string,
    isUpdate: boolean
  ): FormData {
    const formData = new FormData();
    
    formData.append('clientId', clientId);
    formData.append('agentId', agentId);

    // 계약 데이터 추가 (첨부파일 제외)
    const contractData = { ...data } as any;
    delete contractData.attachments;

    Object.entries(contractData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // 첨부파일 처리
    if (attachments && attachments.length > 0) {
      let newFileIndex = 0;

      attachments.forEach((att) => {
        if (att.file instanceof File && !att.isExisting) {
          // 새로 추가된 파일
          formData.append(`attachment_file_${newFileIndex}`, att.file);
          formData.append(`attachment_fileName_${newFileIndex}`, att.fileName);
          formData.append(`attachment_displayName_${newFileIndex}`, att.fileDisplayName);
          formData.append(`attachment_documentType_${newFileIndex}`, att.documentType);
          
          if (att.description) {
            formData.append(`attachment_description_${newFileIndex}`, att.description);
          }
          
          newFileIndex++;
        } else if (att.isExisting && att.id) {
          // 기존 첨부파일 메타데이터 업데이트
          formData.append(`existing_attachment_documentType_${att.id}`, att.documentType);
          
          if (att.description) {
            formData.append(`existing_attachment_description_${att.id}`, att.description);
          }
          
          if (att.fileDisplayName) {
            formData.append(`existing_attachment_displayName_${att.id}`, att.fileDisplayName);
          }
        }
      });
    }

    return formData;
  }
}