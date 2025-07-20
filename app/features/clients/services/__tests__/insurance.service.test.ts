/**
 * 💼 보험 계약 서비스 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InsuranceService } from '../insurance.service';
import type { ContractFormData, AttachmentData } from '../../types/insurance-types';

// API 클라이언트 모킹
vi.mock('~/lib/utils/api-client', () => ({
  apiClient: vi.fn(),
  downloadFile: vi.fn(),
}));

// 모킹된 모듈 가져오기
import { apiClient } from '~/lib/utils/api-client';

describe('InsuranceService', () => {
  const mockApiClient = vi.mocked(apiClient);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getContracts', () => {
    const mockClientId = 'test-client-123';
    const mockContracts = [
      {
        id: 'contract-1',
        clientId: mockClientId,
        insuranceCompany: '삼성생명',
        productName: '종신보험',
        contractNumber: 'CONT-001',
        contractDate: '2024-01-01',
        monthlyPremium: 100000,
        attachments: [],
      },
      {
        id: 'contract-2',
        clientId: mockClientId,
        insuranceCompany: '한화생명',
        productName: '건강보험',
        contractNumber: 'CONT-002',
        contractDate: '2024-01-15',
        monthlyPremium: 50000,
        attachments: [],
      },
    ];

    it('성공적으로 계약 목록을 조회해야 함', async () => {
      mockApiClient.mockResolvedValueOnce({
        success: true,
        data: {
          success: true,
          contracts: mockContracts,
        },
      });

      const result = await InsuranceService.getContracts(mockClientId);

      expect(mockApiClient).toHaveBeenCalledWith(
        `/api/insurance-contracts?clientId=${mockClientId}`,
        {
          method: 'GET',
        }
      );
      expect(result).toEqual({
        success: true,
        contracts: mockContracts,
      });
    });

    it('API 오류 시 빈 배열과 오류 메시지를 반환해야 함', async () => {
      mockApiClient.mockRejectedValueOnce(new Error('Network error'));

      const result = await InsuranceService.getContracts(mockClientId);

      expect(result).toEqual({
        success: false,
        contracts: [],
        error: 'Network error',
      });
    });

    it('data가 없을 때 기본값을 반환해야 함', async () => {
      mockApiClient.mockResolvedValueOnce({
        success: false,
        data: null,
      });

      const result = await InsuranceService.getContracts(mockClientId);

      expect(result).toEqual({
        success: false,
        contracts: [],
      });
    });
  });

  describe('createContract', () => {
    const mockFormData: ContractFormData = {
      insuranceCompany: '삼성생명',
      productName: '종신보험',
      contractNumber: 'CONT-001',
      contractDate: '2024-01-01',
      monthlyPremium: 100000,
      coverageAmount: 500000000,
      beneficiary: '배우자',
      expiryDate: '2054-01-01',
      paymentStartDate: '2024-01-01',
      paymentEndDate: '2054-01-01',
      specialNotes: '특별 메모',
    };

    const mockAttachments: AttachmentData[] = [
      {
        file: new File(['test content'], 'test.pdf', { type: 'application/pdf' }),
        fileName: 'test.pdf',
        fileDisplayName: '테스트 파일',
        documentType: 'contract',
        description: '계약서',
        isExisting: false,
      },
    ];

    const mockClientId = 'client-123';
    const mockAgentId = 'agent-456';

    it('성공적으로 계약을 생성해야 함', async () => {
      const mockResponse = {
        id: 'new-contract-123',
        ...mockFormData,
        clientId: mockClientId,
        agentId: mockAgentId,
      };

      mockApiClient.mockResolvedValueOnce({
        success: true,
        data: mockResponse,
      });

      const result = await InsuranceService.createContract(
        mockFormData,
        mockAttachments,
        mockClientId,
        mockAgentId
      );

      expect(mockApiClient).toHaveBeenCalledWith('/api/insurance-contracts', {
        method: 'POST',
        body: expect.any(FormData),
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
        error: undefined,
        message: undefined,
      });
    });

    it('FormData가 올바르게 구성되어야 함', async () => {
      let capturedFormData: FormData;
      mockApiClient.mockImplementationOnce(async (url, options) => {
        capturedFormData = options.body as FormData;
        return { success: true, data: {} };
      });

      await InsuranceService.createContract(
        mockFormData,
        mockAttachments,
        mockClientId,
        mockAgentId
      );

      expect(capturedFormData!.get('intent')).toBe('createInsuranceContract');
      expect(capturedFormData!.get('clientId')).toBe(mockClientId);
      expect(capturedFormData!.get('agentId')).toBe(mockAgentId);
      expect(capturedFormData!.get('insuranceCompany')).toBe(mockFormData.insuranceCompany);
      expect(capturedFormData!.get('productName')).toBe(mockFormData.productName);
      expect(capturedFormData!.get('attachment_file_0')).toBeInstanceOf(File);
      expect(capturedFormData!.get('attachment_fileName_0')).toBe('test.pdf');
      expect(capturedFormData!.get('attachment_displayName_0')).toBe('테스트 파일');
      expect(capturedFormData!.get('attachment_documentType_0')).toBe('contract');
      expect(capturedFormData!.get('attachment_description_0')).toBe('계약서');
    });
  });

  describe('updateContract', () => {
    const mockContractId = 'contract-123';
    const mockFormData: ContractFormData = {
      insuranceCompany: '삼성생명',
      productName: '종신보험 (수정)',
      contractNumber: 'CONT-001',
      contractDate: '2024-01-01',
      monthlyPremium: 150000,
    };

    const mockExistingAttachments: AttachmentData[] = [
      {
        id: 'att-123',
        fileName: 'existing.pdf',
        fileDisplayName: '기존 파일 (수정)',
        documentType: 'contract',
        description: '수정된 설명',
        isExisting: true,
      },
    ];

    const mockClientId = 'client-123';
    const mockAgentId = 'agent-456';

    it('성공적으로 계약을 수정해야 함', async () => {
      const mockResponse = {
        id: mockContractId,
        ...mockFormData,
        clientId: mockClientId,
        agentId: mockAgentId,
      };

      mockApiClient.mockResolvedValueOnce({
        success: true,
        data: mockResponse,
      });

      const result = await InsuranceService.updateContract(
        mockContractId,
        mockFormData,
        mockExistingAttachments,
        mockClientId,
        mockAgentId
      );

      expect(mockApiClient).toHaveBeenCalledWith('/api/update-insurance-contract', {
        method: 'POST',
        body: expect.any(FormData),
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
        error: undefined,
        message: undefined,
      });
    });

    it('기존 첨부파일 메타데이터가 올바르게 처리되어야 함', async () => {
      let capturedFormData: FormData;
      mockApiClient.mockImplementationOnce(async (url, options) => {
        capturedFormData = options.body as FormData;
        return { success: true, data: {} };
      });

      await InsuranceService.updateContract(
        mockContractId,
        mockFormData,
        mockExistingAttachments,
        mockClientId,
        mockAgentId
      );

      expect(capturedFormData!.get('intent')).toBe('updateInsuranceContract');
      expect(capturedFormData!.get('contractId')).toBe(mockContractId);
      expect(capturedFormData!.get('existing_attachment_documentType_att-123')).toBe('contract');
      expect(capturedFormData!.get('existing_attachment_description_att-123')).toBe('수정된 설명');
      expect(capturedFormData!.get('existing_attachment_displayName_att-123')).toBe('기존 파일 (수정)');
    });
  });

  describe('deleteContract', () => {
    const mockContractId = 'contract-123';

    it('성공적으로 계약을 삭제해야 함', async () => {
      mockApiClient.mockResolvedValueOnce({
        success: true,
        data: { id: mockContractId },
        message: '계약이 삭제되었습니다.',
      });

      const result = await InsuranceService.deleteContract(mockContractId);

      expect(mockApiClient).toHaveBeenCalledWith('/api/insurance-contracts', {
        method: 'POST',
        body: expect.any(FormData),
      });

      const callArgs = mockApiClient.mock.calls[0];
      const formData = callArgs[1].body as FormData;
      expect(formData.get('actionType')).toBe('delete');
      expect(formData.get('contractId')).toBe(mockContractId);

      expect(result).toEqual({
        success: true,
        data: { id: mockContractId },
        error: undefined,
        message: '계약이 삭제되었습니다.',
      });
    });
  });

  describe('downloadAttachment', () => {
    const mockContractId = 'contract-123';
    const mockAttachmentId = 'attachment-456';

    beforeEach(() => {
      // DOM API 모킹
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);
    });

    it('성공적으로 첨부파일을 다운로드해야 함', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        headers: new Headers({
          'Content-Disposition': 'attachment; filename="test-document.pdf"',
        }),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await InsuranceService.downloadAttachment(mockContractId, mockAttachmentId);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/download-attachment?id=${mockAttachmentId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      expect(result).toBe(true);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('URL 인코딩된 파일명을 올바르게 디코딩해야 함', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      const encodedFileName = encodeURIComponent('한글 파일명.pdf');
      const mockResponse = {
        ok: true,
        headers: new Headers({
          'Content-Disposition': `attachment; filename="${encodedFileName}"`,
        }),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const mockLink = document.createElement('a') as any;
      await InsuranceService.downloadAttachment(mockContractId, mockAttachmentId);

      expect(mockLink.download).toBe('한글 파일명.pdf');
    });

    it('다운로드 실패 시 오류를 던져야 함', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found',
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(
        InsuranceService.downloadAttachment(mockContractId, mockAttachmentId)
      ).rejects.toThrow('다운로드 실패: Not Found');
    });
  });

  describe('buildFormData (private method through public methods)', () => {
    it('빈 첨부파일 배열을 올바르게 처리해야 함', async () => {
      const mockFormData: ContractFormData = {
        insuranceCompany: '테스트보험',
        productName: '테스트상품',
      };

      let capturedFormData: FormData;
      mockApiClient.mockImplementationOnce(async (url, options) => {
        capturedFormData = options.body as FormData;
        return { success: true, data: {} };
      });

      await InsuranceService.createContract(
        mockFormData,
        [], // 빈 첨부파일 배열
        'client-123',
        'agent-456'
      );

      // 첨부파일 관련 필드가 없어야 함
      const formDataEntries = Array.from(capturedFormData!.entries());
      const attachmentFields = formDataEntries.filter(([key]) => 
        key.includes('attachment_')
      );
      expect(attachmentFields).toHaveLength(0);
    });

    it('undefined, null, 빈 문자열 값을 제외해야 함', async () => {
      const mockFormData: ContractFormData = {
        insuranceCompany: '테스트보험',
        productName: undefined as any,
        contractNumber: null as any,
        contractDate: '',
        monthlyPremium: 0, // 0은 유효한 값
      };

      let capturedFormData: FormData;
      mockApiClient.mockImplementationOnce(async (url, options) => {
        capturedFormData = options.body as FormData;
        return { success: true, data: {} };
      });

      await InsuranceService.createContract(
        mockFormData,
        [],
        'client-123',
        'agent-456'
      );

      expect(capturedFormData!.has('productName')).toBe(false);
      expect(capturedFormData!.has('contractNumber')).toBe(false);
      expect(capturedFormData!.has('contractDate')).toBe(false);
      expect(capturedFormData!.get('monthlyPremium')).toBe('0');
    });
  });
});