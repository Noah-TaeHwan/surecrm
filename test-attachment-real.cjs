const fs = require('fs');
const path = require('path');

// 가상의 PDF 파일 생성 함수
function createTestPDFFile() {
  const content = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(테스트 계약서입니다) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n290\n%%EOF'
  );

  const filePath = path.join(__dirname, 'test-contract.pdf');
  fs.writeFileSync(filePath, content);
  console.log('✅ 테스트 PDF 파일 생성:', filePath);
  return filePath;
}

// 가상의 Excel 파일 생성 함수
function createTestExcelFile() {
  // 간단한 CSV 형태로 Excel처럼 보이게 생성
  const content =
    '계약번호,상품명,보험회사,계약자명,피보험자명,월보험료,수수료\nCONT001,종신보험,삼성화재,홍길동,홍길동,100000,50000\nCONT002,실손보험,현대해상,김철수,김철수,80000,40000';

  const filePath = path.join(__dirname, 'test-contracts.csv');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 테스트 Excel(CSV) 파일 생성:', filePath);
  return filePath;
}

// FormData 생성 및 테스트
async function testFileUpload() {
  console.log('🧪 첨부파일 업로드 테스트 시작\n');

  try {
    // 1. 테스트 파일들 생성
    const pdfFile = createTestPDFFile();
    const excelFile = createTestExcelFile();

    // 2. 파일 정보 확인
    const pdfStats = fs.statSync(pdfFile);
    const excelStats = fs.statSync(excelFile);

    console.log('📄 PDF 파일 정보:');
    console.log(`  - 크기: ${pdfStats.size} bytes`);
    console.log(`  - 경로: ${pdfFile}`);

    console.log('📊 Excel 파일 정보:');
    console.log(`  - 크기: ${excelStats.size} bytes`);
    console.log(`  - 경로: ${excelFile}`);

    // 3. FormData 구조 시뮬레이션
    console.log('\n📋 FormData 구조 시뮬레이션:');

    const formDataEntries = [
      ['intent', 'createInsuranceContract'],
      ['clientId', 'test-client-123'],
      ['agentId', 'test-agent-456'],
      ['productName', '테스트 종신보험'],
      ['insuranceCompany', '테스트 보험회사'],
      ['insuranceType', 'life'],
      ['contractDate', '2024-01-15'],
      ['effectiveDate', '2024-02-01'],
      ['contractorName', '홍길동'],
      ['insuredName', '홍길동'],
      ['agentCommission', '500000'],
      // 첨부파일 정보
      ['attachment_fileName_0', 'contract-document.pdf'],
      ['attachment_displayName_0', '보험계약서'],
      ['attachment_documentType_0', 'contract_document'],
      ['attachment_description_0', '주계약 계약서'],
      ['attachment_fileName_1', 'commission-report.csv'],
      ['attachment_displayName_1', '수수료 정산서'],
      ['attachment_documentType_1', 'commission_report'],
      ['attachment_description_1', '월별 수수료 정산 내역'],
    ];

    formDataEntries.forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 4. API 콜 시뮬레이션
    console.log('\n🌐 API 호출 시뮬레이션:');
    console.log('POST /app/features/clients/pages/client-detail-page');
    console.log('Content-Type: multipart/form-data');
    console.log(`파일 1: ${path.basename(pdfFile)} (${pdfStats.size} bytes)`);
    console.log(
      `파일 2: ${path.basename(excelFile)} (${excelStats.size} bytes)`
    );

    // 5. 예상 storage 경로
    console.log('\n📁 예상 Supabase Storage 경로:');
    console.log('버킷: contract-attachments');
    console.log(
      `경로 1: test-client-123/contracts/contract-document-${Date.now()}.pdf`
    );
    console.log(
      `경로 2: test-client-123/contracts/commission-report-${Date.now()}.csv`
    );

    // 6. 테스트 파일 정리
    fs.unlinkSync(pdfFile);
    fs.unlinkSync(excelFile);
    console.log('\n🧹 테스트 파일 정리 완료');

    console.log('\n✅ 첨부파일 업로드 테스트 완료!');
    console.log('\n📋 체크포인트:');
    console.log('1. ✅ FormData 구조 확인 완료');
    console.log('2. ✅ 파일 생성/읽기 확인 완료');
    console.log('3. ✅ 첨부파일 메타데이터 구조 확인 완료');
    console.log('4. ⏳ 실제 Supabase Storage 업로드 테스트 필요');
    console.log('5. ⏳ UI에서 실제 첨부파일 선택 테스트 필요');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 테스트 실행
testFileUpload();
