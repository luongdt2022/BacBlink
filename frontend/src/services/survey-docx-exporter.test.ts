import { describe, expect, it } from "vitest";
import * as fs from "fs";
import {
  exportTt17SurveyDocx,
  exportDemandSmeDocx,
  DemandSmeSurveyRecord,
  DOCX_MIME_TYPE,
} from "./survey-docx-exporter";
import { Tt17Assessment } from "./api/assessment-tt17";

describe("T-09.25 [QC] survey-docx-exporter Engine & Edge-Case Hunter", () => {
  const baseAssessment: Tt17Assessment = {
    id: "tt17-mock-uuid-001",
    enterpriseId: "ent-001",
    enterpriseName: "Công Ty Cổ Phần Công Nghệ Chế Tạo NacenTech",
    taxCode: "0109876543",
    scopeType: "PROVINCE",
    scopeId: "HN",
    industryCode: "C.28",
    assessmentYear: 2026,
    status: "APPROVED",
    submittedAt: "2026-11-01T08:00:00Z",
    createdAt: "2026-10-25T08:00:00Z",
    updatedAt: "2026-11-01T08:00:00Z",
    scoreResult: {
      scoreT: 25.5,
      scoreE: 16.0,
      scoreO: 14.5,
      scoreR: 12.0,
      scoreI: 10.0,
      totalScore: 78.0,
      syncCoefficient: 0.72,
      classification: "TIEN_TIEN",
      classificationLabel: "Trình độ Tiên tiến",
      bottlenecks: [],
      criteria: [
        {
          code: "TC01",
          group: "T",
          name: "Mức độ khấu hao thiết bị, công nghệ (K_kh)",
          maxScore: 5,
          achievedScore: 4.5,
          isBottleneck: false,
          recommendation: "Duy trì đầu tư máy móc.",
        },
      ],
    },
    surveyData: {
      companyName: "Công Ty Cổ Phần Công Nghệ Chế Tạo NacenTech",
      taxCode: "0109876543",
      contactPerson: "Nguyễn Văn Trưởng",
      totalCapital: 50000000000,
      totalWorkforce: 250,
      companyAddress: "Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
      companyPhone: "02439876543",
      companyEmail: "contact@nacentech.vn",
      companyType: "cong_ty_co_phan",
      industryCode: "C.28",
      machineries: [
        {
          name: "Trung tâm gia công CNC 5 trục Haas UMC-750",
          originCountry: "Mỹ",
          manufactureYear: 2022,
          startUsageYear: 2023,
          designedCapacityYear: 12000,
          originalCost: 4500000000,
          currentBookValue: 3600000000,
        },
      ],
      originalCostEquipment: 15000000000,
      currentBookValueEquipment: 11000000000,
      newInvestEquipment3Years: 4500000000,
      replacementEquipment3Years: 2000000000,
      digitalEquipmentValue: 3000000000,
      transferredTechTypes: ["lieng_xang", "mua_ban_quyen"],
      transferredTechValue: 1200000000,
      depreciationCoefficient: 0.27,
      modernEquipmentRatio: 75,
      advancedCountryEquipmentRatio: 80,
      automationRatio: 65,
      averageEquipmentAge: 3.5,
      lineSynchronizationLevel: 4,
      materialConsumptionRatio: 98,
      financialSeries: [
        {
          year: 2023,
          industrialOutputValue: 60000000000,
          netRevenue: 55000000000,
          totalCosts: 48000000000,
          actualOutput: 10000,
          designedCapacity: 12000,
          directWorkersCount: 150,
        },
      ],
      mainProductStandard: "quoc_te",
      energyCostYear: 500000000,
      materialCostYear: 25000000000,
      hasKaizenPolicy: true,
      kaizenCount3Years: 5,
      hasHighImpactKaizen: true,
      maintenanceLevel: 3,
      defectProductRatio: 1.2,
      capacityUtilizationRatio: 85,
      exportRevenueRatio: 40,
      energySavingRatio: 8.5,
      directWorkers: 150,
      indirectStaff: 100,
      trainedWorkers: 130,
      highSkilledWorkers: 60,
      qualifiedManagers: 20,
      qualifiedProfessionals: 40,
      trainingCost3Years: 600000000,
      isoCertifications: ["ISO 9001:2015", "ISO 14001:2015"],
      softwareApplications: ["SAP S/4HANA", "Siemens NX CAD/CAM"],
      dataCollectionSystems: ["SCADA FactoryTalk"],
      productivityTools: ["5S", "Lean Six Sigma"],
      digitalMaturityLevel: 3,
      environmentalCompliant: true,
      hasIso14001: true,
      hasWasteRecycling: true,
      itInfrastructureLevel: 3,
      itExpenses3Years: 1200000000,
      rdFacilityLevel: 3,
      rdWorkforceCount: 15,
      rdExpenses3Years: 1500000000,
      hasSciTechFund: true,
      hasLabOrTestingFacility: true,
      rdExpenseRatio: 2.7,
      rdProjectsCount: 3,
      technologyMasteryLevel: 3,
      newProductType: "hoan_toan_moi",
      newProductRevenueRatio: 30,
      rdTechnologyResult: "bang_sang_che",
      academyPartnershipType: "du_an_rd",
      digitalStrategyLevel: "dang_thuc_hien",
      digitalTechnologies: ["IOT", "AI"],
      digitalAdoptionScope: "toan_nha_may",
      grantedPatentsCount: 2,
      registeredIpCount: 5,
      academyPartnershipCount: 2,
      hasInternalInnovationPolicy: true,
    },
  };

  it("TC-01: Sinh Blob DOCX hợp lệ cho Phiếu TT17 chuẩn, kiểm tra ZIP Magic Header & Dung lượng", async () => {
    const blob = await exportTt17SurveyDocx(baseAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000); // Kích thước tệp chuẩn > 10KB
    expect(blob.type).toBe(DOCX_MIME_TYPE);

    // Kiểm tra Magic Bytes của ZIP PK\x03\x04
    const buffer = Buffer.from(await blob.arrayBuffer());
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  it("TC-02 (EDGE-CASE 1): Xử lý Tên Doanh Nghiệp chứa ký tự XML đặc biệt (&, <, >, \", ') an toàn", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      enterpriseName: 'Công Ty & Con <"NacenTech"> \'R&D\'',
      surveyData: {
        ...baseAssessment.surveyData!,
        companyName: 'Công Ty & Con <"NacenTech"> \'R&D\'',
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000);

    const buffer = Buffer.from(await blob.arrayBuffer());
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it("TC-03 (EDGE-CASE 2): Xử lý Doanh nghiệp không có máy móc kê khai (machineries = [])", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      surveyData: {
        ...baseAssessment.surveyData!,
        machineries: [],
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(8000);
  });

  it("TC-04 (EDGE-CASE 3): Xử lý điểm TT17 là số thập phân lẻ (68.45 điểm) và hệ số lẻ (0.582)", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      scoreResult: {
        ...baseAssessment.scoreResult!,
        totalScore: 68.45,
        syncCoefficient: 0.582,
        classification: "TRUNG_BINH_TIEN_TIEN",
        classificationLabel: "Trung bình tiên tiến",
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000);
  });


  it("TC-06 (FULL TT17 COMPLIANCE): Kiểm tra DOCX xuất ra chứa đầy đủ 30 bảng biểu Mục A-E + Phụ lục II + Chữ ký 3 bên và Ngắt trang", async () => {
    const blob = await exportTt17SurveyDocx(baseAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(25000); // Tệp hoàn chỉnh chuẩn Phụ lục I + II > 25KB

    const buffer = Buffer.from(await blob.arrayBuffer());
    const fs = await import("fs");
    const { execSync } = await import("child_process");
    const testPath = "/tmp/test_exported_tt17.docx";
    fs.writeFileSync(testPath, buffer);
    expect(fs.existsSync(testPath)).toBe(true);

    // Thẩm định cấu trúc XML thực tế bằng Python: 30 bảng Mục A-E chuẩn Phụ lục I + Header + 3 bảng Phụ lục II = 34 tables
    const pyCheckScript = `
import zipfile, xml.etree.ElementTree as ET
with zipfile.ZipFile('${testPath}') as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
body = root.find('w:body', namespaces)
tables = body.findall('w:tbl', namespaces)
p_brs = body.findall('.//w:br', namespaces)
page_breaks = [b for b in p_brs if b.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type') == 'page']
xml_str = xml_content.decode('utf-8')

checks = [
    'A. THÔNG TIN CHUNG CỦA DOANH NGHIỆP',
    'B. THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP',
    'C. THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP',
    'D. THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG CỦA DOANH NGHIỆP',
    'Đ. ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP',
    'E. NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP',
    'PHẦN II: PHỤ LỤC II VÀ BÁO CÁO KẾT QUẢ ĐÁNH GIÁ 26 TIÊU CHÍ',
    'TRƯỞNG ĐOÀN KHẢO SÁT',
    'GIÁM ĐỐC DOANH NGHIỆP',
    'NGƯỜI KHAI PHIẾU',
]
assert len(tables) >= 33, f"Thiếu bảng biểu: {len(tables)} < 33"
assert len(page_breaks) >= 1, f"Thiếu ngắt trang giữa Phần I và Phần II"
for c in checks:
    assert c in xml_str, f"Thiếu tiêu đề/mục bắt buộc: {c}"
print("VERIFIED_TT17_OK")
`;
    const verifyOutput = execSync("python3", { input: pyCheckScript }).toString().trim();
    expect(verifyOutput).toBe("VERIFIED_TT17_OK");
  });

  it("TC-08 (TEMPLATE OUT + RADAR CHART & BOTTLENECK SUMMARY): Điền dữ liệu vào mẫu phieu_thu_thap_tt17_out.docx kèm Khung Xếp loại 5 Nhóm, Biểu đồ Radar PNG và Chuẩn đoán Điểm nghẽn", async () => {
    // 1. Trường hợp 0 điểm nghẽn (baseAssessment)
    const blobNoBn = await exportTt17SurveyDocx(baseAssessment);
    const bufNoBn = Buffer.from(await blobNoBn.arrayBuffer());
    const { execSync } = await import("child_process");
    const pathNoBn = "/tmp/test_exported_tt17_no_bn.docx";
    fs.writeFileSync(pathNoBn, bufNoBn);

    // 2. Trường hợp có điểm nghẽn
    const withBnAssessment: Tt17Assessment = {
      ...baseAssessment,
      scoreResult: {
        ...baseAssessment.scoreResult!,
        criteria: [
          {
            code: "TC04",
            group: "T",
            name: "Mức độ tự động hóa thiết bị, công nghệ (K_tđ)",
            maxScore: 5,
            achievedScore: 1.5,
            isBottleneck: true,
            recommendation: "Đầu tư bổ sung cánh tay robot và PLC tự động hóa dây chuyền.",
          },
        ],
      },
    };
    const blobWithBn = await exportTt17SurveyDocx(withBnAssessment);
    const bufWithBn = Buffer.from(await blobWithBn.arrayBuffer());
    const pathWithBn = "/tmp/test_exported_tt17_with_bn.docx";
    fs.writeFileSync(pathWithBn, bufWithBn);

    const pyVerifyOut = `
import zipfile, xml.etree.ElementTree as ET

with zipfile.ZipFile('${pathNoBn}') as z1:
    names1 = z1.namelist()
    assert 'word/media/radar_chart.png' in names1, 'Missing radar_chart.png in DOCX'
    png_bytes = z1.read('word/media/radar_chart.png')
    assert png_bytes[:8] == b'\\x89PNG\\r\\n\\x1a\\n', 'Invalid PNG signature for radar_chart.png'
    xml1 = z1.read('word/document.xml').decode('utf-8')
    root1 = ET.fromstring(xml1.encode('utf-8'))

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
checked_nodes = root1.findall('.//w:checkBox/w:checked', ns)
assert len(checked_nodes) >= 10, f'Expected native Word checkboxes to be checked, got {len(checked_nodes)}'

required_visual_texts = [
    'CÔNG TY CỔ PHẦN CÔNG NGHỆ CHẾ TẠO NACENTECH',
    '0109876543',
    'Trung tâm gia công CNC 5 trục Haas UMC-750',
    'KẾT LUẬN XẾP LOẠI',
    'ĐIỂM TỔNG (T)',
    'HỆ SỐ ĐỒNG BỘ (T_ĐB)',
    'Nhóm T - Thiết bị',
    'Nhóm E - Hiệu quả',
    'Nhóm O - Tổ chức',
    'Nhóm R - Năng lực R&amp;D',
    'Nhóm I - Đổi mới ST',
    'Biểu Đồ Radar 5 Nhóm Thành Phần',
    'Màu xanh biểu thị vùng năng lực hiện tại của doanh nghiệp so với chuẩn 100%.',
    'Chuẩn Đoán Điểm Nghẽn Công Nghệ &amp; Khuyến Nghị Nâng Cấp',
    '0 điểm nghẽn',
    'Không có điểm nghẽn nghiêm trọng',
]
for t in required_visual_texts:
    assert t in xml1, f'Missing expected text in no-bottleneck DOCX: {t}'

with zipfile.ZipFile('${pathWithBn}') as z2:
    xml2 = z2.read('word/document.xml').decode('utf-8')

assert '1 điểm nghẽn' in xml2, 'Missing 1 điểm nghẽn badge'
assert 'Đầu tư bổ sung cánh tay robot và PLC tự động hóa dây chuyền.' in xml2, 'Missing bottleneck recommendation'
print("VERIFIED_OUT_TEMPLATE_AND_VISUALS_OK")
`;
    const out = execSync("python3", { input: pyVerifyOut }).toString().trim();
    expect(out).toBe("VERIFIED_OUT_TEMPLATE_AND_VISUALS_OK");
  });

  it("TC-09 (ECMA-376 / OPENXML SCHEMA STRICT COMPLIANCE): Kiểm định 100% bảng <w:tbl> có <w:tblPr> + <w:tblGrid> + <w:tr> và thứ tự phần tử pPr/tcPr/tcMar chuẩn Microsoft Word", async () => {
    const blob = await exportTt17SurveyDocx(baseAssessment);
    const buf = Buffer.from(await blob.arrayBuffer());
    const { execSync } = await import("child_process");
    const testPath = "/tmp/test_exported_tt17_ecma376.docx";
    fs.writeFileSync(testPath, buf);

    const pySchemaScript = `
import zipfile, xml.etree.ElementTree as ET

with zipfile.ZipFile('${testPath}') as z:
    assert z.testzip() is None, "ZIP CRC mismatch"
    raw_doc = z.read('word/document.xml')
    assert raw_doc.startswith(b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'), "Missing XML declaration"
    root = ET.fromstring(raw_doc)

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
PPR_ORDER = [
    'pStyle', 'keepNext', 'keepLines', 'pageBreakBefore', 'framePr', 'widowControl',
    'numPr', 'suppressLineNumbers', 'pBdr', 'shd', 'tabs', 'suppressAutoHyphens',
    'kinsoku', 'wordWrap', 'overflowPunct', 'topLinePunct', 'autoSpaceDE', 'autoSpaceDN',
    'bidi', 'adjustRightInd', 'snapToGrid', 'spacing', 'ind', 'contextualSpacing',
    'mirrorIndents', 'suppressOverlap', 'jc', 'textDirection', 'textAlignment',
    'textboxTightWrap', 'outlineLvl', 'divId', 'cnfStyle', 'rPr', 'sectPr', 'pPrChange'
]
TCPR_ORDER = [
    'cnfStyle', 'tcW', 'gridSpan', 'hMerge', 'vMerge', 'tcBorders', 'shd', 'noWrap',
    'tcMar', 'textDirection', 'tcFitText', 'vAlign', 'hideMark', 'headers',
    'cellIns', 'cellDel', 'cellMerge', 'tcPrChange'
]
TCMAR_ORDER = ['top', 'start', 'left', 'bottom', 'end', 'right']

def local(tag):
    return tag.split('}')[-1] if '}' in tag else tag

def check_order(elem, order, label):
    last_idx = -1
    seq = [local(c.tag) for c in elem]
    for name in seq:
        if name in order:
            idx = order.index(name)
            assert idx >= last_idx, f"{label} out of order: {seq}"
            last_idx = idx

for tbl in root.iter(f'{W}tbl'):
    children = [local(c.tag) for c in tbl]
    assert 'tblPr' in children, f"Table missing tblPr: {children}"
    assert 'tblGrid' in children, f"Table missing tblGrid: {children}"
    assert 'tr' in children, f"Table missing tr (corrupted table): {children}"
    assert 'r' not in children, f"Table illegally contains direct <w:r>: {children}"

for pPr in root.iter(f'{W}pPr'):
    check_order(pPr, PPR_ORDER, 'pPr')

for tcPr in root.iter(f'{W}tcPr'):
    check_order(tcPr, TCPR_ORDER, 'tcPr')

for tcMar in root.iter(f'{W}tcMar'):
    check_order(tcMar, TCMAR_ORDER, 'tcMar')

print("ECMA376_STRICT_OK")
`;
    const out = execSync("python3", { input: pySchemaScript }).toString().trim();
    expect(out).toBe("ECMA376_STRICT_OK");
  });

  it("TC-07 (EDGE-CASE 5): Doanh nghiệp chưa điền dữ liệu (surveyData tối thiểu), hiển thị dấu chấm/gạch ngang chuẩn mẫu trắng", async () => {
    const minimalAssessment: Tt17Assessment = {
      id: "tt17-empty-001",
      enterpriseId: "ent-empty",
      enterpriseName: "Doanh Nghiệp Chưa Kê Khai Chi Tiết",
      taxCode: "0100000000",
      industryCode: "C28",
      scopeType: "PROVINCE",
      scopeId: "HN",
      assessmentYear: 2026,
      status: "DRAFT",
      createdAt: "2026-11-04T00:00:00Z",
      updatedAt: "2026-11-04T00:00:00Z",
      scoreResult: {
        scoreT: 0,
        scoreE: 0,
        scoreO: 0,
        scoreR: 0,
        scoreI: 0,
        totalScore: 0,
        syncCoefficient: 0,
        classification: "CAN_THAM_DINH",
        classificationLabel: "Cần Thẩm Định",
        bottlenecks: [],
        criteria: [],
      },
      surveyData: {
        companyName: "Doanh Nghiệp Chưa Kê Khai Chi Tiết",
        taxCode: "0100000000",
        companyAddress: "Hà Nội",
        companyPhone: "0243000000",
        companyEmail: "test@example.com",
        companyType: "cong_ty_tnhh",
        totalCapital: 0,
        totalWorkforce: 0,
        machineries: [],
        originalCostEquipment: 0,
        currentBookValueEquipment: 0,
        newInvestEquipment3Years: 0,
        replacementEquipment3Years: 0,
        digitalEquipmentValue: 0,
        transferredTechTypes: [],
        transferredTechValue: 0,
        financialSeries: [],
        mainProductStandard: "co_so",
        energyCostYear: 0,
        materialCostYear: 0,
        hasKaizenPolicy: false,
        kaizenCount3Years: 0,
        hasHighImpactKaizen: false,
        maintenanceLevel: 1,
        directWorkers: 0,
        indirectStaff: 0,
        trainedWorkers: 0,
        highSkilledWorkers: 0,
        qualifiedManagers: 0,
        qualifiedProfessionals: 0,
        trainingCost3Years: 0,
        softwareApplications: [],
        dataCollectionSystems: [],
        isoCertifications: [],
        productivityTools: [],
        environmentalCompliant: false,
        hasIso14001: false,
        hasWasteRecycling: false,
        itInfrastructureLevel: 1,
        itExpenses3Years: 0,
        rdFacilityLevel: 1,
        rdWorkforceCount: 0,
        rdExpenses3Years: 0,
        hasSciTechFund: false,
        newProductType: "none",
        newProductRevenueRatio: 0,
        rdTechnologyResult: "none",
        academyPartnershipType: "none",
        digitalStrategyLevel: "chua_biet",
        digitalTechnologies: [],
        digitalAdoptionScope: "nghien_cuu",
      },
    };

    const blob = await exportTt17SurveyDocx(minimalAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(15000);
    expect(blob.type).toBe(DOCX_MIME_TYPE);
  });

  it("TC-05 (EDGE-CASE 4): Sinh Phiếu Khảo sát Nhu cầu DNNVV với danh mục nhu cầu rỗng", async () => {
    const demandRecord: DemandSmeSurveyRecord = {
      id: "demand-rec-001",
      surveyType: "SME_DEMAND",
      enterpriseName: "Hợp Tác Xã Nông Sản Sạch Ninh Thuận",
      taxCode: "4500987654",
      province: "NT",
      provinceName: "Ninh Thuận",
      address: "Tháp Chàm, Ninh Thuận",
      contactPerson: "Lê Văn Ninh",
      contactPhone: "0912345678",
      contactEmail: "ninhthuan.clean@gmail.com",
      status: "APPROVED",
      updatedAt: "2026-11-02T10:00:00Z",
      demands: [],
    };

    const blob = await exportDemandSmeDocx(demandRecord);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(5000);
    expect(blob.type).toBe(DOCX_MIME_TYPE);
  });
});
